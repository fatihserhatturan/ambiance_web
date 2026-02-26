import SceneCanvas from './components/Scene/SceneCanvas'
import Sidebar from './components/UI/Sidebar'
import './App.css'

export default function App() {
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