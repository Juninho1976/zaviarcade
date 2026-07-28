import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthenticatedPlayer, PlayerRole } from "@/features/auth/domain/player";
import { createAuth } from "./auth";

type SessionUser = {
  id: string;
  name: string;
  role?: string | null;
  banned?: boolean | null;
  mustChangePassword?: boolean | null;
};

export async function getAuthForRequest() {
  const { env } = await getCloudflareContext({ async: true });
  return createAuth(env.DB, env.AUTH_SECRET);
}

export async function getSession() {
  const auth = await getAuthForRequest();
  return auth.api.getSession({ headers: await headers() });
}

function toPlayer(user: SessionUser): AuthenticatedPlayer | null {
  if (user.banned) return null;
  const role: PlayerRole = user.role === "admin" ? "admin" : "player";
  return {
    id: user.id,
    displayName: user.name,
    role,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

export async function getAuthenticatedPlayer(): Promise<AuthenticatedPlayer | null> {
  const session = await getSession();
  return session ? toPlayer(session.user as SessionUser) : null;
}

export async function requirePlayer(returnTo: string): Promise<AuthenticatedPlayer> {
  const player = await getAuthenticatedPlayer();
  if (!player) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (player.mustChangePassword) {
    redirect(`/account/change-password?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return player;
}

export async function requireAdministrator(): Promise<AuthenticatedPlayer> {
  const player = await getAuthenticatedPlayer();
  if (!player) redirect("/login?returnTo=%2Fadmin%2Fplayers");
  if (player.role !== "admin") redirect("/");
  return player;
}
