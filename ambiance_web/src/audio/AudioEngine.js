/**
 * File-based ambient sound engine — Web Audio API + MP3 files.
 *
 * Place your audio files in:  public/sounds/
 * Name each file after the sound ID it corresponds to:
 *
 *  BACKGROUNDS
 *   forest-night.mp3       winter-wind.mp3        rain-city.mp3
 *   autumn-wind.mp3        ocean-coast.mp3        thunderstorm.mp3
 *   coffee-shop.mp3        mountain-peak.mp3      japanese-garden.mp3
 *   deep-forest.mp3
 *
 *  ASSET SOUNDS
 *   fireplace-crackle.mp3  rain-window.mp3        thunder-rumble.mp3
 *   stream-water.mp3       wind-chimes.mp3        forest-birds.mp3
 *   desk-fan.mp3           clock-ticking.mp3      vacuum-cleaner.mp3
 *
 * All files loop seamlessly. Per-channel volume, VU metering, and
 * crossfade between backgrounds work exactly as before.
 */

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
  'vacuum-cleaner',
])

const CROSSFADE_DURATION = 2.0 // seconds

// ─── Engine ─────────────────────────────────────────────────────────────────

class AudioEngine {
  constructor() {
    this.ctx           = null
    this.masterGain    = null
    this.masterAnalyser= null

    // Per-channel nodes (soundId → node)
    this.channelGains    = new Map() // soundId → GainNode
    this.channelAnalysers= new Map() // soundId → AnalyserNode (VU tap)

    // Playback tracking
    this.layers  = new Map() // soundId → true  (presence = currently playing)
    this._sources= new Map() // soundId → AudioBufferSourceNode

    // Master state
    this._volume = 0.6
    this._muted  = false
    this._channelVolumes = new Map() // soundId → 0-1

    // Buffer cache (decoded audio — avoids re-fetching)
    this._buffers = new Map() // soundId → AudioBuffer
    this._loading = new Map() // soundId → Promise<AudioBuffer|null>
  }

  // ─── Init (call once on first user gesture) ─────────────────────────────

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

  // ─── Buffer loading ─────────────────────────────────────────────────────

  // Returns the decoded AudioBuffer for soundId, or null if file not found.
  // Deduplicates concurrent fetch requests via the _loading promise cache.
  async _loadBuffer(soundId) {
    if (this._buffers.has(soundId)) return this._buffers.get(soundId)
    if (this._loading.has(soundId)) return this._loading.get(soundId)

    const promise = fetch(`/sounds/${soundId}.mp3`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.arrayBuffer()
      })
      .then(ab => this.ctx.decodeAudioData(ab))
      .then(buf => {
        this._buffers.set(soundId, buf)
        this._loading.delete(soundId)
        return buf
      })
      .catch(err => {
        console.warn(`[AudioEngine] Could not load /sounds/${soundId}.mp3 —`, err.message)
        this._loading.delete(soundId)
        return null
      })

    this._loading.set(soundId, promise)
    return promise
  }

  // ─── Channel helpers ────────────────────────────────────────────────────

  _getOrCreateChannel(soundId, initialGain = null) {
    if (this.channelGains.has(soundId)) return this.channelGains.get(soundId)

    const channelGain = this.ctx.createGain()
    const vol = initialGain !== null ? initialGain : (this._channelVolumes.get(soundId) ?? 1.0)
    channelGain.gain.value = vol
    channelGain.connect(this.masterGain)

    // VU analyser tap — connected to channelGain output, not in main chain
    const analyser = this.ctx.createAnalyser()
    analyser.fftSize = 256
    channelGain.connect(analyser)

    this.channelGains.set(soundId, channelGain)
    this.channelAnalysers.set(soundId, analyser)
    return channelGain
  }

  // ─── Core play / stop ───────────────────────────────────────────────────

  async _play(soundId, initialGain = null) {
    if (!this.ctx) return
    if (this.layers.has(soundId)) return // already playing

    // Mark as playing immediately so concurrent calls are ignored
    this.layers.set(soundId, true)

    const buf = await this._loadBuffer(soundId)

    // Sound may have been stopped while we were loading
    if (!this.layers.has(soundId)) return
    if (!buf) { this.layers.delete(soundId); return }

    const channelGain = this._getOrCreateChannel(soundId, initialGain)

    const src = this.ctx.createBufferSource()
    src.buffer  = buf
    src.loop    = true
    src.connect(channelGain)
    src.start(0)

    this._sources.set(soundId, src)
  }

  _stop(soundId) {
    const src = this._sources.get(soundId)
    if (src) {
      try { src.stop(); src.disconnect() } catch { /* noop */ }
      this._sources.delete(soundId)
    }

    this.layers.delete(soundId)

    const channelGain = this.channelGains.get(soundId)
    if (channelGain) {
      try { channelGain.disconnect() } catch { /* noop */ }
      this.channelGains.delete(soundId)
    }
    this.channelAnalysers.delete(soundId)
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  // Play a background with a 2-second crossfade from the previous one.
  async playAmbient(bgId) {
    this.init()
    const now = this.ctx.currentTime

    // IDs currently playing as backgrounds (not assets, not the new target)
    const currentBgIds = [...this.layers.keys()].filter(
      id => !ASSET_SOUND_IDS.has(id) && id !== bgId
    )

    // Fade out old backgrounds immediately
    currentBgIds.forEach(id => {
      const oldGain = this.channelGains.get(id)
      if (oldGain) {
        oldGain.gain.cancelScheduledValues(now)
        oldGain.gain.setValueAtTime(oldGain.gain.value, now)
        oldGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_DURATION)
        setTimeout(() => this._stop(id), (CROSSFADE_DURATION + 0.3) * 1000)
      } else {
        this._stop(id)
      }
    })

    // Load + play new background at silence, then fade in
    await this._play(bgId, 0)

    const newGain = this.channelGains.get(bgId)
    if (newGain && this.ctx) {
      const t = this.ctx.currentTime
      const targetVol = this._channelVolumes.get(bgId) ?? 1.0
      newGain.gain.cancelScheduledValues(t)
      newGain.gain.setValueAtTime(0, t)
      newGain.gain.linearRampToValueAtTime(targetVol, t + CROSSFADE_DURATION)
    }
  }

  async playAssetSound(soundId) {
    this.init()
    await this._play(soundId)
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

  // Set per-channel volume (0–1) — affects only that sound's gain node.
  setChannelVolume(soundId, vol) {
    this._channelVolumes.set(soundId, vol)
    const channelGain = this.channelGains.get(soundId)
    if (channelGain && this.ctx) {
      channelGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.08)
    }
  }

  // RMS level 0–1 for a specific channel (used by VU bars in Mixer panel).
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

  // RMS level 0–1 for master output.
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
