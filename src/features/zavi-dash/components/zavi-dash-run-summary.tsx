"use client";

import type { GameState } from "@/features/zavi-dash/domain/game";

type ZaviDashRunSummaryProps = {
  onPlayerNameChange: (playerName: string) => void;
  onRestart: () => void;
  playerName: string;
  state: GameState;
};

export function ZaviDashRunSummary({
  onPlayerNameChange,
  onRestart,
  playerName,
  state,
}: ZaviDashRunSummaryProps) {
  if (state.phase === "ready") {
    return <p className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 leading-7 text-slate-700">Press Jump, Space, Arrow Up, click, or tap the course to begin Sunlit Sprint.</p>;
  }

  if (state.phase === "running") {
    return <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 leading-7 text-slate-700">Keep moving. Jump over spires and blocks, then clear the gaps to reach the finish flag.</p>;
  }

  const completed = state.phase === "completed";

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="run-summary-heading">
      <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">
        {completed ? "Level complete" : "Run ended"}
      </p>
      <h2 id="run-summary-heading" className="mt-2 text-3xl font-bold text-slate-950">
        {completed ? "You reached the finish!" : "Ready for another dash?"}
      </h2>
      <p className="mt-3 leading-7 text-slate-600">
        {completed
          ? `Your completed score is ${state.score.toLocaleString()} points. Enter your name to prepare for score submission.`
          : "Enter your name now if you like, then restart and complete the level to submit a score in the next step."}
      </p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => event.preventDefault()}>
        <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-slate-800" htmlFor="zavi-dash-player-name">
          Player name
          <input
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
            id="zavi-dash-player-name"
            maxLength={24}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Your name"
            value={playerName}
          />
        </label>
        <button
          className="rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white transition-colors hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          onClick={onRestart}
          type="button"
        >
          Restart run
        </button>
      </form>
    </section>
  );
}
