import { useSceneStore } from '../../store/sceneStore'
import { BACKGROUNDS, SCENE_ASSETS } from '../../data/registry'
import './Sidebar.css'

export default function Sidebar() {
  const sidebarOpen    = useSceneStore((s) => s.sidebarOpen)
  const activePanelTab = useSceneStore((s) => s.activePanelTab)
  const setSidebarOpen    = useSceneStore((s) => s.setSidebarOpen)
  const setActivePanelTab = useSceneStore((s) => s.setActivePanelTab)

  return (
    <>
      {/* Toggle button */}
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
        </div>

        {/* Tab nav */}
        <nav className="sidebar-tabs">
          {[
            { id: 'backgrounds', label: 'Sahneler', icon: '🪟' },
            { id: 'assets',      label: 'Nesneler', icon: '✨' },
            { id: 'audio',       label: 'Ses',      icon: '🔊' },
          ].map((tab) => (
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
          {activePanelTab === 'audio'       && <AudioPanel />}
        </div>
      </aside>
    </>
  )
}

// ─── Backgrounds panel ───────────────────────────────────────────────────
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

// ─── Assets panel ────────────────────────────────────────────────────────
const ASSET_GROUPS = [
  { key: 'warmth',   label: 'Sıcaklık',  icon: '🔥' },
  { key: 'weather',  label: 'Hava',      icon: '🌧️' },
  { key: 'nature',   label: 'Doğa',      icon: '🌿' },
  { key: 'ambiance', label: 'Ortam',     icon: '🎶' },
]

function AssetsPanel() {
  const sceneAssets        = useSceneStore((s) => s.sceneAssets)
  const addAsset           = useSceneStore((s) => s.addAsset)
  const removeAsset        = useSceneStore((s) => s.removeAsset)
  const updateAssetSettings = useSceneStore((s) => s.updateAssetSettings)

  const isActive  = (id) => sceneAssets.some((a) => a.id === id)
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

                    {/* Settings sliders when active */}
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

// ─── Audio panel ─────────────────────────────────────────────────────────
function AudioPanel() {
  const audioVolume      = useSceneStore((s) => s.audioVolume)
  const audioMuted       = useSceneStore((s) => s.audioMuted)
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)
  const setAudioVolume   = useSceneStore((s) => s.setAudioVolume)
  const toggleMute       = useSceneStore((s) => s.toggleMute)

  const activeBg         = BACKGROUNDS.find((b) => b.id === activeBackground)
  const activeAssetSounds = sceneAssets.filter((a) => a.hasSound && a.settings?.sound !== false)

  return (
    <div className="panel-section">
      <p className="panel-hint">Ambiyans ses kontrolü</p>

      {/* Master volume */}
      <div className="audio-master">
        <button
          className="mute-btn"
          onClick={toggleMute}
          title={audioMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {audioMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range" min={0} max={1} step={0.02}
          value={audioMuted ? 0 : audioVolume}
          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
        <span className="volume-label">
          {audioMuted ? 'Sessiz' : `${Math.round(audioVolume * 100)}%`}
        </span>
      </div>

      {/* Active layers */}
      <p className="panel-hint" style={{ marginTop: '16px' }}>Aktif katmanlar</p>
      <div className="audio-layers">
        {activeBg && (
          <div className="audio-layer-row">
            <span className="audio-layer-dot playing" />
            <span className="audio-layer-name">{activeBg.label} — ambiyans</span>
            <span className="audio-layer-badge">arka plan</span>
          </div>
        )}

        {activeAssetSounds.length === 0 && (
          <div className="audio-layer-row muted-row">
            <span className="audio-layer-dot" />
            <span className="audio-layer-name" style={{ opacity: 0.4 }}>
              Nesne sesi yok
            </span>
          </div>
        )}
        {activeAssetSounds.map((a) => (
          <div key={a.instanceId} className="audio-layer-row">
            <span className="audio-layer-dot playing" />
            <span className="audio-layer-name">{a.label}</span>
            <span className="audio-layer-badge">nesne</span>
          </div>
        ))}
      </div>

      <p className="panel-hint" style={{ marginTop: '16px', fontSize: '10px', opacity: 0.45 }}>
        Sesi başlatmak için sahneye tıkla
      </p>
    </div>
  )
}
