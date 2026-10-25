/**
 * High-fidelity Web Audio Procedural Synthesizer
 * Generates rich, authentic audio tracks with drums, basslines, chord pads, and leads
 * Encoded to real WAV Blobs so the HTML5 Audio element and Web Audio API can play,
 * seek, equalize, and visualize seamlessly.
 */

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const numSamples = buffer.length * numChannels;
  const dataSize = numSamples * (bitDepth / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write audio samples
  let offset = 44;
  const channelData = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i];
      // Clamping
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

export async function generateSynthesizedTrack(
  genre: 'synthwave' | 'lofi' | 'ambient' | 'jazz' | 'techno',
  durationSec: number = 45
): Promise<string> {
  const sampleRate = 44100;
  const length = sampleRate * durationSec;
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

  const now = 0;
  const bpm = genre === 'synthwave' ? 116 : genre === 'lofi' ? 84 : genre === 'techno' ? 128 : genre === 'jazz' ? 95 : 70;
  const beatTime = 60 / bpm;
  const measureTime = beatTime * 4;
  const totalMeasures = Math.ceil(durationSec / measureTime);

  // Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.75, 0);
  masterGain.gain.setValueAtTime(0.75, durationSec - 3);
  masterGain.gain.linearRampToValueAtTime(0.01, durationSec);
  masterGain.connect(offlineCtx.destination);

  // Helper note frequencies
  const noteFreqs: Record<string, number> = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0
  };

  // Drum synthesis helper
  function playKick(time: number) {
    if (time >= durationSec - 1) return;
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  function playSnare(time: number) {
    if (time >= durationSec - 1) return;
    // Tone
    const osc = offlineCtx.createOscillator();
    const oscGain = offlineCtx.createGain();
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.1);
    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.15);

    // Noise buffer
    const bufferSize = sampleRate * 0.2;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = offlineCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const noiseGain = offlineCtx.createGain();
    noiseGain.gain.setValueAtTime(0.6, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    whiteNoise.start(time);
    whiteNoise.stop(time + 0.2);
  }

  function playHiHat(time: number, open: boolean = false) {
    if (time >= durationSec - 0.5) return;
    const bufferSize = sampleRate * (open ? 0.3 : 0.05);
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = offlineCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;
    const gain = offlineCtx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.25 : 0.04));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(time);
    noise.stop(time + (open ? 0.28 : 0.05));
  }

  function playSynthChord(notes: number[], time: number, dur: number, type: OscillatorType = 'sawtooth', brightness: number = 1800) {
    if (time >= durationSec) return;
    notes.forEach((freq) => {
      const osc = offlineCtx.createOscillator();
      const filter = offlineCtx.createBiquadFilter();
      const gain = offlineCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(brightness, time);
      filter.frequency.exponentialRampToValueAtTime(brightness * 0.6, time + dur);
      gain.gain.setValueAtTime(0.01, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + dur + 0.1);
    });
  }

  function playBassNote(freq: number, time: number, dur: number) {
    if (time >= durationSec) return;
    const osc = offlineCtx.createOscillator();
    const sub = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();
    osc.type = 'sawtooth';
    sub.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    sub.frequency.setValueAtTime(freq / 2, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + dur);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    sub.start(time);
    osc.stop(time + dur);
    sub.stop(time + dur);
  }

  // Compose music according to genre
  for (let m = 0; m < totalMeasures; m++) {
    const mTime = now + m * measureTime;

    if (genre === 'synthwave') {
      // 4-on-the-floor kick & 2/4 snare
      for (let b = 0; b < 4; b++) {
        playKick(mTime + b * beatTime);
        playHiHat(mTime + (b + 0.5) * beatTime);
        if (b === 1 || b === 3) {
          playSnare(mTime + b * beatTime);
        }
      }
      // Synthwave Chords: Am -> F -> C -> G
      const chords = [
        [noteFreqs.A3, noteFreqs.C4, noteFreqs.E4],
        [noteFreqs.F3, noteFreqs.A3, noteFreqs.C4],
        [noteFreqs.C3, noteFreqs.E3, noteFreqs.G3],
        [noteFreqs.G3, noteFreqs.B3, noteFreqs.D4]
      ];
      const bassNotes = [noteFreqs.A2, noteFreqs.F2, noteFreqs.C2, noteFreqs.G2];
      const chord = chords[m % 4];
      const bass = bassNotes[m % 4];

      playSynthChord(chord, mTime, measureTime * 0.9, 'sawtooth', 2200);

      // Driving 8th note bassline
      for (let step = 0; step < 8; step++) {
        playBassNote(bass, mTime + step * (beatTime / 2), beatTime / 2 * 0.85);
      }
    } else if (genre === 'lofi') {
      // Mellow kick, soft snare, swing hats
      playKick(mTime);
      playKick(mTime + beatTime * 2.25);
      playSnare(mTime + beatTime * 1);
      playSnare(mTime + beatTime * 3);
      for (let b = 0; b < 4; b++) {
        playHiHat(mTime + b * beatTime);
        playHiHat(mTime + (b + 0.6) * beatTime);
      }
      // Lush 7th chords: Dm7 -> G7 -> Cmaj7 -> Am7
      const lofiChords = [
        [noteFreqs.D3, noteFreqs.F3, noteFreqs.A3, noteFreqs.C4],
        [noteFreqs.G2, noteFreqs.B2, noteFreqs.D3, noteFreqs.F3],
        [noteFreqs.C3, noteFreqs.E3, noteFreqs.G3, noteFreqs.B3],
        [noteFreqs.A2, noteFreqs.C3, noteFreqs.E3, noteFreqs.G3]
      ];
      playSynthChord(lofiChords[m % 4], mTime, measureTime * 0.95, 'sine', 1200);
      playBassNote(lofiChords[m % 4][0] / 2, mTime, beatTime * 1.8);
      playBassNote(lofiChords[m % 4][0] / 2, mTime + beatTime * 2, beatTime * 1.8);
    } else if (genre === 'ambient') {
      // Ethereal swells, slow atmospheric pad
      const ambientChords = [
        [noteFreqs.E3, noteFreqs.B3, noteFreqs.E4, noteFreqs.G4],
        [noteFreqs.C3, noteFreqs.G3, noteFreqs.C4, noteFreqs.E4],
        [noteFreqs.D3, noteFreqs.A3, noteFreqs.D4, noteFreqs.F4],
        [noteFreqs.B2, noteFreqs.F3, noteFreqs.B3, noteFreqs.D4]
      ];
      playSynthChord(ambientChords[m % 4], mTime, measureTime * 0.98, 'triangle', 800);
      playBassNote(ambientChords[m % 4][0] / 2, mTime, measureTime * 0.8);
    } else if (genre === 'techno') {
      // Driving techno 4-on-the-floor with off-beat hats
      for (let b = 0; b < 4; b++) {
        playKick(mTime + b * beatTime);
        playHiHat(mTime + (b + 0.5) * beatTime, true);
      }
      playSnare(mTime + beatTime * 1);
      playSnare(mTime + beatTime * 3);
      const rootNotes = [noteFreqs.F2, noteFreqs.F2, noteFreqs.D2, noteFreqs.D2];
      const r = rootNotes[m % 4];
      for (let step = 0; step < 16; step++) {
        if (step % 2 === 1) {
          playBassNote(r, mTime + step * (beatTime / 4), beatTime / 4 * 0.7);
        }
      }
    } else {
      // Jazz chords: Fmaj9 -> Em7 -> Dm9 -> Cmaj7
      const jazzChords = [
        [noteFreqs.F3, noteFreqs.A3, noteFreqs.C4, noteFreqs.E4, noteFreqs.G4],
        [noteFreqs.E3, noteFreqs.G3, noteFreqs.B3, noteFreqs.D4],
        [noteFreqs.D3, noteFreqs.F3, noteFreqs.A3, noteFreqs.C4, noteFreqs.E4],
        [noteFreqs.C3, noteFreqs.E3, noteFreqs.G3, noteFreqs.B3]
      ];
      playSynthChord(jazzChords[m % 4], mTime, measureTime * 0.9, 'triangle', 1600);
      playKick(mTime);
      playHiHat(mTime + beatTime * 0.5);
      playSnare(mTime + beatTime * 2);
      playHiHat(mTime + beatTime * 2.5);
      playBassNote(jazzChords[m % 4][0] / 2, mTime, beatTime * 1.5);
      playBassNote(jazzChords[m % 4][2] / 2, mTime + beatTime * 2, beatTime * 1.5);
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  return URL.createObjectURL(wavBlob);
}
