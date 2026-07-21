"use client";

import { useState } from "react";
import { createInitialGameState } from "@/features/zavi-dash/application/game-engine";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import type { GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import {
  canSubmitCompletedRun,
  submitCompletedZaviDashScore,
  type ScoreSubmissionUiState,
} from "@/features/zavi-dash/application/score-submission-client";
import { ZaviDashCanvas } from "./zavi-dash-canvas";
import { ZaviDashRunSummary } from "./zavi-dash-run-summary";

type ZaviDashGameProps = {
  level?: LevelDefinition;
};

export function ZaviDashGame({ level = zaviDashLevelOne }: ZaviDashGameProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(level));
  const [playerName, setPlayerName] = useState("");
  const [restartRequest, setRestartRequest] = useState(0);
  const [submission, setSubmission] = useState<ScoreSubmissionUiState>({ status: "idle" });
  const progressPercent = Math.round(gameState.progress * 100);

  function restartRun(): void {
    setGameState(createInitialGameState(level));
    setSubmission({ status: "idle" });
    setRestartRequest((request) => request + 1);
  }

  async function submitScore(): Promise<void> {
    if (!canSubmitCompletedRun(gameState, submission)) return;

    setSubmission({ status: "pending" });
    try {
      const scoreId = await submitCompletedZaviDashScore(playerName, gameState.score);
      setSubmission({ status: "success", scoreId });
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "Your score could not be saved. Please try again.",
      });
    }
  }

  return (
    <section className="mt-10" aria-labelledby="zavi-dash-play-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">Playable level</p>
          <h2 id="zavi-dash-play-heading" className="mt-2 text-3xl font-bold text-slate-950">Sunlit Sprint</h2>
        </div>
        <p className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-900">{gameState.phase}</p>
      </div>
      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-slate-600">Score</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{gameState.score.toLocaleString()}</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <progress className="mt-3 h-3 w-full accent-cyan-700" max="100" value={progressPercent}>
            {progressPercent}%
          </progress>
        </div>
      </div>
      <div className="mt-6">
        <ZaviDashCanvas
          level={level}
          onGameStateChange={setGameState}
          restartRequest={restartRequest}
        />
      </div>
      <ZaviDashRunSummary
        onPlayerNameChange={setPlayerName}
        onRestart={restartRun}
        onSubmit={submitScore}
        playerName={playerName}
        state={gameState}
        submission={submission}
      />
    </section>
  );
}
