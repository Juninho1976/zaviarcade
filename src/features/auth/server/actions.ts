"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthForRequest } from "./session";

export async function logout() {
  const auth = await getAuthForRequest();
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
