import { useSceneStore } from '../../store/sceneStore'
import { BACKGROUNDS } from '../../data/registry'
import SceneAssetRenderer from './SceneAssetRenderer'
import './SceneCanvas.css'

export default function SceneCanvas() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets = useSceneStore((s) => s.sceneAssets)

  const bg = BACKGROUNDS.find((b) => b.id === activeBackground) ?? BACKGROUNDS[0]

  return (
    <div className="scene-root">
      {/* === LAYER 0: Sky / Background gradient === */}
      <div
        className="scene-layer layer-background"
        style={{ background: bg.gradient }}
      >
        <BackgroundDetails bgId={activeBackground} />
      </div>

      {/* === LAYER 1: Window frame === */}
      <div className="scene-layer layer-window">
        <WindowFrame />
      </div>

      {/* === LAYER 2: Scene objects / placed assets === */}
      <div className="scene-layer layer-objects">
        {sceneAssets.map((asset) => (
          <SceneAssetRenderer key={asset.instanceId} asset={asset} />
        ))}
      </div>

      {/* === LAYER 3: Overlay / atmosphere === */}
      <div
        className="scene-layer layer-overlay"
        style={{ background: bg.overlayColor }}
      />

      {/* === LAYER 4: Vignette === */}
      <div className="scene-layer layer-vignette" />
    </div>
  )
}

// --- Background-specific decorative details ---
function BackgroundDetails({ bgId }) {
  if (bgId === 'forest-night') return <ForestDetails />
  if (bgId === 'snowy-cabin') return <SnowyDetails />
  if (bgId === 'rainy-city') return <RainyCityDetails />
  if (bgId === 'autumn-garden') return <AutumnDetails />
  return null
}

function ForestDetails() {
  return (
    <>
      {/* Moon */}
      <div className="detail-moon" />
      {/* Tree silhouettes */}
      <div className="detail-trees forest-trees" />
      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="detail-star" style={{
          left: `${Math.sin(i * 137.5) * 50 + 50}%`,
          top: `${Math.abs(Math.cos(i * 73.1)) * 40}%`,
          animationDelay: `${(i * 0.3) % 3}s`,
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
        }} />
      ))}
    </>
  )
}

function SnowyDetails() {
  return (
    <>
      <div className="detail-snow-ground" />
      {[...Array(20)].map((_, i) => (
        <div key={i} className="detail-snowflake" style={{
          left: `${(i * 47.3) % 100}%`,
          animationDuration: `${4 + (i % 5)}s`,
          animationDelay: `${(i * 0.5) % 4}s`,
          fontSize: `${10 + (i % 3) * 4}px`,
        }} />
      ))}
    </>
  )
}

function RainyCityDetails() {
  return (
    <>
      <div className="detail-city-lights" />
      {[...Array(35)].map((_, i) => (
        <div key={i} className="detail-raindrop" style={{
          left: `${(i * 37.1) % 100}%`,
          animationDuration: `${0.4 + (i % 5) * 0.1}s`,
          animationDelay: `${(i * 0.08) % 0.8}s`,
          height: `${8 + (i % 4) * 4}px`,
        }} />
      ))}
    </>
  )
}

function AutumnDetails() {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="detail-leaf" style={{
          left: `${(i * 51.3) % 90 + 5}%`,
          animationDuration: `${6 + (i % 5) * 2}s`,
          animationDelay: `${(i * 0.7) % 5}s`,
          fontSize: `${14 + (i % 4) * 4}px`,
        }} />
      ))}
    </>
  )
}

// --- Window frame overlay ---
function WindowFrame() {
  return (
    <div className="window-frame">
      <div className="window-pane top-left" />
      <div className="window-pane top-right" />
      <div className="window-pane bottom-left" />
      <div className="window-pane bottom-right" />
      <div className="window-cross-h" />
      <div className="window-cross-v" />
      <div className="window-sill" />
    </div>
  )
}