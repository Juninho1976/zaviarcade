
import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";

export type ScoreSubmission = { playerName: string; score: number; submissionId: string };
export type ScoreSubmissionResult =
  | { success: true; submission: ScoreSubmission }
  | { success: false; message: string };

const playerNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} _-]*$/u;
const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizePlayerName(playerName: string): string {
  return playerName.trim().replace(/\s+/g, " ");
}

function getMaximumScoreForGame(slug: string): number | undefined {
  if (slug === "zavi-dash") return getMaximumScore(zaviDashLevelOne);

  return undefined;
}

export function submitScore(slug: string, input: unknown): ScoreSubmissionResult {
  if (!input || typeof input !== "object") return { success: false, message: "Request body must be an object." };
  const { playerName, score, submissionId } = input as Record<string, unknown>;
  const normalizedPlayerName = typeof playerName === "string" ? normalizePlayerName(playerName) : "";
  if (!normalizedPlayerName || normalizedPlayerName.length > 24 || !playerNamePattern.test(normalizedPlayerName)) {
    return { success: false, message: "Player name must be 1 to 24 letters, numbers, spaces, hyphens, or underscores." };
  }
  if (typeof score !== "number" || !Number.isSafeInteger(score) || score < 0)
    return { success: false, message: "Score must be a non-negative whole number." };
  if (typeof submissionId !== "string" || !submissionIdPattern.test(submissionId))
    return { success: false, message: "A valid score submission ID is required." };
  const maximumScore = getMaximumScoreForGame(slug);
  if (maximumScore !== undefined && score > maximumScore) {
    return { success: false, message: `Score cannot exceed the level maximum of ${maximumScore}.` };
  }

  return { success: true, submission: { playerName: normalizedPlayerName, score, submissionId } };
}
