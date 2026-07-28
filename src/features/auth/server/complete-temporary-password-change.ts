import type { ZaviAuth } from "./auth";

export class AccountCompletionError extends Error {
  constructor() {
    super("The password changed, but the account could not be marked ready.");
    this.name = "AccountCompletionError";
  }
}

export async function completeTemporaryPasswordChange({
  auth,
  currentPassword,
  database,
  newPassword,
  requestHeaders,
  userId,
}: {
  auth: ZaviAuth;
  currentPassword: string;
  database: D1Database;
  newPassword: string;
  requestHeaders: Headers;
  userId: string;
}): Promise<void> {
  await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: requestHeaders,
  });

  try {
    const result = await database.prepare(
      `UPDATE "user" SET mustChangePassword = 0, updatedAt = ? WHERE id = ?`,
    ).bind(new Date().toISOString(), userId).run();
    if (result.meta.changes !== 1) throw new Error("Authenticated account was not updated.");
  } catch (error) {
    console.error("Temporary password changed but account completion failed", {
      userId,
      message: error instanceof Error ? error.message : "Unknown account completion error",
    });
    throw new AccountCompletionError();
  }
}
