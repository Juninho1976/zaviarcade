import { AdminPlayerManager } from "@/features/auth/components/admin-player-manager";
import { listManagedPlayers } from "@/features/auth/server/admin";
import { requireAdministrator } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  await requireAdministrator();
  const players = await listManagedPlayers();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 sm:px-10">
      <p className="text-sm font-bold tracking-[0.2em] text-cyan-700 uppercase">Administrator</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Manage player accounts</h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-600">
        Usernames are private login names. Display names are public on leaderboards and may be shared by more than one player.
        The administrator is the password-recovery route for this version.
      </p>
      <AdminPlayerManager players={players} />
    </main>
  );
}
