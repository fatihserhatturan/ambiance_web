/**
 * Procedural ambient sound engine — Web Audio API only, no files needed.
 * Generates looping filtered noise shaped for each background/asset.
 */

// ─── Noise buffer generators ───────────────────────────────────────────────

function createNoiseBuffer(ctx, type = 'brown') {
  const len = ctx.sampleRate * 6 // 6-second loop
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
  }
  return buf
}

// ─── Layer configs per sound ID ────────────────────────────────────────────

const CONFIGS = {
  // Backgrounds
  'forest-night': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:300,  filterQ:0.6, gain:0.20, lfo:{ rate:0.05, depth:0.35 } },
    { noiseType:'brown', filterType:'bandpass', filterFreq:180,  filterQ:1.2, gain:0.08, lfo:{ rate:0.09, depth:0.50 } },
  ],
  'winter-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:700,  filterQ:0.5, gain:0.22, lfo:{ rate:0.12, depth:0.60 } },
    { noiseType:'white', filterType:'highpass', filterFreq:2000, filterQ:0.3, gain:0.05, lfo:{ rate:0.20, depth:0.40 } },
  ],
  'rain-city': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:2400, filterQ:0.4, gain:0.16, lfo:{ rate:0.18, depth:0.12 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:150,  filterQ:0.8, gain:0.10, lfo:{ rate:0.07, depth:0.25 } },
  ],
  'autumn-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:500,  filterQ:0.7, gain:0.18, lfo:{ rate:0.07, depth:0.45 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:250,  filterQ:0.5, gain:0.09, lfo:{ rate:0.04, depth:0.30 } },
  ],
  // Assets
  'fireplace-crackle': [
    { noiseType:'brown', filterType:'bandpass', filterFreq:220,  filterQ:2.5, gain:0.14, lfo:{ rate:0.28, depth:0.70 } },
    { noiseType:'brown', filterType:'lowpass',  filterFreq:100,  filterQ:1.0, gain:0.08, lfo:{ rate:0.15, depth:0.40 } },
  ],
  'rain-window': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:1400, filterQ:0.6, gain:0.12, lfo:{ rate:0.22, depth:0.18 } },
  ],
}

// ─── Engine ────────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.layers = new Map() // soundId → [{ nodes, gainNode }]
    this._volume = 0.6
    this._muted = false
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
    this.masterGain.connect(this.ctx.destination)
  }

  // Build one noise layer from a single config entry
  _buildLayer(cfg) {
    const ctx = this.ctx
    const gainNode = ctx.createGain()
    gainNode.gain.value = cfg.gain
    gainNode.connect(this.masterGain)

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
    source.start(0, Math.random() * 6) // random phase for variety

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
    }

    return { nodes, gainNode }
  }

  _play(soundId) {
    if (!this.ctx || this.layers.has(soundId)) return
    const cfgList = CONFIGS[soundId]
    if (!cfgList) return

    const layers = cfgList.map((cfg) => this._buildLayer(cfg))
    this.layers.set(soundId, layers)
  }

  _stop(soundId) {
    const layers = this.layers.get(soundId)
    if (!layers) return
    layers.forEach(({ nodes, gainNode }) => {
      nodes.forEach(n => {  n.stop?.(); n.disconnect() })
      gainNode.disconnect() 
    })
    this.layers.delete(soundId)
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  playAmbient(bgId) {
    this.init()
    // Stop all ambient layers first
    Object.keys(CONFIGS)
      .filter(id => !['fireplace-crackle', 'rain-window'].includes(id))
      .forEach(id => this._stop(id))
    this._play(bgId)
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

  get activeSounds() {
    return [...this.layers.keys()]
  }
}

// Singleton
export const audioEngine = new AudioEngine()