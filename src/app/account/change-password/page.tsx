import { redirect } from "next/navigation";
import { MIN_PASSWORD_LENGTH, safeReturnTo } from "@/features/auth/application/validation";
import { getAuthenticatedPlayer } from "@/features/auth/server/session";
import { changeTemporaryPassword } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  const returnTo = safeReturnTo(query.returnTo);
  const player = await getAuthenticatedPlayer();
  if (!player) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-14 sm:px-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold tracking-[0.2em] text-cyan-700 uppercase">Keep your account safe</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Choose your password</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Replace the temporary password with one only you and your parent know.
        </p>
        {query.error ? (
          <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">
            {query.error === "current"
              ? "The temporary password was not correct."
              : query.error === "service"
                ? "Your password changed, but the account could not be marked ready. Ask your administrator to reset it once more."
                : "Passwords must match and contain at least 12 characters."}
          </p>
        ) : null}
        <form action={changeTemporaryPassword} className="mt-7 space-y-5">
          <input name="returnTo" type="hidden" value={returnTo} />
          <label className="block font-semibold">Temporary password
            <input autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" name="currentPassword" required type="password" />
          </label>
          <label className="block font-semibold">New password
            <input autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" minLength={MIN_PASSWORD_LENGTH} name="newPassword" required type="password" />
          </label>
          <label className="block font-semibold">Type it again
            <input autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" minLength={MIN_PASSWORD_LENGTH} name="confirmation" required type="password" />
          </label>
          <button className="w-full rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white hover:bg-cyan-950" type="submit">Save password and continue</button>
        </form>
      </section>
    </main>
  );
}
