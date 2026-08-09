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

export function canSubmitFinishedRun(state: GameState, submission: ScoreSubmissionUiState): boolean {
  return (
    (state.phase === "dead" || state.phase === "completed") &&
    (submission.status === "idle" || submission.status === "error")
  );
}

export async function submitZaviDashScore(
  gameSlug: "zavi-dash" | "zavi-dash-2",
  score: number,
  submissionId: string,
): Promise<number> {
  const response = await fetch(`/api/games/${gameSlug}/scores`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ score, submissionId }),
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
