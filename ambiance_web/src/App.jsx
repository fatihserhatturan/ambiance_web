import SceneCanvas from './components/scene/SceneCanvas'
import Sidebar from './components/ui/Sidebar'
import { useAudioManager } from './hooks/useAudioManager'
import './App.css'

export default function App() {
  useAudioManager()

  return (
    <div className="app-shell">
      {/* Main scene viewport */}
      <main className="scene-viewport">
        <SceneCanvas />
      </main>

      {/* Customization sidebar */}
      <Sidebar />
    </div>
  )
}