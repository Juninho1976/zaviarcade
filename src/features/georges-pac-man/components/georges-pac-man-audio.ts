type AudioContextConstructor = typeof AudioContext;

export type GeorgesPacManAudio = {
  destroy(): void;
  playCaught(): void;
  playGhost(): void;
  playPellet(): void;
  playPower(): void;
  playVictory(): void;
  setMuted(muted: boolean): void;
  startMusic(): void;
  stopMusic(): void;
};

export function createGeorgesPacManAudio(): GeorgesPacManAudio {
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
      master.gain.value = muted ? 0 : 0.16;
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
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(at);
    oscillator.stop(at + seconds + 0.02);
  }

  return {
    destroy() {
      if (musicTimer) clearInterval(musicTimer);
      void context?.close();
      context = undefined;
      master = undefined;
    },
    playCaught() {
      tone(330, 0.12, 0.2, "sawtooth");
      tone(220, 0.18, 0.2, "sawtooth", 0.1);
      tone(110, 0.28, 0.18, "triangle", 0.22);
    },
    playGhost() {
      tone(523, 0.08, 0.22);
      tone(784, 0.1, 0.22, "square", 0.08);
      tone(1047, 0.18, 0.2, "triangle", 0.16);
    },
    playPellet() {
      tone(beat % 2 === 0 ? 300 : 360, 0.045, 0.08, "square");
    },
    playPower() {
      tone(220, 0.1, 0.2, "triangle");
      tone(440, 0.16, 0.22, "triangle", 0.08);
      tone(880, 0.24, 0.2, "triangle", 0.18);
    },
    playVictory() {
      [523, 659, 784, 1047].forEach((frequency, index) => tone(frequency, 0.25, 0.2, "triangle", index * 0.13));
    },
    setMuted(nextMuted) {
      muted = nextMuted;
      if (master && context) master.gain.setTargetAtTime(muted ? 0 : 0.16, context.currentTime, 0.02);
    },
    startMusic() {
      const audio = getContext();
      if (!audio || musicTimer) return;
      void audio.resume();
      musicTimer = setInterval(() => {
        if (beat % 4 === 0) tone(110, 0.08, 0.04, "triangle");
        beat += 1;
      }, 240);
    },
    stopMusic() {
      if (musicTimer) clearInterval(musicTimer);
      musicTimer = undefined;
    },
  };
}
