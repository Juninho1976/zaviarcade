
export type ScoreSubmission = { playerName: string; score: number };
export type ScoreSubmissionResult =
  | { success: true; submission: ScoreSubmission }
  | { success: false; message: string };

export function submitScore(slug: string, input: unknown): ScoreSubmissionResult {
  if (!input || typeof input !== "object") return { success: false, message: "Request body must be an object." };
  const { playerName, score } = input as Record<string, unknown>;
  if (typeof playerName !== "string" || playerName.trim().length < 1 || playerName.trim().length > 24)
    return { success: false, message: "Player name must be between 1 and 24 characters." };
  if (typeof score !== "number" || !Number.isSafeInteger(score) || score < 0)
    return { success: false, message: "Score must be a non-negative whole number." };
  return { success: true, submission: { playerName: playerName.trim(), score } };
}
