"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialRakAsteroidsState, getAsteroidRadius, stepRakAsteroids } from "@/features/rak-asteroids/application/game-engine";
import { submitRakAsteroidsScore } from "@/features/rak-asteroids/application/score-submission-client";
import {
  RAK_ASTEROIDS_DURATION_SECONDS,
  RAK_ASTEROIDS_STEP_SECONDS,
  RAK_ASTEROIDS_VIEWPORT,
  type Asteroid,
  type RakAsteroidsInput,
  type RakAsteroidsState,
} from "@/features/rak-asteroids/domain/game";
import { createRakAsteroidsAudio, type RakAsteroidsAudio } from "./rak-asteroids-audio";

type ScoreSaveState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; scoreId: number }
  | { status: "error"; message: string };

function drawStars(context: CanvasRenderingContext2D): void {
  context.fillStyle = "#050816";
  context.fillRect(0, 0, RAK_ASTEROIDS_VIEWPORT.width, RAK_ASTEROIDS_VIEWPORT.height);
  for (let index = 0; index < 85; index += 1) {
    const x = (index * 137 + 43) % RAK_ASTEROIDS_VIEWPORT.width;
    const y = (index * 83 + 29) % RAK_ASTEROIDS_VIEWPORT.height;
    const radius = index % 11 === 0 ? 1.8 : index % 3 === 0 ? 1.1 : 0.7;
    context.fillStyle = index % 7 === 0 ? "#a5f3fc" : "rgba(255,255,255,.72)";
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
  }
}

function asteroidShapeRadius(asteroid: Asteroid, vertex: number): number {
  const base = getAsteroidRadius(asteroid.size);
  return base * (0.82 + ((Math.sin(asteroid.id * 12.37 + vertex * 7.13) + 1) / 2) * 0.3);
}

function drawAsteroid(context: CanvasRenderingContext2D, asteroid: Asteroid): void {
  const vertices = asteroid.size === "large" ? 12 : asteroid.size === "medium" ? 10 : 8;
  context.save(); context.translate(asteroid.x, asteroid.y); context.rotate(asteroid.angle);
  context.beginPath();
  for (let index = 0; index < vertices; index += 1) {
    const angle = index * Math.PI * 2 / vertices;
    const radius = asteroidShapeRadius(asteroid, index);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath();
  const gradient = context.createRadialGradient(-12, -15, 3, 0, 0, getAsteroidRadius(asteroid.size));
  gradient.addColorStop(0, asteroid.size === "small" ? "#fef3c7" : "#c4b5fd");
  gradient.addColorStop(0.45, asteroid.size === "large" ? "#6366f1" : "#7c3aed");
  gradient.addColorStop(1, "#312e81");
  context.fillStyle = gradient; context.fill();
  context.strokeStyle = asteroid.size === "small" ? "#fbbf24" : "#67e8f9"; context.lineWidth = 3; context.stroke();
  context.strokeStyle = "rgba(255,255,255,.22)"; context.lineWidth = 2;
  context.beginPath(); context.arc(-getAsteroidRadius(asteroid.size) * 0.2, -4, getAsteroidRadius(asteroid.size) * 0.22, 0, Math.PI * 2); context.stroke();
  context.restore();
}

function drawShip(context: CanvasRenderingContext2D, state: RakAsteroidsState, thrusting: boolean): void {
  if (state.ship.invulnerableSeconds > 0 && Math.floor(state.ship.invulnerableSeconds * 10) % 2 === 0) return;
  context.save(); context.translate(state.ship.x, state.ship.y); context.rotate(state.ship.angle);
  if (thrusting && state.phase === "playing") {
    context.fillStyle = "#fb923c"; context.shadowColor = "#facc15"; context.shadowBlur = 12;
    context.beginPath(); context.moveTo(-18, -8); context.lineTo(-38 - Math.sin(state.elapsedSeconds * 30) * 6, 0); context.lineTo(-18, 8); context.closePath(); context.fill();
  }
  context.shadowColor = "#22d3ee"; context.shadowBlur = 14; context.fillStyle = "#f8fafc"; context.strokeStyle = "#22d3ee"; context.lineWidth = 4;
  context.beginPath(); context.moveTo(25, 0); context.lineTo(-18, -16); context.lineTo(-10, 0); context.lineTo(-18, 16); context.closePath(); context.fill(); context.stroke();
  context.fillStyle = "#facc15"; context.beginPath(); context.arc(5, 0, 4, 0, Math.PI * 2); context.fill();
  context.restore(); context.shadowBlur = 0;
}

function drawGame(context: CanvasRenderingContext2D, state: RakAsteroidsState, thrusting: boolean): void {
  drawStars(context);
  for (const asteroid of state.asteroids) drawAsteroid(context, asteroid);
  context.strokeStyle = "#f472b6"; context.lineWidth = 4; context.lineCap = "round"; context.shadowColor = "#f472b6"; context.shadowBlur = 10;
  for (const laser of state.lasers) {
    const speed = Math.hypot(laser.velocity.x, laser.velocity.y) || 1;
    context.beginPath(); context.moveTo(laser.x, laser.y); context.lineTo(laser.x - laser.velocity.x / speed * 14, laser.y - laser.velocity.y / speed * 14); context.stroke();
  }
  context.shadowBlur = 0;
  drawShip(context, state, thrusting);

  if (state.phase !== "playing") {
    context.fillStyle = "rgba(5, 8, 22, .82)"; context.beginPath(); context.roundRect(220, 215, 520, 170, 26); context.fill();
    context.textAlign = "center"; context.font = "900 42px system-ui";
    context.fillStyle = state.phase === "won" ? "#86efac" : state.phase === "over" ? "#fda4af" : "#67e8f9";
    context.fillText(state.phase === "won" ? "SECTOR CLEARED!" : state.status.startsWith("Run ended") ? "RUN FINISHED!" : state.phase === "over" ? "MISSION OVER" : "Ready, Rak?", 480, 280);
    context.fillStyle = "white"; context.font = "700 21px system-ui";
    context.fillText(state.phase === "ready" ? "Rotate, thrust, and fire" : state.status, 480, 330); context.textAlign = "start";
  }
}

export function RakAsteroidsGame({ playerDisplayName }: { playerDisplayName: string }) {
  const [state, setState] = useState(createInitialRakAsteroidsState);
  const [muted, setMuted] = useState(false);
  const [scoreSave, setScoreSave] = useState<ScoreSaveState>({ status: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const controlsRef = useRef<Pick<RakAsteroidsInput, "rotateLeft" | "rotateRight" | "thrust">>({});
  const fireRef = useRef(false);
  const audioRef = useRef<RakAsteroidsAudio | null>(null);
  const submissionIdRef = useRef<string | null>(null);

  const setControl = useCallback((control: "rotateLeft" | "rotateRight" | "thrust", pressed: boolean) => {
    controlsRef.current = { ...controlsRef.current, [control]: pressed };
    if (pressed) audioRef.current?.startMusic();
  }, []);
  const queueFire = useCallback(() => { fireRef.current = true; audioRef.current?.startMusic(); }, []);
  const saveScore = useCallback(async (score: number) => {
    setScoreSave({ status: "pending" }); submissionIdRef.current ??= crypto.randomUUID();
    try { const scoreId = await submitRakAsteroidsScore(score, submissionIdRef.current); setScoreSave({ status: "success", scoreId }); }
    catch (error) { setScoreSave({ status: "error", message: error instanceof Error ? error.message : "Your score could not be saved. Please try again." }); }
  }, []);
  const reset = useCallback(() => {
    stateRef.current = createInitialRakAsteroidsState(); controlsRef.current = {}; fireRef.current = false; submissionIdRef.current = null;
    setState(stateRef.current); setScoreSave({ status: "idle" });
  }, []);
  const endAndSave = useCallback(() => {
    stateRef.current = stepRakAsteroids(stateRef.current, { endRunPressed: true }, 0); setState(stateRef.current); audioRef.current?.stopMusic(); void saveScore(stateRef.current.score);
  }, [saveScore]);

  useEffect(() => { audioRef.current = createRakAsteroidsAudio(); return () => { audioRef.current?.destroy(); audioRef.current = null; }; }, []);
  useEffect(() => { audioRef.current?.setMuted(muted); }, [muted]);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === "ArrowLeft" || event.code === "KeyA") setControl("rotateLeft", true);
      else if (event.code === "ArrowRight" || event.code === "KeyD") setControl("rotateRight", true);
      else if (event.code === "ArrowUp" || event.code === "KeyW") setControl("thrust", true);
      else if (event.code === "Space" && !event.repeat) queueFire(); else return;
      event.preventDefault();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") setControl("rotateLeft", false);
      if (event.code === "ArrowRight" || event.code === "KeyD") setControl("rotateRight", false);
      if (event.code === "ArrowUp" || event.code === "KeyW") setControl("thrust", false);
    };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp);
    return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); };
  }, [queueFire, setControl]);

  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    let frame = 0; let previousTime = performance.now(); let accumulator = 0;
    const resize = () => { const box = canvas.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1; canvas.width = Math.round(box.width * ratio); canvas.height = Math.round(box.width * RAK_ASTEROIDS_VIEWPORT.height / RAK_ASTEROIDS_VIEWPORT.width * ratio); context.setTransform(canvas.width / RAK_ASTEROIDS_VIEWPORT.width, 0, 0, canvas.height / RAK_ASTEROIDS_VIEWPORT.height, 0, 0); };
    resize(); const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize); observer?.observe(canvas);
    const tick = (now: number) => {
      accumulator += Math.min(0.1, (now - previousTime) / 1_000); previousTime = now;
      while (accumulator >= RAK_ASTEROIDS_STEP_SECONDS) {
        const previous = stateRef.current;
        stateRef.current = stepRakAsteroids(previous, { ...controlsRef.current, firePressed: fireRef.current }); fireRef.current = false;
        if (stateRef.current.shotsFired > previous.shotsFired) audioRef.current?.playShot();
        if (stateRef.current.hits > previous.hits) {
          const currentIds = new Set(stateRef.current.asteroids.map((asteroid) => asteroid.id));
          const destroyed = previous.asteroids.find((asteroid) => !currentIds.has(asteroid.id)); if (destroyed) audioRef.current?.playHit(destroyed.size);
        }
        if (stateRef.current.lives < previous.lives) audioRef.current?.playCrash();
        if (stateRef.current.phase !== previous.phase && (stateRef.current.phase === "won" || stateRef.current.phase === "over")) {
          audioRef.current?.stopMusic(); if (stateRef.current.phase === "won") audioRef.current?.playVictory(); void saveScore(stateRef.current.score);
        }
        accumulator -= RAK_ASTEROIDS_STEP_SECONDS;
      }
      drawGame(context, stateRef.current, Boolean(controlsRef.current.thrust)); setState(stateRef.current); frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [saveScore]);

  const remaining = Math.max(0, Math.ceil(RAK_ASTEROIDS_DURATION_SECONDS - state.elapsedSeconds));
  const accuracy = state.shotsFired === 0 ? 0 : Math.round(state.hits / state.shotsFired * 100);
  const holdClass = "min-h-16 touch-manipulation select-none rounded-2xl border-b-4 border-indigo-950 bg-indigo-600 px-4 text-lg font-black text-white shadow-md active:translate-y-1 active:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500";
  const holdHandlers = (control: "rotateLeft" | "rotateRight" | "thrust") => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); setControl(control, true); },
    onPointerUp: () => setControl(control, false), onPointerCancel: () => setControl(control, false), onPointerLeave: () => setControl(control, false),
  });

  return <section className="mt-10" aria-labelledby="rak-asteroids-play-heading">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold tracking-[.2em] text-cyan-700 uppercase">Playable game</p><h2 id="rak-asteroids-play-heading" className="mt-2 text-3xl font-bold text-slate-950">Clear Rak’s asteroid field!</h2></div><p className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-950">{remaining}s left</p></div>
    <div className="mt-5 grid grid-cols-4 gap-3 rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5"><div><p className="text-xs font-bold text-slate-500 uppercase">Score</p><p className="text-2xl font-black sm:text-3xl">{state.score.toLocaleString()}</p></div><div><p className="text-xs font-bold text-slate-500 uppercase">Rocks</p><p className="text-2xl font-black sm:text-3xl">{state.asteroids.length}</p></div><div><p className="text-xs font-bold text-slate-500 uppercase">Accuracy</p><p className="text-2xl font-black sm:text-3xl">{accuracy}%</p></div><div><p className="text-xs font-bold text-slate-500 uppercase">Lives</p><p aria-label={`${state.lives} ships`} className="text-xl tracking-wide sm:text-3xl">{"▲".repeat(state.lives)}</p></div></div>
    <p className="mt-4 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">Playing as {playerDisplayName}. Hold rotate or thrust; tap Fire for each laser. Large rocks split into four, then two!</p>
    <div className="mx-auto mt-5 grid max-w-5xl gap-5 md:grid-cols-[minmax(0,1fr)_230px] md:items-center">
      <canvas ref={canvasRef} aria-describedby="rak-asteroids-status" aria-label="Rak Asteroids game. Rotate, thrust, and fire lasers to clear every asteroid." className="block aspect-[8/5] w-full touch-none rounded-3xl border-4 border-indigo-950 bg-slate-950 shadow-xl" height={600} role="img" tabIndex={0} width={960}/>
      <div><p className="mb-3 text-center text-sm font-bold text-slate-600">Hold to fly · tap to fire</p><div className="grid grid-cols-3 gap-2"><button aria-label="Rotate left" className={holdClass} type="button" {...holdHandlers("rotateLeft")}>↶ Left</button><button aria-label="Thrust" className={holdClass} type="button" {...holdHandlers("thrust")}>▲ Go</button><button aria-label="Rotate right" className={holdClass} type="button" {...holdHandlers("rotateRight")}>Right ↷</button></div><button aria-label="Fire laser" className="mt-3 min-h-16 w-full touch-manipulation rounded-2xl border-b-4 border-rose-900 bg-rose-500 text-xl font-black text-white shadow-md active:translate-y-1 active:border-b-0" onPointerDown={queueFire} type="button">● FIRE</button><button className="mx-auto mt-3 block rounded-xl border border-slate-300 px-4 py-2 font-bold" onClick={() => setMuted((value) => !value)} type="button">Sound: {muted ? "Off" : "On"}</button>{state.phase === "playing" ? <button className="mx-auto mt-3 block rounded-xl bg-amber-300 px-4 py-2 font-bold text-amber-950" onClick={endAndSave} type="button">End run &amp; save score</button> : null}</div>
    </div>
    <p id="rak-asteroids-status" aria-live="polite" className="mt-4 text-center font-semibold text-indigo-950">{state.status}</p>
    {state.phase === "won" || state.phase === "over" ? <div className="mt-6 rounded-2xl bg-indigo-950 p-6 text-white"><h3 className="text-2xl font-black">{state.phase === "won" ? "Brilliant — sector cleared!" : state.status.startsWith("Run ended") ? "Run finished — your score counts!" : "Mission complete — score recorded!"}</h3><p className="mt-2">Final score: {state.score.toLocaleString()} · {state.hits} hits from {state.shotsFired} shots.</p>{scoreSave.status === "idle" || scoreSave.status === "pending" ? <p className="mt-2">Saving your score…</p> : null}{scoreSave.status === "success" ? <p className="mt-2 text-green-200">Score #{scoreSave.scoreId} saved to the leaderboard!</p> : null}{scoreSave.status === "error" ? <div className="mt-3" role="alert"><p className="text-rose-200">{scoreSave.message}</p><button className="mt-3 rounded-xl bg-white px-4 py-2 font-bold text-indigo-950" onClick={() => void saveScore(state.score)} type="button">Try saving again</button></div> : null}<div className="mt-5 flex flex-wrap gap-3"><button className="rounded-xl bg-yellow-300 px-5 py-3 font-black text-indigo-950 disabled:opacity-60" disabled={scoreSave.status === "pending"} onClick={reset} type="button">Play again</button><Link className="rounded-xl border border-white/40 px-5 py-3 font-bold" href="/games/rak-asteroids/leaderboard">View leaderboard</Link></div></div> : null}
  </section>;
}
