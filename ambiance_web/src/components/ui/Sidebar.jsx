import { useSceneStore } from '../../store/sceneStore'
import { BACKGROUNDS, SCENE_ASSETS } from '../../data/registry'
import './Sidebar.css'

export default function Sidebar() {
  const sidebarOpen = useSceneStore((s) => s.sidebarOpen)
  const activePanelTab = useSceneStore((s) => s.activePanelTab)
  const setSidebarOpen = useSceneStore((s) => s.setSidebarOpen)
  const setActivePanelTab = useSceneStore((s) => s.setActivePanelTab)

  return (
    <>
      {/* Toggle button */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Close panel' : 'Open panel'}
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
            { id: 'backgrounds', label: 'Scenes',   icon: '🪟' },
            { id: 'assets',      label: 'Objects',   icon: '✨' },
            { id: 'audio',       label: 'Audio',     icon: '🔊' },
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

// ─── Backgrounds panel ───────────────────────────────
function BackgroundsPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const setBackground = useSceneStore((s) => s.setBackground)

  return (
    <div className="panel-section">
      <p className="panel-hint">Choose your window view</p>
      <div className="bg-grid">
        {BACKGROUNDS.map((bg) => (
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
}

// ─── Assets panel ────────────────────────────────────
function AssetsPanel() {
  const sceneAssets = useSceneStore((s) => s.sceneAssets)
  const addAsset = useSceneStore((s) => s.addAsset)
  const removeAsset = useSceneStore((s) => s.removeAsset)
  const updateAssetSettings = useSceneStore((s) => s.updateAssetSettings)

  const isActive = (id) => sceneAssets.some((a) => a.id === id)
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
      <p className="panel-hint">Add objects to your scene</p>
      <div className="asset-list">
        {SCENE_ASSETS.map((assetDef) => {
          const active = isActive(assetDef.id)
          const instance = getInstance(assetDef.id)
          return (
            <div key={assetDef.id} className={`asset-card ${active ? 'active' : ''}`}>
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
                  {active ? 'Remove' : 'Add'}
                </button>
              </div>

              {/* Settings sliders when active */}
              {active && instance && (
                <div className="asset-settings">
                  <label className="setting-row">
                    <span>Intensity</span>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={instance.settings.intensity ?? 0.8}
                      onChange={(e) => updateAssetSettings(instance.instanceId, {
                        intensity: parseFloat(e.target.value)
                      })}
                    />
                    <span className="setting-val">
                      {Math.round((instance.settings.intensity ?? 0.8) * 100)}%
                    </span>
                  </label>
                  <label className="setting-row">
                    <span>Size</span>
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
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Audio panel ─────────────────────────────────────
function AudioPanel() {
  const audioVolume      = useSceneStore((s) => s.audioVolume)
  const audioMuted       = useSceneStore((s) => s.audioMuted)
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)
  const setAudioVolume   = useSceneStore((s) => s.setAudioVolume)
  const toggleMute       = useSceneStore((s) => s.toggleMute)

  // Collect currently active sounds for display
  const activeBg = BACKGROUNDS.find((b) => b.id === activeBackground)
  const activeAssetSounds = sceneAssets.filter((a) => a.hasSound && a.settings?.sound !== false)

  return (
    <div className="panel-section">
      <p className="panel-hint">Ambient soundscape controls</p>

      {/* Master volume */}
      <div className="audio-master">
        <button className="mute-btn" onClick={toggleMute} title={audioMuted ? 'Unmute' : 'Mute'}>
          {audioMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range" min={0} max={1} step={0.02}
          value={audioMuted ? 0 : audioVolume}
          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
        <span className="volume-label">
          {audioMuted ? 'Muted' : `${Math.round(audioVolume * 100)}%`}
        </span>
      </div>

      {/* Active layers */}
      <p className="panel-hint" style={{ marginTop: '16px' }}>Now playing</p>
      <div className="audio-layers">
        {/* Background ambient */}
        {activeBg && (
          <div className="audio-layer-row">
            <span className="audio-layer-dot playing" />
            <span className="audio-layer-name">{activeBg.label} — ambient</span>
            <span className="audio-layer-badge">bg</span>
          </div>
        )}

        {/* Asset sounds */}
        {activeAssetSounds.length === 0 && (
          <div className="audio-layer-row muted-row">
            <span className="audio-layer-dot" />
            <span className="audio-layer-name" style={{ opacity: 0.4 }}>No object sounds active</span>
          </div>
        )}
        {activeAssetSounds.map((a) => (
          <div key={a.instanceId} className="audio-layer-row">
            <span className="audio-layer-dot playing" />
            <span className="audio-layer-name">{a.label}</span>
            <span className="audio-layer-badge">obj</span>
          </div>
        ))}
      </div>

      <p className="panel-hint" style={{ marginTop: '16px', fontSize: '10px', opacity: 0.5 }}>
        Click anywhere on the scene to start audio
      </p>
    </div>
  )
}