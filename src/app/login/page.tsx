import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthenticatedPlayer } from "@/features/auth/server/session";
import { safeReturnTo } from "@/features/auth/application/validation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo: requestedReturnTo } = await searchParams;
  const returnTo = safeReturnTo(requestedReturnTo);
  const player = await getAuthenticatedPlayer();
  if (player) redirect(player.mustChangePassword ? `/account/change-password?returnTo=${encodeURIComponent(returnTo)}` : returnTo);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12 sm:px-10">
      <section className="rounded-3xl border border-cyan-100 bg-white p-7 shadow-xl shadow-cyan-950/5 sm:p-9">
        <p className="text-sm font-bold tracking-[0.2em] text-cyan-700 uppercase">Player login</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Ready to play?</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Use the username and password your parent or Zavi Arcade administrator gave you.
        </p>
        <LoginForm returnTo={returnTo} />
        <p className="mt-6 text-center text-sm leading-6 text-slate-500">
          Need an account or a new password? Ask your parent or the site administrator.
        </p>
      </section>
    </main>
  );
}

