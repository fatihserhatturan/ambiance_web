import { useSceneStore } from '../../../store/sceneStore'
import { BACKGROUNDS, BG_GROUPS } from '../../../data/registry'

export default function BackgroundsPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const setBackground    = useSceneStore((s) => s.setBackground)

  return (
    <div className="panel-section">
      <p className="panel-hint">Pencerenden görüntüyü seç</p>

      {BG_GROUPS.map((group) => {
        const bgs = BACKGROUNDS.filter((b) => b.group === group.key)
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
