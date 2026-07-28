import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ManagedPlayer = {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "player";
  disabled: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

type PlayerRow = {
  id: string;
  username: string | null;
  name: string;
  role: string | null;
  banned: number | boolean | null;
  mustChangePassword: number | boolean | null;
  createdAt: Date | number | string;
};

function serializeDate(value: Date | number | string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" || /^\d+$/.test(value)) return new Date(Number(value)).toISOString();
  return new Date(value).toISOString();
}

export async function listManagedPlayers(): Promise<ManagedPlayer[]> {
  const { env } = await getCloudflareContext({ async: true });
  const rows = await env.DB.prepare(
    `SELECT id, username, name, role, banned, mustChangePassword, createdAt
     FROM "user" ORDER BY createdAt ASC`,
  ).all<PlayerRow>();
  return rows.results.map((row) => ({
    id: row.id,
    username: row.username ?? "",
    displayName: row.name,
    role: row.role === "admin" ? "admin" : "player",
    disabled: Boolean(row.banned),
    mustChangePassword: Boolean(row.mustChangePassword),
    createdAt: serializeDate(row.createdAt),
  }));
}

export async function isFinalUsableAdministrator(userId: string): Promise<boolean> {
  const { env } = await getCloudflareContext({ async: true });
  const target = await env.DB.prepare(
    `SELECT role, banned FROM "user" WHERE id = ?`,
  ).bind(userId).first<{ role: string | null; banned: number | boolean | null }>();
  if (target?.role !== "admin" || Boolean(target.banned)) return false;
  const count = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM "user" WHERE role = 'admin' AND banned = 0`,
  ).first<{ count: number }>();
  return wouldRemoveFinalAdministrator(target.role, Boolean(target.banned), count?.count ?? 0);
}

export function wouldRemoveFinalAdministrator(
  role: string | null,
  disabled: boolean,
  usableAdministratorCount: number,
): boolean {
  return role === "admin" && !disabled && usableAdministratorCount <= 1;
}
