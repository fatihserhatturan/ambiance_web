/**
 * Procedural ambient sound engine — Web Audio API only, no files needed.
 * Generates looping filtered noise shaped for each background/asset.
 * Multi-layer synthesis with per-channel gain control, crossfade, and VU metering.
 */

// ─── Noise buffer generators ───────────────────────────────────────────────

function createNoiseBuffer(ctx, type = 'brown') {
  const len = ctx.sampleRate * 8 // 8-second loop for smoother cycling
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  } else if (type === 'brown') {
    let last = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      d[i] = (last + 0.02 * w) / 1.02
      last = d[i]
      d[i] *= 3.5
    }
  } else if (type === 'pink') {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759
      b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856
      b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980
      d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11
      b6 = w * 0.115926
    }
  } else if (type === 'velvet') {
    // Sparse impulse noise — approximates grain/crackle textures
    for (let i = 0; i < len; i++) {
      d[i] = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.8 : 0
    }
  }
  return buf
}

// ─── Layer configs per sound ID ────────────────────────────────────────────
// Each entry: { noiseType, filterType, filterFreq, filterQ, gain, lfo? }
// lfo: { rate (Hz), depth (0-1), secondaryRate?, secondaryDepth? }

const CONFIGS = {

  // ── Backgrounds ────────────────────────────────────────────────────────

  // Orman gecesi: böcek sesleri, yaprak hışırtısı, uzak uğultu
  'forest-night': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.6, gain:0.18, lfo:{ rate:0.04, depth:0.30 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:160,  filterQ:1.4, gain:0.09, lfo:{ rate:0.08, depth:0.55 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:3800, filterQ:6.0, gain:0.04, lfo:{ rate:0.85, depth:0.90 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:5200, filterQ:8.0, gain:0.025,lfo:{ rate:1.20, depth:0.95 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:80,   filterQ:0.4, gain:0.06, lfo:{ rate:0.02, depth:0.20 } },
  ],

  // Kış fırtınası: uluyan rüzgar, tipi, derin gürültü
  'winter-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:680,  filterQ:0.5, gain:0.22, lfo:{ rate:0.12, depth:0.65 } },
    { noiseType:'white', filterType:'highpass', filterFreq:1800, filterQ:0.3, gain:0.06, lfo:{ rate:0.22, depth:0.45 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.7, gain:0.12, lfo:{ rate:0.05, depth:0.35 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1400, filterQ:1.2, gain:0.08, lfo:{ rate:0.30, depth:0.55 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:3500, filterQ:0.8, gain:0.03, lfo:{ rate:0.45, depth:0.60 } },
  ],

  // Yağmurlu şehir: sürekli yağmur, şehir uğultusu, su birikintisi
  'rain-city': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:2200, filterQ:0.4, gain:0.15, lfo:{ rate:0.18, depth:0.12 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:140,  filterQ:0.9, gain:0.10, lfo:{ rate:0.06, depth:0.28 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:750,  filterQ:1.5, gain:0.07, lfo:{ rate:0.14, depth:0.22 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:300,  filterQ:0.8, gain:0.06, lfo:{ rate:0.09, depth:0.32 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:60,   filterQ:2.0, gain:0.04, lfo:{ rate:0.03, depth:0.40 } },
  ],

  // Sonbahar: yaprak hışırtısı, esinti, dallar
  'autumn-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:480,  filterQ:0.7, gain:0.17, lfo:{ rate:0.07, depth:0.48 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:230,  filterQ:0.5, gain:0.10, lfo:{ rate:0.03, depth:0.32 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2100, filterQ:2.5, gain:0.06, lfo:{ rate:0.16, depth:0.60 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1400, filterQ:1.8, gain:0.05, lfo:{ rate:0.13, depth:0.40 } },
    { noiseType:'pink',  filterType:'highpass', filterFreq:3000, filterQ:0.6, gain:0.025,lfo:{ rate:0.24, depth:0.50 } },
  ],

  // Okyanus kıyısı: dalgalar, köpük, derin deniz uğultusu
  'ocean-coast': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.5, gain:0.22, lfo:{ rate:0.06, depth:0.70 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:550,  filterQ:0.6, gain:0.16, lfo:{ rate:0.08, depth:0.65 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:2800, filterQ:0.7, gain:0.08, lfo:{ rate:0.12, depth:0.55 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:75,   filterQ:0.4, gain:0.14, lfo:{ rate:0.03, depth:0.45 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1200, filterQ:1.0, gain:0.06, lfo:{ rate:0.10, depth:0.50 } },
  ],

  // Gök gürültülü fırtına: yoğun yağmur, gürültü, şimşek
  'thunderstorm': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:3200, filterQ:0.4, gain:0.18, lfo:{ rate:0.28, depth:0.18 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:70,   filterQ:1.5, gain:0.20, lfo:{ rate:0.04, depth:0.75 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:110,  filterQ:1.2, gain:0.14, lfo:{ rate:0.06, depth:0.60 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1000, filterQ:0.9, gain:0.08, lfo:{ rate:0.20, depth:0.40 } },
    { noiseType:'white', filterType:'highpass', filterFreq:4000, filterQ:0.5, gain:0.04, lfo:{ rate:0.50, depth:0.30 } },
  ],

  // Kafe: fısıltı, kahve makinesi, bardak
  'coffee-shop': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:380,  filterQ:0.6, gain:0.14, lfo:{ rate:0.04, depth:0.28 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.7, gain:0.12, lfo:{ rate:0.02, depth:0.18 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1800, filterQ:2.0, gain:0.05, lfo:{ rate:0.15, depth:0.55 } },
    { noiseType:'pink',  filterType:'highpass', filterFreq:1200, filterQ:0.8, gain:0.04, lfo:{ rate:0.08, depth:0.35 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:80,   filterQ:1.5, gain:0.06, lfo:{ rate:0.01, depth:0.15 } },
  ],

  // Dağ zirvesi: yüksek irtifada rüzgar, ince hava
  'mountain-peak': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1100, filterQ:0.5, gain:0.20, lfo:{ rate:0.18, depth:0.65 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2800, filterQ:0.3, gain:0.07, lfo:{ rate:0.35, depth:0.55 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:140,  filterQ:0.6, gain:0.10, lfo:{ rate:0.04, depth:0.30 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:600,  filterQ:1.2, gain:0.08, lfo:{ rate:0.25, depth:0.70 } },
  ],

  // Japon bahçesi: rüzgar, bambu, huzur
  'japanese-garden': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.5, gain:0.12, lfo:{ rate:0.02, depth:0.18 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:750,  filterQ:0.8, gain:0.10, lfo:{ rate:0.05, depth:0.40 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2400, filterQ:3.5, gain:0.05, lfo:{ rate:0.07, depth:0.65 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:3800, filterQ:4.0, gain:0.03, lfo:{ rate:0.10, depth:0.70 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:100,  filterQ:0.4, gain:0.08, lfo:{ rate:0.015,depth:0.22 } },
  ],

  // Derin orman: antik, puslu, yoğun taçortüsü
  'deep-forest': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:350,  filterQ:0.6, gain:0.16, lfo:{ rate:0.03, depth:0.28 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:650,  filterQ:0.9, gain:0.12, lfo:{ rate:0.06, depth:0.45 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:130,  filterQ:1.2, gain:0.08, lfo:{ rate:0.04, depth:0.35 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1700, filterQ:2.0, gain:0.05, lfo:{ rate:0.14, depth:0.55 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:60,   filterQ:0.5, gain:0.07, lfo:{ rate:0.02, depth:0.25 } },
  ],

  // ── Asset Sounds ──────────────────────────────────────────────────────

  // Şömine: odun çatırtısı, alev, korlu kor
  'fireplace-crackle': [
    { noiseType:'brown',  filterType:'bandpass', filterFreq:200,  filterQ:2.8, gain:0.15, lfo:{ rate:0.30, depth:0.75 } },
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:95,   filterQ:1.0, gain:0.09, lfo:{ rate:0.14, depth:0.42 } },
    { noiseType:'velvet', filterType:'bandpass', filterFreq:480,  filterQ:3.5, gain:0.06, lfo:{ rate:0.55, depth:0.85 } },
    { noiseType:'pink',   filterType:'bandpass', filterFreq:1100, filterQ:2.0, gain:0.04, lfo:{ rate:0.42, depth:0.65 } },
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:50,   filterQ:0.8, gain:0.05, lfo:{ rate:0.08, depth:0.30 } },
  ],

  // Pencere yağmuru: damlalar, cam titreşimi
  'rain-window': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:1300, filterQ:0.6, gain:0.12, lfo:{ rate:0.22, depth:0.18 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:580,  filterQ:1.8, gain:0.07, lfo:{ rate:0.18, depth:0.28 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2400, filterQ:0.5, gain:0.04, lfo:{ rate:0.32, depth:0.15 } },
  ],

  // Gök gürültüsü: düşük yuvarlanma, çarpma
  'thunder-rumble': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:55,   filterQ:2.0, gain:0.22, lfo:{ rate:0.03, depth:0.82 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:95,   filterQ:1.5, gain:0.16, lfo:{ rate:0.05, depth:0.68 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:170,  filterQ:1.0, gain:0.08, lfo:{ rate:0.08, depth:0.50 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:350,  filterQ:0.7, gain:0.04, lfo:{ rate:0.12, depth:0.35 } },
  ],

  // Dere: akan su, çağlayan, pınarıltı
  'stream-water': [
    { noiseType:'white', filterType:'bandpass', filterFreq:780,  filterQ:1.2, gain:0.14, lfo:{ rate:0.28, depth:0.42 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1400, filterQ:1.5, gain:0.10, lfo:{ rate:0.38, depth:0.52 } },
    { noiseType:'pink',  filterType:'lowpass',  filterFreq:480,  filterQ:0.8, gain:0.08, lfo:{ rate:0.16, depth:0.35 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2400, filterQ:0.6, gain:0.05, lfo:{ rate:0.45, depth:0.38 } },
  ],

  // Rüzgar çanları: rezonans, kristal tınılar
  'wind-chimes': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1900, filterQ:5.0, gain:0.09, lfo:{ rate:0.09, depth:0.80 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:3600, filterQ:6.0, gain:0.06, lfo:{ rate:0.06, depth:0.75 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1100, filterQ:4.0, gain:0.05, lfo:{ rate:0.12, depth:0.70 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:300,  filterQ:0.5, gain:0.04, lfo:{ rate:0.03, depth:0.22 } },
  ],

  // Orman kuşları: cıvıltı, şarkı, arka plan
  'forest-birds': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:3800, filterQ:7.0, gain:0.07, lfo:{ rate:1.60, depth:0.88 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2400, filterQ:5.0, gain:0.06, lfo:{ rate:0.90, depth:0.82 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1600, filterQ:3.5, gain:0.05, lfo:{ rate:0.55, depth:0.70 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:380,  filterQ:0.5, gain:0.04, lfo:{ rate:0.04, depth:0.18 } },
  ],

  // Elektrik vantilatör: sabit humming
  'desk-fan': [
    { noiseType:'white', filterType:'bandpass', filterFreq:380,  filterQ:2.5, gain:0.10, lfo:{ rate:0.02, depth:0.08 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:760,  filterQ:2.0, gain:0.06, lfo:{ rate:0.03, depth:0.06 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:200,  filterQ:0.6, gain:0.08, lfo:{ rate:0.01, depth:0.12 } },
  ],

  // Duvar saati: tik-tak ritim
  'clock-ticking': [
    { noiseType:'brown', filterType:'bandpass', filterFreq:2800, filterQ:8.0, gain:0.12, lfo:{ rate:2.00, depth:0.96 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1600, filterQ:6.0, gain:0.07, lfo:{ rate:2.00, depth:0.94 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.5, gain:0.03, lfo:{ rate:0.04, depth:0.15 } },
  ],
}

// ─── Asset sound ID set (not treated as ambient backgrounds) ───────────────
const ASSET_SOUND_IDS = new Set([
  'fireplace-crackle',
  'rain-window',
  'thunder-rumble',
  'stream-water',
  'wind-chimes',
  'forest-birds',
  'desk-fan',
  'clock-ticking',
])

// ─── Crossfade duration (seconds) ─────────────────────────────────────────
const CROSSFADE_DURATION = 2.0

// ─── Engine ────────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.masterAnalyser = null
    this.channelGains = new Map()    // soundId → GainNode (per-channel volume)
    this.channelAnalysers = new Map()// soundId → AnalyserNode (VU metering tap)
    this.layers = new Map()          // soundId → [{ nodes, gainNode }]
    this._volume = 0.6
    this._muted = false
    this._channelVolumes = new Map() // soundId → 0-1
  }

  // Call once on first user gesture
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = this._muted ? 0 : this._volume

    // Master analyser for overall VU metering
    this.masterAnalyser = this.ctx.createAnalyser()
    this.masterAnalyser.fftSize = 256
    this.masterGain.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.ctx.destination)
  }

  // Get or create a channel gain node with an analysis tap
  _getOrCreateChannel(soundId, initialGain = null) {
    if (this.channelGains.has(soundId)) return this.channelGains.get(soundId)

    const channelGain = this.ctx.createGain()
    const vol = initialGain !== null ? initialGain : (this._channelVolumes.get(soundId) ?? 1.0)
    channelGain.gain.value = vol
    channelGain.connect(this.masterGain)

    // Analysis tap — doesn't need output connection
    const analyser = this.ctx.createAnalyser()
    analyser.fftSize = 256
    channelGain.connect(analyser)

    this.channelGains.set(soundId, channelGain)
    this.channelAnalysers.set(soundId, analyser)
    return channelGain
  }

  // Build one noise layer, connecting into channelGain
  _buildLayer(cfg, channelGain) {
    const ctx = this.ctx
    const gainNode = ctx.createGain()
    gainNode.gain.value = cfg.gain
    gainNode.connect(channelGain)

    const buf = createNoiseBuffer(ctx, cfg.noiseType)
    const source = ctx.createBufferSource()
    source.buffer = buf
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = cfg.filterType
    filter.frequency.value = cfg.filterFreq
    filter.Q.value = cfg.filterQ

    source.connect(filter)
    filter.connect(gainNode)
    source.start(0, Math.random() * 8) // random phase for variety

    const nodes = [source, filter]

    if (cfg.lfo) {
      const lfoOsc = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfoOsc.type = 'sine'
      lfoOsc.frequency.value = cfg.lfo.rate
      lfoGain.gain.value = cfg.gain * cfg.lfo.depth
      lfoOsc.connect(lfoGain)
      lfoGain.connect(gainNode.gain)
      lfoOsc.start()
      nodes.push(lfoOsc, lfoGain)

      if (cfg.lfo.secondaryRate) {
        const lfo2 = ctx.createOscillator()
        const lfoGain2 = ctx.createGain()
        lfo2.type = 'triangle'
        lfo2.frequency.value = cfg.lfo.secondaryRate
        lfoGain2.gain.value = cfg.gain * (cfg.lfo.secondaryDepth ?? 0.2)
        lfo2.connect(lfoGain2)
        lfoGain2.connect(gainNode.gain)
        lfo2.start()
        nodes.push(lfo2, lfoGain2)
      }
    }

    return { nodes, gainNode }
  }

  _play(soundId, initialGain = null) {
    if (!this.ctx || this.layers.has(soundId)) return
    const cfgList = CONFIGS[soundId]
    if (!cfgList) return

    const channelGain = this._getOrCreateChannel(soundId, initialGain)
    const layers = cfgList.map((cfg) => this._buildLayer(cfg, channelGain))
    this.layers.set(soundId, layers)
  }

  _stop(soundId) {
    const layers = this.layers.get(soundId)
    if (!layers) return
    layers.forEach(({ nodes, gainNode }) => {
      nodes.forEach(n => { try { n.stop?.(); n.disconnect() } catch (_) {} })
      try { gainNode.disconnect() } catch (_) {}
    })
    this.layers.delete(soundId)

    const channelGain = this.channelGains.get(soundId)
    if (channelGain) {
      try { channelGain.disconnect() } catch (_) {}
      this.channelGains.delete(soundId)
    }
    this.channelAnalysers.delete(soundId)
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  // Play background with crossfade from previous
  playAmbient(bgId) {
    this.init()
    const now = this.ctx.currentTime

    // Currently playing backgrounds (exclude assets and target)
    const currentBgIds = [...this.layers.keys()].filter(
      id => !ASSET_SOUND_IDS.has(id) && id !== bgId
    )

    // Start new background at silence, then fade in
    this._play(bgId, 0)
    const newGain = this.channelGains.get(bgId)
    if (newGain) {
      const targetVol = this._channelVolumes.get(bgId) ?? 1.0
      newGain.gain.cancelScheduledValues(now)
      newGain.gain.setValueAtTime(0, now)
      newGain.gain.linearRampToValueAtTime(targetVol, now + CROSSFADE_DURATION)
    }

    // Fade out old backgrounds then stop
    currentBgIds.forEach(id => {
      const oldGain = this.channelGains.get(id)
      if (oldGain) {
        oldGain.gain.cancelScheduledValues(now)
        oldGain.gain.setValueAtTime(oldGain.gain.value, now)
        oldGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_DURATION)
        setTimeout(() => this._stop(id), (CROSSFADE_DURATION + 0.2) * 1000)
      } else {
        this._stop(id)
      }
    })
  }

  playAssetSound(soundId) {
    this.init()
    this._play(soundId)
  }

  stopAssetSound(soundId) {
    this._stop(soundId)
  }

  setVolume(vol) {
    this._volume = vol
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.15)
    }
  }

  setMute(muted) {
    this._muted = muted
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : this._volume,
        this.ctx.currentTime,
        0.15
      )
    }
  }

  // Set per-channel volume (0-1) — affects only that sound's gain node
  setChannelVolume(soundId, vol) {
    this._channelVolumes.set(soundId, vol)
    const channelGain = this.channelGains.get(soundId)
    if (channelGain && this.ctx) {
      channelGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08)
    }
  }

  // RMS level 0-1 for a specific channel (for VU metering)
  getChannelLevel(soundId) {
    const analyser = this.channelAnalysers.get(soundId)
    if (!analyser) return 0
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / data.length) * 10)
  }

  // RMS level 0-1 for master output
  getMasterLevel() {
    if (!this.masterAnalyser) return 0
    const data = new Uint8Array(this.masterAnalyser.frequencyBinCount)
    this.masterAnalyser.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / data.length) * 10)
  }

  get activeSounds() {
    return [...this.layers.keys()]
  }
}

// Singleton
export const audioEngine = new AudioEngine()
