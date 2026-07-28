"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialFishGameState, startFishGame, stepFishGame } from "@/features/zavi-fish/application/game-engine";
import { fishConfig, ZAVI_FISH_DURATION_SECONDS, ZAVI_FISH_VIEWPORT, type FishGameState } from "@/features/zavi-fish/domain/game";

function drawFish(context: CanvasRenderingContext2D, fish: FishGameState["fish"][number]) {
  const config = fishConfig[fish.type];
  context.save(); context.translate(fish.x, fish.y); context.scale(fish.direction, 1);
  context.fillStyle = config.color; context.beginPath(); context.ellipse(0, 0, config.width / 2, config.height / 2, 0, 0, Math.PI * 2); context.fill();
  context.beginPath(); context.moveTo(-config.width / 2 + 5, 0); context.lineTo(-config.width / 2 - 16, -config.height / 2); context.lineTo(-config.width / 2 - 16, config.height / 2); context.closePath(); context.fill();
  context.fillStyle = "#0f172a"; context.beginPath(); context.arc(config.width / 4, -4, 3, 0, Math.PI * 2); context.fill(); context.restore();
}

function drawGame(context: CanvasRenderingContext2D, state: FishGameState) {
  const { width, height } = ZAVI_FISH_VIEWPORT;
  const water = context.createLinearGradient(0, 70, 0, height); water.addColorStop(0, "#38bdf8"); water.addColorStop(1, "#0e7490"); context.fillStyle = water; context.fillRect(0, 0, width, height);
  context.fillStyle = "#dbeafe"; context.fillRect(0, 0, width, 88);
  context.fillStyle = "#92400e"; context.beginPath(); context.roundRect(width / 2 - 100, 46, 200, 30, 12); context.fill();
  context.fillStyle = "#fef3c7"; context.beginPath(); context.arc(width / 2, 38, 18, 0, Math.PI * 2); context.fill();
  for (let x = 24; x < width; x += 92) { context.strokeStyle = "rgba(255,255,255,.16)"; context.beginPath(); context.arc(x, 150 + (x % 4) * 38, 7, 0, Math.PI * 2); context.stroke(); }
  context.strokeStyle = "#f8fafc"; context.lineWidth = 2; context.beginPath(); context.moveTo(width / 2, 70); context.lineTo(width / 2, state.hook.y); context.stroke();
  for (const fish of state.fish) drawFish(context, fish);
  context.strokeStyle = "#0f172a"; context.lineWidth = 5; context.beginPath(); context.arc(width / 2, state.hook.y + 6, 9, -Math.PI / 2, Math.PI * .7); context.stroke();
  context.fillStyle = "rgba(255,255,255,.92)"; context.font = "700 18px system-ui"; context.fillText(state.status, 24, 118);
}

export function ZaviFishGame({ playerDisplayName }: { playerDisplayName: string }) {
  const [state, setState] = useState(createInitialFishGameState);
  const canvasRef = useRef<HTMLCanvasElement>(null); const stateRef = useRef(state); const holdingRef = useRef(false); const submittedRef = useRef(false); const [muted, setMuted] = useState(false); const [saveMessage, setSaveMessage] = useState("");
  const reset = useCallback(() => { holdingRef.current = false; submittedRef.current = false; setSaveMessage(""); stateRef.current = createInitialFishGameState(); setState(stateRef.current); }, []);
  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    let frame = 0; let last = performance.now(); let accumulated = 0;
    const resize = () => { const box = canvas.getBoundingClientRect(); const ratio = devicePixelRatio || 1; canvas.width = box.width * ratio; canvas.height = box.width * ZAVI_FISH_VIEWPORT.height / ZAVI_FISH_VIEWPORT.width * ratio; context.setTransform(canvas.width / ZAVI_FISH_VIEWPORT.width, 0, 0, canvas.height / ZAVI_FISH_VIEWPORT.height, 0, 0); };
    resize(); const observer = new ResizeObserver(resize); observer.observe(canvas);
    const tick = (now: number) => { accumulated += Math.min(.1, (now - last) / 1000); last = now; while (accumulated >= 1 / 60) { stateRef.current = stepFishGame(stateRef.current, holdingRef.current); accumulated -= 1 / 60; } drawGame(context, stateRef.current); setState(stateRef.current); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  useEffect(() => { const keyDown = (event: KeyboardEvent) => { if (event.code !== "ArrowDown") return; event.preventDefault(); stateRef.current = startFishGame(stateRef.current); holdingRef.current = true; }; const keyUp = (event: KeyboardEvent) => { if (event.code === "ArrowDown") { event.preventDefault(); holdingRef.current = false; } }; window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp); return () => { window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); }; }, []);
  useEffect(() => {
    if (state.phase !== "over" || submittedRef.current) return;
    submittedRef.current = true;
    void fetch("/api/games/zavi-fish/scores", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ score: state.score, submissionId: crypto.randomUUID() }) })
      .then((response) => response.ok ? setSaveMessage("Score saved to the leaderboard!") : setSaveMessage("Your score could not be saved."))
      .catch(() => setSaveMessage("Your score could not be saved."));
  }, [state.phase, state.score]);
  const startHold = () => { stateRef.current = startFishGame(stateRef.current); holdingRef.current = true; };
  const remaining = Math.ceil(ZAVI_FISH_DURATION_SECONDS - state.elapsedSeconds);
  return <section className="mt-10" aria-labelledby="zavi-fish-play-heading"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold tracking-[.2em] text-cyan-700 uppercase">Playable game</p><h2 id="zavi-fish-play-heading" className="mt-2 text-3xl font-bold text-slate-950">Hook, catch, reel!</h2></div><p className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-950">{remaining}s left</p></div><div className="mt-5 grid gap-4 rounded-2xl border border-cyan-100 bg-white p-5 sm:grid-cols-3"><div><p className="text-sm font-semibold text-slate-600">Score</p><p className="text-3xl font-black">{state.score}</p></div><div className="sm:col-span-2"><p className="text-sm font-semibold text-slate-600">Recent catch</p><p className="text-lg font-bold text-cyan-900">{Object.entries(state.catches).filter(([, count]) => count).map(([type, count]) => `${count} ${type}`).join(" · ") || "Cast your hook to find fish!"}</p></div></div><p className="mt-5 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-950">Playing as {playerDisplayName}. Hold ↓ or the big button to lower the hook; release to reel in.</p><canvas ref={canvasRef} role="img" tabIndex={0} aria-label="Zavi Fish game. Hold Down Arrow or the Cast and reel button to lower the hook." className="mt-6 block aspect-video w-full touch-manipulation rounded-3xl border border-cyan-200 shadow-sm" width={960} height={540} /><div className="mt-4 flex flex-wrap gap-3"><button type="button" onPointerDown={startHold} onPointerUp={() => { holdingRef.current = false; }} onPointerCancel={() => { holdingRef.current = false; }} onPointerLeave={() => { holdingRef.current = false; }} className="rounded-xl bg-cyan-800 px-6 py-4 text-lg font-black text-white hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">Hold to cast &amp; reel</button><button type="button" onClick={() => setMuted(!muted)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold">{muted ? "Sound off" : "Sound on"}</button>{state.phase === "over" ? <button type="button" onClick={reset} className="rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950">Play again</button> : null}</div>{state.phase === "over" ? <div className="mt-6 rounded-2xl bg-cyan-950 p-6 text-white"><h3 className="text-2xl font-black">Time’s up — {state.score} points!</h3><p className="mt-2">You caught {Object.values(state.catches).reduce((sum, count) => sum + count, 0)} fish. {saveMessage || "Saving your score…"} Play again for another splash.</p></div> : null}</section>;
}
