"use client";

import { useEffect, useRef, useState } from "react";
import { createInitialGameState, stepGame } from "@/features/zavi-dash/application/game-engine";
import { zaviDashLevelOne } from "@/features/zavi-dash/data/zavi-dash-level-one";
import { FIXED_TIME_STEP_SECONDS, type GameInput, type GameState } from "@/features/zavi-dash/domain/game";
import type { LevelDefinition } from "@/features/zavi-dash/domain/level";
import { zaviDashCanvasViewport } from "./canvas-viewport";
import { getKeyboardGameInput, getPointerGameInput } from "./game-controls";
import { isDebugOverlayEnabled, renderDebugOverlay } from "./render-debug-overlay";
import { renderZaviDashGame } from "./render-zavi-dash-game";
import { createZaviDashAudio, type ZaviDashAudio } from "./zavi-dash-audio";

type ZaviDashCanvasProps = {
  debug?: boolean;
  level?: LevelDefinition;
  onGameStateChange?: (state: GameState) => void;
  onRestart?: () => void;
  restartRequest?: number;
};

function mergeInput(current: GameInput, next: GameInput): GameInput {
  return {
    jumpPressed: current.jumpPressed || next.jumpPressed,
    restartPressed: current.restartPressed || next.restartPressed,
    startPressed: current.startPressed || next.startPressed,
  };
}

export function ZaviDashCanvas({
  debug = false,
  level = zaviDashLevelOne,
  onGameStateChange,
  onRestart,
  restartRequest = 0,
}: ZaviDashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineStateRef = useRef<GameState>(createInitialGameState(level));
  const pendingInputRef = useRef<GameInput>({});
  const onGameStateChangeRef = useRef(onGameStateChange);
  const restartRequestRef = useRef(restartRequest);
  const audioRef = useRef<ZaviDashAudio | null>(null);
  const [presentation, setPresentation] = useState<GameState>(() => createInitialGameState(level));
  const [muted, setMuted] = useState(false);
  const debugEnabled = isDebugOverlayEnabled({ explicitFlag: debug });

  function queueInput(input: GameInput): void {
    audioRef.current?.startMusic();
    pendingInputRef.current = mergeInput(pendingInputRef.current, input);
  }

  useEffect(() => {
    audioRef.current = createZaviDashAudio();

    return () => {
      audioRef.current?.destroy();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    onGameStateChangeRef.current = onGameStateChange;
  }, [onGameStateChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) return;

      const input = getKeyboardGameInput(event.code);
      if (!input) return;

      event.preventDefault();
      queueInput(input);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (restartRequest === restartRequestRef.current) return;

    restartRequestRef.current = restartRequest;
    queueInput({ restartPressed: true });
  }, [restartRequest]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    engineStateRef.current = createInitialGameState(level);
    setPresentation(engineStateRef.current);
    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let accumulator = 0;
    let framesPerSecond = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const cssWidth = Math.max(1, bounds.width);
      const cssHeight = cssWidth * zaviDashCanvasViewport.height / zaviDashCanvasViewport.width;

      canvas.width = Math.round(cssWidth * pixelRatio);
      canvas.height = Math.round(cssHeight * pixelRatio);
      context.setTransform(
        canvas.width / zaviDashCanvasViewport.width,
        0,
        0,
        canvas.height / zaviDashCanvasViewport.height,
        0,
        0,
      );
    };

    resize();
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize);
    resizeObserver?.observe(canvas);
    if (!resizeObserver) window.addEventListener("resize", resize);

    const render = (now: number) => {
      const elapsed = Math.min(0.1, (now - lastFrameTime) / 1_000);
      lastFrameTime = now;
      accumulator += elapsed;
      framesPerSecond = elapsed > 0 ? 1 / elapsed : framesPerSecond;
      let input = pendingInputRef.current;
      pendingInputRef.current = {};

      while (accumulator >= FIXED_TIME_STEP_SECONDS) {
        const previousPhase = engineStateRef.current.phase;
        engineStateRef.current = stepGame(engineStateRef.current, level, input);
        if (previousPhase !== engineStateRef.current.phase) {
          if (engineStateRef.current.phase === "dead") {
            audioRef.current?.stopMusic();
            if (engineStateRef.current.deathReason === "gap") {
              audioRef.current?.playFall();
            } else {
              audioRef.current?.playCrash();
            }
          } else if (engineStateRef.current.phase === "completed") {
            audioRef.current?.stopMusic();
            audioRef.current?.playVictory();
          }
        }
        input = {};
        accumulator -= FIXED_TIME_STEP_SECONDS;
      }

      const frame = renderZaviDashGame(context, level, engineStateRef.current);
      if (debugEnabled) renderDebugOverlay(context, level, engineStateRef.current, frame, framesPerSecond);
      setPresentation(engineStateRef.current);
      onGameStateChangeRef.current?.(engineStateRef.current);
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);
    };
  }, [debugEnabled, level]);

  const canRestart = presentation.phase === "completed" || presentation.phase === "dead";
  const progressPercent = Math.round(presentation.progress * 100);

  return (
    <section className="w-full" aria-label="Zavi Dash game controls">
      <canvas
        ref={canvasRef}
        aria-describedby="zavi-dash-status"
        aria-label="Zavi Dash game canvas. Press Space or Arrow Up, click, tap, or use the Jump button to start and jump."
        className="block aspect-video w-full touch-manipulation rounded-3xl border border-slate-200 bg-slate-950 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700"
        data-debug-enabled={debugEnabled}
        height={zaviDashCanvasViewport.height}
        onPointerDown={(event) => {
          event.currentTarget.focus();
          queueInput(getPointerGameInput());
        }}
        role="img"
        tabIndex={0}
        width={zaviDashCanvasViewport.width}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white transition-colors hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          onClick={() => queueInput(getPointerGameInput())}
          type="button"
        >
          Jump
        </button>
        <button
          className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          disabled={!canRestart}
          onClick={() => {
            if (onRestart) {
              onRestart();
            } else {
              queueInput({ restartPressed: true });
            }
          }}
          type="button"
        >
          Restart
        </button>
        <button
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={!muted}
          className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          onClick={() => setMuted((current) => !current)}
          type="button"
        >
          Sound: {muted ? "Off" : "On"}
        </button>
        <p className="text-sm font-semibold text-slate-600">
          {presentation.phase} · {progressPercent}% · {presentation.score.toLocaleString()} points
        </p>
      </div>
      <p id="zavi-dash-status" className="sr-only" aria-live="polite">
        Zavi Dash is {presentation.phase}. Progress {progressPercent} percent. Score {presentation.score}.
      </p>
    </section>
  );
}
