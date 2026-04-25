/**
 * Web Audio API-based ambient sound generator.
 * Creates calming soundscapes programmatically — no external audio files needed.
 *
 * Sound types:
 * - rain: Brown noise filtered to sound like gentle rainfall
 * - ocean: Layered oscillators mimicking ocean waves
 * - forest: Soft wind + chirp-like tones
 * - bowls: Singing bowl resonance with harmonics
 * - drone: Deep meditative drone (binaural-adjacent)
 */

let audioCtx = null;
let activeNodes = [];

function getContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function cleanup() {
  activeNodes.forEach((n) => {
    try {
      n.stop?.();
      n.disconnect?.();
    } catch {
      // already stopped
    }
  });
  activeNodes = [];
}

/* ──── Brown noise (rain-like) ──── */
function createRain(ctx, dest) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Low-pass filter to soften
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();

  activeNodes.push(source, filter, gain);
  return { source, gain };
}

/* ──── Ocean waves ──── */
function createOcean(ctx, dest) {
  // Low rumble oscillator
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 55;

  const gain1 = ctx.createGain();
  gain1.gain.value = 0.15;

  // Modulate volume to simulate wave crests
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // Very slow ~12s cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.12;

  lfo.connect(lfoGain);
  lfoGain.connect(gain1.gain);

  osc1.connect(gain1);
  gain1.connect(dest);

  // White noise layer for "shhh" of waves
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 500;
  bpf.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.08;

  // LFO for noise volume
  const lfo2 = ctx.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 0.06;
  const lfo2Gain = ctx.createGain();
  lfo2Gain.gain.value = 0.06;

  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(noiseGain.gain);

  noiseSource.connect(bpf);
  bpf.connect(noiseGain);
  noiseGain.connect(dest);

  osc1.start();
  lfo.start();
  noiseSource.start();
  lfo2.start();

  activeNodes.push(osc1, gain1, lfo, lfoGain, noiseSource, bpf, noiseGain, lfo2, lfo2Gain);
  return { gain: gain1 };
}

/* ──── Forest ambience (wind + bird-like tones) ──── */
function createForest(ctx, dest) {
  // Wind: filtered noise
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.04 * w) / 1.04;
    last = data[i];
    data[i] *= 2;
  }

  const windSource = ctx.createBufferSource();
  windSource.buffer = buffer;
  windSource.loop = true;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 600;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.18;

  windSource.connect(lpf);
  lpf.connect(windGain);
  windGain.connect(dest);
  windSource.start();

  activeNodes.push(windSource, lpf, windGain);

  // Bird-like chirps using scheduled oscillators
  function chirp() {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const baseFreq = 1200 + Math.random() * 1800;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.15);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(g);
    g.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // Schedule random chirps
  const chirpInterval = setInterval(() => {
    if (audioCtx?.state !== 'running') return;
    if (Math.random() < 0.4) chirp();
  }, 2000 + Math.random() * 3000);

  // Store interval for cleanup
  const originalCleanup = cleanup;
  const wrappedCleanup = () => {
    clearInterval(chirpInterval);
  };
  activeNodes.push({ stop: wrappedCleanup, disconnect: () => {} });

  return { gain: windGain };
}

/* ──── Singing bowls ──── */
function createBowls(ctx, dest) {
  const fundamentals = [174, 285, 396]; // Solfeggio-inspired frequencies

  fundamentals.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Slow amplitude modulation for shimmer
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15 + idx * 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);

    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.06;
    lfoGain.connect(mainGain.gain);

    osc.connect(mainGain);
    mainGain.connect(dest);

    osc.start();
    lfo.start();

    activeNodes.push(osc, lfo, lfoGain, mainGain);
  });

  // Add gentle reverb-like effect with delayed feedback
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 528;
  const g = ctx.createGain();
  g.gain.value = 0.03;
  osc.connect(g);
  g.connect(dest);
  osc.start();
  activeNodes.push(osc, g);

  return { gain: g };
}

/* ──── Deep drone ──── */
function createDrone(ctx, dest) {
  const frequencies = [60, 120, 90];

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    // Super-slow tremolo
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.03 + Math.random() * 0.03;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    lfo.start();

    activeNodes.push(osc, gain, lfo, lfoGain);
  });

  return {};
}

/* ──── Public API ──── */
const GENERATORS = {
  rain: createRain,
  ocean: createOcean,
  forest: createForest,
  bowls: createBowls,
  drone: createDrone,
};

export function startSound(type, volume = 0.5) {
  stopSound();
  const ctx = getContext();

  // Master gain for volume control
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  activeNodes.push(master);

  if (GENERATORS[type]) {
    GENERATORS[type](ctx, master);
  }

  return master;
}

export function setVolume(gainNode, value) {
  if (gainNode?.gain) {
    gainNode.gain.setTargetAtTime(value, audioCtx.currentTime, 0.1);
  }
}

export function stopSound() {
  cleanup();
  // Don't close the context, just clean up nodes
}

export function getSoundTypes() {
  return [
    { id: 'rain', label: 'Gentle Rain', emoji: '🌧️', color: 'from-slate-blue-300 to-slate-blue-500' },
    { id: 'ocean', label: 'Ocean Waves', emoji: '🌊', color: 'from-slate-blue-200 to-sage-400' },
    { id: 'forest', label: 'Forest Breeze', emoji: '🌿', color: 'from-sage-300 to-sage-500' },
    { id: 'bowls', label: 'Singing Bowls', emoji: '🔔', color: 'from-cream-300 to-sage-300' },
    { id: 'drone', label: 'Deep Drone', emoji: '🕉️', color: 'from-sage-400 to-sage-700' },
  ];
}
