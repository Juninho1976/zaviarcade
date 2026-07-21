import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { processScoreSubmission } from "@/features/games/application/process-score-submission";
import { readScoreSubmissionRequest } from "@/features/games/application/read-score-submission-request";

function getRateLimitKey(request: Request): string {
  const clientAddress = request.headers.get("cf-connecting-ip")?.trim();

  return `score-submission:${clientAddress || "anonymous"}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const requestBody = await readScoreSubmissionRequest(request);
  if (!requestBody.success) return NextResponse.json({ error: requestBody.message }, { status: requestBody.status });
  const { env } = await getCloudflareContext({ async: true });
  const result = await processScoreSubmission(env.DB, slug, requestBody.body, {
    rateLimitKey: getRateLimitKey(request),
    rateLimiter: env.SCORE_SUBMISSION_LIMITER,
  });
  if (!result.success) return NextResponse.json({ error: result.message }, { status: result.status });
  return NextResponse.json({ message: "Score persisted.", score: result.score, scoreId: result.scoreId }, { status: result.status });
}
