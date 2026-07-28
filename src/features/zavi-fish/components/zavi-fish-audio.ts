type AudioContextConstructor = typeof AudioContext;

export type ZaviFishAudio = {
  destroy(): void;
  playCast(): void;
  playCatch(): void;
  playGameOver(): void;
  playMiss(): void;
  playReel(direction: "down" | "up"): void;
  playScore(): void;
  setMuted(muted: boolean): void;
  startMusic(): void;
  stopMusic(): void;
};

export function createZaviFishAudio(): ZaviFishAudio {
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let muted = false;
  let musicTimer: ReturnType<typeof setInterval> | undefined;
  let note = 0;
  function getContext() {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!context && AudioContextClass) { context = new AudioContextClass(); master = context.createGain(); master.gain.value = muted ? 0 : .2; master.connect(context.destination); }
    return context;
  }
  function tone(frequency: number, seconds: number, volume: number, type: OscillatorType = "sine", delay = 0) {
    const audio = getContext(); if (!audio || !master) return;
    const at = audio.currentTime + delay; const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, at); gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .01); gain.gain.exponentialRampToValueAtTime(.0001, at + seconds); oscillator.connect(gain); gain.connect(master); oscillator.start(at); oscillator.stop(at + seconds + .02);
  }
  return {
    destroy() { if (musicTimer) clearInterval(musicTimer); void context?.close(); context = undefined; master = undefined; },
    playCast() { tone(180, .18, .2, "triangle"); tone(280, .14, .12, "sine", .05); },
    playCatch() { tone(640, .12, .25, "square"); tone(960, .22, .25, "triangle", .09); tone(1280, .18, .2, "sine", .18); },
    playGameOver() { tone(420, .2, .18, "triangle"); tone(330, .3, .2, "triangle", .16); tone(220, .42, .2, "sine", .36); },
    playMiss() { tone(170, .18, .14, "sine"); tone(110, .3, .15, "triangle", .08); },
    playReel(direction) { tone(direction === "down" ? 240 : 360, .055, .05, "square"); },
    playScore() { tone(523, .1, .18, "triangle"); tone(784, .18, .2, "triangle", .09); },
    setMuted(nextMuted) { muted = nextMuted; if (master && context) master.gain.setTargetAtTime(muted ? 0 : .2, context.currentTime, .02); },
    startMusic() { const audio = getContext(); if (!audio || musicTimer) return; void audio.resume(); const melody = [523, 659, 784, 659, 587, 740, 880, 740]; const play = () => { tone(melody[note % melody.length], .11, .08, "triangle"); if (note % 2 === 0) tone([131, 147, 165, 147][Math.floor(note / 2) % 4], .2, .07, "sine"); note += 1; }; play(); musicTimer = setInterval(play, 180); },
    stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = undefined; },
  };
}
