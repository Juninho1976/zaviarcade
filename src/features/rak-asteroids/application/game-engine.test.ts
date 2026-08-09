import { describe, expect, it } from "vitest";
import {
  RAK_ASTEROIDS_DURATION_SECONDS,
  type Asteroid,
  type Laser,
  type RakAsteroidsState,
} from "@/features/rak-asteroids/domain/game";
import { createInitialRakAsteroidsState, stepRakAsteroids } from "./game-engine";

function laserAt(asteroid: Asteroid, id = 10_000): Laser {
  return { id, x: asteroid.x, y: asteroid.y, velocity: { x: 0, y: 0 }, lifeSeconds: 1 };
}

describe("Rak Asteroids game engine", () => {
  it("starts Rak centrally with three large asteroids and three lives", () => {
    const state = createInitialRakAsteroidsState();

    expect(state.ship).toMatchObject({ x: 480, y: 300 });
    expect(state.asteroids).toHaveLength(3);
    expect(state.asteroids.every((asteroid) => asteroid.size === "large")).toBe(true);
    expect(state.lives).toBe(3);
  });

  it("rotates, thrusts, wraps around the screen, and fires once per press", () => {
    let state = createInitialRakAsteroidsState();
    state = stepRakAsteroids(state, { rotateRight: true, thrust: true, firePressed: true }, 0.2);

    expect(state.phase).toBe("playing");
    expect(state.ship.angle).toBeGreaterThan(-Math.PI / 2);
    expect(Math.hypot(state.ship.velocity.x, state.ship.velocity.y)).toBeGreaterThan(0);
    expect(state.lasers).toHaveLength(1);
    expect(state.shotsFired).toBe(1);

    state = stepRakAsteroids({ ...state, ship: { ...state.ship, x: 959, velocity: { x: 100, y: 0 } } }, {}, 0.1);
    expect(state.ship.x).toBeLessThan(20);
  });

  it("splits one large asteroid into four medium asteroids", () => {
    const initial = createInitialRakAsteroidsState();
    const target = initial.asteroids[0];
    const state = stepRakAsteroids({
      ...initial,
      phase: "playing",
      lasers: [laserAt(target)],
    }, {}, 0);

    expect(state.asteroids.filter((asteroid) => asteroid.size === "large")).toHaveLength(2);
    expect(state.asteroids.filter((asteroid) => asteroid.size === "medium")).toHaveLength(4);
    expect(state.score).toBe(100);
  });

  it("splits one medium asteroid into two small asteroids", () => {
    const initial = createInitialRakAsteroidsState();
    const medium: Asteroid = { ...initial.asteroids[0], id: 20, size: "medium" };
    const state = stepRakAsteroids({
      ...initial,
      asteroids: [medium],
      phase: "playing",
      lasers: [laserAt(medium)],
      nextEntityId: 21,
    }, {}, 0);

    expect(state.asteroids).toHaveLength(2);
    expect(state.asteroids.every((asteroid) => asteroid.size === "small")).toBe(true);
    expect(state.score).toBe(250);
  });

  it("can clear the complete split tree with 39 accurate shots", () => {
    let state: RakAsteroidsState = { ...createInitialRakAsteroidsState(), phase: "playing" };
    let shots = 0;
    while (state.phase !== "won" && shots < 50) {
      const target = state.asteroids[0];
      state = stepRakAsteroids({ ...state, lasers: [laserAt(target, 10_000 + shots)] }, {}, 0);
      shots += 1;
    }

    expect(shots).toBe(39);
    expect(state).toMatchObject({ phase: "won", hits: 39 });
    expect(state.score).toBeLessThanOrEqual(20_000);
  });

  it("takes a life on impact and protects the replacement ship briefly", () => {
    const initial = createInitialRakAsteroidsState();
    const collision = { ...initial.asteroids[0], x: initial.ship.x, y: initial.ship.y };
    const state = stepRakAsteroids({ ...initial, asteroids: [collision], phase: "playing" }, {}, 0);

    expect(state.lives).toBe(2);
    expect(state.ship).toMatchObject({ x: 480, y: 300 });
    expect(state.ship.invulnerableSeconds).toBeGreaterThan(2);
  });

  it("ends unfinished and timed-out runs with their score intact", () => {
    const playing = { ...createInitialRakAsteroidsState(), phase: "playing" as const, score: 1_250 };
    expect(stepRakAsteroids(playing, { endRunPressed: true }, 0)).toMatchObject({
      phase: "over",
      score: 1_250,
      status: "Run ended — your score still counts!",
    });
    expect(stepRakAsteroids(playing, {}, RAK_ASTEROIDS_DURATION_SECONDS)).toMatchObject({
      phase: "over",
      score: 1_250,
      status: "Time’s up — your score still counts!",
    });
  });
});
