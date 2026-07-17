import { NextResponse } from "next/server";
import { submitScore } from "@/features/games/application/submit-score";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const result = submitScore(slug, body);
  if (!result.success) return NextResponse.json({ error: result.message }, { status: result.message === "Game not found." ? 404 : 400 });
  return NextResponse.json({ message: "Score accepted.", score: result.submission }, { status: 201 });
}
