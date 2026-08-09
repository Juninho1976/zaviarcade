"use client";

import { useActionState } from "react";
import type { ManagedPlayer } from "@/features/auth/server/admin";
import { managePlayer, type AdminActionState } from "@/app/admin/players/actions";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/application/validation";

const initialState: AdminActionState = {};

function Feedback({ state }: { state: AdminActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <div className={`mt-4 rounded-xl p-4 text-sm font-semibold ${state.error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-900"}`} role="status">
      <p>{state.error ?? state.success}</p>
      {state.temporaryPassword ? (
        <p className="mt-3 select-all rounded-lg bg-white px-3 py-2 font-mono text-base text-slate-950">
          {state.temporaryPassword}
        </p>
      ) : null}
    </div>
  );
}

export function AdminPlayerManager({ players }: { players: ManagedPlayer[] }) {
  const [state, action, pending] = useActionState(managePlayer, initialState);
  return (
    <>
      <section className="mt-8 rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="create-player">
        <h2 className="text-2xl font-black text-slate-950" id="create-player">Create a player</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use nicknames, not full legal names. Leave the password blank to generate a five-character temporary password.</p>
        <form action={action} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input name="intent" type="hidden" value="create" />
          <label className="font-semibold">Username
            <input autoCapitalize="none" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" name="username" required />
          </label>
          <label className="font-semibold">Public display name
            <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" name="displayName" required />
          </label>
          <label className="font-semibold sm:col-span-2">Temporary password (optional)
            <input autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" minLength={MIN_PASSWORD_LENGTH} name="password" type="password" />
          </label>
          <button className="rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2" disabled={pending} type="submit">
            {pending ? "Saving…" : "Create player account"}
          </button>
        </form>
        <Feedback state={state} />
      </section>

      <section className="mt-10 space-y-5" aria-labelledby="player-accounts">
        <h2 className="text-2xl font-black text-slate-950" id="player-accounts">Player accounts</h2>
        {players.map((player) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={player.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-950">{player.displayName}</h3>
                <p className="mt-1 text-sm text-slate-500">@{player.username} · {player.role} · created {new Date(player.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${player.disabled ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-900"}`}>
                {player.disabled ? "Disabled" : "Active"}
              </span>
            </div>
            <form action={action} className="mt-5 grid gap-3 sm:grid-cols-2">
              <input name="userId" type="hidden" value={player.id} />
              <input name="intent" type="hidden" value="update" />
              <label className="text-sm font-semibold">Username
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue={player.username} name="username" required />
              </label>
              <label className="text-sm font-semibold">Public display name
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue={player.displayName} name="displayName" required />
              </label>
              <button className="rounded-lg border border-cyan-700 px-4 py-2 font-bold text-cyan-900 sm:col-span-2" type="submit">Save names</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={action}>
                <input name="userId" type="hidden" value={player.id} />
                <input name="intent" type="hidden" value="reset-password" />
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800" type="submit">Reset password</button>
              </form>
              <form action={action}>
                <input name="userId" type="hidden" value={player.id} />
                <input name="intent" type="hidden" value={player.disabled ? "enable" : "disable"} />
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800" type="submit">{player.disabled ? "Enable account" : "Disable account"}</button>
              </form>
              {player.mustChangePassword ? <span className="self-center text-xs font-semibold text-amber-800">Temporary password change required</span> : null}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
