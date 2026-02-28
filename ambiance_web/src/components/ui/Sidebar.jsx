import { useState, useEffect, useRef } from 'react'
import { useSceneStore } from '../../store/sceneStore'
import { BACKGROUNDS, SCENE_ASSETS, AUDIO_TRACKS } from '../../data/registry'
import { audioEngine } from '../../audio/AudioEngine'
import './Sidebar.css'

// ─── Icon lookup from audio track registry ────────────────────────────────
const SOUND_ICON = Object.fromEntries(AUDIO_TRACKS.map(t => [t.id, t.icon]))

// ─── Root sidebar ─────────────────────────────────────────────────────────

export default function Sidebar() {
  const sidebarOpen       = useSceneStore((s) => s.sidebarOpen)
  const activePanelTab    = useSceneStore((s) => s.activePanelTab)
  const setSidebarOpen    = useSceneStore((s) => s.setSidebarOpen)
  const setActivePanelTab = useSceneStore((s) => s.setActivePanelTab)

  const TABS = [
    { id: 'backgrounds', label: 'Sahneler', icon: '🪟' },
    { id: 'assets',      label: 'Nesneler', icon: '✨' },
    { id: 'mixer',       label: 'Mikser',   icon: '🎚️' },
    { id: 'presets',     label: 'Presetler',icon: '🎛️' },
  ]

  return (
    <>
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Kapat' : 'Aç'}
      >
        {sidebarOpen ? '›' : '‹'}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">ambiance</span>
          <span className="sidebar-subtitle">studio</span>
        </div>

        <nav className="sidebar-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activePanelTab === tab.id ? 'active' : ''}`}
              onClick={() => setActivePanelTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-body">
          {activePanelTab === 'backgrounds' && <BackgroundsPanel />}
          {activePanelTab === 'assets'      && <AssetsPanel />}
          {activePanelTab === 'mixer'       && <MixerPanel />}
          {activePanelTab === 'presets'     && <PresetsPanel />}
        </div>
      </aside>
    </>
  )
}

// ─── Backgrounds panel ────────────────────────────────────────────────────

const BG_GROUPS = [
  { key: 'nature',   label: 'Doğa & Gece',   ids: ['forest-night', 'deep-forest', 'japanese-garden'] },
  { key: 'weather',  label: 'Hava & Mevsim',  ids: ['snowy-cabin', 'rainy-city', 'autumn-garden', 'thunderstorm'] },
  { key: 'landscape',label: 'Manzara',         ids: ['ocean-coast', 'mountain-peak'] },
  { key: 'indoor',   label: 'İç Mekan',        ids: ['coffee-shop'] },
]

function BackgroundsPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const setBackground    = useSceneStore((s) => s.setBackground)

  return (
    <div className="panel-section">
      <p className="panel-hint">Pencerenden görüntüyü seç</p>

      {BG_GROUPS.map((group) => {
        const bgs = group.ids
          .map((id) => BACKGROUNDS.find((b) => b.id === id))
          .filter(Boolean)
        if (!bgs.length) return null
        return (
          <div key={group.key} className="bg-group">
            <span className="bg-group-label">{group.label}</span>
            <div className="bg-grid">
              {bgs.map((bg) => (
                <button
                  key={bg.id}
                  className={`bg-card ${activeBackground === bg.id ? 'active' : ''}`}
                  onClick={() => setBackground(bg.id)}
                >
                  <div className="bg-thumb" style={{ background: bg.gradient }} />
                  <span className="bg-label">{bg.label}</span>
                  <span className="bg-desc">{bg.description}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Assets panel ─────────────────────────────────────────────────────────

const ASSET_GROUPS = [
  { key: 'warmth',   label: 'Sıcaklık',  icon: '🔥' },
  { key: 'weather',  label: 'Hava',      icon: '🌧️' },
  { key: 'nature',   label: 'Doğa',      icon: '🌿' },
  { key: 'ambiance', label: 'Ortam',     icon: '🎶' },
]

function AssetsPanel() {
  const sceneAssets         = useSceneStore((s) => s.sceneAssets)
  const addAsset            = useSceneStore((s) => s.addAsset)
  const removeAsset         = useSceneStore((s) => s.removeAsset)
  const updateAssetSettings = useSceneStore((s) => s.updateAssetSettings)

  const isActive    = (id) => sceneAssets.some((a) => a.id === id)
  const getInstance = (id) => sceneAssets.find((a) => a.id === id)

  const toggleAsset = (assetDef) => {
    if (isActive(assetDef.id)) {
      const inst = getInstance(assetDef.id)
      if (inst) removeAsset(inst.instanceId)
    } else {
      addAsset(assetDef)
    }
  }

  return (
    <div className="panel-section">
      <p className="panel-hint">Sahneye ses nesneleri ekle</p>

      {ASSET_GROUPS.map((group) => {
        const assets = SCENE_ASSETS.filter((a) => a.category === group.key)
        if (!assets.length) return null
        return (
          <div key={group.key} className="asset-group">
            <span className="asset-group-label">
              <span className="asset-group-icon">{group.icon}</span>
              {group.label}
            </span>

            <div className="asset-list">
              {assets.map((assetDef) => {
                const active   = isActive(assetDef.id)
                const instance = getInstance(assetDef.id)
                return (
                  <div
                    key={assetDef.id}
                    className={`asset-card ${active ? 'active' : ''}`}
                  >
                    <div className="asset-card-header">
                      <span className="asset-icon">{assetDef.icon}</span>
                      <div className="asset-info">
                        <span className="asset-name">{assetDef.label}</span>
                        <span className="asset-desc">{assetDef.description}</span>
                      </div>
                      <button
                        className={`asset-toggle ${active ? 'on' : 'off'}`}
                        onClick={() => toggleAsset(assetDef)}
                      >
                        {active ? 'Kaldır' : 'Ekle'}
                      </button>
                    </div>

                    {active && instance && (
                      <div className="asset-settings">
                        <label className="setting-row">
                          <span>Yoğunluk</span>
                          <input
                            type="range" min={0} max={1} step={0.05}
                            value={instance.settings.intensity ?? 0.7}
                            onChange={(e) => updateAssetSettings(instance.instanceId, {
                              intensity: parseFloat(e.target.value)
                            })}
                          />
                          <span className="setting-val">
                            {Math.round((instance.settings.intensity ?? 0.7) * 100)}%
                          </span>
                        </label>
                        {instance.settings.size !== undefined && (
                          <label className="setting-row">
                            <span>Boyut</span>
                            <input
                              type="range" min={0.5} max={2} step={0.05}
                              value={instance.settings.size ?? 1}
                              onChange={(e) => updateAssetSettings(instance.instanceId, {
                                size: parseFloat(e.target.value)
                              })}
                            />
                            <span className="setting-val">
                              {Math.round((instance.settings.size ?? 1) * 100)}%
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── VU Bars component ─────────────────────────────────────────────────────
// Polls AudioEngine's analyser every 150ms to detect activity,
// then drives CSS animations for organic visual feedback.

function VUBars({ soundId, bars = 6 }) {
  const [active, setActive] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const lvl = soundId === '__master__'
        ? audioEngine.getMasterLevel()
        : audioEngine.getChannelLevel(soundId)
      setActive(lvl > 0.008)
    }, 150)
    return () => clearInterval(intervalRef.current)
  }, [soundId])

  return (
    <div className={`vu-bars ${active ? 'active' : ''}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <div key={i} className={`vu-bar vu-bar-${i + 1}`} />
      ))}
    </div>
  )
}

// ─── Mixer channel strip ───────────────────────────────────────────────────

function ChannelStrip({ soundId, label, icon, badge, badgeType, isMaster = false }) {
  const channelVolumes   = useSceneStore((s) => s.channelVolumes)
  const audioVolume      = useSceneStore((s) => s.audioVolume)
  const audioMuted       = useSceneStore((s) => s.audioMuted)
  const setChannelVolume = useSceneStore((s) => s.setChannelVolume)
  const setAudioVolume   = useSceneStore((s) => s.setAudioVolume)
  const toggleMute       = useSceneStore((s) => s.toggleMute)

  const [channelMuted, setChannelMuted] = useState(false)
  const prevVolRef = useRef(1)

  const handleChannelMute = () => {
    if (isMaster) {
      toggleMute()
      return
    }
    if (channelMuted) {
      setChannelVolume(soundId, prevVolRef.current)
      setChannelMuted(false)
    } else {
      prevVolRef.current = channelVolumes[soundId] ?? 1
      setChannelVolume(soundId, 0)
      setChannelMuted(true)
    }
  }

  const isMuted = isMaster ? audioMuted : channelMuted
  const volume  = isMaster
    ? audioVolume
    : (channelVolumes[soundId] ?? 1)

  const handleVolumeChange = (val) => {
    if (isMaster) {
      setAudioVolume(val)
    } else {
      if (channelMuted && val > 0) setChannelMuted(false)
      setChannelVolume(soundId, val)
    }
  }

  return (
    <div className={`mixer-channel ${isMaster ? 'mixer-master' : ''} ${isMuted ? 'muted' : ''}`}>
      <div className="mixer-channel-header">
        <span className="mixer-channel-icon">{icon}</span>
        <span className="mixer-channel-name">{label}</span>
        {badge && (
          <span className={`mixer-channel-badge badge-${badgeType}`}>{badge}</span>
        )}
      </div>

      <div className="mixer-channel-controls">
        <button
          className={`mixer-mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleChannelMute}
          title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <VUBars soundId={isMaster ? '__master__' : soundId} />

        <input
          type="range" min={0} max={1} step={0.01}
          value={isMuted && isMaster ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="mixer-slider"
        />

        <span className="mixer-vol-label">
          {isMuted ? '—' : `${Math.round(volume * 100)}%`}
        </span>
      </div>
    </div>
  )
}

// ─── Mixer panel ───────────────────────────────────────────────────────────

function MixerPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)

  const activeBg = BACKGROUNDS.find((b) => b.id === activeBackground)
  const bgIcon   = activeBg ? (SOUND_ICON[activeBg.ambientSound] || '🌿') : '🌿'

  const activeAssets = sceneAssets.filter(
    (a) => a.hasSound && a.settings?.sound !== false
  )

  return (
    <div className="panel-section mixer-panel">

      {/* Master bus */}
      <div className="mixer-section-label">Master</div>
      <ChannelStrip
        soundId="__master__"
        label="Master"
        icon="🎛️"
        isMaster
      />

      {/* Channel strips */}
      <div className="mixer-section-label" style={{ marginTop: 20 }}>Kanallar</div>

      {activeBg && (
        <ChannelStrip
          soundId={activeBg.ambientSound}
          label={activeBg.label}
          icon={bgIcon}
          badge="zemin"
          badgeType="background"
        />
      )}

      {activeAssets.map((asset) => (
        <ChannelStrip
          key={asset.instanceId}
          soundId={asset.soundId}
          label={asset.label}
          icon={asset.icon}
          badge="nesne"
          badgeType="asset"
        />
      ))}

      {activeAssets.length === 0 && (
        <p className="mixer-empty">
          Nesneler panelinden ses nesnesi ekle
        </p>
      )}

      <p className="panel-hint" style={{ marginTop: 20, fontSize: '10px' }}>
        Sesi başlatmak için sahneye tıkla
      </p>
    </div>
  )
}

// ─── Presets panel ─────────────────────────────────────────────────────────

function PresetsPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)
  const presets          = useSceneStore((s) => s.presets)
  const savePreset       = useSceneStore((s) => s.savePreset)
  const loadPreset       = useSceneStore((s) => s.loadPreset)
  const deletePreset     = useSceneStore((s) => s.deletePreset)

  const [presetName, setPresetName] = useState('')
  const [savedFeedback, setSavedFeedback] = useState(false)

  const activeBg = BACKGROUNDS.find((b) => b.id === activeBackground)

  const handleSave = () => {
    if (!presetName.trim()) return
    savePreset(presetName)
    setPresetName('')
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
  }

  // Build a summary string for a preset
  const presetSummary = (preset) => {
    const bg = BACKGROUNDS.find(b => b.id === preset.background)
    const bgLabel = bg?.label || preset.background
    if (!preset.assets?.length) return bgLabel
    const assetLabels = preset.assets
      .slice(0, 2)
      .map(a => SCENE_ASSETS.find(s => s.id === a.id)?.label || a.id)
    const rest = preset.assets.length > 2 ? ` +${preset.assets.length - 2}` : ''
    return `${bgLabel} · ${assetLabels.join(', ')}${rest}`
  }

  return (
    <div className="panel-section">
      <p className="panel-hint">Ambiyansı kaydet ve yükle</p>

      {/* Current ambiance preview */}
      <div className="preset-current-card">
        <span className="preset-current-label">Şu anki ambiyans</span>
        <span className="preset-current-bg">
          {activeBg?.label || activeBackground}
        </span>
        {sceneAssets.length > 0 && (
          <span className="preset-current-assets">
            {sceneAssets.map(a => a.icon).join(' ')} {sceneAssets.length} nesne
          </span>
        )}
      </div>

      {/* Save row */}
      <div className="preset-save-row">
        <input
          className="preset-name-input"
          type="text"
          placeholder="Preset adı..."
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={40}
        />
        <button
          className={`preset-save-btn ${savedFeedback ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={!presetName.trim()}
          title="Mevcut ambiyansı kaydet"
        >
          {savedFeedback ? '✓' : '💾'}
        </button>
      </div>

      {/* Saved presets list */}
      {presets.length === 0 ? (
        <div className="preset-empty">
          <span>Henüz kaydedilmiş preset yok</span>
          <span>Ambiyansını oluştur ve kaydet</span>
        </div>
      ) : (
        <div className="preset-list">
          <span className="preset-list-label">Kaydedilen presetler</span>
          {[...presets].reverse().map((preset) => (
            <div key={preset.id} className="preset-card">
              <div className="preset-card-info">
                <span className="preset-card-name">{preset.name}</span>
                <span className="preset-card-meta">{presetSummary(preset)}</span>
              </div>
              <button
                className="preset-load-btn"
                onClick={() => loadPreset(preset.id)}
                title="Bu ambiyansı yükle"
              >
                Yükle
              </button>
              <button
                className="preset-delete-btn"
                onClick={() => deletePreset(preset.id)}
                title="Sil"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
