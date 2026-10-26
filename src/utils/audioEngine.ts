import { EQ_FREQUENCIES } from './demoData';

class AudioEngine {
  private audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private preampGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private spatialPanner: StereoPannerNode | null = null;
  private isSpatialEnabled = false;

  private abRepeat: { a: number | null; b: number | null; active: boolean } = {
    a: null,
    b: null,
    active: false
  };

  private listeners: {
    timeUpdate?: (currentTime: number, duration: number) => void;
    ended?: () => void;
    playState?: (isPlaying: boolean) => void;
    error?: (err: string) => void;
  } = {};

  constructor() {
    this.audio = new Audio();
    this.setupAudioListeners();
  }

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);

      // Create 10 EQ BiquadFilterNodes
      this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = this.ctx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Chain EQ filters
      let lastNode: AudioNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      // Preamp / master gain node
      this.preampGain = this.ctx.createGain();
      this.preampGain.gain.value = 1.0;
      lastNode.connect(this.preampGain);
      lastNode = this.preampGain;

      // Stereo panner for spatial ambiance
      if (this.ctx.createStereoPanner) {
        this.spatialPanner = this.ctx.createStereoPanner();
        this.spatialPanner.pan.value = 0;
        lastNode.connect(this.spatialPanner);
        lastNode = this.spatialPanner;
      }

      // Analyser node for Apple / WinUI visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128; // 64 frequency bins, fast and responsive
      this.analyser.smoothingTimeConstant = 0.8;
      lastNode.connect(this.analyser);

      // Connect to speakers
      this.analyser.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio Context initialization warning (audio will still play via HTMLAudio):', e);
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('loadedmetadata', () => {
      const dur = this.audio.duration;
      if (this.listeners.timeUpdate && dur > 0 && !isNaN(dur)) {
        this.listeners.timeUpdate(this.audio.currentTime, dur);
      }
    });

    this.audio.addEventListener('durationchange', () => {
      const dur = this.audio.duration;
      if (this.listeners.timeUpdate && dur > 0 && !isNaN(dur)) {
        this.listeners.timeUpdate(this.audio.currentTime, dur);
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      const current = this.audio.currentTime;

      // Check A-B Repeat
      if (
        this.abRepeat.active &&
        this.abRepeat.a !== null &&
        this.abRepeat.b !== null &&
        this.abRepeat.b > this.abRepeat.a
      ) {
        if (current >= this.abRepeat.b || current < this.abRepeat.a) {
          this.audio.currentTime = this.abRepeat.a;
          return;
        }
      }

      if (this.listeners.timeUpdate) {
        this.listeners.timeUpdate(current, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.listeners.ended) {
        this.listeners.ended();
      }
    });

    this.audio.addEventListener('play', () => {
      if (this.listeners.playState) {
        this.listeners.playState(true);
      }
    });

    this.audio.addEventListener('pause', () => {
      if (this.listeners.playState) {
        this.listeners.playState(false);
      }
    });

    this.audio.addEventListener('error', () => {
      const err = this.audio.error;
      const msg = err ? `Error code ${err.code}: ${err.message}` : 'Failed to load audio source';
      console.warn('HTMLAudio error:', msg);
      if (this.listeners.error) {
        this.listeners.error(msg);
      }
    });
  }

  public async setSource(url: string, autoPlay = true) {
    // Only set crossOrigin for remote HTTP(S) resources to avoid CORS failures on local protocols/blobs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      this.audio.crossOrigin = 'anonymous';
    } else {
      this.audio.removeAttribute('crossorigin');
    }

    this.initContext();
    this.audio.src = url;
    this.audio.load();

    if (autoPlay) {
      try {
        await this.play();
      } catch (err) {
        console.warn('Auto play was prevented by browser/system policy:', err);
      }
    }
  }

  public async play(): Promise<void> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.audio.play();
  }

  public pause(): void {
    this.audio.pause();
  }

  public seek(seconds: number): void {
    if (Number.isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(level: number): void {
    // level: 0.0 to 1.5 (up to 150% volume booster)
    const clamped = Math.max(0, Math.min(1.5, level));
    if (clamped <= 1.0) {
      this.audio.volume = clamped;
      if (this.preampGain && this.ctx) {
        this.preampGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      }
    } else {
      this.audio.volume = 1.0;
      if (this.preampGain && this.ctx) {
        this.preampGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
      }
    }
  }

  public setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.25, Math.min(2.5, rate));
  }

  public setEqualizerBand(index: number, gainDb: number): void {
    this.initContext();
    if (this.eqFilters[index] && this.ctx) {
      this.eqFilters[index].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public setAllEqualizerBands(gains: number[]): void {
    this.initContext();
    if (!this.ctx) return;
    gains.forEach((gainDb, index) => {
      if (this.eqFilters[index]) {
        this.eqFilters[index].gain.setValueAtTime(gainDb, this.ctx!.currentTime);
      }
    });
  }

  public toggleSpatialAudio(enabled: boolean): void {
    this.initContext();
    this.isSpatialEnabled = enabled;
    if (this.spatialPanner && this.ctx) {
      // Subtle width expansion simulation
      this.spatialPanner.pan.setValueAtTime(enabled ? 0.08 : 0, this.ctx.currentTime);
    }
  }

  public setABRepeat(a: number | null, b: number | null, active: boolean): void {
    this.abRepeat = { a, b, active };
    if (active && a !== null && this.audio.currentTime < a) {
      this.audio.currentTime = a;
    }
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyser) {
      (this.analyser as unknown as { getByteTimeDomainData: (arr: Uint8Array) => void }).getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  public onTimeUpdate(cb: (currentTime: number, duration: number) => void) {
    this.listeners.timeUpdate = cb;
  }

  public onEnded(cb: () => void) {
    this.listeners.ended = cb;
  }

  public onPlayState(cb: (isPlaying: boolean) => void) {
    this.listeners.playState = cb;
  }

  public onError(cb: (err: string) => void) {
    this.listeners.error = cb;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime;
  }

  public getDuration(): number {
    return this.audio.duration || 0;
  }

  public isPaused(): boolean {
    return this.audio.paused;
  }
}

export const audioEngine = new AudioEngine();
