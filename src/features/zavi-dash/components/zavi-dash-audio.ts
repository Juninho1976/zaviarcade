type AudioContextConstructor = typeof AudioContext;

export type ZaviDashAudio = {
  destroy(): void;
  playCrash(): void;
  playFall(): void;
  playVictory(): void;
  setMuted(muted: boolean): void;
  startMusic(): void;
  stopMusic(): void;
};

const melody = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880, 698.46,
  659.25, 783.99, 987.77, 783.99,
  587.33, 698.46, 783.99, 493.88,
];
const bass = [130.81, 146.83, 164.81, 146.83];

export function createZaviDashAudio(): ZaviDashAudio {
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let musicTimer: ReturnType<typeof setInterval> | undefined;
  let noteIndex = 0;
  let muted = false;

  function getContext(): AudioContext | undefined {
    if (typeof window === "undefined") return undefined;
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!AudioContextClass) return undefined;

    if (!context) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = muted ? 0 : 0.22;
      master.connect(context.destination);
    }

    return context;
  }

  function playTone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    delay = 0,
  ): void {
    const audioContext = getContext();
    if (!audioContext || !master) return;
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playMusicStep(): void {
    playTone(melody[noteIndex % melody.length], 0.14, 0.2, "square");
    if (noteIndex % 2 === 0) {
      playTone(bass[Math.floor(noteIndex / 4) % bass.length], 0.28, 0.13, "triangle");
    }
    noteIndex += 1;
  }

  function stopMusic(): void {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = undefined;
  }

  return {
    destroy() {
      stopMusic();
      void context?.close();
      context = undefined;
      master = undefined;
    },
    playCrash() {
      const audioContext = getContext();
      if (!audioContext || !master) return;
      const start = audioContext.currentTime;
      const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.42), audioContext.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) {
        const decay = 1 - index / samples.length;
        samples[index] = (Math.random() * 2 - 1) * decay * decay;
      }
      const noise = audioContext.createBufferSource();
      const highpass = audioContext.createBiquadFilter();
      const noiseGain = audioContext.createGain();
      noise.buffer = buffer;
      highpass.type = "highpass";
      highpass.frequency.value = 1_800;
      noiseGain.gain.setValueAtTime(0.7, start);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      noise.connect(highpass);
      highpass.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(start);
      playTone(130, 0.3, 0.55, "sawtooth");
      for (const [index, frequency] of [2_900, 3_700, 4_600, 5_400].entries()) {
        playTone(frequency, 0.12 + index * 0.035, 0.18, "square", index * 0.028);
      }
    },
    playFall() {
      const audioContext = getContext();
      if (!audioContext || !master) return;
      const start = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, start);
      oscillator.frequency.exponentialRampToValueAtTime(75, start + 0.7);
      gain.gain.setValueAtTime(0.32, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.75);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.76);
      playTone(310, 0.5, 0.12, "triangle", 0.04);
    },
    playVictory() {
      for (const [index, frequency] of [523.25, 659.25, 783.99, 1_046.5].entries()) {
        playTone(frequency, 0.22, 0.2, "square", index * 0.11);
      }
    },
    setMuted(nextMuted) {
      muted = nextMuted;
      if (master && context) {
        master.gain.setTargetAtTime(muted ? 0 : 0.22, context.currentTime, 0.02);
      }
    },
    startMusic() {
      const audioContext = getContext();
      if (!audioContext) return;
      void audioContext.resume();
      if (musicTimer) return;
      playMusicStep();
      musicTimer = setInterval(playMusicStep, 170);
    },
    stopMusic,
  };
}
