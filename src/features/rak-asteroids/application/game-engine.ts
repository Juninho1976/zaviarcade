import {
  RAK_ASTEROIDS_DURATION_SECONDS,
  RAK_ASTEROIDS_STEP_SECONDS,
  RAK_ASTEROIDS_VIEWPORT,
  type Asteroid,
  type AsteroidSize,
  type Laser,
  type RakAsteroidsInput,
  type RakAsteroidsState,
  type Ship,
  type Vector,
} from "@/features/rak-asteroids/domain/game";

const asteroidRadius: Record<AsteroidSize, number> = { large: 62, medium: 34, small: 18 };
const asteroidPoints: Record<AsteroidSize, number> = { large: 100, medium: 250, small: 500 };
const rotationRadiansPerSecond = 3.1;
const thrustPerSecond = 230;
const maximumShipSpeed = 290;
const laserSpeed = 520;
const laserLifeSeconds = 1.35;
const fireCooldownSeconds = 0.18;

function createInitialAsteroids(): readonly Asteroid[] {
  return [
    { id: 1, size: "large", x: 125, y: 120, velocity: { x: 44, y: 30 }, angle: 0.2, rotationSpeed: 0.34 },
    { id: 2, size: "large", x: 825, y: 135, velocity: { x: -40, y: 34 }, angle: 1.7, rotationSpeed: -0.29 },
    { id: 3, size: "large", x: 160, y: 500, velocity: { x: 38, y: -43 }, angle: 2.8, rotationSpeed: 0.25 },
  ];
}

function createShip(invulnerableSeconds = 0): Ship {
  return {
    x: RAK_ASTEROIDS_VIEWPORT.width / 2,
    y: RAK_ASTEROIDS_VIEWPORT.height / 2,
    angle: -Math.PI / 2,
    invulnerableSeconds,
    velocity: { x: 0, y: 0 },
  };
}

export function createInitialRakAsteroidsState(): RakAsteroidsState {
  return {
    asteroids: createInitialAsteroids(),
    elapsedSeconds: 0,
    fireCooldownSeconds: 0,
    hits: 0,
    lasers: [],
    lives: 3,
    nextEntityId: 4,
    phase: "ready",
    score: 0,
    ship: createShip(),
    shotsFired: 0,
    status: "Rotate, thrust, and fire to start!",
  };
}

function wrap(value: number, maximum: number): number {
  return (value % maximum + maximum) % maximum;
}

function wrapVector(vector: Vector): Vector {
  return {
    x: wrap(vector.x, RAK_ASTEROIDS_VIEWPORT.width),
    y: wrap(vector.y, RAK_ASTEROIDS_VIEWPORT.height),
  };
}

function toroidalDistance(first: Vector, second: Vector): number {
  const rawX = Math.abs(first.x - second.x);
  const rawY = Math.abs(first.y - second.y);
  const x = Math.min(rawX, RAK_ASTEROIDS_VIEWPORT.width - rawX);
  const y = Math.min(rawY, RAK_ASTEROIDS_VIEWPORT.height - rawY);
  return Math.hypot(x, y);
}

function clampVelocity(velocity: Vector): Vector {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed <= maximumShipSpeed) return velocity;
  const ratio = maximumShipSpeed / speed;
  return { x: velocity.x * ratio, y: velocity.y * ratio };
}

function moveShip(ship: Ship, input: RakAsteroidsInput, seconds: number): Ship {
  const rotation = (Number(Boolean(input.rotateRight)) - Number(Boolean(input.rotateLeft))) * rotationRadiansPerSecond * seconds;
  const angle = ship.angle + rotation;
  const thrust = input.thrust ? thrustPerSecond : 0;
  const drag = Math.pow(0.992, seconds * 60);
  const velocity = clampVelocity({
    x: (ship.velocity.x + Math.cos(angle) * thrust * seconds) * drag,
    y: (ship.velocity.y + Math.sin(angle) * thrust * seconds) * drag,
  });
  return {
    ...ship,
    ...wrapVector({ x: ship.x + velocity.x * seconds, y: ship.y + velocity.y * seconds }),
    angle,
    invulnerableSeconds: Math.max(0, ship.invulnerableSeconds - seconds),
    velocity,
  };
}

function createLaser(state: RakAsteroidsState): Laser {
  const direction = { x: Math.cos(state.ship.angle), y: Math.sin(state.ship.angle) };
  return {
    id: state.nextEntityId,
    x: state.ship.x + direction.x * 24,
    y: state.ship.y + direction.y * 24,
    lifeSeconds: laserLifeSeconds,
    velocity: {
      x: state.ship.velocity.x + direction.x * laserSpeed,
      y: state.ship.velocity.y + direction.y * laserSpeed,
    },
  };
}

function moveLaser(laser: Laser, seconds: number): Laser {
  return {
    ...laser,
    ...wrapVector({ x: laser.x + laser.velocity.x * seconds, y: laser.y + laser.velocity.y * seconds }),
    lifeSeconds: laser.lifeSeconds - seconds,
  };
}

function moveAsteroid(asteroid: Asteroid, seconds: number): Asteroid {
  return {
    ...asteroid,
    ...wrapVector({
      x: asteroid.x + asteroid.velocity.x * seconds,
      y: asteroid.y + asteroid.velocity.y * seconds,
    }),
    angle: asteroid.angle + asteroid.rotationSpeed * seconds,
  };
}

function splitAsteroid(asteroid: Asteroid, firstId: number): readonly Asteroid[] {
  const childSize = asteroid.size === "large" ? "medium" : asteroid.size === "medium" ? "small" : undefined;
  if (!childSize) return [];
  const childCount = asteroid.size === "large" ? 4 : 2;
  const speedBoost = asteroid.size === "large" ? 72 : 105;
  return Array.from({ length: childCount }, (_, index) => {
    const angle = asteroid.angle + index * Math.PI * 2 / childCount;
    return {
      id: firstId + index,
      size: childSize,
      x: wrap(asteroid.x + Math.cos(angle) * 8, RAK_ASTEROIDS_VIEWPORT.width),
      y: wrap(asteroid.y + Math.sin(angle) * 8, RAK_ASTEROIDS_VIEWPORT.height),
      velocity: {
        x: asteroid.velocity.x * 0.45 + Math.cos(angle) * speedBoost,
        y: asteroid.velocity.y * 0.45 + Math.sin(angle) * speedBoost,
      },
      angle,
      rotationSpeed: (index % 2 === 0 ? 1 : -1) * (0.45 + index * 0.08),
    };
  });
}

function resolveLaserHits(state: RakAsteroidsState): RakAsteroidsState {
  const removedLasers = new Set<number>();
  const removedAsteroids = new Set<number>();
  const children: Asteroid[] = [];
  let nextEntityId = state.nextEntityId;
  let score = state.score;
  let hits = state.hits;

  for (const laser of state.lasers) {
    const asteroid = state.asteroids.find((candidate) =>
      !removedAsteroids.has(candidate.id) && toroidalDistance(laser, candidate) <= asteroidRadius[candidate.size] + 4,
    );
    if (!asteroid) continue;
    removedLasers.add(laser.id);
    removedAsteroids.add(asteroid.id);
    score += asteroidPoints[asteroid.size];
    hits += 1;
    const split = splitAsteroid(asteroid, nextEntityId);
    children.push(...split);
    nextEntityId += split.length;
  }

  if (removedAsteroids.size === 0) return state;
  return {
    ...state,
    asteroids: [...state.asteroids.filter((asteroid) => !removedAsteroids.has(asteroid.id)), ...children],
    hits,
    lasers: state.lasers.filter((laser) => !removedLasers.has(laser.id)),
    nextEntityId,
    score,
    status: children.length > 0 ? "Direct hit — it split!" : "Asteroid cleared!",
  };
}

function resolveShipCollision(state: RakAsteroidsState): RakAsteroidsState {
  if (state.ship.invulnerableSeconds > 0) return state;
  const collision = state.asteroids.some((asteroid) =>
    toroidalDistance(state.ship, asteroid) <= asteroidRadius[asteroid.size] + 16,
  );
  if (!collision) return state;
  const lives = state.lives - 1;
  if (lives === 0) return { ...state, lives, phase: "over", status: "Rak’s ship was hit — score saved!" };
  return {
    ...state,
    lives,
    ship: createShip(2.4),
    status: `${lives} ${lives === 1 ? "ship" : "ships"} left — back in the fight!`,
  };
}

export function stepRakAsteroids(
  state: RakAsteroidsState,
  input: RakAsteroidsInput = {},
  seconds = RAK_ASTEROIDS_STEP_SECONDS,
): RakAsteroidsState {
  if (input.endRunPressed && state.phase === "playing") {
    return { ...state, phase: "over", status: "Run ended — your score still counts!" };
  }
  if (input.restartPressed && (state.phase === "over" || state.phase === "won")) return createInitialRakAsteroidsState();
  if (state.phase === "over" || state.phase === "won") return state;
  const starting = state.phase === "ready" && (input.rotateLeft || input.rotateRight || input.thrust || input.firePressed);
  if (state.phase === "ready" && !starting) return state;

  let next: RakAsteroidsState = {
    ...state,
    asteroids: state.asteroids.map((asteroid) => moveAsteroid(asteroid, seconds)),
    elapsedSeconds: Math.min(RAK_ASTEROIDS_DURATION_SECONDS, state.elapsedSeconds + seconds),
    fireCooldownSeconds: Math.max(0, state.fireCooldownSeconds - seconds),
    lasers: state.lasers.map((laser) => moveLaser(laser, seconds)).filter((laser) => laser.lifeSeconds > 0),
    phase: "playing",
    ship: moveShip(state.ship, input, seconds),
    status: state.phase === "ready" ? "Clear every asteroid!" : state.status,
  };
  if (input.firePressed && next.fireCooldownSeconds <= 0) {
    next = {
      ...next,
      fireCooldownSeconds,
      lasers: [...next.lasers, createLaser(next)],
      nextEntityId: next.nextEntityId + 1,
      shotsFired: next.shotsFired + 1,
    };
  }
  next = resolveLaserHits(next);
  next = resolveShipCollision(next);
  if (next.phase === "over") return next;
  if (next.asteroids.length === 0) {
    const bonus = Math.ceil(RAK_ASTEROIDS_DURATION_SECONDS - next.elapsedSeconds) * 25 + next.lives * 500;
    return { ...next, phase: "won", score: next.score + bonus, status: `Sector cleared! +${bonus} bonus` };
  }
  if (next.elapsedSeconds >= RAK_ASTEROIDS_DURATION_SECONDS) {
    return { ...next, phase: "over", status: "Time’s up — your score still counts!" };
  }
  return next;
}

export function getAsteroidRadius(size: AsteroidSize): number {
  return asteroidRadius[size];
}
