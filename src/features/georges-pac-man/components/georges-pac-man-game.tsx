"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialGeorgesPacManState, stepGeorgesPacMan } from "@/features/georges-pac-man/application/game-engine";
import { georgesPacManMaze } from "@/features/georges-pac-man/data/maze";
import {
  GEORGES_PAC_MAN_DURATION_SECONDS,
  GEORGES_PAC_MAN_STEP_SECONDS,
  GEORGES_PAC_MAN_VIEWPORT,
  type Direction,
  type GeorgesPacManState,
  type GhostState,
} from "@/features/georges-pac-man/domain/game";
import { createGeorgesPacManAudio, type GeorgesPacManAudio } from "./georges-pac-man-audio";

const BOARD_OFFSET = 30;
const CELL_SIZE = 40;
const directionRotation: Record<Direction, number> = {
  down: Math.PI / 2,
  left: Math.PI,
  right: 0,
  up: -Math.PI / 2,
};

function tileCenter(row: number, column: number): { x: number; y: number } {
  return {
    x: BOARD_OFFSET + column * CELL_SIZE + CELL_SIZE / 2,
    y: BOARD_OFFSET + row * CELL_SIZE + CELL_SIZE / 2,
  };
}

function drawGhost(context: CanvasRenderingContext2D, ghost: GhostState, frightened: boolean): void {
  const { x, y } = tileCenter(ghost.row, ghost.column);
  context.save();
  context.translate(x, y);
  if (ghost.recoveringSeconds > 0) {
    context.fillStyle = "white";
    for (const eyeX of [-7, 7]) {
      context.beginPath(); context.ellipse(eyeX, -2, 6, 8, 0, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#2563eb"; context.beginPath(); context.arc(eyeX, 0, 3, 0, Math.PI * 2); context.fill(); context.fillStyle = "white";
    }
    context.restore();
    return;
  }
  context.fillStyle = frightened ? "#2563eb" : ghost.color;
  context.beginPath();
  context.arc(0, -3, 16, Math.PI, 0);
  context.lineTo(16, 14);
  context.lineTo(8, 8);
  context.lineTo(0, 14);
  context.lineTo(-8, 8);
  context.lineTo(-16, 14);
  context.closePath();
  context.fill();
  context.fillStyle = "white";
  for (const eyeX of [-6, 6]) {
    context.beginPath(); context.ellipse(eyeX, -4, 5, 7, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = frightened ? "white" : "#172554";
    context.beginPath(); context.arc(eyeX, -3, 2.5, 0, Math.PI * 2); context.fill();
    context.fillStyle = "white";
  }
  if (frightened) {
    context.strokeStyle = "white"; context.lineWidth = 2; context.beginPath(); context.moveTo(-8, 7); context.lineTo(-4, 3); context.lineTo(0, 7); context.lineTo(4, 3); context.lineTo(8, 7); context.stroke();
  }
  context.restore();
}

function drawGame(context: CanvasRenderingContext2D, state: GeorgesPacManState): void {
  const { width, height } = GEORGES_PAC_MAN_VIEWPORT;
  context.fillStyle = "#070b2b";
  context.fillRect(0, 0, width, height);
  for (const [row, line] of georgesPacManMaze.entries()) {
    for (const [column, tile] of [...line].entries()) {
      const x = BOARD_OFFSET + column * CELL_SIZE;
      const y = BOARD_OFFSET + row * CELL_SIZE;
      if (tile === "#") {
        const gradient = context.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        gradient.addColorStop(0, "#312e81");
        gradient.addColorStop(1, "#0891b2");
        context.fillStyle = gradient;
        context.beginPath();
        context.roundRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 9);
        context.fill();
        context.strokeStyle = "#67e8f9";
        context.lineWidth = 1.5;
        context.stroke();
      }
    }
  }
  context.fillStyle = "#fde68a";
  for (const key of state.pellets) {
    const [row, column] = key.split(",").map(Number);
    const center = tileCenter(row, column);
    context.beginPath(); context.arc(center.x, center.y, 3.5, 0, Math.PI * 2); context.fill();
  }
  context.fillStyle = "#fef08a";
  context.shadowColor = "#fef08a";
  context.shadowBlur = 12;
  for (const key of state.powerPellets) {
    const [row, column] = key.split(",").map(Number);
    const center = tileCenter(row, column);
    context.beginPath(); context.arc(center.x, center.y, 9, 0, Math.PI * 2); context.fill();
  }
  context.shadowBlur = 0;
  const player = tileCenter(state.player.row, state.player.column);
  const direction = state.player.direction ?? "left";
  const mouth = 0.2 + Math.abs(Math.sin(state.elapsedSeconds * 12)) * 0.25;
  context.save();
  context.translate(player.x, player.y);
  context.rotate(directionRotation[direction]);
  context.fillStyle = state.invulnerableSeconds > 0 && Math.floor(state.invulnerableSeconds * 10) % 2 === 0 ? "#fef9c3" : "#facc15";
  context.shadowColor = "#facc15";
  context.shadowBlur = 10;
  context.beginPath(); context.moveTo(0, 0); context.arc(0, 0, 17, mouth, Math.PI * 2 - mouth); context.closePath(); context.fill();
  context.restore();
  context.shadowBlur = 0;
  for (const ghost of state.ghosts) drawGhost(context, ghost, state.powerSeconds > 0);

  if (state.phase === "ready" || state.phase === "won" || state.phase === "lost") {
    context.fillStyle = "rgba(7, 11, 43, 0.82)";
    context.beginPath(); context.roundRect(105, 265, 450, 130, 22); context.fill();
    context.textAlign = "center";
    context.fillStyle = state.phase === "won" ? "#86efac" : state.phase === "lost" ? "#fda4af" : "#fef08a";
    context.font = "900 32px system-ui";
    context.fillText(state.phase === "won" ? "MAZE CLEARED!" : state.phase === "lost" ? "GAME OVER" : "READY, GEORGE?", width / 2, 315);
    context.fillStyle = "white";
    context.font = "700 18px system-ui";
    context.fillText(state.phase === "ready" ? "Swipe or choose a direction" : state.status, width / 2, 355);
    context.textAlign = "start";
  }
}

function directionFromKey(code: string): Direction | undefined {
  if (code === "ArrowUp" || code === "KeyW") return "up";
  if (code === "ArrowDown" || code === "KeyS") return "down";
  if (code === "ArrowLeft" || code === "KeyA") return "left";
  if (code === "ArrowRight" || code === "KeyD") return "right";
  return undefined;
}

export function GeorgesPacManGame({ playerDisplayName }: { playerDisplayName: string }) {
  const [state, setState] = useState(createInitialGeorgesPacManState);
  const [muted, setMuted] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const inputRef = useRef<Direction | undefined>(undefined);
  const submittedRef = useRef(false);
  const audioRef = useRef<GeorgesPacManAudio | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const queueDirection = useCallback((direction: Direction) => {
    inputRef.current = direction;
    audioRef.current?.startMusic();
  }, []);

  const reset = useCallback(() => {
    submittedRef.current = false;
    inputRef.current = undefined;
    setSaveMessage("");
    stateRef.current = createInitialGeorgesPacManState();
    setState(stateRef.current);
  }, []);

  useEffect(() => {
    audioRef.current = createGeorgesPacManAudio();
    return () => { audioRef.current?.destroy(); audioRef.current = null; };
  }, []);
  useEffect(() => { audioRef.current?.setMuted(muted); }, [muted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const direction = directionFromKey(event.code);
      if (!direction) return;
      event.preventDefault();
      queueDirection(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [queueDirection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    let previousTime = performance.now();
    let accumulator = 0;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const size = Math.max(1, box.width);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(canvas.width / GEORGES_PAC_MAN_VIEWPORT.width, 0, 0, canvas.height / GEORGES_PAC_MAN_VIEWPORT.height, 0, 0);
    };
    resize();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize);
    observer?.observe(canvas);

    const tick = (now: number) => {
      accumulator += Math.min(0.1, (now - previousTime) / 1_000);
      previousTime = now;
      while (accumulator >= GEORGES_PAC_MAN_STEP_SECONDS) {
        const previous = stateRef.current;
        stateRef.current = stepGeorgesPacMan(previous, { direction: inputRef.current });
        inputRef.current = undefined;
        if (stateRef.current.score > previous.score && stateRef.current.ghostCombo === previous.ghostCombo) audioRef.current?.playPellet();
        if (stateRef.current.powerSeconds > previous.powerSeconds) audioRef.current?.playPower();
        if (stateRef.current.ghostCombo > previous.ghostCombo) audioRef.current?.playGhost();
        if (stateRef.current.lives < previous.lives) audioRef.current?.playCaught();
        if (stateRef.current.phase !== previous.phase && (stateRef.current.phase === "won" || stateRef.current.phase === "lost")) {
          audioRef.current?.stopMusic();
          if (stateRef.current.phase === "won") audioRef.current?.playVictory();
        }
        accumulator -= GEORGES_PAC_MAN_STEP_SECONDS;
      }
      drawGame(context, stateRef.current);
      setState(stateRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, []);

  useEffect(() => {
    if ((state.phase !== "won" && state.phase !== "lost") || submittedRef.current) return;
    submittedRef.current = true;
    void fetch("/api/games/georges-pac-man/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: state.score, submissionId: crypto.randomUUID() }),
    }).then((response) => response.ok
      ? setSaveMessage("Score saved to the leaderboard!")
      : setSaveMessage("Your score could not be saved."))
      .catch(() => setSaveMessage("Your score could not be saved."));
  }, [state.phase, state.score]);

  const remaining = Math.max(0, Math.ceil(GEORGES_PAC_MAN_DURATION_SECONDS - state.elapsedSeconds));
  const pelletsLeft = state.pellets.length + state.powerPellets.length;
  const buttonClass = "flex min-h-16 min-w-16 touch-manipulation select-none items-center justify-center rounded-2xl border-b-4 border-indigo-950 bg-indigo-600 text-3xl font-black text-white shadow-md active:translate-y-1 active:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500";

  return (
    <section className="mt-10" aria-labelledby="georges-pac-man-play-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">Playable game</p>
          <h2 id="georges-pac-man-play-heading" className="mt-2 text-3xl font-bold text-slate-950">Clear George’s maze!</h2>
        </div>
        <p className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-950">{remaining}s left</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5">
        <div><p className="text-xs font-bold text-slate-500 uppercase">Score</p><p className="text-2xl font-black text-slate-950 sm:text-3xl">{state.score.toLocaleString()}</p></div>
        <div><p className="text-xs font-bold text-slate-500 uppercase">Pellets</p><p className="text-2xl font-black text-slate-950 sm:text-3xl">{pelletsLeft}</p></div>
        <div><p className="text-xs font-bold text-slate-500 uppercase">Lives</p><p aria-label={`${state.lives} lives`} className="text-2xl tracking-wide sm:text-3xl">{"●".repeat(state.lives)}</p></div>
      </div>
      <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">
        Playing as {playerDisplayName}. Eat every pellet, grab glowing power pellets, then chase the blue ghosts!
      </p>
      <div className="mx-auto mt-5 grid max-w-3xl gap-5 md:grid-cols-[minmax(0,1fr)_210px] md:items-center">
        <canvas
          ref={canvasRef}
          aria-describedby="georges-pac-man-status"
          aria-label="Georges Pac Man maze. Swipe, use the on-screen arrows, or press the arrow or WASD keys to move."
          className="block aspect-square w-full touch-none rounded-3xl border-4 border-indigo-950 bg-slate-950 shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500"
          height={GEORGES_PAC_MAN_VIEWPORT.height}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            swipeStartRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = swipeStartRef.current;
            swipeStartRef.current = null;
            if (!start) return;
            const x = event.clientX - start.x;
            const y = event.clientY - start.y;
            if (Math.max(Math.abs(x), Math.abs(y)) < 12) return;
            queueDirection(Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : (y > 0 ? "down" : "up"));
          }}
          role="img"
          tabIndex={0}
          width={GEORGES_PAC_MAN_VIEWPORT.width}
        />
        <div>
          <p className="mb-3 text-center text-sm font-bold text-slate-600">Tap or swipe to move</p>
          <div aria-label="Direction controls" className="mx-auto grid w-fit grid-cols-3 gap-2">
            <span aria-hidden="true" />
            <button aria-label="Move up" className={buttonClass} onPointerDown={() => queueDirection("up")} type="button">↑</button>
            <span aria-hidden="true" />
            <button aria-label="Move left" className={buttonClass} onPointerDown={() => queueDirection("left")} type="button">←</button>
            <button aria-label="Move down" className={buttonClass} onPointerDown={() => queueDirection("down")} type="button">↓</button>
            <button aria-label="Move right" className={buttonClass} onPointerDown={() => queueDirection("right")} type="button">→</button>
          </div>
          <button className="mx-auto mt-4 block rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700" onClick={() => setMuted((current) => !current)} type="button">
            Sound: {muted ? "Off" : "On"}
          </button>
        </div>
      </div>
      <p id="georges-pac-man-status" aria-live="polite" className="mt-4 text-center font-semibold text-indigo-950">{state.status}</p>
      {state.phase === "won" || state.phase === "lost" ? (
        <div className="mt-6 rounded-2xl bg-indigo-950 p-6 text-white">
          <h3 className="text-2xl font-black">{state.phase === "won" ? "Brilliant — maze cleared!" : "Good chase — try again!"}</h3>
          <p className="mt-2">Final score: {state.score.toLocaleString()}. {saveMessage || "Saving your score…"}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-yellow-300 px-5 py-3 font-black text-indigo-950" onClick={reset} type="button">Play again</button>
            <Link className="rounded-xl border border-white/40 px-5 py-3 font-bold" href="/games/georges-pac-man/leaderboard">View leaderboard</Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
