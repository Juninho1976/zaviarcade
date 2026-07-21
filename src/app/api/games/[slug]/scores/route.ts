import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { processScoreSubmission } from "@/features/games/application/process-score-submission";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const { env } = await getCloudflareContext({ async: true });
  const result = await processScoreSubmission(env.DB, slug, body);
  if (!result.success) return NextResponse.json({ error: result.message }, { status: result.status });
  return NextResponse.json({ message: "Score persisted.", score: result.score, scoreId: result.scoreId }, { status: result.status });
}
