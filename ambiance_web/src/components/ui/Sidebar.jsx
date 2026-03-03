import { ChevronLeft, ChevronRight, LayoutGrid, Layers, SlidersHorizontal, Bookmark } from 'lucide-react'
import { useSceneStore } from '../../store/sceneStore'
import BackgroundsPanel from './panels/BackgroundsPanel'
import AssetsPanel      from './panels/AssetsPanel'
import MixerPanel       from './panels/MixerPanel'
import PresetsPanel     from './panels/PresetsPanel'
import './Sidebar.css'

const TABS = [
  { id: 'backgrounds', label: 'Sahneler',  Icon: LayoutGrid },
  { id: 'assets',      label: 'Nesneler',  Icon: Layers },
  { id: 'mixer',       label: 'Mikser',    Icon: SlidersHorizontal },
  { id: 'presets',     label: 'Presetler', Icon: Bookmark },
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
  const ToggleIcon  = sidebarOpen ? ChevronRight : ChevronLeft

  return (
    <>
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Kapat' : 'Aç'}
      >
        <ToggleIcon size={13} strokeWidth={2} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">ambiance</span>
          <span className="sidebar-subtitle">studio</span>
        </div>

        <nav className="sidebar-tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`sidebar-tab ${activePanelTab === id ? 'active' : ''}`}
              onClick={() => setActivePanelTab(id)}
            >
              <span className="tab-icon">
                <Icon size={15} strokeWidth={1.5} />
              </span>
              <span className="tab-label">{label}</span>
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
