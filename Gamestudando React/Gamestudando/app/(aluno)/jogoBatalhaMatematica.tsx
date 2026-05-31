import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { perguntasMatematica } from "../perguntasMatematicaQuiz4";
import { atualizarPerfil, carregarPerfil } from "../utils/perfilAluno";
import { carregarQuestoesMultiplaEscolha } from "../utils/repositorioQuestoes";

type Question = {
  pergunta: string;
  respostas: string[];
  correta: number;
  nivel?: number;
  enemyType?: EnemyType;
};

type EnemyType = "slime" | "dragon" | "robot" | "dino" | "golem";
type GameStatus = "playing" | "between" | "finished";

const TOTAL_MONSTERS = 5;
const STARTING_LIVES = 3;
const BASE_ENEMY_SPEED = 42;
const SPEED_STEP = 9;
const WRONG_ADVANCE = 42;

const ENEMY_TYPES: EnemyType[] = ["slime", "dragon", "robot", "dino", "golem"];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function selectQuestions(list: Question[], level = 3, amount = TOTAL_MONSTERS) {
  const levels = list.map((item) => item.nivel || 1);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  const safeLevel = Math.max(minLevel, Math.min(level, maxLevel));

  const chosen = [
    ...shuffle(list.filter((item) => item.nivel === safeLevel)).slice(0, 2),
    ...shuffle(list.filter((item) => item.nivel === safeLevel + 1)).slice(0, 2),
    ...shuffle(list.filter((item) => item.nivel === safeLevel + 2)).slice(0, 1),
  ];

  const used = new Set(chosen);
  if (chosen.length < amount) {
    chosen.push(...shuffle(list).filter((item) => !used.has(item)).slice(0, amount - chosen.length));
  }

  return chosen.slice(0, amount).map((question, index) => ({
    ...question,
    enemyType: ENEMY_TYPES[index % ENEMY_TYPES.length],
  }));
}

export default function JogoBatalhaMatematica() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const stageWidth = Math.max(width, 1);
  const stageHeight = Math.max(height, 1);
  const isLandscape = stageWidth >= stageHeight;
  const groundY = stageHeight * 0.64;
  const warriorX = stageWidth * 0.13;
  const contactX = warriorX + 54;
  const spawnX = stageWidth + 72;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disabledAnswers, setDisabledAnswers] = useState<number[]>([]);
  const [enemyX, setEnemyX] = useState(spawnX);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState("Escolha a resposta certa para atacar!");
  const [startedAt, setStartedAt] = useState(Date.now());
  const [attackPulse, setAttackPulse] = useState(0);
  const [hitPulse, setHitPulse] = useState(0);
  const [parallax, setParallax] = useState(0);

  const enemyXRef = useRef(enemyX);
  const statusRef = useRef<GameStatus>(status);
  const currentIndexRef = useRef(currentIndex);
  const livesRef = useRef(lives);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    enemyXRef.current = enemyX;
  }, [enemyX]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadQuestions() {
        const profile = await carregarPerfil();
        const level = profile?.matematica?.nivel || 3;
        const loadedQuestions = await carregarQuestoesMultiplaEscolha("matematica", perguntasMatematica);
        const selected = selectQuestions(loadedQuestions, level, TOTAL_MONSTERS);

        if (!active) return;

        setQuestions(selected);
        setCurrentIndex(0);
        setDisabledAnswers([]);
        setEnemyX(spawnX);
        setLives(STARTING_LIVES);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setStatus("playing");
        setStartedAt(Date.now());
        setMessage("Escolha a resposta certa para atacar!");
      }

      loadQuestions();

      return () => {
        active = false;
      };
    }, [spawnX])
  );

  const finishGame = useCallback(
    async (completed: boolean, finalLives = livesRef.current) => {
      setStatus("finished");
      const timePlayed = Math.round((Date.now() - startedAt) / 1000);
      const phaseId = Array.isArray(params.faseId) ? params.faseId[0] : params.faseId || "1";

      const result = {
        taskId: `matematica-fase-${phaseId}`,
        completed,
        correctAnswers,
        wrongAnswers,
        timePlayed,
        livesRemaining: Math.max(0, finalLives),
      };

      console.log("BattleMathResult:", JSON.stringify(result));
      setMessage(completed ? "Voce venceu a batalha!" : "Fim de partida. Tente novamente!");

      await atualizarPerfil("matematica", correctAnswers, wrongAnswers, String(phaseId));
    },
    [correctAnswers, params.faseId, startedAt, wrongAnswers]
  );

  const goToNextEnemy = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex >= TOTAL_MONSTERS || nextIndex >= questions.length) {
      finishGame(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setDisabledAnswers([]);
    setEnemyX(spawnX);
    enemyXRef.current = spawnX;
    setStatus("playing");
    setMessage("Novo desafio chegando!");
  }, [finishGame, questions.length, spawnX]);

  const handleEnemyReachedPlayer = useCallback(() => {
    if (statusRef.current !== "playing") return;

    statusRef.current = "between";
    setStatus("between");
    setHitPulse(1);
    setTimeout(() => setHitPulse(0), 220);

    const nextLives = livesRef.current - 1;
    livesRef.current = nextLives;
    setLives(nextLives);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    if (nextLives <= 0) {
      finishGame(false, nextLives);
      return;
    }

    setMessage("O monstro encostou! Voce perdeu uma vida.");
    setTimeout(goToNextEnemy, 650);
  }, [finishGame, goToNextEnemy]);

  useEffect(() => {
    function loop(timestamp: number) {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = Math.min(0.05, (timestamp - lastFrameRef.current) / 1000);
      lastFrameRef.current = timestamp;

      setParallax((value) => (value + delta * 24) % 160);

      if (statusRef.current === "playing" && questions.length > 0) {
        const speed = BASE_ENEMY_SPEED + SPEED_STEP * currentIndexRef.current;
        const nextX = enemyXRef.current - speed * delta;
        enemyXRef.current = nextX;
        setEnemyX(nextX);

        if (nextX <= contactX) {
          handleEnemyReachedPlayer();
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      lastFrameRef.current = null;
    };
  }, [contactX, handleEnemyReachedPlayer, questions.length]);

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || status !== "playing" || disabledAnswers.includes(answerIndex)) return;

    if (answerIndex === currentQuestion.correta) {
      setStatus("between");
      statusRef.current = "between";
      setCorrectAnswers((value) => value + 1);
      setAttackPulse(1);
      setMessage("Acertou! Ataque especial!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => setAttackPulse(0), 220);
      setTimeout(goToNextEnemy, 620);
      return;
    }

    setWrongAnswers((value) => value + 1);
    setDisabledAnswers((items) => [...items, answerIndex]);
    setEnemyX((value) => {
      const nextX = value - WRONG_ADVANCE;
      enemyXRef.current = nextX;
      return nextX;
    });
    setMessage("Quase! Essa alternativa saiu do caminho.");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const restart = () => {
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setDisabledAnswers([]);
    setEnemyX(spawnX);
    enemyXRef.current = spawnX;
    setLives(STARTING_LIVES);
    livesRef.current = STARTING_LIVES;
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStatus("playing");
    statusRef.current = "playing";
    setStartedAt(Date.now());
    setMessage("Escolha a resposta certa para atacar!");
  };

  const progressLabel = `${Math.min(currentIndex + 1, TOTAL_MONSTERS)}/${TOTAL_MONSTERS}`;
  const enemyType = currentQuestion?.enemyType || "slime";

  if (!currentQuestion) {
    return (
      <SafeAreaView style={screenStyles.loading}>
        <Text style={screenStyles.loadingText}>Carregando batalha...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.screen}>
      <View style={StyleSheet.absoluteFill}>
        <View style={screenStyles.sky} />
        <View
          style={[
            screenStyles.sun,
            {
              left: stageWidth * 0.78 - 34,
              top: stageHeight * 0.16 - 34,
            },
          ]}
        />
        <PixelForestView width={stageWidth} groundY={groundY} offset={parallax * 0.35} layer="back" />
        <PixelForestView width={stageWidth} groundY={groundY + 28} offset={parallax} layer="front" />
        <View style={[screenStyles.ground, { top: groundY + 42, height: stageHeight - groundY }]} />
        <View style={[screenStyles.groundTop, { top: groundY + 42 }]} />
        <PixelWarriorView x={warriorX} y={groundY + 2} attackPulse={attackPulse} hitPulse={hitPulse} />
        {status !== "finished" && (
          <PixelEnemyView x={enemyX} y={groundY + 7} type={enemyType} />
        )}
      </View>

      {!isLandscape && (
        <View style={screenStyles.rotateNotice}>
          <Text style={screenStyles.rotateText}>Vire o celular para jogar em modo horizontal.</Text>
        </View>
      )}

      <View style={screenStyles.topHud}>
        <View style={screenStyles.hudPill}>
          <Text style={screenStyles.hudLabel}>Monstros</Text>
          <Text style={screenStyles.hudValue}>{progressLabel}</Text>
        </View>
        <Text style={screenStyles.title}>Batalha dos Numeros</Text>
        <View style={screenStyles.hudPill}>
          <Text style={screenStyles.hudLabel}>Vidas</Text>
          <Text style={screenStyles.hudValue}>{Array.from({ length: lives }, () => "<3").join(" ")}</Text>
        </View>
      </View>

      <View style={screenStyles.questionPanel}>
        <Text style={screenStyles.questionText}>{currentQuestion.pergunta}</Text>
        <Text style={screenStyles.feedbackText}>{message}</Text>
      </View>

      <View style={screenStyles.answerGrid}>
        {currentQuestion.respostas.slice(0, 4).map((answer, index) => {
          const disabled = disabledAnswers.includes(index) || status !== "playing";

          return (
            <Pressable
              key={`${answer}-${index}`}
              disabled={disabled}
              onPress={() => handleAnswer(index)}
              style={({ pressed }) => [
                screenStyles.answerButton,
                disabled && screenStyles.answerButtonDisabled,
                pressed && screenStyles.answerButtonPressed,
              ]}
            >
              <Text style={[screenStyles.answerText, disabled && screenStyles.answerTextDisabled]}>
                {answer}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {status === "finished" && (
        <View style={screenStyles.resultPanel}>
          <Text style={screenStyles.resultTitle}>{lives > 0 ? "Partida concluida!" : "Tente novamente!"}</Text>
          <Text style={screenStyles.resultText}>
            Acertos: {correctAnswers} | Erros: {wrongAnswers} | Vidas: {Math.max(0, lives)}
          </Text>
          <View style={screenStyles.resultActions}>
            <Pressable style={screenStyles.secondaryButton} onPress={restart}>
              <Text style={screenStyles.secondaryButtonText}>Jogar de novo</Text>
            </Pressable>
            <Pressable
              style={screenStyles.primaryButton}
              onPress={() => router.replace({ pathname: "/", params: { faseConcluida: String(params.faseId || "1") } })}
            >
              <Text style={screenStyles.primaryButtonText}>Voltar ao mapa</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function PixelForestView({ width, groundY, offset, layer }: { width: number; groundY: number; offset: number; layer: "front" | "back" }) {
  const trees: React.ReactNode[] = [];
  const spacing = layer === "front" ? 92 : 128;
  const count = Math.ceil(width / spacing) + 3;
  const start = -spacing - (offset % spacing);
  const trunk = layer === "front" ? "#6b4b2a" : "#6c6a3c";
  const leaves = layer === "front" ? "#2f9e44" : "#7fc66a";

  for (let i = 0; i < count; i++) {
    const x = start + i * spacing;
    const y = groundY - (layer === "front" ? 78 : 62);
    trees.push(
      <View key={`${layer}-${i}`}>
        <PixelBlock x={x + 28} y={y + 34} width={18} height={58} color={trunk} />
        <PixelBlock x={x + 10} y={y + 16} width={54} height={34} color={leaves} />
        <PixelBlock x={x + 18} y={y} width={38} height={28} color={leaves} />
        <PixelBlock x={x + 4} y={y + 42} width={66} height={24} color={leaves} />
      </View>
    );
  }

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{trees}</View>;
}

function PixelWarriorView({ x, y, attackPulse, hitPulse }: { x: number; y: number; attackPulse: number; hitPulse: number }) {
  const offset = attackPulse ? 18 : 0;
  const tint = hitPulse ? "#ff8b88" : "#3b82f6";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <PixelBlock x={x + offset + 8} y={y - 82} width={36} height={28} color="#6d3b1f" />
      <PixelBlock x={x + offset + 4} y={y - 56} width={42} height={32} color="#f7b267" />
      <PixelBlock x={x + offset + 2} y={y - 24} width={48} height={44} color={tint} />
      <PixelBlock x={x + offset - 8} y={y - 18} width={14} height={24} color="#f7b267" />
      <PixelBlock x={x + offset + 47} y={y - 12} width={12} height={22} color="#f7b267" />
      <PixelBlock x={x + offset + 20} y={y + 20} width={12} height={20} color="#253042" />
      <PixelBlock x={x + offset + 38} y={y + 20} width={12} height={20} color="#253042" />
      <PixelBlock x={x + offset + 60} y={y - 40} width={10} height={74} color="#dfe8f3" />
      <PixelBlock x={x + offset + 54} y={y - 14} width={22} height={8} color="#ffd166" />
    </View>
  );
}

function PixelEnemyView({ x, y, type }: { x: number; y: number; type: EnemyType }) {
  if (type === "dragon") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PixelBlock x={x + 8} y={y - 48} width={54} height={42} color="#6cb6ff" />
        <PixelBlock x={x + 36} y={y - 68} width={38} height={30} color="#6cb6ff" />
        <PixelBlock x={x - 6} y={y - 58} width={28} height={24} color="#b197fc" />
        <PixelBlock x={x + 50} y={y - 34} width={18} height={24} color="#ffd166" />
        <PixelBlock x={x + 62} y={y - 60} width={8} height={8} color="#ffffff" />
      </View>
    );
  }

  if (type === "robot") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PixelBlock x={x + 10} y={y - 62} width={54} height={44} color="#91a7b3" />
        <PixelBlock x={x + 18} y={y - 86} width={38} height={26} color="#4dabf7" />
        <PixelBlock x={x} y={y - 48} width={12} height={28} color="#91a7b3" />
        <PixelBlock x={x + 64} y={y - 48} width={12} height={28} color="#91a7b3" />
        <PixelBlock x={x + 26} y={y - 76} width={8} height={8} color="#fff3bf" />
        <PixelBlock x={x + 43} y={y - 76} width={8} height={8} color="#fff3bf" />
      </View>
    );
  }

  if (type === "dino") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PixelBlock x={x + 6} y={y - 50} width={58} height={42} color="#52b788" />
        <PixelBlock x={x + 42} y={y - 72} width={36} height={32} color="#52b788" />
        <PixelBlock x={x + 16} y={y - 32} width={30} height={22} color="#ffe066" />
        <PixelBlock x={x + 66} y={y - 62} width={8} height={8} color="#ffffff" />
      </View>
    );
  }

  if (type === "golem") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <PixelBlock x={x + 12} y={y - 58} width={52} height={48} color="#adb5bd" />
        <PixelBlock x={x + 20} y={y - 82} width={38} height={28} color="#868e96" />
        <PixelBlock x={x + 2} y={y - 46} width={14} height={30} color="#adb5bd" />
        <PixelBlock x={x + 62} y={y - 46} width={14} height={30} color="#adb5bd" />
        <PixelBlock x={x + 25} y={y - 70} width={10} height={7} color="#ffd43b" />
        <PixelBlock x={x + 45} y={y - 70} width={10} height={7} color="#ffd43b" />
        <PixelBlock x={x + 14} y={y - 26} width={46} height={6} color="#69db7c" />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <PixelBlock x={x + 8} y={y - 54} width={66} height={50} color="#51cf66" radius={14} />
      <PixelBlock x={x + 20} y={y - 72} width={42} height={24} color="#51cf66" />
      <PixelBlock x={x + 23} y={y - 49} width={14} height={14} color="#ffffff" radius={7} />
      <PixelBlock x={x + 48} y={y - 49} width={14} height={14} color="#ffffff" radius={7} />
      <PixelBlock x={x + 31} y={y - 25} width={24} height={5} color="#2b8a3e" />
    </View>
  );
}

function PixelBlock({
  x,
  y,
  width,
  height,
  color,
  radius = 0,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  radius?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: radius,
        height,
        left: x,
        position: "absolute",
        top: y,
        width,
      }}
    />
  );
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#8fd3ff",
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#8fd3ff",
  },
  sun: {
    backgroundColor: "#fff1a8",
    borderRadius: 34,
    height: 68,
    position: "absolute",
    width: 68,
  },
  ground: {
    backgroundColor: "#6ab04c",
    left: 0,
    position: "absolute",
    right: 0,
  },
  groundTop: {
    backgroundColor: "#4b8f3a",
    height: 18,
    left: 0,
    position: "absolute",
    right: 0,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8fd3ff",
  },
  loadingText: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "700",
  },
  rotateNotice: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rotateText: {
    color: "#243047",
    fontSize: 12,
    fontWeight: "700",
  },
  topHud: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  hudPill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderColor: "#275f3a",
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hudLabel: {
    color: "#41506b",
    fontSize: 10,
    fontWeight: "700",
  },
  hudValue: {
    color: "#172033",
    fontSize: 17,
    fontWeight: "900",
  },
  title: {
    color: "#172033",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  questionPanel: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "#275f3a",
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 8,
    maxWidth: 620,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "72%",
  },
  questionText: {
    color: "#172033",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  feedbackText: {
    color: "#41506b",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },
  answerGrid: {
    bottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    right: 12,
  },
  answerButton: {
    alignItems: "center",
    backgroundColor: "#ffd166",
    borderColor: "#8a5a12",
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 10,
    width: "23%",
  },
  answerButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  answerButtonDisabled: {
    backgroundColor: "rgba(210, 210, 210, 0.65)",
    borderColor: "rgba(120, 120, 120, 0.5)",
  },
  answerText: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  answerTextDisabled: {
    color: "rgba(40, 40, 40, 0.45)",
    textDecorationLine: "line-through",
  },
  resultPanel: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: "#275f3a",
    borderRadius: 8,
    borderWidth: 3,
    padding: 16,
    position: "absolute",
    top: "32%",
    width: "72%",
  },
  resultTitle: {
    color: "#172033",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  resultText: {
    color: "#41506b",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
  },
  primaryButton: {
    backgroundColor: "#2f9e44",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
  },
});
