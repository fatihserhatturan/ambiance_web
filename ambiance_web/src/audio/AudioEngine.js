/**
 * Procedural ambient sound engine v2 — Web Audio API only, no files needed.
 *
 * Enhancements over v1:
 *  - Synthetic convolution reverb (room IR = exponentially-decaying noise)
 *  - Web Audio API lookahead scheduling: precise clock ticks, wind chimes,
 *    FM bird calls, and periodic thunder macro-events
 *  - FM synthesis for realistic bird song (carrier + modulator oscillators)
 *  - Musical wind chime tones at real pentatonic pitches with decay envelopes
 *  - Harmonically-tuned filter parameters for all noise layers
 *  - Acoustic-quality velvet crackle for fireplace
 */

// ─── Noise buffer generators ────────────────────────────────────────────────

function createNoiseBuffer(ctx, type = 'brown') {
  const len = ctx.sampleRate * 8 // 8-second loop
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
    // Sparse impulse noise — wood crackle / fire texture
    for (let i = 0; i < len; i++) {
      d[i] = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.9 : 0
    }
  }
  return buf
}

// ─── Synthetic reverb impulse response ──────────────────────────────────────
// Exponentially-decaying stereo noise convolved → room reverberation

function createReverbIR(ctx, duration = 2.0, decay = 4.0) {
  const len = Math.floor(ctx.sampleRate * duration)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return ir
}

// ─── Layer configs per sound ID ─────────────────────────────────────────────
// Each layer: { noiseType, filterType, filterFreq, filterQ, gain, lfo? }
// lfo: { rate (Hz), depth (0-1), secondaryRate?, secondaryDepth? }

const CONFIGS = {

  // ── Backgrounds ─────────────────────────────────────────────────────────

  // Orman gecesi: geniş böcek korosu, yaprak hışırtısı, uzak uğultu
  'forest-night': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:200,  filterQ:0.5,  gain:0.14, lfo:{ rate:0.03, depth:0.25 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:140,  filterQ:1.2,  gain:0.08, lfo:{ rate:0.06, depth:0.45 } },
    // Cırcır böcekleri — yüksek rezonant band, titreyen
    { noiseType:'pink',  filterType:'bandpass', filterFreq:4200, filterQ:12.0, gain:0.055, lfo:{ rate:1.20, depth:0.92 } },
    // İkinci cırcır böcek bandı (harmoni)
    { noiseType:'pink',  filterType:'bandpass', filterFreq:5800, filterQ:10.0, gain:0.035, lfo:{ rate:0.95, depth:0.88 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:850,  filterQ:1.5,  gain:0.06, lfo:{ rate:0.11, depth:0.50 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:60,   filterQ:0.4,  gain:0.05, lfo:{ rate:0.02, depth:0.15 } },
  ],

  // Kış fırtınası: uluyan rüzgar, yapı gıcırtısı, blizzard tisi
  'winter-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:520,  filterQ:0.4,  gain:0.20, lfo:{ rate:0.08, depth:0.60, secondaryRate:0.19, secondaryDepth:0.25 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1600, filterQ:1.8,  gain:0.07, lfo:{ rate:0.35, depth:0.75 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:160,  filterQ:0.6,  gain:0.14, lfo:{ rate:0.04, depth:0.38 } },
    { noiseType:'white', filterType:'highpass', filterFreq:3200, filterQ:0.3,  gain:0.03, lfo:{ rate:0.28, depth:0.40 } },
    // Yapı gıcırtısı rezonansı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:240,  filterQ:3.5,  gain:0.06, lfo:{ rate:0.14, depth:0.65 } },
  ],

  // Yağmurlu şehir: sürekli yağmur + trafik + su birikintisi
  'rain-city': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:2800, filterQ:0.4,  gain:0.14, lfo:{ rate:0.12, depth:0.08 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:4500, filterQ:0.8,  gain:0.05, lfo:{ rate:0.22, depth:0.12 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:120,  filterQ:0.8,  gain:0.12, lfo:{ rate:0.05, depth:0.22 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:280,  filterQ:0.7,  gain:0.07, lfo:{ rate:0.08, depth:0.28 } },
    // Su birikintisi çalkantısı
    { noiseType:'brown', filterType:'bandpass', filterFreq:65,   filterQ:2.5,  gain:0.05, lfo:{ rate:0.04, depth:0.45 } },
  ],

  // Sonbahar: kuru yaprak hışırtısı + esinti + dal çarpışmaları
  'autumn-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:560,  filterQ:0.8,  gain:0.16, lfo:{ rate:0.09, depth:0.55 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:200,  filterQ:0.5,  gain:0.10, lfo:{ rate:0.03, depth:0.28 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2400, filterQ:2.0,  gain:0.07, lfo:{ rate:0.18, depth:0.65 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1200, filterQ:1.5,  gain:0.05, lfo:{ rate:0.15, depth:0.45 } },
    { noiseType:'pink',  filterType:'highpass', filterFreq:3500, filterQ:0.5,  gain:0.02, lfo:{ rate:0.26, depth:0.55 } },
  ],

  // Okyanus kıyısı: derin dalga kabarması + köpük + çakıl
  'ocean-coast': [
    // Derin dalga swell — çok yavaş LFO (0.05 Hz = 20 saniyelik dalga)
    { noiseType:'brown', filterType:'lowpass',  filterFreq:160,  filterQ:0.5,  gain:0.22, lfo:{ rate:0.05, depth:0.72 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:480,  filterQ:0.6,  gain:0.16, lfo:{ rate:0.07, depth:0.68 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:3200, filterQ:0.6,  gain:0.07, lfo:{ rate:0.10, depth:0.55 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:55,   filterQ:0.4,  gain:0.16, lfo:{ rate:0.025, depth:0.48 } },
    // Sahil çakıl geri çekilmesi
    { noiseType:'white', filterType:'bandpass', filterFreq:1100, filterQ:1.2,  gain:0.08, lfo:{ rate:0.12, depth:0.62 } },
  ],

  // Gök gürültülü fırtına: yoğun yağmur + kalıcı bas gürültü (anlık olaylar scheduler'da)
  'thunderstorm': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:4000, filterQ:0.3,  gain:0.18, lfo:{ rate:0.18, depth:0.10 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:55,   filterQ:1.8,  gain:0.22, lfo:{ rate:0.035, depth:0.80 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:100,  filterQ:1.4,  gain:0.14, lfo:{ rate:0.05, depth:0.65 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:900,  filterQ:0.8,  gain:0.08, lfo:{ rate:0.16, depth:0.38 } },
    { noiseType:'white', filterType:'highpass', filterFreq:5000, filterQ:0.4,  gain:0.03, lfo:{ rate:0.60, depth:0.28 } },
  ],

  // Kafe: kalabalık fısıltısı + espresso makinesi + oda akustiği
  'coffee-shop': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:350,  filterQ:0.5,  gain:0.14, lfo:{ rate:0.03, depth:0.22 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:160,  filterQ:0.7,  gain:0.12, lfo:{ rate:0.015, depth:0.15 } },
    // Espresso makinesi tisi
    { noiseType:'white', filterType:'bandpass', filterFreq:2200, filterQ:1.8,  gain:0.05, lfo:{ rate:0.12, depth:0.50 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1600, filterQ:3.5,  gain:0.03, lfo:{ rate:0.08, depth:0.60 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:80,   filterQ:1.2,  gain:0.06, lfo:{ rate:0.01, depth:0.12 } },
  ],

  // Dağ zirvesi: yüksek irtifa rüzgarı + ince hava + taş rezonansı
  'mountain-peak': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1200, filterQ:0.4,  gain:0.22, lfo:{ rate:0.15, depth:0.70, secondaryRate:0.38, secondaryDepth:0.20 } },
    { noiseType:'white', filterType:'highpass', filterFreq:3500, filterQ:0.3,  gain:0.06, lfo:{ rate:0.28, depth:0.52 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:120,  filterQ:0.5,  gain:0.10, lfo:{ rate:0.035, depth:0.28 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:680,  filterQ:2.0,  gain:0.08, lfo:{ rate:0.22, depth:0.68 } },
  ],

  // Japon bahçesi: su, bambu, hafif esinti
  'japanese-garden': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:240,  filterQ:0.4,  gain:0.10, lfo:{ rate:0.02, depth:0.15 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:680,  filterQ:0.9,  gain:0.12, lfo:{ rate:0.06, depth:0.42 } },
    // Bambu hışırtısı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2600, filterQ:3.0,  gain:0.05, lfo:{ rate:0.09, depth:0.68 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:4200, filterQ:3.5,  gain:0.03, lfo:{ rate:0.12, depth:0.72 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:90,   filterQ:0.4,  gain:0.07, lfo:{ rate:0.01, depth:0.20 } },
  ],

  // Derin orman: kadim taçörtüsü + alt bas + pus
  'deep-forest': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:320,  filterQ:0.6,  gain:0.16, lfo:{ rate:0.025, depth:0.30 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:580,  filterQ:1.0,  gain:0.12, lfo:{ rate:0.05, depth:0.48 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:110,  filterQ:1.5,  gain:0.09, lfo:{ rate:0.04, depth:0.38 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1800, filterQ:2.5,  gain:0.05, lfo:{ rate:0.15, depth:0.58 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:50,   filterQ:0.5,  gain:0.08, lfo:{ rate:0.015, depth:0.22 } },
  ],

  // ── Asset Sounds ────────────────────────────────────────────────────────

  // Şömine: kor uğultusu + odun çatırtısı + alev hışırtısı
  'fireplace-crackle': [
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:90,   filterQ:0.9,  gain:0.12, lfo:{ rate:0.10, depth:0.35 } },
    { noiseType:'brown',  filterType:'bandpass', filterFreq:185,  filterQ:2.5,  gain:0.10, lfo:{ rate:0.20, depth:0.60 } },
    // Velvet darbe — çatırtı dokusu
    { noiseType:'velvet', filterType:'bandpass', filterFreq:420,  filterQ:4.0,  gain:0.08, lfo:{ rate:0.55, depth:0.90 } },
    // Alev konveksiyon tisi
    { noiseType:'pink',   filterType:'bandpass', filterFreq:1200, filterQ:1.5,  gain:0.05, lfo:{ rate:0.38, depth:0.55 } },
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:45,   filterQ:0.7,  gain:0.06, lfo:{ rate:0.06, depth:0.28 } },
  ],

  // Pencere yağmuru: cam çarpma + rezonans + akar
  'rain-window': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:1800, filterQ:0.5,  gain:0.12, lfo:{ rate:0.18, depth:0.12 } },
    // Cam rezonansı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:620,  filterQ:2.5,  gain:0.08, lfo:{ rate:0.15, depth:0.30 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2800, filterQ:0.4,  gain:0.04, lfo:{ rate:0.28, depth:0.18 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:280,  filterQ:1.8,  gain:0.05, lfo:{ rate:0.08, depth:0.40 } },
  ],

  // Gök gürültüsü (asset): derin bas yuvarlanma — anlık olaylar scheduler'da
  'thunder-rumble': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:50,   filterQ:2.2,  gain:0.24, lfo:{ rate:0.025, depth:0.85 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:90,   filterQ:1.8,  gain:0.18, lfo:{ rate:0.04, depth:0.72 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:165,  filterQ:1.2,  gain:0.09, lfo:{ rate:0.07, depth:0.55 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:340,  filterQ:0.8,  gain:0.04, lfo:{ rate:0.12, depth:0.38 } },
  ],

  // Dere: akan su + türbülans + taş gürültüsü
  'stream-water': [
    { noiseType:'white', filterType:'bandpass', filterFreq:820,  filterQ:1.0,  gain:0.14, lfo:{ rate:0.25, depth:0.45 } },
    { noiseType:'white', filterType:'bandpass', filterFreq:1600, filterQ:1.2,  gain:0.10, lfo:{ rate:0.35, depth:0.55 } },
    { noiseType:'pink',  filterType:'lowpass',  filterFreq:420,  filterQ:0.7,  gain:0.09, lfo:{ rate:0.14, depth:0.38 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2800, filterQ:0.5,  gain:0.05, lfo:{ rate:0.42, depth:0.42 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:180,  filterQ:1.5,  gain:0.06, lfo:{ rate:0.09, depth:0.32 } },
  ],

  // Rüzgar çanları: zemin rüzgar gürültüsü (tonal notlar scheduler'da)
  'wind-chimes': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.4,  gain:0.04, lfo:{ rate:0.03, depth:0.18 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2200, filterQ:4.0,  gain:0.03, lfo:{ rate:0.06, depth:0.55 } },
  ],

  // Orman kuşları: arka plan doğa zemin (kuş ötmeleri scheduler'da)
  'forest-birds': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1400, filterQ:1.5,  gain:0.04, lfo:{ rate:0.08, depth:0.45 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:320,  filterQ:0.5,  gain:0.03, lfo:{ rate:0.03, depth:0.20 } },
  ],

  // Elektrik vantilatör: motor hum harmonikleri + kanat türbülansı
  'desk-fan': [
    // Motor temel frekansı (50Hz harmonik — 120Hz)
    { noiseType:'white', filterType:'bandpass', filterFreq:120,  filterQ:8.0,  gain:0.08, lfo:{ rate:0.02, depth:0.06 } },
    // 2. harmonik (240Hz)
    { noiseType:'white', filterType:'bandpass', filterFreq:240,  filterQ:6.0,  gain:0.06, lfo:{ rate:0.02, depth:0.05 } },
    // Kanat çırpma türbülansı
    { noiseType:'white', filterType:'bandpass', filterFreq:380,  filterQ:3.0,  gain:0.05, lfo:{ rate:0.04, depth:0.08 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:680,  filterQ:1.0,  gain:0.07, lfo:{ rate:0.01, depth:0.10 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.6,  gain:0.06, lfo:{ rate:0.015, depth:0.10 } },
  ],

  // Duvar saati: çok hafif mekanik zemin (tik-tak scheduler'da)
  'clock-ticking': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:240,  filterQ:0.5,  gain:0.015, lfo:{ rate:0.02, depth:0.10 } },
  ],
}

// ─── Per-sound options: reverb send + scheduled event type ──────────────────
const SOUND_OPTIONS = {
  // Reverb: spatial depth for large/reverberant spaces
  'forest-night':      { reverb: { duration: 3.0, decay: 2.5, wet: 0.18 } },
  'ocean-coast':       { reverb: { duration: 2.5, decay: 2.0, wet: 0.18 } },
  'coffee-shop':       { reverb: { duration: 1.5, decay: 3.5, wet: 0.14 } },
  'deep-forest':       { reverb: { duration: 3.5, decay: 2.0, wet: 0.22 } },
  'fireplace-crackle': { reverb: { duration: 1.2, decay: 3.0, wet: 0.20 } },
  // Scheduled discrete events
  'thunderstorm':      { scheduler: 'thunder-bg' },
  'wind-chimes':       { scheduler: 'chimes' },
  'forest-birds':      { scheduler: 'birds' },
  'clock-ticking':     { scheduler: 'clock' },
  'thunder-rumble':    { scheduler: 'thunder-asset' },
}

// ─── Asset sound ID set ─────────────────────────────────────────────────────
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

const CROSSFADE_DURATION = 2.0

// ─── Engine ─────────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.masterAnalyser = null
    this.channelGains = new Map()     // soundId → GainNode
    this.channelAnalysers = new Map() // soundId → AnalyserNode (VU tap)
    this.layers = new Map()           // soundId → [{ nodes, gainNode }]
    this._volume = 0.6
    this._muted = false
    this._channelVolumes = new Map()  // soundId → 0-1
    this._schedulers = new Map()      // soundId → [cancelFn, ...]
    this._reverbNodes = new Map()     // soundId → { convolver, wetGain }
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

    this.masterAnalyser = this.ctx.createAnalyser()
    this.masterAnalyser.fftSize = 256
    this.masterGain.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.ctx.destination)
  }

  // Get or create a per-channel gain node + analyser tap
  _getOrCreateChannel(soundId, initialGain = null) {
    if (this.channelGains.has(soundId)) return this.channelGains.get(soundId)

    const channelGain = this.ctx.createGain()
    const vol = initialGain !== null ? initialGain : (this._channelVolumes.get(soundId) ?? 1.0)
    channelGain.gain.value = vol
    channelGain.connect(this.masterGain)

    const analyser = this.ctx.createAnalyser()
    analyser.fftSize = 256
    channelGain.connect(analyser)

    this.channelGains.set(soundId, channelGain)
    this.channelAnalysers.set(soundId, analyser)
    return channelGain
  }

  // Build one noise layer → channelGain
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
    source.start(0, Math.random() * 8)

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

  // ─── Reverb helpers ───────────────────────────────────────────────────────

  _setupReverb(soundId, channelGain, opts) {
    const { duration = 2.0, decay = 3.0, wet = 0.18 } = opts
    const convolver = this.ctx.createConvolver()
    convolver.buffer = createReverbIR(this.ctx, duration, decay)

    const wetGain = this.ctx.createGain()
    wetGain.gain.value = wet

    channelGain.connect(convolver)
    convolver.connect(wetGain)
    wetGain.connect(this.masterGain)

    this._reverbNodes.set(soundId, { convolver, wetGain })
  }

  _teardownReverb(soundId) {
    const rv = this._reverbNodes.get(soundId)
    if (!rv) return
    try { rv.convolver.disconnect(); rv.wetGain.disconnect() } catch { /* noop */ }
    this._reverbNodes.delete(soundId)
  }

  // ─── Scheduler helpers ────────────────────────────────────────────────────

  // Schedules fn() at random intervals [minMs, maxMs]. Cancellable per soundId.
  _scheduleLoop(soundId, fn, minMs, maxMs) {
    const cancelRef = { cancelled: false }
    if (!this._schedulers.has(soundId)) this._schedulers.set(soundId, [])
    this._schedulers.get(soundId).push(() => { cancelRef.cancelled = true })

    const loop = () => {
      if (cancelRef.cancelled || !this.layers.has(soundId) || !this.ctx) return
      try { fn() } catch { /* noop */ }
      const delay = minMs + Math.random() * (maxMs - minMs)
      setTimeout(loop, delay)
    }
    // Stagger initial fire so different sounds don't synchronize
    setTimeout(loop, Math.random() * minMs * 0.8)
  }

  _cancelSchedulers(soundId) {
    const cancels = this._schedulers.get(soundId)
    if (cancels) { cancels.forEach(fn => fn()); this._schedulers.delete(soundId) }
  }

  // ─── Clock tick scheduler ─────────────────────────────────────────────────
  // Uses AudioContext.currentTime lookahead for sample-accurate 1 Hz ticks.

  _startClockScheduler(soundId, channelGain) {
    const cancelRef = { cancelled: false }
    if (!this._schedulers.has(soundId)) this._schedulers.set(soundId, [])
    this._schedulers.get(soundId).push(() => { cancelRef.cancelled = true })

    // Pre-generate a short click buffer (reused for every tick — no GC pressure)
    const TICK_DUR = 0.016 // 16 ms
    const sr = this.ctx.sampleRate
    const tickBuf = this.ctx.createBuffer(1, Math.floor(sr * TICK_DUR), sr)
    const td = tickBuf.getChannelData(0)
    for (let i = 0; i < td.length; i++) {
      // Exponentially-decaying white noise — like a mechanical escapement click
      td[i] = (Math.random() * 2 - 1) * Math.exp(-i / (td.length * 0.18))
    }

    const LOOKAHEAD = 0.25   // schedule 250ms ahead
    const POLL_MS   = 60     // check every 60ms
    let nextTick = this.ctx.currentTime + 0.5 // first tick after 0.5s

    const schedule = () => {
      if (cancelRef.cancelled || !this.ctx) return

      while (nextTick < this.ctx.currentTime + LOOKAHEAD) {
        this._fireTick(channelGain, tickBuf, nextTick)
        nextTick += 1.0 // exactly 1-second intervals
      }
      setTimeout(schedule, POLL_MS)
    }
    schedule()
  }

  _fireTick(channelGain, tickBuf, when) {
    if (!this.ctx) return
    const src = this.ctx.createBufferSource()
    src.buffer = tickBuf

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 3000 + (Math.random() - 0.5) * 300
    filter.Q.value = 14

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.20, when)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(channelGain)
    src.start(when)
    src.stop(when + 0.06)

    src.onended = () => {
      try { src.disconnect(); filter.disconnect(); gain.disconnect() } catch { /* noop */ }
    }
  }

  // ─── Wind chime scheduler ─────────────────────────────────────────────────
  // Musical pentatonic pitches (G major pentatonic scale) with bell-like decay.

  _startChimeScheduler(soundId, channelGain) {
    // G major pentatonic: G4, A4, B4, D5, E5, G5, B5, D6
    const FREQS = [392.0, 440.0, 493.88, 587.33, 659.25, 784.0, 987.77, 1174.66]

    const trigger = () => {
      if (!this.ctx || !this.layers.has(soundId)) return
      const count = Math.floor(Math.random() * 3) + 1 // 1–3 notes per gust
      let t = this.ctx.currentTime + 0.05

      for (let i = 0; i < count; i++) {
        const freq = FREQS[Math.floor(Math.random() * FREQS.length)]
        const decay = 1.8 + Math.random() * 2.5
        this._fireChimeTone(channelGain, freq, t, decay)
        t += 0.10 + Math.random() * 0.20 // notes staggered 100–300ms apart
      }
    }

    this._scheduleLoop(soundId, trigger, 2000, 7000)
  }

  _fireChimeTone(channelGain, freq, when, decayTime) {
    if (!this.ctx) return
    // Fundamental sine
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = freq

    // Inharmonic partial (bell character): ~2.76× for tubular bell
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 2.756

    const gain1 = this.ctx.createGain()
    gain1.gain.setValueAtTime(0, when)
    gain1.gain.linearRampToValueAtTime(0.14, when + 0.004)
    gain1.gain.exponentialRampToValueAtTime(0.001, when + decayTime)

    const gain2 = this.ctx.createGain()
    gain2.gain.setValueAtTime(0, when)
    gain2.gain.linearRampToValueAtTime(0.05, when + 0.004)
    gain2.gain.exponentialRampToValueAtTime(0.001, when + decayTime * 0.55)

    osc1.connect(gain1); gain1.connect(channelGain)
    osc2.connect(gain2); gain2.connect(channelGain)

    osc1.start(when); osc2.start(when)
    osc1.stop(when + decayTime + 0.1)
    osc2.stop(when + decayTime * 0.6 + 0.1)

    const cleanup = () => {
      try { osc1.disconnect(); gain1.disconnect() } catch { /* noop */ }
      try { osc2.disconnect(); gain2.disconnect() } catch { /* noop */ }
    }
    osc1.onended = cleanup
  }

  // ─── Bird chirp scheduler ─────────────────────────────────────────────────
  // FM synthesis: carrier oscillator + modulator → realistic bird-like sweeps.

  _startBirdScheduler(soundId, channelGain) {
    const trigger = () => {
      if (!this.ctx || !this.layers.has(soundId)) return
      const syllables = Math.floor(Math.random() * 4) + 1 // 1–4 syllables
      let t = this.ctx.currentTime + Math.random() * 0.4

      for (let i = 0; i < syllables; i++) {
        const baseFreq = 1600 + Math.random() * 2400  // 1600–4000 Hz
        const dur = 0.06 + Math.random() * 0.22
        this._fireBirdSyllable(channelGain, baseFreq, t, dur)
        t += dur + 0.04 + Math.random() * 0.18
      }
    }

    // More frequent during "daytime" feel: 1.5–6 seconds between calls
    this._scheduleLoop(soundId, trigger, 1500, 6000)
  }

  _fireBirdSyllable(channelGain, baseFreq, when, duration) {
    if (!this.ctx) return
    // FM carrier
    const carrier = this.ctx.createOscillator()
    carrier.type = 'sine'
    carrier.frequency.value = baseFreq

    // FM modulator
    const modulator = this.ctx.createOscillator()
    modulator.type = 'sine'
    modulator.frequency.value = baseFreq * (0.25 + Math.random() * 0.55)

    const modDepth = this.ctx.createGain()
    modDepth.gain.value = baseFreq * (0.4 + Math.random() * 1.2)

    // Pitch sweep up or down (chirp character)
    const sweep = (Math.random() > 0.45 ? 1 : -1) * baseFreq * (0.15 + Math.random() * 0.35)
    carrier.frequency.setValueAtTime(baseFreq, when)
    carrier.frequency.linearRampToValueAtTime(baseFreq + sweep, when + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(0.11, when + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration)

    modulator.connect(modDepth)
    modDepth.connect(carrier.frequency)
    carrier.connect(gain)
    gain.connect(channelGain)

    modulator.start(when); carrier.start(when)
    modulator.stop(when + duration + 0.06)
    carrier.stop(when + duration + 0.06)

    carrier.onended = () => {
      try { carrier.disconnect(); modulator.disconnect(); modDepth.disconnect(); gain.disconnect() } catch { /* noop */ }
    }
  }

  // ─── Thunder macro-event scheduler ───────────────────────────────────────
  // Periodic bursts of low-pass brown noise with exponential decay — distant thunder.

  _startThunderScheduler(soundId, channelGain, isAsset = false) {
    const trigger = () => {
      if (!this.ctx || !this.layers.has(soundId)) return
      const now = this.ctx.currentTime
      const burstLen = 0.8 + Math.random() * 2.5

      const buf = createNoiseBuffer(this.ctx, 'brown')
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      src.loop = false

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 65 + Math.random() * 55
      filter.Q.value = 1.8

      // Louder for the standalone thunder-rumble asset
      const peakGain = isAsset ? (0.55 + Math.random() * 0.35) : (0.30 + Math.random() * 0.25)
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + burstLen)

      src.connect(filter); filter.connect(gain); gain.connect(channelGain)
      src.start(now)
      src.stop(now + burstLen + 0.15)

      src.onended = () => {
        try { src.disconnect(); filter.disconnect(); gain.disconnect() } catch { /* noop */ }
      }
    }

    // Background thunderstorm: every 10–30s / Asset thunder-rumble: every 5–15s
    const [minMs, maxMs] = isAsset ? [5000, 15000] : [10000, 30000]
    this._scheduleLoop(soundId, trigger, minMs, maxMs)
  }

  // ─── Core play / stop ─────────────────────────────────────────────────────

  _play(soundId, initialGain = null) {
    if (!this.ctx || this.layers.has(soundId)) return
    const cfgList = CONFIGS[soundId]
    if (!cfgList) return

    const channelGain = this._getOrCreateChannel(soundId, initialGain)
    const layers = cfgList.map((cfg) => this._buildLayer(cfg, channelGain))
    this.layers.set(soundId, layers)

    const opts = SOUND_OPTIONS[soundId]
    if (!opts) return

    if (opts.reverb) this._setupReverb(soundId, channelGain, opts.reverb)

    switch (opts.scheduler) {
      case 'clock':          this._startClockScheduler(soundId, channelGain); break
      case 'chimes':         this._startChimeScheduler(soundId, channelGain); break
      case 'birds':          this._startBirdScheduler(soundId, channelGain); break
      case 'thunder-bg':     this._startThunderScheduler(soundId, channelGain, false); break
      case 'thunder-asset':  this._startThunderScheduler(soundId, channelGain, true); break
    }
  }

  _stop(soundId) {
    this._cancelSchedulers(soundId)
    this._teardownReverb(soundId)

    const layers = this.layers.get(soundId)
    if (!layers) return
    layers.forEach(({ nodes, gainNode }) => {
      nodes.forEach(n => { try { n.stop?.(); n.disconnect() } catch { /* noop */ } })
      try { gainNode.disconnect() } catch { /* noop */ }
    })
    this.layers.delete(soundId)

    const channelGain = this.channelGains.get(soundId)
    if (channelGain) {
      try { channelGain.disconnect() } catch { /* noop */ }
      this.channelGains.delete(soundId)
    }
    this.channelAnalysers.delete(soundId)
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  playAmbient(bgId) {
    this.init()
    const now = this.ctx.currentTime

    const currentBgIds = [...this.layers.keys()].filter(
      id => !ASSET_SOUND_IDS.has(id) && id !== bgId
    )

    this._play(bgId, 0)
    const newGain = this.channelGains.get(bgId)
    if (newGain) {
      const targetVol = this._channelVolumes.get(bgId) ?? 1.0
      newGain.gain.cancelScheduledValues(now)
      newGain.gain.setValueAtTime(0, now)
      newGain.gain.linearRampToValueAtTime(targetVol, now + CROSSFADE_DURATION)
    }

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

  setChannelVolume(soundId, vol) {
    this._channelVolumes.set(soundId, vol)
    const channelGain = this.channelGains.get(soundId)
    if (channelGain && this.ctx) {
      channelGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08)
    }
  }

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
