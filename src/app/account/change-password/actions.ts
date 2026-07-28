"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeReturnTo } from "@/features/auth/application/validation";
import { getAuthForRequest, getSession } from "@/features/auth/server/session";

export async function changeTemporaryPassword(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/"));
  if (newPassword.length < 12 || newPassword !== confirmation) {
    redirect(`/account/change-password?returnTo=${encodeURIComponent(returnTo)}&error=invalid`);
  }
  try {
    const auth = await getAuthForRequest();
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
    await auth.api.updateUser({
      body: { mustChangePassword: false },
      headers: await headers(),
    });
  } catch {
    redirect(`/account/change-password?returnTo=${encodeURIComponent(returnTo)}&error=current`);
  }
  redirect(returnTo);
}
