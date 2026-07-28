import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { processScoreSubmission } from "@/features/games/application/process-score-submission";
import { readScoreSubmissionRequest } from "@/features/games/application/read-score-submission-request";
import { createAuth } from "@/features/auth/server/auth";

function getRateLimitKey(request: Request): string {
  const clientAddress = request.headers.get("cf-connecting-ip")?.trim();

  return `score-submission:${clientAddress || "anonymous"}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const requestBody = await readScoreSubmissionRequest(request);
  if (!requestBody.success) return NextResponse.json({ error: requestBody.message }, { status: requestBody.status });
  try {
    const { env } = await getCloudflareContext({ async: true });
    const session = await createAuth(env.DB, env.AUTH_SECRET).api.getSession({ headers: request.headers });
    if (!session || session.user.banned) {
      return NextResponse.json({ error: "Log in with an active player account to save a score." }, { status: 401 });
    }
    const result = await processScoreSubmission(env.DB, slug, session.user.id, requestBody.body, {
      rateLimitKey: `${getRateLimitKey(request)}:${session.user.id}`,
      rateLimiter: env.SCORE_SUBMISSION_LIMITER,
    });
    if (!result.success) return NextResponse.json({ error: result.message }, { status: result.status });
    return NextResponse.json({ message: "Score persisted.", score: result.score, scoreId: result.scoreId }, { status: result.status });
  } catch (error) {
    console.error("Score submission failed", {
      slug,
      message: error instanceof Error ? error.message : "Unknown server submission error",
    });
    return NextResponse.json({ error: "The score service is unavailable. Please try again." }, { status: 500 });
  }
}
