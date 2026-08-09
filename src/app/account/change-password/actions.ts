"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MIN_PASSWORD_LENGTH, safeReturnTo } from "@/features/auth/application/validation";
import {
  AccountCompletionError,
  completeTemporaryPasswordChange,
} from "@/features/auth/server/complete-temporary-password-change";
import { getAuthForRequest, getSession } from "@/features/auth/server/session";

export async function changeTemporaryPassword(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/"));
  if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword !== confirmation) {
    redirect(`/account/change-password?returnTo=${encodeURIComponent(returnTo)}&error=invalid`);
  }
  try {
    const auth = await getAuthForRequest();
    const { env } = await getCloudflareContext({ async: true });
    await completeTemporaryPasswordChange({
      auth,
      currentPassword,
      database: env.DB,
      newPassword,
      requestHeaders: await headers(),
      userId: session.user.id,
    });
  } catch (error) {
    const reason = error instanceof AccountCompletionError ? "service" : "current";
    redirect(`/account/change-password?returnTo=${encodeURIComponent(returnTo)}&error=${reason}`);
  }
  redirect(returnTo);
}
