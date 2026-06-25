import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { useVideoTransition } from "../_components/VideoTransition";
import { perguntasMatematica } from "../perguntasMatematicaQuiz4";
import { perguntasPortugues } from "../perguntasPortuguesQuiz4";
import { batalhaAssets } from "../utils/batalhaAssets";
import { lerTextoSeAtivo, pararLeitura } from "../utils/leituraPerguntas";
import { atualizarPerfil, carregarPerfil } from "../utils/perfilAluno";
import { carregarQuestoesMultiplaEscolha } from "../utils/repositorioQuestoes";

type Question = {
  pergunta: string;
  respostas: string[];
  correta: number;
  nivel?: number;
  enemyType?: EnemyType;
};

type EnemyType =
  | "slime"
  | "dragon"
  | "robot"
  | "dino"
  | "golem"
  | "goblin"
  | "lobo"
  | "morcego"
  | "monstrinho";
type GameStatus = "intro" | "playing" | "between" | "finished";
type BattleSubject = "matematica" | "portugues";
type HeroType = "knight" | "mage";
type BattleElement = "agua" | "fogo" | "terra" | "ar";

const TOTAL_MONSTERS = 5;
const STARTING_LIVES = 3;
const BASE_ENEMY_SPEED = 42;
const SPEED_STEP = 9;
const WRONG_ADVANCE = 42;

const ENEMY_TYPES: EnemyType[] = [
  "slime",
  "dragon",
  "robot",
  "dino",
  "golem",
  "goblin",
  "lobo",
  "morcego",
  "monstrinho",
];
const ANSWER_ELEMENTS: BattleElement[] = ["agua", "fogo", "terra", "ar"];
const ELEMENT_LABELS: Record<BattleElement, string> = {
  agua: "Agua",
  fogo: "Fogo",
  terra: "Terra",
  ar: "Ar",
};
const INTRO_STEPS = [
  {
    title: "Batalha educativa",
    text: "Responda as perguntas antes que os monstrinhos cheguem no heroi."
  },
  {
    title: "Como atacar",
    text: "Toque na resposta correta para atacar. Se errar, a alternativa some e o monstro avanca."
  },
  {
    title: "Personagem",
    text: "Em matematica voce joga de cavaleiro. Em portugues voce joga de mago."
  },
  {
    title: "Objetivo",
    text: "Derrote cinco monstros e tente terminar com o maximo de vidas."
  }
];

function shuffle<T>(items: T[]) {
  // Embaralha uma lista para as respostas nao ficarem sempre no mesmo lugar.
  const array = [...items];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function uppercaseQuestion(question: Question): Question {
  // Padroniza as perguntas de portugues e matematica em letras maiusculas.
  return {
    ...question,
    pergunta: String(question.pergunta || "").toUpperCase(),
    respostas: question.respostas.map((answer) =>
      String(answer || "").toUpperCase()
    ),
  };
}

function embaralharAlternativas(question: Question): Question {
  // Troca a ordem das alternativas sem perder qual delas e a correta.
  const respostasOriginais = [...question.respostas];
  const indiceCorretoOriginal = question.correta;

  let indices = [0, 1, 2, 3];

  // Garante que a resposta correta mude de posicao.
  do {
    indices = [...indices].sort(() => Math.random() - 0.5);
  } while (indices[indiceCorretoOriginal] === indiceCorretoOriginal);

  const novasRespostas = indices.map(i => respostasOriginais[i]);

  const novaCorreta = indices.findIndex(
    i => i === indiceCorretoOriginal
  );

  return {
    ...question,
    respostas: novasRespostas,
    correta: novaCorreta,
  };
}

function selectQuestions(list: Question[], level = 3, amount = TOTAL_MONSTERS) {
  // Escolhe cinco perguntas proximas ao nivel atual do aluno.
  const normalizedList = list.map(uppercaseQuestion);
  const levels = normalizedList.map((item) => item.nivel || 1);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  const safeLevel = Math.max(minLevel, Math.min(level, maxLevel));

  const chosen = [
    ...shuffle(normalizedList.filter((item) => item.nivel === safeLevel)).slice(0, 2),
    ...shuffle(normalizedList.filter((item) => item.nivel === safeLevel + 1)).slice(0, 2),
    ...shuffle(normalizedList.filter((item) => item.nivel === safeLevel + 2)).slice(0, 1),
  ];

  const used = new Set(chosen);
  if (chosen.length < amount) {
    chosen.push(...shuffle(normalizedList).filter((item) => !used.has(item)).slice(0, amount - chosen.length));
  }

  const enemyOrder = shuffle(ENEMY_TYPES);

  return chosen.slice(0, amount).map((question, index) => {
    const perguntaEmbaralhada = embaralharAlternativas(question);

    return {
      ...perguntaEmbaralhada,
        enemyType: enemyOrder[index % enemyOrder.length],
    };
  });
}

export default function JogoBatalhaMatematica() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const stageWidth = Math.max(width, 1);
  const stageHeight = Math.max(height, 1);
  const isLandscape = stageWidth >= stageHeight;
  const materiaParam = Array.isArray(params.materia) ? params.materia[0] : params.materia;
  const heroiParam = Array.isArray(params.heroi) ? params.heroi[0] : params.heroi;
  const origemParam = Array.isArray(params.origem) ? params.origem[0] : params.origem;
  const subject: BattleSubject = materiaParam === "portugues" ? "portugues" : "matematica";
  const heroType: HeroType =
    origemParam === "jogos" && heroiParam === "mage"
      ? "mage"
      : origemParam === "jogos" && heroiParam === "knight"
        ? "knight"
        : subject === "portugues"
          ? "mage"
          : "knight";
  const groundY = isLandscape ? stageHeight * 0.68 : stageHeight * 0.62;
  const warriorX = isLandscape ? stageWidth * 0.13 : stageWidth * 0.14;
  const contactX = warriorX + (isLandscape ? 54 : 44);
  const spawnX = stageWidth + 72;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disabledAnswers, setDisabledAnswers] = useState<number[]>([]);
  const [enemyX, setEnemyX] = useState(spawnX);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [introStep, setIntroStep] = useState(0);
  const [message, setMessage] = useState("Escolha a resposta certa para atacar!");
  const [startedAt, setStartedAt] = useState(Date.now());
  const { showVideo, hideVideo } = useVideoTransition();
  const [attackPulse, setAttackPulse] = useState(0);
  const [attackElement, setAttackElement] = useState<BattleElement | null>(null);
  const [attackFrame, setAttackFrame] = useState(0);
  const [hitPulse, setHitPulse] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const [cenarioIndex, setCenarioIndex] = useState(0);

  const enemyXRef = useRef(enemyX);
  const statusRef = useRef<GameStatus>(status);
  const currentIndexRef = useRef(currentIndex);
  const livesRef = useRef(lives);
  const pausedRef = useRef(paused);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const gameTitle = subject === "portugues" ? "Batalha das Palavras" : "Batalha dos Numeros";

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

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    // Le a pergunta em voz alta quando a batalha esta em andamento.
    if (status === "playing" && currentQuestion) {
      lerTextoSeAtivo(currentQuestion.pergunta);
    }
  }, [currentQuestion, status]);

  useEffect(() => {
    return () => pararLeitura();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTick((value) => (value + 1) % 1000);
    }, 130);

    return () => clearInterval(interval);
  }, []);

  const prepararNovaPartida = useCallback(async (active = true) => {
    // Carrega perguntas do Firebase/cache e reinicia todos os dados da batalha.
    if (active) {
      showVideo();
    }

    try {
      const profile = await carregarPerfil();
      const level = profile?.[subject]?.nivel || 3;
      const fallbackQuestions =
        subject === "portugues" ? perguntasPortugues : perguntasMatematica;
      const loadedQuestions = await carregarQuestoesMultiplaEscolha(
        subject,
        fallbackQuestions
      );
    const selected = selectQuestions(loadedQuestions, level, TOTAL_MONSTERS);

    if (!active) return;

    setQuestions(selected);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setDisabledAnswers([]);
    setEnemyX(spawnX);
    enemyXRef.current = spawnX;
    setLives(STARTING_LIVES);
    livesRef.current = STARTING_LIVES;
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStatus("intro");
    statusRef.current = "intro";
    setIntroStep(0);
    setAttackPulse(0);
    setAttackElement(null);
    setAttackFrame(0);
    setHitPulse(0);
    setPaused(false);
    setCenarioIndex(Math.floor(Math.random() * batalhaAssets.cenarios.length));
    setStartedAt(Date.now());
    setMessage("Escolha a resposta certa para atacar!");
  } finally {
    if (active) {
      hideVideo();
    }
  }
}, [spawnX, subject, showVideo, hideVideo]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      prepararNovaPartida(active);

      return () => {
        active = false;
      };
    }, [prepararNovaPartida])
  );

  const finishGame = useCallback(
    async (completed: boolean, finalLives = livesRef.current) => {
      // Finaliza a partida e envia o desempenho para o perfil do aluno.
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

      await atualizarPerfil(subject, correctAnswers, wrongAnswers, String(phaseId));
    },
    [correctAnswers, params.faseId, startedAt, subject, wrongAnswers]
  );

  const goToNextEnemy = useCallback(() => {
    // Avanca para o proximo monstro ou encerra se todos foram derrotados.
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
    // Quando o monstro encosta no jogador, perde uma vida e muda o desafio.
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
    // Loop simples que move o monstro em direcao ao jogador.
    function loop(timestamp: number) {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = Math.min(0.05, (timestamp - lastFrameRef.current) / 1000);
      lastFrameRef.current = timestamp;

      if (statusRef.current === "playing" && questions.length > 0) {
        if (pausedRef.current) {
          frameRef.current = requestAnimationFrame(loop);
          return;
        }

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
    // Decide se a resposta acertou, dispara o ataque ou remove a alternativa errada.
    if (!currentQuestion || status !== "playing" || paused || disabledAnswers.includes(answerIndex)) return;

    lerTextoSeAtivo(currentQuestion.respostas[answerIndex]);
    const element = ANSWER_ELEMENTS[answerIndex];

    if (answerIndex === currentQuestion.correta) {
      setStatus("between");
      statusRef.current = "between";
      setCorrectAnswers((value) => value + 1);
      setAttackPulse(1);
      setAttackElement(element);
      setAttackFrame(0);
      setMessage("Acertou! Ataque especial!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      [1, 2, 3].forEach((frame) => {
        setTimeout(() => setAttackFrame(frame), frame * 180);
      });
      setTimeout(() => setAttackPulse(0), 760);
      setTimeout(() => setAttackElement(null), 840);
      setTimeout(goToNextEnemy, 900);
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

  const restart = async () => {
    // Comeca uma partida nova com novas perguntas e novo cenario.
    setQuestions([]);
    await prepararNovaPartida();
  };

  const startBattle = () => {
    // Sai do tutorial e libera os comandos da batalha.
    setPaused(false);
    setStatus("playing");
    statusRef.current = "playing";
    setStartedAt(Date.now());
    setMessage("Escolha a resposta certa para atacar!");
  };

  const advanceIntro = () => {
    // Avanca os cards de explicacao antes da partida.
    if (introStep >= INTRO_STEPS.length - 1) {
      startBattle();
      return;
    }

    setIntroStep((value) => value + 1);
  };

  const pauseBattle = () => {
    // Pausa a batalha e interrompe a leitura da pergunta.
    setPaused(true);
    pararLeitura();
  };

  const continueBattle = () => {
    // Retoma a batalha de onde parou.
    setPaused(false);
  };

  const progressLabel = `${Math.min(currentIndex + 1, TOTAL_MONSTERS)}/${TOTAL_MONSTERS}`;
  const enemyType = currentQuestion?.enemyType || "slime";
  const intro = INTRO_STEPS[introStep];

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
        <Image
          source={batalhaAssets.cenarios[cenarioIndex]}
          resizeMode="cover"
          style={screenStyles.backgroundImage}
        />
        <View style={screenStyles.backgroundShade} />
        <View
          style={[
            screenStyles.floorShadow,
            {
              top: groundY + 24,
            },
          ]}
        />
        <PixelWarriorView
          x={warriorX}
          y={groundY + 16}
          attackPulse={attackPulse}
          attackFrame={attackFrame}
          hitPulse={hitPulse}
          heroType={heroType}
          lives={lives}
          status={status}
          animationTick={animationTick}
        />
        {status !== "finished" && (
          <PixelEnemyView
            x={enemyX}
            y={groundY + 14}
            type={enemyType}
            hitPulse={attackPulse}
            animationTick={animationTick}
          />
        )}
        {attackElement && (
          <ElementalAttackView
            element={attackElement}
            frame={attackFrame}
            heroType={heroType}
            fromX={warriorX + (isLandscape ? 82 : 72)}
            toX={Math.max(72, Math.min(enemyX - 54, stageWidth - 148))}
            y={groundY - (isLandscape ? 74 : 54)}
            progress={attackFrame / 3}
          />
        )}
      </View>

      <View style={[screenStyles.topHud, !isLandscape && screenStyles.topHudPortrait]}>
        <View style={screenStyles.hudPill}>
          <Text style={screenStyles.hudLabel}>Monstros</Text>
          <Text style={screenStyles.hudValue}>{progressLabel}</Text>
        </View>
        <Text style={[screenStyles.title, !isLandscape && screenStyles.titlePortrait]}>{gameTitle}</Text>
        <View style={screenStyles.hudPill}>
          <Text style={screenStyles.hudLabel}>Vidas</Text>
          <Text style={screenStyles.hudValue}>{Array.from({ length: lives }, () => "<3").join(" ")}</Text>
        </View>
      </View>

      <View style={[screenStyles.questionPanel, !isLandscape && screenStyles.questionPanelPortrait]}>
        <Text style={screenStyles.questionText}>{currentQuestion.pergunta}</Text>
        <Text style={screenStyles.feedbackText}>{message}</Text>
      </View>

      {status === "playing" && (
        <Pressable
          onPress={pauseBattle}
          style={[
            screenStyles.pauseButton,
            !isLandscape && screenStyles.pauseButtonPortrait,
          ]}
        >
          <Text style={screenStyles.pauseButtonText}>II</Text>
        </Pressable>
      )}

      <View style={[screenStyles.answerGrid, !isLandscape && screenStyles.answerGridPortrait]}>
        {currentQuestion.respostas.slice(0, 4).map((answer, index) => {
          const disabled = disabledAnswers.includes(index) || status !== "playing";
          const element = ANSWER_ELEMENTS[index];

          return (
            <Pressable
              key={`${answer}-${index}`}
              disabled={disabled}
              onPress={() => handleAnswer(index)}
              style={({ pressed }) => [
                screenStyles.answerButton,
                !isLandscape && screenStyles.answerButtonPortrait,
                disabled && screenStyles.answerButtonDisabled,
                pressed && screenStyles.answerButtonPressed,
              ]}
            >
              <Image
                source={batalhaAssets.botoes[element]}
                resizeMode="contain"
                style={[
                  screenStyles.answerElementIcon,
                  disabled && screenStyles.answerElementIconDisabled,
                ]}
              />
              <Text style={screenStyles.answerElementLabel}>{ELEMENT_LABELS[element]}</Text>
              <Text style={[screenStyles.answerText, disabled && screenStyles.answerTextDisabled]}>
                {answer}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {status === "intro" && (
        <View style={screenStyles.introOverlay}>
          <View style={screenStyles.introCard}>
            <Text style={screenStyles.introProgress}>{introStep + 1}/{INTRO_STEPS.length}</Text>
            <Text style={screenStyles.introTitle}>{intro.title}</Text>
            <Text style={screenStyles.introText}>{intro.text}</Text>
            <Pressable style={screenStyles.primaryButton} onPress={advanceIntro}>
              <Text style={screenStyles.primaryButtonText}>
                {introStep >= INTRO_STEPS.length - 1 ? "Iniciar jogo" : "Proximo"}
              </Text>
            </Pressable>
            {introStep < INTRO_STEPS.length - 1 && (
              <Pressable style={screenStyles.secondaryButton} onPress={startBattle}>
                <Text style={screenStyles.secondaryButtonText}>Pular explicacao</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {paused && (
        <View style={screenStyles.introOverlay}>
          <View style={screenStyles.pauseCard}>
            <Text style={screenStyles.introTitle}>Jogo pausado</Text>
            <Text style={screenStyles.introText}>
              O monstro ficou parado. Respire um pouco e continue quando quiser.
            </Text>
            <Pressable style={screenStyles.primaryButton} onPress={continueBattle}>
              <Text style={screenStyles.primaryButtonText}>Continuar</Text>
            </Pressable>
            <View style={screenStyles.pauseActions}>
              <Pressable style={screenStyles.secondaryButton} onPress={restart}>
                <Text style={screenStyles.secondaryButtonText}>Reiniciar</Text>
              </Pressable>
              <Pressable
                style={screenStyles.secondaryButton}
                onPress={() => router.replace("/Aluno")}
              >
                <Text style={screenStyles.secondaryButtonText}>Voltar ao mapa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {status === "finished" && (
        <View style={[screenStyles.resultPanel, !isLandscape && screenStyles.resultPanelPortrait]}>
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
              onPress={() => router.replace({ pathname: "/Aluno", params: { faseConcluida: String(params.faseId || "1") } })}
            >
              <Text style={screenStyles.primaryButtonText}>Voltar ao mapa</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function PixelWarriorView({
  x,
  y,
  attackPulse,
  attackFrame,
  hitPulse,
  heroType,
  lives,
  status,
  animationTick,
}: {
  x: number;
  y: number;
  attackPulse: number;
  attackFrame: number;
  hitPulse: number;
  heroType: HeroType;
  lives: number;
  status: GameStatus;
  animationTick: number;
}) {
  // Mostra cavaleiro ou mago no estado certo: parado, atacando, ferido ou vitoria.
  const offset = attackPulse ? 14 : 0;
  const frameIndex = animationTick;
  const assetGroup = batalhaAssets.herois[heroType];
  const source =
    status === "finished" && lives <= 0
      ? assetGroup.defeated[Math.min(frameIndex, assetGroup.defeated.length - 1)]
      : status === "finished"
        ? assetGroup.victory[frameIndex % assetGroup.victory.length]
        : attackPulse
          ? assetGroup.attack[Math.min(attackFrame, assetGroup.attack.length - 1)]
          : hitPulse
            ? assetGroup.hurt[frameIndex % assetGroup.hurt.length]
            : assetGroup.idle[frameIndex % assetGroup.idle.length];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={source}
        resizeMode="contain"
        style={[
          screenStyles.heroSprite,
          {
            left: x + offset - 14,
            top: y - 112,
          },
          hitPulse ? screenStyles.hitSprite : null,
        ]}
      />
    </View>
  );
}

function PixelEnemyView({
  x,
  y,
  type,
  hitPulse,
  animationTick,
}: {
  x: number;
  y: number;
  type: EnemyType;
  hitPulse: number;
  animationTick: number;
}) {
  // Escolhe o inimigo da rodada e troca seus frames durante a animacao.
  const frames = batalhaAssets.inimigos[type];
  const source = frames[animationTick % frames.length];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={source}
        resizeMode="contain"
        style={[
          screenStyles.enemySprite,
          {
            left: x - 16,
            top: y - 112,
          },
          hitPulse ? screenStyles.hitSprite : null,
        ]}
      />
    </View>
  );
}

function ElementalAttackView({
  element,
  frame,
  heroType,
  fromX,
  toX,
  y,
  progress,
}: {
  element: BattleElement;
  frame: number;
  heroType: HeroType;
  fromX: number;
  toX: number;
  y: number;
  progress: number;
}) {
  // Desenha o golpe elemental que sai do heroi quando a resposta esta correta.
  const frames = batalhaAssets.ataques[heroType][element];
  const source = frames[Math.max(0, Math.min(frame, frames.length - 1))];
  const left = fromX + (toX - fromX) * Math.max(0, Math.min(progress, 1));
  const size = getAttackSize(heroType, element);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={source}
        resizeMode="contain"
        style={[
          screenStyles.attackSprite,
          {
            height: size,
            left,
            top: y,
            width: size,
          },
        ]}
      />
    </View>
  );
}

function getAttackSize(heroType: HeroType, element: BattleElement) {
  // Ajusta cada sprite de ataque para nao ficar gigante ou pequeno demais.
  if (heroType === "mage") {
    if (element === "agua") return 142;
    if (element === "ar") return 136;
    return 126;
  }

  if (element === "agua") return 146;
  return 138;
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#8fd3ff",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  backgroundShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  floorShadow: {
    alignSelf: "center",
    backgroundColor: "rgba(25, 60, 24, 0.18)",
    borderRadius: 999,
    height: 24,
    left: "8%",
    position: "absolute",
    right: "8%",
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
  heroSprite: {
    height: 132,
    position: "absolute",
    width: 112,
    zIndex: 2,
  },
  enemySprite: {
    height: 118,
    position: "absolute",
    transform: [{ scaleX: -1 }],
    width: 118,
    zIndex: 1,
  },
  attackSprite: {
    position: "absolute",
    zIndex: 4,
  },
  hitSprite: {
    opacity: 0.82,
    transform: [{ scale: 1.05 }],
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
    paddingTop: 30,
  },
  topHudPortrait: {
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 34,
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
  titlePortrait: {
    flex: 1,
    fontSize: 19,
    paddingHorizontal: 6,
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
  questionPanelPortrait: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "86%",
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
  answerGridPortrait: {
    bottom: 72,
    gap: 8,
  },
  answerButton: {
    alignItems: "center",
    backgroundColor: "#ffd166",
    borderColor: "#8a5a12",
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: "23%",
  },
  answerButtonPortrait: {
    minHeight: 86,
    width: "46%",
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
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  answerElementIcon: {
    height: 28,
    marginBottom: 2,
    width: 28,
  },
  answerElementIconDisabled: {
    opacity: 0.35,
  },
  answerElementLabel: {
    color: "#8a5a12",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 2,
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
  resultPanelPortrait: {
    top: "28%",
    width: "88%",
  },
  pauseButton: {
    alignItems: "center",
    backgroundColor: "#ffb02e",
    borderColor: "#8a5a12",
    borderRadius: 8,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 14,
    top: 116,
    width: 52,
  },
  pauseButtonPortrait: {
    top: 174,
  },
  pauseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.54)",
    justifyContent: "center",
    padding: 20,
  },
  introCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "#275f3a",
    borderRadius: 8,
    borderWidth: 3,
    maxWidth: 420,
    padding: 18,
    width: "100%",
  },
  pauseCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderColor: "#275f3a",
    borderRadius: 8,
    borderWidth: 3,
    maxWidth: 420,
    padding: 18,
    width: "100%",
  },
  introProgress: {
    color: "#2f9e44",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },
  introTitle: {
    color: "#172033",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  introText: {
    color: "#41506b",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginVertical: 14,
    textAlign: "center",
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
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
  },
  pauseActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2f9e44",
    borderRadius: 8,
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "900",
  },
});
