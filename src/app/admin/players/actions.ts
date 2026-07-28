"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  generateTemporaryPassword,
  isValidDisplayName,
  isValidUsername,
  normalizeDisplayName,
  normalizeUsername,
} from "@/features/auth/application/validation";
import { isFinalUsableAdministrator } from "@/features/auth/server/admin";
import { getAuthForRequest, requireAdministrator } from "@/features/auth/server/session";

export type AdminActionState = {
  error?: string;
  success?: string;
  temporaryPassword?: string;
};

export async function managePlayer(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdministrator();
  const intent = String(formData.get("intent") ?? "");
  const auth = await getAuthForRequest();
  const requestHeaders = await headers();

  try {
    if (intent === "create") {
      const username = normalizeUsername(String(formData.get("username") ?? ""));
      const displayName = normalizeDisplayName(String(formData.get("displayName") ?? ""));
      if (!isValidUsername(username)) return { error: "Username must be 3–30 lowercase letters, numbers, dots, hyphens or underscores." };
      if (!isValidDisplayName(displayName)) return { error: "Display name must be 1–24 letters, numbers, spaces, apostrophes or hyphens." };
      const requestedPassword = String(formData.get("password") ?? "");
      const temporaryPassword = requestedPassword || generateTemporaryPassword();
      if (temporaryPassword.length < 12) return { error: "Temporary passwords must contain at least 12 characters." };
      await auth.api.createUser({
        body: {
          email: `${crypto.randomUUID()}@players.invalid`,
          name: displayName,
          password: temporaryPassword,
          role: "user",
          data: {
            username,
            displayUsername: username,
            mustChangePassword: true,
          },
        },
        headers: requestHeaders,
      });
      revalidatePath("/admin/players");
      return {
        success: `${displayName}'s account was created. Copy this temporary password now—it cannot be shown again.`,
        temporaryPassword,
      };
    }

    const userId = String(formData.get("userId") ?? "");
    if (!userId) return { error: "Player account was not found." };
    if (intent === "update") {
      const username = normalizeUsername(String(formData.get("username") ?? ""));
      const displayName = normalizeDisplayName(String(formData.get("displayName") ?? ""));
      if (!isValidUsername(username) || !isValidDisplayName(displayName)) return { error: "Check the username and display name." };
      await auth.api.adminUpdateUser({
        body: { userId, data: { username, displayUsername: username, name: displayName } },
        headers: requestHeaders,
      });
      revalidatePath("/admin/players");
      revalidatePath("/games/zavi-dash/leaderboard");
      return { success: "Account details updated." };
    }
    if (intent === "reset-password") {
      const requestedPassword = String(formData.get("password") ?? "");
      const temporaryPassword = requestedPassword || generateTemporaryPassword();
      if (temporaryPassword.length < 12) return { error: "Temporary passwords must contain at least 12 characters." };
      await auth.api.setUserPassword({
        body: { userId, newPassword: temporaryPassword },
        headers: requestHeaders,
      });
      await auth.api.adminUpdateUser({
        body: { userId, data: { mustChangePassword: true } },
        headers: requestHeaders,
      });
      await auth.api.revokeUserSessions({ body: { userId }, headers: requestHeaders });
      revalidatePath("/admin/players");
      return {
        success: "Password reset. Copy this temporary password now—it cannot be shown again.",
        temporaryPassword,
      };
    }
    if (intent === "disable") {
      if (await isFinalUsableAdministrator(userId)) {
        return { error: "The final usable administrator cannot be disabled." };
      }
      await auth.api.banUser({ body: { userId }, headers: requestHeaders });
      revalidatePath("/admin/players");
      return { success: "Account disabled and its sessions revoked." };
    }
    if (intent === "enable") {
      await auth.api.unbanUser({ body: { userId }, headers: requestHeaders });
      revalidatePath("/admin/players");
      return { success: "Account enabled." };
    }
    return { error: "Unknown account action." };
  } catch (error) {
    console.error("Administrator account action failed", {
      intent,
      message: error instanceof Error ? error.message : "Unknown account error",
    });
    return { error: "That account change could not be saved. Check for an existing username and try again." };
  }
}
