import { persistScore } from "./persist-score";
import { submitScore } from "./submit-score";

export async function processScoreSubmission(database: Parameters<typeof persistScore>[0], slug: string, body: unknown) {
  const validated = submitScore(slug, body);
  if (!validated.success) return { success: false as const, status: 400, message: validated.message };
  const persisted = await persistScore(database, slug, validated.submission);
  if (!persisted.success) return { success: false as const, status: persisted.message === "Game not found." ? 404 : 500, message: persisted.message };
  return { success: true as const, status: 201, score: validated.submission, scoreId: persisted.scoreId };
}
