"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialGameState } from "@/features/zavi-dash/application/game-engine";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import type { GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import {
  canSubmitFinishedRun,
  submitZaviDashScore,
  type ScoreSubmissionUiState,
} from "@/features/zavi-dash/application/score-submission-client";
import { ZaviDashCanvas } from "./zavi-dash-canvas";
import { ZaviDashRunSummary } from "./zavi-dash-run-summary";

type ZaviDashGameProps = {
  level?: LevelDefinition;
  playerDisplayName: string;
};

export function ZaviDashGame({ level = zaviDashLevelOne, playerDisplayName }: ZaviDashGameProps) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(level));
  const [restartRequest, setRestartRequest] = useState(0);
  const [submission, setSubmission] = useState<ScoreSubmissionUiState>({ status: "idle" });
  const submittedRun = useRef<number | null>(null);
  const submissionId = useRef(crypto.randomUUID());
  const progressPercent = Math.round(gameState.progress * 100);

  function restartRun(): void {
    setGameState(createInitialGameState(level));
    setSubmission({ status: "idle" });
    setRestartRequest((request) => request + 1);
    submissionId.current = crypto.randomUUID();
  }

  const submitScore = useCallback(async (): Promise<void> => {
    if (!canSubmitFinishedRun(gameState, submission)) return;

    setSubmission({ status: "pending" });
    try {
      const scoreId = await submitZaviDashScore(gameState.score, submissionId.current);
      setSubmission({ status: "success", scoreId });
    } catch (error) {
      console.error("Zavi Dash score submission failed", {
        message: error instanceof Error ? error.message : "Unknown client submission error",
      });
      setSubmission({
        status: "error",
        message: error instanceof Error ? error.message : "Your score could not be saved. Please try again.",
      });
    }
  }, [gameState, submission]);

  useEffect(() => {
    if (
      (gameState.phase !== "dead" && gameState.phase !== "completed") ||
      submittedRun.current === restartRequest
    ) return;

    submittedRun.current = restartRequest;
    void submitScore();
  }, [gameState.phase, restartRequest, submitScore]);

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
      <p className="mt-5 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">
        Playing as {playerDisplayName}. Your score saves to your Zavi Arcade account.
      </p>
      <div className="mt-6">
        <ZaviDashCanvas
          level={level}
          onGameStateChange={setGameState}
          onRestart={restartRun}
          restartRequest={restartRequest}
        />
      </div>
      <ZaviDashRunSummary
        onRestart={restartRun}
        onSubmit={submitScore}
        state={gameState}
        submission={submission}
      />
    </section>
  );
}
