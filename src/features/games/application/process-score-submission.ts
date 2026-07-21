import { persistScore } from "./persist-score";
import { submitScore } from "./submit-score";

export type ScoreRateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type ScoreSubmissionOptions = {
  rateLimitKey?: string;
  rateLimiter?: ScoreRateLimiter;
};

export async function processScoreSubmission(
  database: Parameters<typeof persistScore>[0],
  slug: string,
  body: unknown,
  { rateLimiter, rateLimitKey = "anonymous" }: ScoreSubmissionOptions = {},
) {
  const validated = submitScore(slug, body);
  if (!validated.success) return { success: false as const, status: 400, message: validated.message };
  if (rateLimiter) {
    const rateLimit = await rateLimiter.limit({ key: rateLimitKey });
    if (!rateLimit.success) {
      return { success: false as const, status: 429, message: "Too many score submissions. Please wait a minute and try again." };
    }
  }
  const persisted = await persistScore(database, slug, validated.submission);
  if (!persisted.success) return { success: false as const, status: persisted.message === "Game not found." ? 404 : 500, message: persisted.message };
  return { success: true as const, status: 201, score: validated.submission, scoreId: persisted.scoreId };
}
