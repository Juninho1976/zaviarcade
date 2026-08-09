type AudioContextConstructor = typeof AudioContext;

export type RakAsteroidsAudio = {
  destroy(): void;
  playCrash(): void;
  playHit(size: "large" | "medium" | "small"): void;
  playShot(): void;
  playVictory(): void;
  setMuted(muted: boolean): void;
  startMusic(): void;
  stopMusic(): void;
};

export function createRakAsteroidsAudio(): RakAsteroidsAudio {
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let muted = false;
  let musicTimer: ReturnType<typeof setInterval> | undefined;
  let beat = 0;

  function getContext(): AudioContext | undefined {
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!context && AudioContextClass) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = muted ? 0 : 0.15;
      master.connect(context.destination);
    }
    return context;
  }

  function tone(frequency: number, seconds: number, volume: number, type: OscillatorType = "square", delay = 0): void {
    const audio = getContext();
    if (!audio || !master) return;
    const at = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    oscillator.connect(gain); gain.connect(master); oscillator.start(at); oscillator.stop(at + seconds + 0.02);
  }

  return {
    destroy() { if (musicTimer) clearInterval(musicTimer); void context?.close(); context = undefined; master = undefined; },
    playCrash() { tone(150, 0.25, 0.24, "sawtooth"); tone(80, 0.45, 0.18, "triangle", 0.12); },
    playHit(size) {
      const frequency = size === "large" ? 130 : size === "medium" ? 210 : 340;
      tone(frequency, 0.12, 0.2, "sawtooth"); tone(frequency * 0.7, 0.2, 0.12, "triangle", 0.05);
    },
    playShot() { tone(720, 0.07, 0.16, "square"); tone(420, 0.1, 0.1, "sawtooth", 0.03); },
    playVictory() { [392, 523, 659, 784].forEach((frequency, index) => tone(frequency, 0.3, 0.2, "triangle", index * 0.13)); },
    setMuted(nextMuted) { muted = nextMuted; if (master && context) master.gain.setTargetAtTime(muted ? 0 : 0.15, context.currentTime, 0.02); },
    startMusic() {
      const audio = getContext(); if (!audio || musicTimer) return; void audio.resume();
      musicTimer = setInterval(() => { tone(beat % 4 === 0 ? 82 : 110, 0.07, 0.035, "triangle"); beat += 1; }, 300);
    },
    stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = undefined; },
  };
}
