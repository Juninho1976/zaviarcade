import type { GameState } from "@/features/zavi-dash/domain/game";

export type ScoreSubmissionUiState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; scoreId: number }
  | { status: "error"; message: string };

type ScoreSubmissionResponse = {
  error?: unknown;
  scoreId?: unknown;
};

export function canSubmitCompletedRun(state: GameState, submission: ScoreSubmissionUiState): boolean {
  return state.phase === "completed" && (submission.status === "idle" || submission.status === "error");
}

export async function submitCompletedZaviDashScore(playerName: string, score: number): Promise<number> {
  const response = await fetch("/api/games/zavi-dash/scores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ playerName, score }),
  });
  const body = await response.json().catch(() => ({})) as ScoreSubmissionResponse;

  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "Your score could not be saved. Please try again.");
  }
  if (typeof body.scoreId !== "number") {
    throw new Error("The score service returned an unexpected response.");
  }

  return body.scoreId;
}
