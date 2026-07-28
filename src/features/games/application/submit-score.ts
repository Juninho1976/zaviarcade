
import { getMaximumScore } from "@/features/zavi-dash/application/get-maximum-score";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { zaviFishMaximumScore } from "@/features/zavi-fish/application/game-engine";

export type ScoreSubmission = { score: number; submissionId: string };
export type ScoreSubmissionResult =
  | { success: true; submission: ScoreSubmission }
  | { success: false; message: string };

const submissionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getMaximumScoreForGame(slug: string): number | undefined {
  if (slug === "zavi-dash") return getMaximumScore(zaviDashLevelOne);
  if (slug === "zavi-fish") return zaviFishMaximumScore;

  return undefined;
}

export function submitScore(slug: string, input: unknown): ScoreSubmissionResult {
  if (!input || typeof input !== "object") return { success: false, message: "Request body must be an object." };
  const { score, submissionId } = input as Record<string, unknown>;
  if (typeof score !== "number" || !Number.isSafeInteger(score) || score < 0)
    return { success: false, message: "Score must be a non-negative whole number." };
  if (typeof submissionId !== "string" || !submissionIdPattern.test(submissionId))
    return { success: false, message: "A valid score submission ID is required." };
  const maximumScore = getMaximumScoreForGame(slug);
  if (maximumScore !== undefined && score > maximumScore) {
    return { success: false, message: `Score cannot exceed the level maximum of ${maximumScore}.` };
  }

  return { success: true, submission: { score, submissionId } };
}
