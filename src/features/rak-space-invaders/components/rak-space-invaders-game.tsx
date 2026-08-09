"use client";
import { useEffect, useRef, useState } from "react";
import { createRakState, startRak, stepRak } from "../application/game-engine";
import { type RakState } from "../domain/game";
import { createRakAudio } from "./rak-audio";
function render(context: CanvasRenderingContext2D, state: RakState) { context.fillStyle="#020617";context.fillRect(0,0,960,600);context.fillStyle="#f8fafc";for(let x=20;x<960;x+=73)context.fillRect(x,(x*31)%490,2,2);context.strokeStyle="#ef4444";context.setLineDash([8,8]);context.beginPath();context.moveTo(0,505);context.lineTo(960,505);context.stroke();context.setLineDash([]); for(const invader of state.invaders){context.fillStyle=invader.hits===1?"#67e8f9":invader.hits===2?"#c4b5fd":"#fbbf24";context.fillRect(invader.x-22,invader.y-14,44,28);context.fillStyle="#020617";context.fillRect(invader.x-12,invader.y-5,6,6);context.fillRect(invader.x+6,invader.y-5,6,6);}context.fillStyle="#34d399";context.beginPath();context.moveTo(state.shipX,520);context.lineTo(state.shipX-26,560);context.lineTo(state.shipX+26,560);context.closePath();context.fill();context.fillStyle="#fef08a";for(const laser of state.lasers)context.fillRect(laser.x-2,laser.y,4,14);context.fillStyle="#fb7185";for(const bomb of state.bombs)context.fillRect(bomb.x-4,bomb.y,8,14); }
type RakInputKey = "left" | "right" | "fire";

const controlClassName = "touch-none select-none rounded-xl p-4 font-black text-white outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] active:scale-95 focus-visible:ring-4 focus-visible:ring-cyan-300";

export function RakSpaceInvadersGame({ playerDisplayName }: { playerDisplayName: string }) {
  const [state, setState] = useState(createRakState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const input = useRef({ left: false, right: false, fire: false });
  const audio = useRef<ReturnType<typeof createRakAudio> | null>(null);
  const submitted = useRef(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    audio.current = createRakAudio();
    return () => audio.current?.destroy();
  }, []);

  useEffect(() => {
    if (state.phase !== "complete" || submitted.current) return;
    submitted.current = true;
    void fetch("/api/games/rak-space-invaders/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ score: state.score, submissionId: crypto.randomUUID() }),
    }).then((response) => setSaved(response.ok ? "Score saved to the leaderboard!" : "Score could not be saved."));
  }, [state.phase, state.score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let id = 0;
    let last = performance.now();
    let accumulator = 0;
    const releaseAllInputs = () => {
      input.current.left = false;
      input.current.right = false;
      input.current.fire = false;
    };
    const handleVisibilityChange = () => {
      if (document.hidden) releaseAllInputs();
    };
    const handleKey = (event: KeyboardEvent, down: boolean) => {
      if (!["ArrowLeft", "KeyA", "ArrowRight", "KeyD", "Space"].includes(event.code)) return;
      event.preventDefault();
      if (event.code === "ArrowLeft" || event.code === "KeyA") input.current.left = down;
      if (event.code === "ArrowRight" || event.code === "KeyD") input.current.right = down;
      if (event.code === "Space") input.current.fire = down;
      if (down) {
        stateRef.current = startRak(stateRef.current);
        audio.current?.start();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKey(event, false);
    const frame = (now: number) => {
      accumulator += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (accumulator >= 1 / 60) {
        const previous = stateRef.current;
        stateRef.current = stepRak(previous, input.current);
        if (input.current.fire && stateRef.current.lasers.length > previous.lasers.length) audio.current?.fire();
        if (stateRef.current.score > previous.score) audio.current?.hit();
        if (stateRef.current.phase === "complete" && previous.phase !== "complete") audio.current?.win();
        accumulator -= 1 / 60;
      }
      render(context, stateRef.current);
      setState(stateRef.current);
      id = requestAnimationFrame(frame);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseAllInputs);
    window.addEventListener("pagehide", releaseAllInputs);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    id = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(id);
      releaseAllInputs();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseAllInputs);
      window.removeEventListener("pagehide", releaseAllInputs);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const press = (key: RakInputKey, down: boolean) => {
    input.current[key] = down;
    if (down) {
      stateRef.current = startRak(stateRef.current);
      audio.current?.start();
    }
  };
  const startPress = (key: RakInputKey, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    press(key, true);
  };
  const endPress = (key: RakInputKey) => press(key, false);
  const replay = () => {
    submitted.current = false;
    setSaved("");
    stateRef.current = createRakState();
    setState(stateRef.current);
  };

  return <section className="mt-10"><div className="flex justify-between"><h2 className="text-3xl font-black">Level 1</h2><p className="font-bold">Score {state.score} · ♥ {state.lives} · {state.elapsed.toFixed(1)}s</p></div><p className="mt-3 rounded-xl bg-violet-50 p-3 font-semibold">Playing as {playerDisplayName}. Move with ← → or A/D; fire with Space.</p><canvas ref={canvasRef} role="img" aria-label="Rak Space Invaders game" width={960} height={600} className="mt-5 aspect-video w-full rounded-3xl border bg-slate-950"/><div className="mt-4 grid grid-cols-3 gap-3"><button type="button" aria-label="Move left" onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => startPress("left", event)} onPointerUp={() => endPress("left")} onPointerCancel={() => endPress("left")} onLostPointerCapture={() => endPress("left")} className={`${controlClassName} bg-slate-800`}>← Left</button><button type="button" aria-label="Fire" onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => startPress("fire", event)} onPointerUp={() => endPress("fire")} onPointerCancel={() => endPress("fire")} onLostPointerCapture={() => endPress("fire")} className={`${controlClassName} bg-violet-700`}>Fire</button><button type="button" aria-label="Move right" onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => startPress("right", event)} onPointerUp={() => endPress("right")} onPointerCancel={() => endPress("right")} onLostPointerCapture={() => endPress("right")} className={`${controlClassName} bg-slate-800`}>Right →</button></div>{state.phase === "complete" || state.phase === "over" ? <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><h3 className="text-2xl font-black">{state.phase === "complete" ? "Level Complete!" : "Game Over"}</h3><p>{state.phase === "complete" ? saved || "Saving your score…" : "The base was overrun. Try again!"}</p><button type="button" onClick={replay} className="mt-3 rounded-xl bg-violet-400 px-5 py-3 font-black text-slate-950">Play again</button></div> : null}</section>;
}
