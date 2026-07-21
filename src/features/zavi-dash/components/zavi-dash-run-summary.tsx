"use client";

import Link from "next/link";
import type { ScoreSubmissionUiState } from "@/features/zavi-dash/application/score-submission-client";
import type { GameState } from "@/features/zavi-dash/domain/game";

type ZaviDashRunSummaryProps = {
  onRestart: () => void;
  onSubmit: () => void;
  state: GameState;
  submission: ScoreSubmissionUiState;
};

export function ZaviDashRunSummary({
  onRestart,
  onSubmit,
  state,
  submission,
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
          ? `Your completed score is ${state.score.toLocaleString()} points. We are saving it to the leaderboard with the name above.`
          : "Restart and complete the level to submit a score."}
      </p>
      {submission.status === "error" ? <p className="mt-4 text-sm font-semibold text-red-700" role="alert">{submission.message}</p> : null}
      {completed && submission.status === "pending" ? <p className="mt-4 text-sm font-semibold text-slate-700">Saving score…</p> : null}
      {completed && submission.status === "error" ? (
        <button
          className="mt-4 rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white transition-colors hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          onClick={onSubmit}
          type="button"
        >
          Try saving again
        </button>
      ) : null}
      {submission.status === "success" ? (
        <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          Score #{submission.scoreId} saved. <Link className="underline hover:text-emerald-950" href="/games/zavi-dash/leaderboard">View the leaderboard</Link>.
        </p>
      ) : null}
      <div className="mt-5">
        <button
          className="rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white transition-colors hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          onClick={onRestart}
          type="button"
        >
          Restart run
        </button>
      </div>
    </section>
  );
}
