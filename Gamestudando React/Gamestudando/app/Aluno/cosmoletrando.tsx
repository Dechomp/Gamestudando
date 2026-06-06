import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Svg, {
  Line as SvgLine,
  Polygon as SvgPolygon,
  Rect as SvgRect
} from "react-native-svg";

import { colors } from "../colors";
import { styles } from "../styles";
import { cosmoletrandoAssets } from "../utils/cosmoletrandoAssets";
import { atualizarPerfil } from "../utils/perfilAluno";
import { carregarPalavraCosmoletrando } from "../utils/repositorioQuestoes";

type Vector2 = {
  x: number;
  y: number;
};

type LetterObject = Vector2 & {
  id: string;
  value: string;
  collected: boolean;
  revealed: boolean;
  hiddenUntil?: number;
};

type AsteroidObject = Vector2 & {
  id: string;
  label: string;
  kind: "points" | "fuel" | "letter" | "upgrade";
  letterId?: string;
  upgrade?: "shield" | "tank" | "rapidFire" | "magnet" | "spreadShot" | "extraLife" | "bigLaser";
  health: number;
  maxHealth: number;
  radius: number;
  vx: number;
  vy: number;
};

type LaserObject = Vector2 & {
  id: string;
  angle: number;
  life: number;
  size: number;
};

type PickupObject = Vector2 & {
  id: string;
  kind: "fuel" | "upgrade";
  upgrade?: NonNullable<AsteroidObject["upgrade"]>;
};

type GamePhase = "intro" | "playing" | "returnChoice" | "success" | "gameOver" | "paused";
type ControlMode = "buttons" | "follow" | "tap";

const DEFAULT_WORD = "GATO";
const SHIP_RADIUS = 22;
const EARTH_RADIUS = 42;
const INITIAL_SHIP_POSITION = { x: 0, y: 210 };
const INITIAL_EARTH_POSITION = { x: 0, y: 300 };
const SPAWN_SAFE_RADIUS = 260;
const FUEL_ACCELERATION_COST = 3.8;
const FUEL_REVERSE_COST = 2.4;
const FUEL_TURN_COST = 0.75;
const FUEL_AUTO_ACCELERATION_COST = 2.1;
const FUEL_SHOT_COST = 0.65;
const FUEL_PER_LETTER = 25;
const MIN_WORD_FUEL = 75;
const TUTORIAL_STEPS = [
  {
    title: "Cosmoletrando",
    text: "Busque as letras da palavra no espaco e volte para a Terra com a palavra completa."
  },
  {
    title: "Como funciona",
    text: "As letras ficam dentro dos meteoros. Quebre o meteoro certo, colete a letra liberada e siga a ordem da palavra."
  },
  {
    title: "Movimento",
    text: "Escolha entre botoes, seguir o dedo ou tocar no destino. Nos botoes, as setas viram e aceleram a nave."
  },
  {
    title: "Tiro",
    text: "Toque na mira para ligar ou desligar os disparos. Assim voce consegue pilotar e atirar ao mesmo tempo. Atirar gasta gasolina."
  },
  {
    title: "Pronto?",
    text: "Complete a palavra, siga a seta para a Terra e finalize a missao antes da gasolina acabar."
  }
];

function normalizeWord(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const word = raw?.trim() || DEFAULT_WORD;
  return word
    .replace(/[^a-zA-ZÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç]/g, "")
    .toUpperCase() || DEFAULT_WORD;
}

function distance(a: Vector2, b: Vector2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function forwardFromAngle(angle: number) {
  return {
    x: Math.sin(angle),
    y: -Math.cos(angle)
  };
}

function rightFromAngle(angle: number) {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fuelForWord(word: string) {
  return Math.max(MIN_WORD_FUEL, word.length * FUEL_PER_LETTER);
}

function createFlameShape(origin: Vector2, direction: Vector2, width: number, length: number) {
  const side = { x: -direction.y, y: direction.x };
  const baseLeft = {
    x: origin.x - side.x * width * 0.5,
    y: origin.y - side.y * width * 0.5
  };
  const baseRight = {
    x: origin.x + side.x * width * 0.5,
    y: origin.y + side.y * width * 0.5
  };
  const tip = {
    x: origin.x + direction.x * length,
    y: origin.y + direction.y * length
  };
  const innerLeft = {
    x: origin.x - side.x * width * 0.22 + direction.x * length * 0.16,
    y: origin.y - side.y * width * 0.22 + direction.y * length * 0.16
  };
  const innerRight = {
    x: origin.x + side.x * width * 0.22 + direction.x * length * 0.16,
    y: origin.y + side.y * width * 0.22 + direction.y * length * 0.16
  };
  const innerTip = {
    x: origin.x + direction.x * length * 0.76,
    y: origin.y + direction.y * length * 0.76
  };

  return { baseLeft, baseRight, tip, innerLeft, innerRight, innerTip };
}

function Flame({ shape }: { shape: ReturnType<typeof createFlameShape> }) {
  return (
    <>
      <SvgPolygon
        points={`${shape.baseLeft.x},${shape.baseLeft.y} ${shape.tip.x},${shape.tip.y} ${shape.baseRight.x},${shape.baseRight.y}`}
        fill="#48d8ff"
        opacity={0.95}
      />
      <SvgPolygon
        points={`${shape.innerLeft.x},${shape.innerLeft.y} ${shape.innerTip.x},${shape.innerTip.y} ${shape.innerRight.x},${shape.innerRight.y}`}
        fill="#d9fbff"
        opacity={0.9}
      />
    </>
  );
}

function wrapScreenPosition(value: number, size: number) {
  if (size <= 0) return 0;
  return ((value % size) + size) % size;
}

function brakeShip(ship: { vx: number; vy: number }, strength = 0.28) {
  ship.vx *= strength;
  ship.vy *= strength;
}

function shortestAngleDelta(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function createLetters(word: string): LetterObject[] {
  const basePositions = [
    { x: -170, y: -180 },
    { x: 80, y: -260 },
    { x: 230, y: -80 },
    { x: -260, y: 80 },
    { x: 20, y: 180 },
    { x: 310, y: 210 },
    { x: -330, y: -320 },
    { x: 390, y: -310 },
    { x: -430, y: 210 },
    { x: 480, y: 90 },
    { x: -120, y: -430 },
    { x: 110, y: 420 },
    { x: -520, y: -130 },
    { x: 520, y: -210 }
  ];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const requiredLetters = word.split("").map((value, index) => ({ value, required: true, index }));
  const extraCorrectLetters = word
    .slice(0, Math.min(3, word.length))
    .split("")
    .map((value, index) => ({ value, required: false, index: word.length + index }));
  const decoyLetters = alphabet
    .filter((letter) => !word.includes(letter))
    .slice(0, 6)
    .map((value, index) => ({ value, required: false, index: word.length + extraCorrectLetters.length + index }));

  return [...requiredLetters, ...extraCorrectLetters, ...decoyLetters].map(({ value, required }, index) => ({
    id: `${required ? "letter" : "extra-letter"}-${index}-${value}`,
      value,
      collected: false,
      revealed: false,
      hiddenUntil: 0,
      ...basePositions[index % basePositions.length]
  }));
}

function createAsteroids(letters: LetterObject[]): AsteroidObject[] {
  const letterAsteroids = letters.map((letter, index) => ({
    id: `asteroid-${letter.id}`,
    label: letter.value,
    kind: "letter" as const,
    letterId: letter.id,
    x: letter.x,
    y: letter.y,
    health: 3 + (index % 2),
    maxHealth: 3 + (index % 2),
    radius: 31,
    vx: index % 2 === 0 ? 2 : -2,
    vy: index % 3 === 0 ? 1.5 : -1.5
  }));

  return keepAsteroidsAwayFromStart([
    ...letterAsteroids,
    {
      id: "asteroid-fuel",
      label: "GAS",
      kind: "fuel",
      x: 330,
      y: 95,
      health: 4,
      maxHealth: 4,
      radius: 34,
      vx: -5,
      vy: 3
    },
    {
      id: "asteroid-fuel-2",
      label: "GAS",
      kind: "fuel",
      x: -560,
      y: -60,
      health: 4,
      maxHealth: 4,
      radius: 34,
      vx: 4,
      vy: 2
    },
    {
      id: "asteroid-fuel-3",
      label: "GAS",
      kind: "fuel",
      x: 620,
      y: -360,
      health: 4,
      maxHealth: 4,
      radius: 34,
      vx: -4,
      vy: 2.5
    },
    {
      id: "asteroid-a",
      label: "A",
      kind: "points",
      x: -310,
      y: 40,
      health: 5,
      maxHealth: 5,
      radius: 36,
      vx: 4,
      vy: -2
    },
    {
      id: "asteroid-up",
      label: "UP",
      kind: "upgrade",
      upgrade: "shield",
      x: 190,
      y: -390,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: -3,
      vy: 4
    },
    {
      id: "asteroid-tank",
      label: "UP",
      kind: "upgrade",
      upgrade: "tank",
      x: -470,
      y: -360,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: 3,
      vy: 2
    },
    {
      id: "asteroid-rapid",
      label: "UP",
      kind: "upgrade",
      upgrade: "rapidFire",
      x: 500,
      y: 340,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: -2,
      vy: -3
    },
    {
      id: "asteroid-spread",
      label: "UP",
      kind: "upgrade",
      upgrade: "spreadShot",
      x: -650,
      y: 340,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: 2.5,
      vy: -3
    },
    {
      id: "asteroid-life",
      label: "UP",
      kind: "upgrade",
      upgrade: "extraLife",
      x: 720,
      y: 80,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: -3,
      vy: -2
    },
    {
      id: "asteroid-big-laser",
      label: "UP",
      kind: "upgrade",
      upgrade: "bigLaser",
      x: -760,
      y: -220,
      health: 6,
      maxHealth: 6,
      radius: 38,
      vx: 3,
      vy: 2
    }
  ]);
}

function keepAsteroidsAwayFromStart(asteroids: AsteroidObject[]) {
  const safeZones = [INITIAL_SHIP_POSITION, INITIAL_EARTH_POSITION];

  return asteroids.map((asteroid, index) => {
    for (const zone of safeZones) {
      const dx = asteroid.x - zone.x;
      const dy = asteroid.y - zone.y;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const minimumDistance = SPAWN_SAFE_RADIUS + asteroid.radius;

      if (currentDistance >= minimumDistance) continue;

      const fallbackAngle = (index * 1.37) % (Math.PI * 2);
      const angle = currentDistance > 1 ? Math.atan2(dy, dx) : fallbackAngle;
      asteroid.x = zone.x + Math.cos(angle) * minimumDistance;
      asteroid.y = zone.y + Math.sin(angle) * minimumDistance;
    }

    return asteroid;
  });
}

function getAsteroidImage(asteroid: AsteroidObject) {
  const lostHealth = asteroid.maxHealth - asteroid.health;
  if (lostHealth >= Math.ceil(asteroid.maxHealth * 0.68)) return cosmoletrandoAssets.asteroideQuaseQuebrado;
  if (lostHealth >= Math.ceil(asteroid.maxHealth * 0.34)) return cosmoletrandoAssets.asteroideRachado;
  return cosmoletrandoAssets.asteroide;
}

function getShipImage(lives: number) {
  if (lives <= 1) return cosmoletrandoAssets.naveDanificada;
  if (lives === 2) return cosmoletrandoAssets.naveIntermediaria;
  return cosmoletrandoAssets.naveInteira;
}

function getUpgradePickupLabel(upgrade?: AsteroidObject["upgrade"]) {
  if (upgrade === "extraLife") return "X";
  if (upgrade === "bigLaser") return "L";
  if (upgrade === "spreadShot") return "3";
  if (upgrade === "rapidFire") return ">>";
  if (upgrade === "tank") return "+";
  if (upgrade === "shield") return "S";
  if (upgrade === "magnet") return "I";
  return "UP";
}

export default function MissaoEspacial() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const faseId = useMemo(() => {
    const rawFaseId = Array.isArray(params.faseId) ? params.faseId[0] : params.faseId;
    const parsed = parseInt(String(rawFaseId || ""), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [params.faseId]);
  const { width, height } = useWindowDimensions();
  const fallbackMissionWord = useMemo(() => normalizeWord(params.missionWord), [params.missionWord]);
  const [missionWordBanco, setMissionWordBanco] = useState("");
  const missionWord = missionWordBanco || fallbackMissionWord;

  const [, forceRender] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [controlMode, setControlModeState] = useState<ControlMode>("buttons");
  const [fireActive, setFireActive] = useState(false);
  const [message, setMessage] = useState(`Sua missao e trazer a palavra ${missionWord} do espaco!`);

  const phaseRef = useRef<GamePhase>("intro");
  const inputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    brake: false,
    fire: false
  });
  const lastShotRef = useRef(0);
  const completionSavedRef = useRef(false);
  const lastFrameRef = useRef<number | null>(null);
  const lastRenderRef = useRef(0);
  const accumulatedFrameRef = useRef(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const earthChoiceOpenRef = useRef(false);
  const controlModeRef = useRef<ControlMode>("buttons");
  const targetRef = useRef({ active: false, x: 0, y: 0 });
  const missionWordRef = useRef(missionWord);

  const gameRef = useRef({
    maxFuel: fuelForWord(missionWord),
    spreadShot: 0,
    laserSize: 1,
    ship: {
      x: INITIAL_SHIP_POSITION.x,
      y: INITIAL_SHIP_POSITION.y,
      vx: 0,
      vy: 0,
      angle: 0,
      lives: 3,
      fuel: fuelForWord(missionWord)
    },
    earth: INITIAL_EARTH_POSITION,
    letters: createLetters(missionWord),
    asteroids: [] as AsteroidObject[],
    lasers: [] as LaserObject[],
    pickups: [] as PickupObject[],
    collectedIndex: 0,
    returning: false,
    ended: false,
    touchingEarth: false,
    shield: 0,
    shotCooldown: 260,
    magnet: false
  });

  if (gameRef.current.asteroids.length === 0) {
    gameRef.current.asteroids = createAsteroids(gameRef.current.letters);
  }

  useEffect(() => {
    let ativo = true;

    async function carregarPalavra() {
      const palavra = await carregarPalavraCosmoletrando(fallbackMissionWord);
      if (!ativo) return;

      const normalizada = normalizeWord(palavra);
      setMissionWordBanco(normalizada);
    }

    carregarPalavra();

    return () => {
      ativo = false;
    };
  }, [fallbackMissionWord]);

  const restartWithNewWord = useCallback(async () => {
    const palavra = await carregarPalavraCosmoletrando(
      fallbackMissionWord,
      missionWordRef.current
    );
    const normalizada = normalizeWord(palavra);

    if (normalizada && normalizada !== missionWordRef.current) {
      setMissionWordBanco(normalizada);
      return;
    }

    resetMission();
  }, [fallbackMissionWord, resetMission]);

  const camera = {
    x: gameRef.current.ship.x,
    y: gameRef.current.ship.y
  };

  const toScreen = useCallback(
    (point: Vector2) => ({
      x: width / 2 + point.x - camera.x,
      y: height / 2 + point.y - camera.y
    }),
    [camera.x, camera.y, height, width]
  );

  const showMessage = useCallback((text: string, duration = 2300) => {
    setMessage(text);

    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = setTimeout(() => {
      setMessage("");
    }, duration);
  }, []);

  const resetMission = useCallback(() => {
    const letters = createLetters(missionWord);
    const maxFuel = fuelForWord(missionWord);
    completionSavedRef.current = false;

    gameRef.current = {
      maxFuel,
      ship: {
        x: INITIAL_SHIP_POSITION.x,
        y: INITIAL_SHIP_POSITION.y,
        vx: 0,
        vy: 0,
        angle: 0,
        lives: 3,
        fuel: maxFuel
      },
      earth: INITIAL_EARTH_POSITION,
      letters,
      asteroids: createAsteroids(letters),
      lasers: [],
      pickups: [],
      collectedIndex: 0,
      returning: false,
      ended: false,
      touchingEarth: false,
      shield: 0,
      shotCooldown: 260,
      magnet: false,
      spreadShot: 0,
      laserSize: 1
    };

    inputRef.current = {
      up: false,
      down: false,
      left: false,
      right: false,
      brake: false,
      fire: false
    };
    targetRef.current.active = false;
    accumulatedFrameRef.current = 0;
    lastFrameRef.current = null;
    lastRenderRef.current = 0;
    setFireActive(false);
    setTutorialStep(0);
    phaseRef.current = "intro";
    setPhase("intro");
    setMessage("");
    forceRender((value) => value + 1);
  }, [missionWord]);

  useEffect(() => {
    missionWordRef.current = missionWord;
    resetMission();
  }, [missionWord, resetMission]);

  const toggleFireInput = useCallback(() => {
    const nextValue = !inputRef.current.fire;
    inputRef.current.fire = nextValue;
    setFireActive(nextValue);
  }, []);

  const setControlMode = useCallback((mode: ControlMode) => {
    controlModeRef.current = mode;
    targetRef.current.active = false;
    inputRef.current.up = false;
    inputRef.current.down = false;
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.brake = false;
    setControlModeState(mode);
  }, []);

  const startMission = useCallback(() => {
    gameRef.current.ship.lives = 3;
    phaseRef.current = "playing";
    setPhase("playing");
    forceRender((value) => value + 1);
    showMessage(`Sua missao e trazer a palavra ${missionWord} do espaco!`, 3200);
  }, [missionWord, showMessage]);

  const advanceTutorial = useCallback(() => {
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
      startMission();
      return;
    }

    setTutorialStep((step) => step + 1);
  }, [startMission, tutorialStep]);

  const backTutorial = useCallback(() => {
    setTutorialStep((step) => Math.max(0, step - 1));
  }, []);

  useFocusEffect(
    useCallback(() => {
      restartWithNewWord();
    }, [restartWithNewWord])
  );

  const continueMission = useCallback(() => {
    earthChoiceOpenRef.current = false;
    gameRef.current.touchingEarth = true;
    phaseRef.current = "playing";
    setPhase("playing");
  }, []);

  const finishWithoutFullReward = useCallback(() => {
    resetMission();
    router.replace("/Aluno");
  }, [resetMission, router]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "paused") {
      phaseRef.current = "playing";
      setPhase("playing");
      return;
    }

    if (phaseRef.current === "playing") {
      phaseRef.current = "paused";
      setPhase("paused");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    function tick(now: number) {
      const last = lastFrameRef.current ?? now;
      const rawDt = Math.min((now - last) / 1000, 0.05);
      lastFrameRef.current = now;

      if (phaseRef.current === "playing") {
        accumulatedFrameRef.current += rawDt;

        if (accumulatedFrameRef.current >= 1 / 24) {
          const dt = Math.min(accumulatedFrameRef.current, 0.05);
          accumulatedFrameRef.current = 0;
          updateGame(dt, now);
        }

        if (now - lastRenderRef.current > 100) {
          lastRenderRef.current = now;
          forceRender((value) => value + 1);
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
    // O loop usa refs de jogo/input para nao reiniciar a animacao a cada frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateGame(dt: number, now: number) {
    const game = gameRef.current;
    if (game.ended) return;

    const ship = game.ship;
    const input = inputRef.current;
    const target = targetRef.current;
    const mode = controlModeRef.current;

    let turn = 0;
    let autoThrust = false;

    if (mode === "buttons") {
      turn = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      ship.angle += turn * 3.1 * dt;
    }

    if (mode !== "buttons" && target.active) {
      const dx = target.x - ship.x;
      const dy = target.y - ship.y;
      const targetDistance = Math.sqrt(dx * dx + dy * dy);

      if (targetDistance > 34) {
        const targetAngle = Math.atan2(dx, -dy);
        const angleDelta = shortestAngleDelta(ship.angle, targetAngle);

        ship.angle += angleDelta * Math.min(1, dt * 7);
        autoThrust = Math.abs(angleDelta) < 0.75;
      } else if (mode === "tap") {
        target.active = false;
        brakeShip(ship, 0.12);
      }
    }

    const activeForward = forwardFromAngle(ship.angle);

    if ((input.up || autoThrust) && ship.fuel > 0) {
      ship.vx += activeForward.x * 230 * dt;
      ship.vy += activeForward.y * 230 * dt;
      ship.fuel = Math.max(
        0,
        ship.fuel - (autoThrust && !input.up ? FUEL_AUTO_ACCELERATION_COST : FUEL_ACCELERATION_COST) * dt
      );
    }

    if (mode === "buttons" && input.down && ship.fuel > 0) {
      ship.vx -= activeForward.x * 145 * dt;
      ship.vy -= activeForward.y * 145 * dt;
      ship.fuel = Math.max(0, ship.fuel - FUEL_REVERSE_COST * dt);
    }

    if (turn !== 0 && ship.fuel > 0) {
      ship.fuel = Math.max(0, ship.fuel - FUEL_TURN_COST * dt);
    }

    if (input.brake) {
      ship.vx *= Math.pow(0.015, dt);
      ship.vy *= Math.pow(0.015, dt);
    }

    if (input.fire && now - lastShotRef.current > game.shotCooldown) {
      lastShotRef.current = now;
      ship.fuel = Math.max(0, ship.fuel - FUEL_SHOT_COST);
      const coneAngles = game.spreadShot > 0 ? [-0.24, 0, 0.24] : [0];
      coneAngles.forEach((angleOffset, index) => {
        const shotAngle = ship.angle + angleOffset;
        const shotForward = forwardFromAngle(shotAngle);
        game.lasers.push({
          id: `laser-${now}-${index}`,
          x: ship.x + shotForward.x * 28,
          y: ship.y + shotForward.y * 28,
          angle: shotAngle,
          life: 0.75,
          size: game.laserSize
        });
      });
    }

    ship.vx *= 0.992;
    ship.vy *= 0.992;

    const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
    if (speed > 185) {
      ship.vx = (ship.vx / speed) * 185;
      ship.vy = (ship.vy / speed) * 185;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;

    updateAsteroids(dt);
    updateHiddenLetters();
    updateLasers(dt);
    updateMagnet(dt);
    handleLetterCollisions();
    handlePickupCollisions();
    handleEarthCollision();
    handleShipAsteroidCollision();

    if (ship.fuel <= 0) {
      game.ended = true;
      phaseRef.current = "gameOver";
      setPhase("gameOver");
      showMessage("Voce ficou sem combustivel.", 2600);
    }
  }

  function updateAsteroids(dt: number) {
    const game = gameRef.current;

    for (const asteroid of game.asteroids) {
      asteroid.x += asteroid.vx * dt;
      asteroid.y += asteroid.vy * dt;
    }
  }

  function updateHiddenLetters() {
    const now = Date.now();

    for (const letter of gameRef.current.letters) {
      if (letter.hiddenUntil && now >= letter.hiddenUntil) {
        letter.hiddenUntil = 0;
        letter.revealed = true;
      }
    }
  }

  function updateLasers(dt: number) {
    const game = gameRef.current;

    game.lasers = game.lasers
      .map((laser) => {
        const forward = forwardFromAngle(laser.angle);
        return {
          ...laser,
          x: laser.x + forward.x * 430 * dt,
          y: laser.y + forward.y * 430 * dt,
          life: laser.life - dt
        };
      })
      .filter((laser) => laser.life > 0);

    const lasersToRemove = new Set<string>();
    const asteroidsToRemove = new Set<string>();

    for (const laser of game.lasers) {
      for (const asteroid of game.asteroids) {
        if (distance(laser, asteroid) < asteroid.radius + laser.size * 9) {
          lasersToRemove.add(laser.id);
          asteroid.health -= 1;

          if (asteroid.health <= 0) {
            asteroidsToRemove.add(asteroid.id);

            if (asteroid.kind === "fuel") {
              game.pickups.push({
                id: `pickup-${asteroid.id}`,
                kind: "fuel",
                x: asteroid.x,
                y: asteroid.y
              });
              showMessage("Combustivel liberado!", 1700);
            }

            if (asteroid.kind === "upgrade" && asteroid.upgrade) {
              game.pickups.push({
                id: `pickup-${asteroid.id}`,
                kind: "upgrade",
                upgrade: asteroid.upgrade,
                x: asteroid.x,
                y: asteroid.y
              });
              showMessage("Upgrade liberado!", 1700);
            }

            if (asteroid.kind === "letter" && asteroid.letterId) {
              const letter = game.letters.find((item) => item.id === asteroid.letterId);

              if (letter) {
                letter.x = asteroid.x;
                letter.y = asteroid.y;
                letter.revealed = true;
                showMessage(`Letra ${letter.value} liberada!`, 1300);
              }
            }
          }
          break;
        }
      }
    }

    game.lasers = game.lasers.filter((laser) => !lasersToRemove.has(laser.id));
    game.asteroids = game.asteroids.filter((asteroid) => !asteroidsToRemove.has(asteroid.id));
  }

  function updateMagnet(dt: number) {
    const game = gameRef.current;
    if (!game.magnet) return;

    const palavraAtual = missionWordRef.current;
    const nextLetter = palavraAtual[game.collectedIndex];
    const letter = game.letters.find((item) => item.revealed && !item.collected && item.value === nextLetter);
    if (!letter) return;

    const dx = game.ship.x - letter.x;
    const dy = game.ship.y - letter.y;
    const pullDistance = Math.sqrt(dx * dx + dy * dy);

    if (pullDistance > 140 || pullDistance < 1) return;

    letter.x += (dx / pullDistance) * 120 * dt;
    letter.y += (dy / pullDistance) * 120 * dt;
  }

  function applyUpgrade(upgrade: NonNullable<AsteroidObject["upgrade"]>) {
    const game = gameRef.current;

    if (upgrade === "shield") {
      game.shield = Math.min(2, game.shield + 1);
      showMessage("Escudo ativado!", 1800);
      return;
    }

    if (upgrade === "tank") {
      game.maxFuel += 20;
      game.ship.fuel = clamp(game.ship.fuel + 20, 0, game.maxFuel);
      showMessage("Tanque maior!", 1800);
      return;
    }

    if (upgrade === "rapidFire") {
      game.shotCooldown = Math.max(150, game.shotCooldown - 70);
      showMessage("Tiro mais rapido!", 1800);
      return;
    }

    if (upgrade === "spreadShot") {
      game.spreadShot = Math.min(2, game.spreadShot + 1);
      showMessage("Tiro em cone ativado!", 1800);
      return;
    }

    if (upgrade === "extraLife") {
      game.ship.lives = Math.min(3, game.ship.lives + 1);
      showMessage("Nave reparada!", 1800);
      return;
    }

    if (upgrade === "bigLaser") {
      game.laserSize = Math.min(2.2, game.laserSize + 0.45);
      showMessage("Laser maior!", 1800);
      return;
    }

    game.magnet = true;
    showMessage("Ima de letras ativado!", 1800);
  }

  function handleLetterCollisions() {
    const game = gameRef.current;
    const palavraAtual = missionWordRef.current;
    const nextLetter = palavraAtual[game.collectedIndex];
    if (!nextLetter || game.returning) return;

    for (const letter of game.letters) {
      if (letter.collected || !letter.revealed) continue;

      if (distance(game.ship, letter) < SHIP_RADIUS + 24) {
        if (letter.value !== nextLetter) {
          game.ship.fuel = Math.max(0, game.ship.fuel - 7);
          letter.revealed = false;

          if (letter.id.startsWith("extra-letter")) {
            letter.collected = true;
          } else {
            letter.hiddenUntil = Date.now() + 2600;
            letter.x += game.ship.x <= letter.x ? 70 : -70;
            letter.y += game.ship.y <= letter.y ? 70 : -70;
          }

          showMessage("Acho que nao e isto que devo pegar...", 2100);
          return;
        }

        letter.collected = true;
        game.collectedIndex += 1;

        if (game.collectedIndex >= palavraAtual.length) {
          game.returning = true;
          showMessage("Hora de retornar para casa!", 2600);
        }
        return;
      }
    }
  }

  function handlePickupCollisions() {
    const game = gameRef.current;
    const pickupsToRemove = new Set<string>();

    for (const pickup of game.pickups) {
      if (distance(game.ship, pickup) >= SHIP_RADIUS + 25) continue;

      pickupsToRemove.add(pickup.id);

      if (pickup.kind === "fuel") {
        game.ship.fuel = clamp(game.ship.fuel + 28, 0, game.maxFuel);
        showMessage("Combustivel recuperado!", 1700);
        continue;
      }

      if (pickup.upgrade) {
        applyUpgrade(pickup.upgrade);
      }
    }

    if (pickupsToRemove.size > 0) {
      game.pickups = game.pickups.filter((pickup) => !pickupsToRemove.has(pickup.id));
    }
  }

  const registrarConclusaoDaFase = useCallback(() => {
    if (completionSavedRef.current || !faseId) return;

    completionSavedRef.current = true;
    atualizarPerfil("cosmoletrando", missionWordRef.current.length, 0, faseId).catch((error) => {
      console.log("Erro ao salvar progresso do Cosmoletrando:", error);
    });
  }, [faseId]);

  function handleEarthCollision() {
    const game = gameRef.current;
    const reachedEarth = distance(game.ship, game.earth) <= EARTH_RADIUS + SHIP_RADIUS;

    if (!reachedEarth) {
      game.touchingEarth = false;
      earthChoiceOpenRef.current = false;
      return;
    }

    if (game.returning) {
      game.ended = true;
      game.ship.vx = 0;
      game.ship.vy = 0;
      phaseRef.current = "success";
      setPhase("success");
      registrarConclusaoDaFase();
      showMessage("Missao completa!", 2400);
      return;
    }

    if (game.touchingEarth || earthChoiceOpenRef.current) return;

    game.touchingEarth = true;
    earthChoiceOpenRef.current = true;
    phaseRef.current = "returnChoice";
    setPhase("returnChoice");
  }

  const setMoveInput = useCallback(
    (key: "up" | "down" | "left" | "right" | "brake", value: boolean) => {
      inputRef.current[key] = value;
    },
    []
  );

  const updateTouchTarget = useCallback(
    (event: GestureResponderEvent, keepActive: boolean) => {
      const { locationX, locationY } = event.nativeEvent;
      const ship = gameRef.current.ship;

      targetRef.current = {
        active: keepActive,
        x: ship.x + locationX - width / 2,
        y: ship.y + locationY - height / 2
      };
    },
    [height, width]
  );

  const handleWorldTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (phaseRef.current !== "playing") return;

      if (controlModeRef.current === "follow") {
        updateTouchTarget(event, true);
      }

      if (controlModeRef.current === "tap") {
        updateTouchTarget(event, true);
      }
    },
    [updateTouchTarget]
  );

  const handleWorldTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (phaseRef.current !== "playing" || controlModeRef.current !== "follow") return;
      updateTouchTarget(event, true);
    },
    [updateTouchTarget]
  );

  const handleWorldTouchEnd = useCallback(() => {
    if (controlModeRef.current === "follow") {
      targetRef.current.active = false;
      brakeShip(gameRef.current.ship, 0.12);
    }
  }, []);

  const stopShip = useCallback(() => {
    targetRef.current.active = false;
    inputRef.current.brake = false;
    brakeShip(gameRef.current.ship, 0.05);
    forceRender((value) => value + 1);
  }, []);

  const goToMap = useCallback(() => {
    const missionCompleted = phaseRef.current === "success";

    if (missionCompleted) {
      registrarConclusaoDaFase();
    }

    resetMission();

    if (missionCompleted && faseId) {
      router.replace({
        pathname: "/Aluno",
        params: { faseConcluida: String(faseId) }
      });
      return;
    }

    router.replace("/Aluno");
  }, [faseId, registrarConclusaoDaFase, resetMission, router]);

  function handleShipAsteroidCollision() {
    const game = gameRef.current;

    for (const asteroid of game.asteroids) {
      if (distance(game.ship, asteroid) < SHIP_RADIUS + asteroid.radius * 1.05) {
        const usedShield = game.shield > 0;

        if (game.shield > 0) {
          game.shield -= 1;
          showMessage("Escudo protegeu a nave!", 1400);
        } else {
          game.ship.lives -= 1;
        }

        game.ship.vx *= -0.45;
        game.ship.vy *= -0.45;
        asteroid.x += Math.sign(asteroid.x - game.ship.x || 1) * 24;
        asteroid.y += Math.sign(asteroid.y - game.ship.y || 1) * 24;

        if (game.ship.lives <= 0) {
          game.ended = true;
          phaseRef.current = "gameOver";
          setPhase("gameOver");
          showMessage("Sua nave ficou muito danificada.", 2600);
        } else if (!usedShield) {
          showMessage("Cuidado com os asteroides!", 1500);
        }
        return;
      }
    }
  }

  const game = gameRef.current;
  const shipScreen = toScreen(game.ship);
  const earthScreen = toScreen(game.earth);
  const shipForward = forwardFromAngle(game.ship.angle);
  const shipRight = rightFromAngle(game.ship.angle);
  const shipNose = {
    x: shipScreen.x + shipForward.x * 28,
    y: shipScreen.y + shipForward.y * 28
  };
  const shipInput = inputRef.current;
  const targetVisual = targetRef.current;
  const targetVisualDx = targetVisual.x - game.ship.x;
  const targetVisualDy = targetVisual.y - game.ship.y;
  const targetVisualDistance = Math.sqrt(targetVisualDx * targetVisualDx + targetVisualDy * targetVisualDy);
  const targetVisualAngle = Math.atan2(targetVisualDx, -targetVisualDy);
  const targetVisualDelta =
    controlMode !== "buttons" && targetVisual.active && targetVisualDistance > 34
      ? shortestAngleDelta(game.ship.angle, targetVisualAngle)
      : 0;
  const autoTurnRight = targetVisualDelta > 0.18;
  const autoTurnLeft = targetVisualDelta < -0.18;
  const autoThrustVisual = targetVisual.active && targetVisualDistance > 34 && Math.abs(targetVisualDelta) < 0.75;
  const leftJetStart = {
    x: shipScreen.x - shipForward.x * 6 - shipRight.x * 20,
    y: shipScreen.y - shipForward.y * 6 - shipRight.y * 20
  };
  const rightJetStart = {
    x: shipScreen.x - shipForward.x * 6 + shipRight.x * 20,
    y: shipScreen.y - shipForward.y * 6 + shipRight.y * 20
  };
  const thrustActive = shipInput.up || autoThrustVisual;
  const mainFlame = createFlameShape(
    {
      x: shipScreen.x - shipForward.x * 24,
      y: shipScreen.y - shipForward.y * 24
    },
    { x: -shipForward.x, y: -shipForward.y },
    18,
    34
  );
  const leftTurnFlame = createFlameShape(leftJetStart, { x: -shipRight.x, y: -shipRight.y }, 12, 25);
  const rightTurnFlame = createFlameShape(rightJetStart, shipRight, 12, 25);
  const reverseFlame = createFlameShape(shipNose, shipForward, 12, 23);
  const shipSprite = getShipImage(game.ship.lives);

  const nextMissionLetter = missionWord[game.collectedIndex];
  const objectiveCandidates = game.returning
    ? [game.earth]
    : [
        ...game.letters.filter(
          (letter) =>
            letter.revealed &&
            !letter.collected &&
            !letter.hiddenUntil &&
            letter.value === nextMissionLetter
        ),
        ...game.asteroids.filter(
          (asteroid) =>
            asteroid.kind === "letter" &&
            game.letters.find(
              (letter) =>
                letter.id === asteroid.letterId &&
                !letter.collected &&
                letter.value === nextMissionLetter
            )
        )
      ];
  const fuelAtual = Math.round(game.ship.fuel);
  const fuelGasto = Math.max(0, game.maxFuel - fuelAtual);
  const fuelPercent = clamp(game.ship.fuel / game.maxFuel, 0, 1);
  const displayedLives = phase === "intro" ? 3 : Math.round(clamp(game.ship.lives, 0, 3));
  const tutorial = TUTORIAL_STEPS[tutorialStep];
  const backgroundOffsetX = -wrapScreenPosition(camera.x * 0.34, width || 1);
  const backgroundOffsetY = -wrapScreenPosition(camera.y * 0.34, height || 1);

  return (
    <View style={styles.missaoContainer}>
      {[0, 1].map((row) =>
        [0, 1].map((column) => (
          <Image
            key={`${row}-${column}`}
            source={cosmoletrandoAssets.fundoEspaco}
            resizeMode="cover"
            style={[
              styles.missaoFundoImagem,
              {
                width,
                height,
                left: backgroundOffsetX + column * width,
                top: backgroundOffsetY + row * height
              }
            ]}
          />
        ))
      )}
      <Svg style={styles.missaoCanvas} width={width} height={height}>
        <SvgRect x={0} y={0} width={width} height={height} fill={colors.espacoFundo} opacity={0.14} />

        {objectiveCandidates.slice(0, 4).map((candidate, index) => {
          const candidateAngle = Math.atan2(candidate.y - game.ship.y, candidate.x - game.ship.x);
          const candidateDistance = clamp(distance(game.ship, candidate) / 280, 0.65, 1.2);
          const arrowLength = 76 * candidateDistance;
          const arrowCos = Math.cos(candidateAngle);
          const arrowSin = Math.sin(candidateAngle);
          const start = {
            x: shipScreen.x + arrowCos * (index === 0 ? 44 : 36),
            y: shipScreen.y + arrowSin * (index === 0 ? 44 : 36)
          };
          const end = {
            x: shipScreen.x + arrowCos * arrowLength,
            y: shipScreen.y + arrowSin * arrowLength
          };
          const headSize = index === 0 ? 12 : 8;
          const leftHead = {
            x: end.x - arrowCos * headSize - Math.cos(candidateAngle + Math.PI / 2) * headSize * 0.55,
            y: end.y - arrowSin * headSize - Math.sin(candidateAngle + Math.PI / 2) * headSize * 0.55
          };
          const rightHead = {
            x: end.x - arrowCos * headSize - Math.cos(candidateAngle - Math.PI / 2) * headSize * 0.55,
            y: end.y - arrowSin * headSize - Math.sin(candidateAngle - Math.PI / 2) * headSize * 0.55
          };

          return (
            <React.Fragment key={`pointer-${index}-${candidate.x}-${candidate.y}`}>
              <SvgLine
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={colors.palavraAtual}
                strokeWidth={index === 0 ? 4 : 2}
                opacity={index === 0 ? 1 : 0.55}
              />
              <SvgPolygon
                points={`${end.x},${end.y} ${leftHead.x},${leftHead.y} ${rightHead.x},${rightHead.y}`}
                fill={colors.palavraAtual}
                opacity={index === 0 ? 1 : 0.55}
              />
            </React.Fragment>
          );
        })}

        {(shipInput.right || autoTurnRight) && <Flame shape={leftTurnFlame} />}
        {(shipInput.left || autoTurnLeft) && <Flame shape={rightTurnFlame} />}
        {shipInput.down && <Flame shape={reverseFlame} />}
        {thrustActive && (
          <Flame shape={mainFlame} />
        )}
      </Svg>

      {game.lasers.map((laser) => {
        const screen = toScreen(laser);
        return (
          <Image
            key={laser.id}
            pointerEvents="none"
            source={cosmoletrandoAssets.laser}
            resizeMode="contain"
            style={[
              styles.missaoSpriteLaser,
              {
                width: 18 * laser.size,
                height: 46 * laser.size,
                left: screen.x - 9 * laser.size,
                top: screen.y - 23 * laser.size,
                transform: [{ rotate: `${laser.angle + Math.PI}rad` }]
              }
            ]}
          />
        );
      })}

      <Image
        pointerEvents="none"
        source={cosmoletrandoAssets.terra}
        style={[
          styles.missaoSpriteTerra,
          {
            left: earthScreen.x - EARTH_RADIUS,
            top: earthScreen.y - EARTH_RADIUS
          }
        ]}
      />

      {game.asteroids.map((asteroid) => {
        const screen = toScreen(asteroid);
        const size = asteroid.radius * 2.25;

        return (
          <Image
            key={`${asteroid.id}-sprite`}
            pointerEvents="none"
            source={getAsteroidImage(asteroid)}
            style={[
              styles.missaoSpriteAsteroide,
              {
                width: size,
                height: size,
                left: screen.x - size / 2,
                top: screen.y - size / 2
              }
            ]}
          />
        );
      })}

      {game.pickups.map((pickup) => {
        const screen = toScreen(pickup);

        if (pickup.kind === "fuel") {
          return (
            <Image
              key={pickup.id}
              pointerEvents="none"
              source={cosmoletrandoAssets.combustivel}
              resizeMode="contain"
              style={[
                styles.missaoSpritePickup,
                {
                  left: screen.x - 22,
                  top: screen.y - 26
                }
              ]}
            />
          );
        }

        return (
          <View
            key={pickup.id}
            pointerEvents="none"
            style={[
              styles.missaoUpgradePickup,
              {
                left: screen.x - 22,
                top: screen.y - 22
              }
            ]}
          >
            <Text style={styles.missaoUpgradePickupTexto}>{getUpgradePickupLabel(pickup.upgrade)}</Text>
          </View>
        );
      })}

      <Image
        pointerEvents="none"
        source={shipSprite}
        style={[
          styles.missaoSpriteNave,
          {
            left: shipScreen.x - 30,
            top: shipScreen.y - 36,
            transform: [{ rotate: `${game.ship.angle}rad` }]
          }
        ]}
      />

      <View
        pointerEvents={controlMode === "buttons" || phase !== "playing" ? "none" : "auto"}
        style={styles.missaoTouchArea}
        onTouchStart={handleWorldTouchStart}
        onTouchMove={handleWorldTouchMove}
        onTouchEnd={handleWorldTouchEnd}
        onTouchCancel={handleWorldTouchEnd}
      />

      {game.letters.map((letter) => {
        if (letter.collected || !letter.revealed) return null;
        const screen = toScreen(letter);
        return (
          <Text
            key={letter.id}
            pointerEvents="none"
            style={[
              styles.missaoLetraTexto,
              {
                position: "absolute",
                left: screen.x - 12,
                top: screen.y - 26,
                color: letter.value === missionWord[game.collectedIndex] ? colors.palavraAtual : colors.branco
              }
            ]}
          >
            {letter.value}
          </Text>
        );
      })}

      {game.asteroids.map((asteroid) => {
        const screen = toScreen(asteroid);
        return (
          <Text
            key={`${asteroid.id}-label`}
            pointerEvents="none"
            style={[
              styles.missaoObjetoLabel,
              {
                position: "absolute",
                left: screen.x - 22,
                top: screen.y - 12,
                width: 44,
                textAlign: "center"
              }
            ]}
          >
            {asteroid.label}
          </Text>
        );
      })}

      <View pointerEvents="box-none" style={styles.missaoHudTopo}>
        <View style={styles.missaoHudBloco}>
          <Text style={styles.missaoHudTexto}>Gasolina: {fuelAtual}/{game.maxFuel}</Text>
          <View style={styles.missaoFuelBarra}>
            <View style={[styles.missaoFuelBarraPreenchida, { width: `${fuelPercent * 100}%` }]} />
          </View>
          <Text style={styles.missaoHudTexto}>Gasta: {fuelGasto}</Text>
          <View style={styles.missaoVidasLinha}>
            {[0, 1, 2].map((lifeIndex) => (
              <Image
                key={lifeIndex}
                source={cosmoletrandoAssets.naveInteira}
                resizeMode="contain"
                style={[
                  styles.missaoVidaNave,
                  lifeIndex >= displayedLives && styles.missaoVidaNaveApagada
                ]}
              />
            ))}
          </View>
          {game.shield > 0 && <Text style={styles.missaoHudTexto}>Escudo: {game.shield}</Text>}
          {game.shotCooldown < 260 && <Text style={styles.missaoHudTexto}>Tiro rapido</Text>}
          {game.spreadShot > 0 && <Text style={styles.missaoHudTexto}>Tiro em cone</Text>}
          {game.laserSize > 1 && <Text style={styles.missaoHudTexto}>Laser grande</Text>}
          {game.magnet && <Text style={styles.missaoHudTexto}>Ima ativo</Text>}
        </View>

        <TouchableOpacity style={styles.missaoPauseBotao} onPress={togglePause}>
          <Text style={styles.missaoPauseTexto}>II</Text>
        </TouchableOpacity>
      </View>

      {!!message && (
        <View pointerEvents="none" style={styles.missaoPensamento}>
          <Text style={styles.missaoPensamentoTexto}>{message}</Text>
        </View>
      )}

      <View pointerEvents="box-none" style={styles.missaoControleArea}>
        {controlMode === "buttons" ? (
          <View style={styles.missaoDirecional}>
            <ControlButton label="↑" onChange={(value) => setMoveInput("up", value)} />
            <View style={styles.missaoDirecionalLinha}>
              <ControlButton label="←" onChange={(value) => setMoveInput("left", value)} />
              <ControlButton label="■" onChange={(value) => setMoveInput("brake", value)} />
              <ControlButton label="→" onChange={(value) => setMoveInput("right", value)} />
            </View>
            <ControlButton label="↓" onChange={(value) => setMoveInput("down", value)} />
          </View>
        ) : (
          <View style={styles.missaoControleDicaGrupo}>
            <View style={styles.missaoControleDica}>
              <Text style={styles.missaoControleDicaTexto}>
                {controlMode === "follow" ? "Arraste o dedo" : "Toque no destino"}
              </Text>
            </View>
            <TouchableOpacity style={styles.missaoPararBotao} onPress={stopShip}>
              <Text style={styles.missaoControleTexto}>■</Text>
            </TouchableOpacity>
          </View>
        )}

        <FireButton active={fireActive} onPress={toggleFireInput} />
      </View>

      <View pointerEvents="none" style={styles.missaoPalavra}>
        <View style={styles.missaoPalavraLinha}>
          {missionWord.split("").map((letter, index) => {
            const collected = index < game.collectedIndex;
            const current = index === game.collectedIndex;

            return (
              <View key={`${letter}-${index}`} style={styles.missaoLetraSlot}>
                <Text
                  style={[
                    styles.missaoLetraTexto,
                    {
                      color: collected
                        ? colors.branco
                        : current
                          ? colors.palavraAtual
                          : colors.palavraFutura
                    }
                  ]}
                >
                  {letter}
                </Text>
                <Text style={styles.missaoIndicadorLetra}>{current ? "^" : " "}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {phase === "intro" && (
        <View style={styles.missaoOverlay}>
          <View style={styles.missaoOverlayBox}>
            <Text style={styles.missaoOverlayProgresso}>
              {tutorialStep + 1}/{TUTORIAL_STEPS.length}
            </Text>
            <Text style={styles.missaoOverlayTitulo}>{tutorial.title}</Text>
            <Text style={styles.missaoOverlayTexto}>{tutorial.text}</Text>
            <View style={styles.missaoModoControleBox}>
              <Text style={styles.missaoOverlayTexto}>Controle</Text>
              <View style={styles.missaoModoControleLinha}>
                <ModeButton
                  label="Botoes"
                  active={controlMode === "buttons"}
                  onPress={() => setControlMode("buttons")}
                />
                <ModeButton
                  label="Dedo"
                  active={controlMode === "follow"}
                  onPress={() => setControlMode("follow")}
                />
                <ModeButton
                  label="Tocar"
                  active={controlMode === "tap"}
                  onPress={() => setControlMode("tap")}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.missaoOverlayBotao} onPress={advanceTutorial}>
              <Text style={styles.missaoOverlayBotaoTexto}>
                {tutorialStep >= TUTORIAL_STEPS.length - 1 ? "Iniciar jogo" : "Proximo"}
              </Text>
            </TouchableOpacity>
            {tutorialStep < TUTORIAL_STEPS.length - 1 && (
              <TouchableOpacity
                style={[styles.missaoOverlayBotao, styles.missaoOverlayBotaoSecundario]}
                onPress={startMission}
              >
                <Text style={styles.missaoOverlayBotaoTexto}>Pular tutorial</Text>
              </TouchableOpacity>
            )}
            {tutorialStep > 0 && (
              <TouchableOpacity
                style={[styles.missaoOverlayBotao, styles.missaoOverlayBotaoSecundario]}
                onPress={backTutorial}
              >
                <Text style={styles.missaoOverlayBotaoTexto}>Voltar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {phase === "returnChoice" && (
        <View style={styles.missaoOverlay}>
          <View style={styles.missaoOverlayBox}>
            <Text style={styles.missaoOverlayTitulo}>Palavra incompleta</Text>
            <Text style={styles.missaoOverlayTexto}>
              Deseja voltar? A palavra esta incompleta e voce nao recebera todos os premios.
            </Text>
            <TouchableOpacity style={styles.missaoOverlayBotao} onPress={continueMission}>
              <Text style={styles.missaoOverlayBotaoTexto}>Continuar missao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.missaoOverlayBotao, styles.missaoOverlayBotaoSecundario]}
              onPress={finishWithoutFullReward}
            >
              <Text style={styles.missaoOverlayBotaoTexto}>Encerrar e voltar ao mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {phase === "paused" && (
        <View style={styles.missaoOverlay}>
          <View style={styles.missaoOverlayBox}>
            <Text style={styles.missaoOverlayTitulo}>Pausa</Text>
            <Text style={styles.missaoOverlayTexto}>
              Vida: {game.ship.lives}{"\n"}
              Combustivel: {Math.round(game.ship.fuel)}{"\n"}
              Velocidade: {Math.round(Math.sqrt(game.ship.vx * game.ship.vx + game.ship.vy * game.ship.vy))}
            </Text>
            <TouchableOpacity style={styles.missaoOverlayBotao} onPress={togglePause}>
              <Text style={styles.missaoOverlayBotaoTexto}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.missaoOverlayBotao, styles.missaoOverlayBotaoSecundario]}
              onPress={() => {
                phaseRef.current = "playing";
                goToMap();
              }}
            >
              <Text style={styles.missaoOverlayBotaoTexto}>Desistir e voltar ao mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(phase === "success" || phase === "gameOver") && (
        <View style={styles.missaoOverlay}>
          <View style={styles.missaoOverlayBox}>
            <Text style={styles.missaoOverlayTitulo}>
              {phase === "success" ? "Missao completa!" : "Fim da missao"}
            </Text>
            <Text style={styles.missaoOverlayTexto}>
              {phase === "success"
                ? "Voce voltou para a Terra com a palavra."
                : "Voce ficou sem combustivel ou a nave foi danificada."}
            </Text>
            <TouchableOpacity style={styles.missaoOverlayBotao} onPress={goToMap}>
              <Text style={styles.missaoOverlayBotaoTexto}>Voltar ao mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.missaoOverlayBotao, styles.missaoOverlayBotaoSecundario]}
              onPress={restartWithNewWord}
            >
              <Text style={styles.missaoOverlayBotaoTexto}>
                Jogar novamente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function ControlButton({
  label,
  large,
  onChange
}: {
  label: string;
  large?: boolean;
  onChange: (pressed: boolean) => void;
}) {
  return (
    <View
      style={[
        styles.missaoControleBotao,
        large && styles.missaoControleBotaoGrande
      ]}
      onTouchStart={() => onChange(true)}
      onTouchEnd={() => onChange(false)}
      onTouchCancel={() => onChange(false)}
    >
      <Text style={styles.missaoControleTexto}>{label}</Text>
    </View>
  );
}

function FireButton({
  active,
  onPress
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.missaoControleBotao,
        styles.missaoControleBotaoGrande,
        active && styles.missaoControleBotaoAtivo
      ]}
      onPress={onPress}
    >
      <Text style={styles.missaoControleTexto}>◎</Text>
    </TouchableOpacity>
  );
}

function ModeButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.missaoModoControleBotao,
        active && styles.missaoModoControleBotaoAtivo
      ]}
      onPress={onPress}
    >
      <Text style={styles.missaoModoControleTexto}>{label}</Text>
    </TouchableOpacity>
  );
}
