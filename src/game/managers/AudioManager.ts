class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private isMuted = false;
  private volume = 0.3;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        console.warn('Web Audio API not available');
      }
    }
    return this.audioContext;
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'square'): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playCoinSound(): void {
    this.playTone(880, 0.1, 'square');
    setTimeout(() => this.playTone(1174, 0.15, 'square'), 80);
  }

  playTaskComplete(): void {
    this.playTone(523, 0.1, 'square');
    setTimeout(() => this.playTone(659, 0.1, 'square'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'square'), 200);
  }

  playTaskStart(): void {
    this.playTone(330, 0.1, 'triangle');
  }

  playBuySound(): void {
    this.playTone(440, 0.08, 'square');
    setTimeout(() => this.playTone(554, 0.08, 'square'), 60);
    setTimeout(() => this.playTone(659, 0.12, 'square'), 120);
  }

  playPlaceSound(): void {
    this.playTone(262, 0.15, 'triangle');
  }

  playClickSound(): void {
    this.playTone(660, 0.05, 'square');
  }

  playLevelUp(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square'), i * 150);
    });
  }

  playError(): void {
    this.playTone(200, 0.2, 'sawtooth');
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  getMuted(): boolean {
    return this.isMuted;
  }
}

export default AudioManager;
