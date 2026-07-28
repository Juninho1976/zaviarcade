import { fishConfig, ZAVI_FISH_DURATION_SECONDS, ZAVI_FISH_STEP_SECONDS, ZAVI_FISH_VIEWPORT, type Fish, type FishGameState, type FishType } from "@/features/zavi-fish/domain/game";

const SURFACE_Y = 88;
const BOTTOM_Y = 490;
const HOOK_SPEED = 190;
const SPAWN_INTERVAL = 0.8;

export function createInitialFishGameState(): FishGameState {
  return { phase: "ready", elapsedSeconds: 0, score: 0, fish: [], hook: { y: SURFACE_Y, caughtFishId: null }, catches: { large: 0, medium: 0, small: 0, rare: 0 }, nextFishId: 1, status: "Cast to start!" };
}

function spawnFish(state: FishGameState, random: () => number): FishGameState {
  const roll = random();
  let cumulative = 0;
  const type = (Object.keys(fishConfig) as FishType[]).find((candidate) => {
    cumulative += fishConfig[candidate].rarity;
    return roll < cumulative;
  }) ?? "large";
  const config = fishConfig[type];
  const direction = random() < 0.5 ? 1 : -1;
  const fish: Fish = { id: state.nextFishId, type, direction, speed: config.speed[0] + random() * (config.speed[1] - config.speed[0]), x: direction === 1 ? -config.width : ZAVI_FISH_VIEWPORT.width + config.width, y: 145 + random() * 290, caught: false };
  return { ...state, nextFishId: state.nextFishId + 1, fish: [...state.fish, fish] };
}

function hookTouchesFish(hookY: number, fish: Fish): boolean {
  const config = fishConfig[fish.type];
  const hookX = ZAVI_FISH_VIEWPORT.width / 2;
  return Math.abs(hookX - fish.x) <= config.width / 2 + 7 && Math.abs(hookY - fish.y) <= config.height / 2 + 8;
}

export function stepFishGame(state: FishGameState, holdingDown: boolean, random = Math.random): FishGameState {
  if (state.phase !== "playing") return state;
  const elapsedSeconds = Math.min(ZAVI_FISH_DURATION_SECONDS, state.elapsedSeconds + ZAVI_FISH_STEP_SECONDS);
  let next: FishGameState = { ...state, elapsedSeconds, fish: state.fish.map((fish) => fish.caught ? fish : { ...fish, x: fish.x + fish.direction * fish.speed * ZAVI_FISH_STEP_SECONDS }).filter((fish) => fish.caught || fish.x > -120 && fish.x < ZAVI_FISH_VIEWPORT.width + 120) };
  if (elapsedSeconds >= ZAVI_FISH_DURATION_SECONDS - ZAVI_FISH_STEP_SECONDS / 2) {
    if (next.hook.caughtFishId === null) return { ...next, phase: "over", status: "Ready to cast" };
    holdingDown = false;
  }
  const hasCatch = next.hook.caughtFishId !== null;
  const y = Math.max(SURFACE_Y, Math.min(BOTTOM_Y, next.hook.y + ((holdingDown && !hasCatch) ? HOOK_SPEED : -HOOK_SPEED) * ZAVI_FISH_STEP_SECONDS));
  next = { ...next, hook: { ...next.hook, y } };
  if (!hasCatch) {
    const caught = next.fish.find((fish) => hookTouchesFish(y, fish));
    if (caught) next = { ...next, hook: { y, caughtFishId: caught.id }, fish: next.fish.map((fish) => fish.id === caught.id ? { ...fish, caught: true, x: ZAVI_FISH_VIEWPORT.width / 2, y } : fish), status: "Fish on! Reel it in!" };
    else if (y >= BOTTOM_Y) next = { ...next, status: "Miss — reeling in." };
  } else {
    next = { ...next, fish: next.fish.map((fish) => fish.id === next.hook.caughtFishId ? { ...fish, x: ZAVI_FISH_VIEWPORT.width / 2, y } : fish) };
  }
  if (y <= SURFACE_Y && (hasCatch || next.hook.caughtFishId !== null)) {
    const landed = next.fish.find((fish) => fish.id === next.hook.caughtFishId);
    if (landed) {
      const points = fishConfig[landed.type].points;
      const catches = { ...next.catches, [landed.type]: next.catches[landed.type] + 1 };
      return { ...next, score: next.score + points, catches, fish: next.fish.filter((fish) => fish.id !== landed.id), hook: { y: SURFACE_Y, caughtFishId: null }, status: "Ready to cast" };
    }
  }
  if (y <= SURFACE_Y && !holdingDown) next = { ...next, status: "Ready to cast" };
  if (Math.floor(state.elapsedSeconds / SPAWN_INTERVAL) !== Math.floor(elapsedSeconds / SPAWN_INTERVAL)) next = spawnFish(next, random);
  return next;
}

export function startFishGame(state: FishGameState): FishGameState { return state.phase === "ready" ? { ...state, phase: "playing", status: "Ready to cast" } : state; }
export const zaviFishMaximumScore = 7_500;
