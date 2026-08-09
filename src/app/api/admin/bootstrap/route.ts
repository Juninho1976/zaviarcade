import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { createAuth } from "@/features/auth/server/auth";
import {
  isValidDisplayName,
  isValidUsername,
  MIN_PASSWORD_LENGTH,
  normalizeDisplayName,
  normalizeUsername,
} from "@/features/auth/application/validation";

type BootstrapBody = { displayName?: unknown; password?: unknown; username?: unknown };

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const bootstrapToken = env.ADMIN_BOOTSTRAP_TOKEN ?? process.env.ADMIN_BOOTSTRAP_TOKEN;
  const suppliedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!bootstrapToken || suppliedToken !== bootstrapToken) {
    return NextResponse.json({ error: "Bootstrap is unavailable." }, { status: 404 });
  }

  const existing = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM "user" WHERE role = 'admin' AND banned = 0`,
  ).first<{ count: number }>();
  if ((existing?.count ?? 0) > 0) {
    return NextResponse.json({ error: "An administrator already exists." }, { status: 409 });
  }

  let body: BootstrapBody;
  try {
    body = await request.json() as BootstrapBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
  const displayName = typeof body.displayName === "string" ? normalizeDisplayName(body.displayName) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidUsername(username) || !isValidDisplayName(displayName) || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Use a valid username, display name and password of at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const auth = createAuth(env.DB, env.AUTH_SECRET, true);
  const result = await auth.api.signUpEmail({
    body: {
      email: `${crypto.randomUUID()}@players.invalid`,
      name: displayName,
      password,
      username,
      displayUsername: username,
      mustChangePassword: false,
    },
  });
  await env.DB.prepare(`UPDATE "user" SET role = 'admin' WHERE id = ?`).bind(result.user.id).run();
  return NextResponse.json({ created: true }, { status: 201 });
}
