import { useState } from 'react'
import { useSceneStore } from '../../../store/sceneStore'
import { BACKGROUNDS, SCENE_ASSETS } from '../../../data/registry'

export default function PresetsPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)
  const presets          = useSceneStore((s) => s.presets)
  const savePreset       = useSceneStore((s) => s.savePreset)
  const loadPreset       = useSceneStore((s) => s.loadPreset)
  const deletePreset     = useSceneStore((s) => s.deletePreset)

  const [presetName, setPresetName]       = useState('')
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

  const presetSummary = (preset) => {
    const bg = BACKGROUNDS.find((b) => b.id === preset.background)
    const bgLabel = bg?.label || preset.background
    if (!preset.assets?.length) return bgLabel
    const assetLabels = preset.assets
      .slice(0, 2)
      .map((a) => SCENE_ASSETS.find((s) => s.id === a.id)?.label || a.id)
    const rest = preset.assets.length > 2 ? ` +${preset.assets.length - 2}` : ''
    return `${bgLabel} · ${assetLabels.join(', ')}${rest}`
  }

  return (
    <div className="panel-section">
      <p className="panel-hint">Ambiyansı kaydet ve yükle</p>

      <div className="preset-current-card">
        <span className="preset-current-label">Şu anki ambiyans</span>
        <span className="preset-current-bg">
          {activeBg?.label || activeBackground}
        </span>
        {sceneAssets.length > 0 && (
          <span className="preset-current-assets">
            {sceneAssets.map((a) => a.icon).join(' ')} {sceneAssets.length} nesne
          </span>
        )}
      </div>

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
