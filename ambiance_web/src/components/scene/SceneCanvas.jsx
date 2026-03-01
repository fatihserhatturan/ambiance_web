import { useSceneStore } from '../../store/sceneStore'
import { BACKGROUNDS } from '../../data/registry'
import BackgroundDetails from '../backgrounds/BackgroundDetails'
import SceneAssetRenderer from './SceneAssetRenderer'
import './SceneCanvas.css'

export default function SceneCanvas() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets = useSceneStore((s) => s.sceneAssets)

  const bg = BACKGROUNDS.find((b) => b.id === activeBackground) ?? BACKGROUNDS[0]

  return (
    <div className="scene-root">
      {/* === LAYER 1: Sky / Background scene (visible through window) === */}
      <div
        className="scene-layer layer-background"
        style={{ background: bg.gradient }}
      >
        <BackgroundDetails bgId={activeBackground} />
      </div>

      {/* === LAYER 2: Room frame — walls, ceiling, floor, window frame === */}
      <div className="scene-layer layer-room">
        <RoomFrame />
      </div>

      {/* === LAYER 3: Scene objects / placed assets === */}
      <div className="scene-layer layer-objects">
        {sceneAssets.map((asset) => (
          <SceneAssetRenderer key={asset.instanceId} asset={asset} />
        ))}
      </div>

      {/* === LAYER 4: Atmospheric overlay (only tints the outdoor scene) === */}
      <div
        className="scene-layer layer-overlay"
        style={{ background: bg.overlayColor }}
      />

      {/* === LAYER 5: Window glass reflection === */}
      <div className="scene-layer layer-glass" />

      {/* === LAYER 6: Room depth & vignette === */}
      <div className="scene-layer layer-vignette" />
    </div>
  )
}

// ─── Room Frame ──────────────────────────────────────────────────────────
// Interior room with floor-to-ceiling panoramic window.
// Window opening: x 20%→80%, y 9%→90%
function RoomFrame() {
  return (
    <div className="room">
      <div className="room-ceiling" />
      <div className="room-wall-left" />
      <div className="room-wall-right" />
      <div className="room-floor" />

      <div className="room-trim-h room-trim-top" />
      <div className="room-trim-h room-trim-bottom" />
      <div className="room-trim-v room-trim-left" />
      <div className="room-trim-v room-trim-right" />

      <div className="win-div win-div-v1" />
      <div className="win-div win-div-v2" />
      <div className="win-div win-div-h" />
    </div>
  )
}
