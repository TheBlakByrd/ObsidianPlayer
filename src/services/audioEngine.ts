// Unified Audio Engine supporting both HTML5 Audio stream and Web Audio Synthesizer

class AudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isSynthPlaying = false;
  private synthGainNode: GainNode | null = null;
  private synthInterval: number | null = null;
  private currentMode: 'stream' | 'synth' = 'stream';
  private trackDuration = 180;
  private currentElapsed = 0;
  private volume = 0.85;
  private isMuted = false;

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.crossOrigin = 'anonymous';

      this.audioEl.addEventListener('timeupdate', () => {
        if (this.currentMode === 'stream' && this.audioEl) {
          const cur = this.audioEl.currentTime;
          const dur = this.audioEl.duration || this.trackDuration;
          this.currentElapsed = cur;
          this.onTimeUpdateCallback?.(cur, dur);
        }
      });

      this.audioEl.addEventListener('ended', () => {
        if (this.currentMode === 'stream') {
          this.onEndedCallback?.();
        }
      });

      this.audioEl.addEventListener('error', () => {
        // Fallback to synth if stream fails or is blocked by CORS/mock
        if (this.currentMode === 'stream' && this.audioEl?.src) {
          console.warn('Stream audio playback error, falling back to ambient generator.');
          this.switchToSynth();
        }
      });
    }
  }

  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode) {
      this.synthGainNode.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume * 0.25,
        this.audioCtx?.currentTime || 0
      );
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.volume);
  }

  public playTrack(url: string, duration: number, startAt = 0) {
    this.trackDuration = duration || 180;
    this.currentElapsed = startAt;

    // Check if this is a synthetic demo track or real stream
    const isSynthetic = url.startsWith('synth://') || !url;

    if (isSynthetic) {
      this.stopStream();
      this.startSynth(startAt);
    } else {
      this.stopSynth();
      this.startStream(url, startAt);
    }
  }

  public pause() {
    if (this.currentMode === 'stream' && this.audioEl) {
      this.audioEl.pause();
    } else if (this.currentMode === 'synth') {
      this.pauseSynth();
    }
  }

  public resume() {
    if (this.currentMode === 'stream' && this.audioEl) {
      this.audioEl.play().catch(() => {
        this.switchToSynth();
      });
    } else if (this.currentMode === 'synth') {
      this.startSynth(this.currentElapsed);
    }
  }

  public seek(seconds: number) {
    this.currentElapsed = Math.max(0, Math.min(seconds, this.trackDuration));
    if (this.currentMode === 'stream' && this.audioEl) {
      this.audioEl.currentTime = this.currentElapsed;
    } else if (this.currentMode === 'synth') {
      this.onTimeUpdateCallback?.(this.currentElapsed, this.trackDuration);
    }
  }

  private startStream(url: string, startAt: number) {
    this.currentMode = 'stream';
    if (!this.audioEl) return;
    this.audioEl.src = url;
    this.audioEl.currentTime = startAt;
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    this.audioEl.play().catch((err) => {
      console.warn('Audio play request failed or blocked:', err);
      this.switchToSynth();
    });
  }

  private stopStream() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
    }
  }

  private switchToSynth() {
    this.stopStream();
    this.startSynth(this.currentElapsed);
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.synthGainNode = this.audioCtx.createGain();
      this.synthGainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private startSynth(startAt: number) {
    this.currentMode = 'synth';
    this.initAudioContext();
    this.isSynthPlaying = true;
    this.currentElapsed = startAt;

    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.22, this.audioCtx.currentTime);
    }

    // Play generative harmonic chord pulses
    this.playAmbientChord();

    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
    }

    this.synthInterval = window.setInterval(() => {
      if (!this.isSynthPlaying) return;
      this.currentElapsed += 1;
      this.onTimeUpdateCallback?.(this.currentElapsed, this.trackDuration);

      // Periodically trigger harmonic notes
      if (this.currentElapsed % 4 === 0) {
        this.playAmbientChord();
      }

      if (this.currentElapsed >= this.trackDuration) {
        this.pause();
        this.onEndedCallback?.();
      }
    }, 1000);
  }

  private playAmbientChord() {
    if (!this.audioCtx || !this.synthGainNode || !this.isSynthPlaying) return;

    // Harmonious chord notes (frequencies around D minor / F major pentatonic)
    const baseFreqs = [146.83, 220.00, 261.63, 329.63, 392.00, 440.00];
    const now = this.audioCtx.currentTime;

    const chosenFreqs = [
      baseFreqs[Math.floor(Math.random() * 2)],
      baseFreqs[2 + Math.floor(Math.random() * 2)],
      baseFreqs[4 + Math.floor(Math.random() * 2)],
    ];

    chosenFreqs.forEach((freq) => {
      if (!this.audioCtx || !this.synthGainNode) return;
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc.connect(noteGain);
      noteGain.connect(this.synthGainNode);

      osc.start(now);
      osc.stop(now + 4.0);
    });
  }

  private pauseSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  private stopSynth() {
    this.pauseSynth();
  }

  public destroy() {
    this.stopStream();
    this.stopSynth();
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
    }
  }
}

export const audioEngine = new AudioEngine();
