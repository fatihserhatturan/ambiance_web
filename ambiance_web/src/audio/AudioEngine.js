/**
 * Procedural ambient sound engine — Web Audio API only, no files needed.
 * Generates looping filtered noise shaped for each background/asset.
 * Multi-layer synthesis for realistic, professional-grade soundscapes.
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
    { noiseType:'pink',  filterType:'bandpass', filterFreq:3800, filterQ:6.0, gain:0.04, lfo:{ rate:0.85, depth:0.90 } }, // cırcır böceği
    { noiseType:'pink',  filterType:'bandpass', filterFreq:5200, filterQ:8.0, gain:0.025,lfo:{ rate:1.20, depth:0.95 } }, // yüksek frekans böcek
    { noiseType:'brown', filterType:'lowpass',  filterFreq:80,   filterQ:0.4, gain:0.06, lfo:{ rate:0.02, depth:0.20 } }, // derin orman tabanı
  ],

  // Kış fırtınası: uluyan rüzgar, tipi, derin gürültü
  'winter-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:680,  filterQ:0.5, gain:0.22, lfo:{ rate:0.12, depth:0.65 } }, // ana rüzgar
    { noiseType:'white', filterType:'highpass', filterFreq:1800, filterQ:0.3, gain:0.06, lfo:{ rate:0.22, depth:0.45 } }, // ıslık
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.7, gain:0.12, lfo:{ rate:0.05, depth:0.35 } }, // derin tipi
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1400, filterQ:1.2, gain:0.08, lfo:{ rate:0.30, depth:0.55 } }, // rüzgar hamleleri
    { noiseType:'white', filterType:'bandpass', filterFreq:3500, filterQ:0.8, gain:0.03, lfo:{ rate:0.45, depth:0.60 } }, // ince uğultu
  ],

  // Yağmurlu şehir: sürekli yağmur, şehir uğultusu, su birikintisi
  'rain-city': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:2200, filterQ:0.4, gain:0.15, lfo:{ rate:0.18, depth:0.12 } }, // sürekli yağmur
    { noiseType:'brown', filterType:'lowpass',  filterFreq:140,  filterQ:0.9, gain:0.10, lfo:{ rate:0.06, depth:0.28 } }, // uzak şehir
    { noiseType:'white', filterType:'bandpass', filterFreq:750,  filterQ:1.5, gain:0.07, lfo:{ rate:0.14, depth:0.22 } }, // yağmur yoğunluğu
    { noiseType:'pink',  filterType:'bandpass', filterFreq:300,  filterQ:0.8, gain:0.06, lfo:{ rate:0.09, depth:0.32 } }, // su birikintisi
    { noiseType:'brown', filterType:'bandpass', filterFreq:60,   filterQ:2.0, gain:0.04, lfo:{ rate:0.03, depth:0.40 } }, // metro/tünel altyapısı
  ],

  // Sonbahar: yaprak hışırtısı, esinti, dallar
  'autumn-wind': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:480,  filterQ:0.7, gain:0.17, lfo:{ rate:0.07, depth:0.48 } }, // esinti tabanı
    { noiseType:'brown', filterType:'lowpass',  filterFreq:230,  filterQ:0.5, gain:0.10, lfo:{ rate:0.03, depth:0.32 } }, // derin katman
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2100, filterQ:2.5, gain:0.06, lfo:{ rate:0.16, depth:0.60 } }, // yaprak hışırtısı
    { noiseType:'white', filterType:'bandpass', filterFreq:1400, filterQ:1.8, gain:0.05, lfo:{ rate:0.13, depth:0.40 } }, // dönen yapraklar
    { noiseType:'pink',  filterType:'highpass', filterFreq:3000, filterQ:0.6, gain:0.025,lfo:{ rate:0.24, depth:0.50 } }, // ince yüksek frekans
  ],

  // Okyanus kıyısı: dalgalar, köpük, derin deniz uğultusu
  'ocean-coast': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.5, gain:0.22, lfo:{ rate:0.06, depth:0.70 } }, // derin dalga tabanı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:550,  filterQ:0.6, gain:0.16, lfo:{ rate:0.08, depth:0.65 } }, // dalga ortası
    { noiseType:'white', filterType:'bandpass', filterFreq:2800, filterQ:0.7, gain:0.08, lfo:{ rate:0.12, depth:0.55 } }, // köpük/sıçrama
    { noiseType:'brown', filterType:'lowpass',  filterFreq:75,   filterQ:0.4, gain:0.14, lfo:{ rate:0.03, depth:0.45 } }, // derin okyanus
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1200, filterQ:1.0, gain:0.06, lfo:{ rate:0.10, depth:0.50 } }, // çekilen su
  ],

  // Gök gürültülü fırtına: yoğun yağmur, gürültü, şimşek
  'thunderstorm': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:3200, filterQ:0.4, gain:0.18, lfo:{ rate:0.28, depth:0.18 } }, // yoğun yağmur
    { noiseType:'brown', filterType:'lowpass',  filterFreq:70,   filterQ:1.5, gain:0.20, lfo:{ rate:0.04, depth:0.75 } }, // gök gürültüsü tabanı
    { noiseType:'brown', filterType:'bandpass', filterFreq:110,  filterQ:1.2, gain:0.14, lfo:{ rate:0.06, depth:0.60 } }, // gürültü gövdesi
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1000, filterQ:0.9, gain:0.08, lfo:{ rate:0.20, depth:0.40 } }, // yağmur yoğunluğu
    { noiseType:'white', filterType:'highpass', filterFreq:4000, filterQ:0.5, gain:0.04, lfo:{ rate:0.50, depth:0.30 } }, // çok ince ayrıntı
  ],

  // Kafe: fısıltı, kahve makinesi, bardak
  'coffee-shop': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:380,  filterQ:0.6, gain:0.14, lfo:{ rate:0.04, depth:0.28 } }, // sohbet mırıltısı
    { noiseType:'brown', filterType:'lowpass',  filterFreq:180,  filterQ:0.7, gain:0.12, lfo:{ rate:0.02, depth:0.18 } }, // oda ambiyansı
    { noiseType:'white', filterType:'bandpass', filterFreq:1800, filterQ:2.0, gain:0.05, lfo:{ rate:0.15, depth:0.55 } }, // bardak/tabak şıkırtısı
    { noiseType:'pink',  filterType:'highpass', filterFreq:1200, filterQ:0.8, gain:0.04, lfo:{ rate:0.08, depth:0.35 } }, // yüksek frekans aktivite
    { noiseType:'brown', filterType:'bandpass', filterFreq:80,   filterQ:1.5, gain:0.06, lfo:{ rate:0.01, depth:0.15 } }, // derin oda tonu
  ],

  // Dağ zirvesi: yüksek irtifada rüzgar, ince hava
  'mountain-peak': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1100, filterQ:0.5, gain:0.20, lfo:{ rate:0.18, depth:0.65 } }, // yüksek rüzgar
    { noiseType:'white', filterType:'highpass', filterFreq:2800, filterQ:0.3, gain:0.07, lfo:{ rate:0.35, depth:0.55 } }, // ince hava ıslığı
    { noiseType:'brown', filterType:'lowpass',  filterFreq:140,  filterQ:0.6, gain:0.10, lfo:{ rate:0.04, depth:0.30 } }, // dağ uğultusu
    { noiseType:'pink',  filterType:'bandpass', filterFreq:600,  filterQ:1.2, gain:0.08, lfo:{ rate:0.25, depth:0.70 } }, // rüzgar hamleleri
  ],

  // Japon bahçesi: rüzgar, bambu, huzur
  'japanese-garden': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.5, gain:0.12, lfo:{ rate:0.02, depth:0.18 } }, // sakin taban
    { noiseType:'pink',  filterType:'bandpass', filterFreq:750,  filterQ:0.8, gain:0.10, lfo:{ rate:0.05, depth:0.40 } }, // hafif esinti
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2400, filterQ:3.5, gain:0.05, lfo:{ rate:0.07, depth:0.65 } }, // bambu / çan tonu
    { noiseType:'white', filterType:'bandpass', filterFreq:3800, filterQ:4.0, gain:0.03, lfo:{ rate:0.10, depth:0.70 } }, // ince kristal detay
    { noiseType:'brown', filterType:'lowpass',  filterFreq:100,  filterQ:0.4, gain:0.08, lfo:{ rate:0.015,depth:0.22 } }, // derin zemlin
  ],

  // Derin orman: antik, puslu, yoğun taçortüsü
  'deep-forest': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:350,  filterQ:0.6, gain:0.16, lfo:{ rate:0.03, depth:0.28 } }, // orman tabanı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:650,  filterQ:0.9, gain:0.12, lfo:{ rate:0.06, depth:0.45 } }, // taçortüsü esintisi
    { noiseType:'brown', filterType:'bandpass', filterFreq:130,  filterQ:1.2, gain:0.08, lfo:{ rate:0.04, depth:0.35 } }, // derin uğultu
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1700, filterQ:2.0, gain:0.05, lfo:{ rate:0.14, depth:0.55 } }, // yüksek taçortüsü
    { noiseType:'brown', filterType:'lowpass',  filterFreq:60,   filterQ:0.5, gain:0.07, lfo:{ rate:0.02, depth:0.25 } }, // sub-bas derinlik
  ],

  // ── Asset Sounds ──────────────────────────────────────────────────────

  // Şömine: odun çatırtısı, alev, korlu kor
  'fireplace-crackle': [
    { noiseType:'brown',  filterType:'bandpass', filterFreq:200,  filterQ:2.8, gain:0.15, lfo:{ rate:0.30, depth:0.75 } },
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:95,   filterQ:1.0, gain:0.09, lfo:{ rate:0.14, depth:0.42 } },
    { noiseType:'velvet', filterType:'bandpass', filterFreq:480,  filterQ:3.5, gain:0.06, lfo:{ rate:0.55, depth:0.85 } }, // odun patlaması
    { noiseType:'pink',   filterType:'bandpass', filterFreq:1100, filterQ:2.0, gain:0.04, lfo:{ rate:0.42, depth:0.65 } }, // kıvılcım
    { noiseType:'brown',  filterType:'lowpass',  filterFreq:50,   filterQ:0.8, gain:0.05, lfo:{ rate:0.08, depth:0.30 } }, // derin alev tonu
  ],

  // Pencere yağmuru: damlalar, cam titreşimi
  'rain-window': [
    { noiseType:'white', filterType:'lowpass',  filterFreq:1300, filterQ:0.6, gain:0.12, lfo:{ rate:0.22, depth:0.18 } },
    { noiseType:'pink',  filterType:'bandpass', filterFreq:580,  filterQ:1.8, gain:0.07, lfo:{ rate:0.18, depth:0.28 } }, // damla vurma
    { noiseType:'white', filterType:'highpass', filterFreq:2400, filterQ:0.5, gain:0.04, lfo:{ rate:0.32, depth:0.15 } }, // sprey/sis
  ],

  // Gök gürültüsü: düşük yuvarlanma, çarpma
  'thunder-rumble': [
    { noiseType:'brown', filterType:'lowpass',  filterFreq:55,   filterQ:2.0, gain:0.22, lfo:{ rate:0.03, depth:0.82 } }, // çok derin çarpta
    { noiseType:'brown', filterType:'bandpass', filterFreq:95,   filterQ:1.5, gain:0.16, lfo:{ rate:0.05, depth:0.68 } }, // gürültü gövdesi
    { noiseType:'brown', filterType:'bandpass', filterFreq:170,  filterQ:1.0, gain:0.08, lfo:{ rate:0.08, depth:0.50 } }, // üst yuvarlanma
    { noiseType:'pink',  filterType:'bandpass', filterFreq:350,  filterQ:0.7, gain:0.04, lfo:{ rate:0.12, depth:0.35 } }, // uzak ses
  ],

  // Dere: akan su, çağlayan, pınarıltı
  'stream-water': [
    { noiseType:'white', filterType:'bandpass', filterFreq:780,  filterQ:1.2, gain:0.14, lfo:{ rate:0.28, depth:0.42 } }, // akan su sesi
    { noiseType:'white', filterType:'bandpass', filterFreq:1400, filterQ:1.5, gain:0.10, lfo:{ rate:0.38, depth:0.52 } }, // su ayrıntısı
    { noiseType:'pink',  filterType:'lowpass',  filterFreq:480,  filterQ:0.8, gain:0.08, lfo:{ rate:0.16, depth:0.35 } }, // akım tabanı
    { noiseType:'white', filterType:'highpass', filterFreq:2400, filterQ:0.6, gain:0.05, lfo:{ rate:0.45, depth:0.38 } }, // su parıltısı
  ],

  // Rüzgar çanları: rezonans, kristal tınılar
  'wind-chimes': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1900, filterQ:5.0, gain:0.09, lfo:{ rate:0.09, depth:0.80 } }, // ana rezonans
    { noiseType:'white', filterType:'bandpass', filterFreq:3600, filterQ:6.0, gain:0.06, lfo:{ rate:0.06, depth:0.75 } }, // yüksek çan tonu
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1100, filterQ:4.0, gain:0.05, lfo:{ rate:0.12, depth:0.70 } }, // orta çan
    { noiseType:'brown', filterType:'lowpass',  filterFreq:300,  filterQ:0.5, gain:0.04, lfo:{ rate:0.03, depth:0.22 } }, // gövde tını
  ],

  // Orman kuşları: cıvıltı, şarkı, arka plan
  'forest-birds': [
    { noiseType:'pink',  filterType:'bandpass', filterFreq:3800, filterQ:7.0, gain:0.07, lfo:{ rate:1.60, depth:0.88 } }, // yüksek cıvıltı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:2400, filterQ:5.0, gain:0.06, lfo:{ rate:0.90, depth:0.82 } }, // orta şarkı
    { noiseType:'pink',  filterType:'bandpass', filterFreq:1600, filterQ:3.5, gain:0.05, lfo:{ rate:0.55, depth:0.70 } }, // alçak melodi
    { noiseType:'brown', filterType:'lowpass',  filterFreq:380,  filterQ:0.5, gain:0.04, lfo:{ rate:0.04, depth:0.18 } }, // orman zemini
  ],

  // Elektrik vantilatör: sabit humming
  'desk-fan': [
    { noiseType:'white', filterType:'bandpass', filterFreq:380,  filterQ:2.5, gain:0.10, lfo:{ rate:0.02, depth:0.08 } }, // motor hum
    { noiseType:'white', filterType:'bandpass', filterFreq:760,  filterQ:2.0, gain:0.06, lfo:{ rate:0.03, depth:0.06 } }, // üst harmonik
    { noiseType:'brown', filterType:'lowpass',  filterFreq:200,  filterQ:0.6, gain:0.08, lfo:{ rate:0.01, depth:0.12 } }, // motor taban
  ],

  // Duvar saati: tik-tak ritim
  'clock-ticking': [
    { noiseType:'brown', filterType:'bandpass', filterFreq:2800, filterQ:8.0, gain:0.12, lfo:{ rate:2.00, depth:0.96 } }, // tik darbesi
    { noiseType:'white', filterType:'bandpass', filterFreq:1600, filterQ:6.0, gain:0.07, lfo:{ rate:2.00, depth:0.94 } }, // tak darbesi
    { noiseType:'brown', filterType:'lowpass',  filterFreq:280,  filterQ:0.5, gain:0.03, lfo:{ rate:0.04, depth:0.15 } }, // mekanizma
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

      // Optional secondary LFO for extra organic movement
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
      nodes.forEach(n => { n.stop?.(); n.disconnect() })
      gainNode.disconnect()
    })
    this.layers.delete(soundId)
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  playAmbient(bgId) {
    this.init()
    // Stop all non-asset ambient layers
    Object.keys(CONFIGS)
      .filter(id => !ASSET_SOUND_IDS.has(id))
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
