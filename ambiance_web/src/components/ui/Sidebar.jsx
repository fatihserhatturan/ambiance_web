import { useSceneStore } from '../../store/sceneStore'
import BackgroundsPanel from './panels/BackgroundsPanel'
import AssetsPanel      from './panels/AssetsPanel'
import MixerPanel       from './panels/MixerPanel'
import PresetsPanel     from './panels/PresetsPanel'
import './Sidebar.css'

const TABS = [
  { id: 'backgrounds', label: 'Sahneler',  icon: '🪟' },
  { id: 'assets',      label: 'Nesneler',  icon: '✨' },
  { id: 'mixer',       label: 'Mikser',    icon: '🎚️' },
  { id: 'presets',     label: 'Presetler', icon: '🎛️' },
]

const PANELS = {
  backgrounds: BackgroundsPanel,
  assets:      AssetsPanel,
  mixer:       MixerPanel,
  presets:     PresetsPanel,
}

export default function Sidebar() {
  const sidebarOpen       = useSceneStore((s) => s.sidebarOpen)
  const activePanelTab    = useSceneStore((s) => s.activePanelTab)
  const setSidebarOpen    = useSceneStore((s) => s.setSidebarOpen)
  const setActivePanelTab = useSceneStore((s) => s.setActivePanelTab)

  const ActivePanel = PANELS[activePanelTab]

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
          {ActivePanel && <ActivePanel />}
        </div>
      </aside>
    </>
  )
}
