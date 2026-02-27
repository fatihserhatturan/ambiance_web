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
  if (bgId === 'forest-night')    return <ForestDetails />
  if (bgId === 'snowy-cabin')     return <SnowyDetails />
  if (bgId === 'rainy-city')      return <RainyCityDetails />
  if (bgId === 'autumn-garden')   return <AutumnDetails />
  if (bgId === 'ocean-coast')     return <OceanDetails />
  if (bgId === 'thunderstorm')    return <ThunderstormDetails />
  if (bgId === 'coffee-shop')     return <CoffeeShopDetails />
  if (bgId === 'mountain-peak')   return <MountainDetails />
  if (bgId === 'japanese-garden') return <JapaneseGardenDetails />
  if (bgId === 'deep-forest')     return <DeepForestDetails />
  return null
}

// ─── Forest Night ──────────────────────────────────────────────────────────
function ForestDetails() {
  return (
    <>
      <div className="detail-moon" />
      <div className="detail-trees forest-trees" />
      {[...Array(30)].map((_, i) => (
        <div key={i} className="detail-star" style={{
          left: `${Math.sin(i * 137.5) * 50 + 50}%`,
          top:  `${Math.abs(Math.cos(i * 73.1)) * 40}%`,
          animationDelay: `${(i * 0.3) % 3}s`,
          width:  `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
        }} />
      ))}
    </>
  )
}

// ─── Snowy Cabin ──────────────────────────────────────────────────────────
function SnowyDetails() {
  return (
    <>
      <div className="detail-snow-ground" />
      {[...Array(22)].map((_, i) => (
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

// ─── Rainy City ──────────────────────────────────────────────────────────
function RainyCityDetails() {
  return (
    <>
      <div className="detail-city-lights" />
      {[...Array(40)].map((_, i) => (
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

// ─── Autumn Garden ────────────────────────────────────────────────────────
function AutumnDetails() {
  return (
    <>
      <div className="detail-autumn-ground" />
      {[...Array(14)].map((_, i) => (
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

// ─── Ocean Coast ─────────────────────────────────────────────────────────
function OceanDetails() {
  return (
    <>
      <div className="detail-ocean-horizon" />
      <div className="detail-ocean-water" />
      {/* Rolling wave layers */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="detail-wave" style={{
          animationDelay: `${i * 1.4}s`,
          bottom: `${8 + i * 6}%`,
          opacity: 0.6 - i * 0.15,
        }} />
      ))}
      {/* Foam streaks */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="detail-sea-foam" style={{
          left: `${(i * 43.7) % 90}%`,
          bottom: `${6 + (i % 3) * 3}%`,
          animationDelay: `${(i * 0.6) % 3}s`,
          width: `${30 + (i % 4) * 15}px`,
        }} />
      ))}
      {/* Stars on horizon */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className="detail-star" style={{
          left:  `${Math.sin(i * 113.5) * 50 + 50}%`,
          top:   `${Math.abs(Math.cos(i * 89.1)) * 30}%`,
          animationDelay: `${(i * 0.4) % 3}s`,
          width:  `${1 + (i % 2)}px`,
          height: `${1 + (i % 2)}px`,
        }} />
      ))}
    </>
  )
}

// ─── Thunderstorm ────────────────────────────────────────────────────────
function ThunderstormDetails() {
  return (
    <>
      <div className="detail-storm-clouds" />
      <div className="detail-city-lights" style={{ opacity: 0.35 }} />
      {/* Heavy rain */}
      {[...Array(55)].map((_, i) => (
        <div key={i} className="detail-raindrop detail-raindrop-heavy" style={{
          left: `${(i * 29.7) % 100}%`,
          animationDuration: `${0.28 + (i % 4) * 0.06}s`,
          animationDelay: `${(i * 0.05) % 0.6}s`,
          height: `${12 + (i % 5) * 5}px`,
          opacity: 0.55 + (i % 3) * 0.1,
        }} />
      ))}
      {/* Lightning flash elements */}
      <div className="detail-lightning-flash" />
    </>
  )
}

// ─── Coffee Shop ─────────────────────────────────────────────────────────
function CoffeeShopDetails() {
  return (
    <>
      <div className="detail-cafe-window-rain" />
      <div className="detail-cafe-lights" />
      <div className="detail-cafe-steam" />
      {/* Light rain on cafe window */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="detail-raindrop detail-raindrop-soft" style={{
          left: `${(i * 41.3) % 100}%`,
          animationDuration: `${0.7 + (i % 4) * 0.15}s`,
          animationDelay: `${(i * 0.15) % 1.2}s`,
          height: `${5 + (i % 3) * 3}px`,
          opacity: 0.3 + (i % 2) * 0.1,
        }} />
      ))}
    </>
  )
}

// ─── Mountain Peak ───────────────────────────────────────────────────────
function MountainDetails() {
  return (
    <>
      <div className="detail-mountain-range" />
      <div className="detail-mountain-snow" />
      {/* Stars — alpine sky */}
      {[...Array(40)].map((_, i) => (
        <div key={i} className="detail-star" style={{
          left:  `${Math.sin(i * 97.3) * 50 + 50}%`,
          top:   `${Math.abs(Math.cos(i * 61.7)) * 55}%`,
          animationDelay: `${(i * 0.25) % 3}s`,
          width:  `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          opacity: 0.4 + (i % 3) * 0.2,
        }} />
      ))}
      {/* Milky way band */}
      <div className="detail-milky-way" />
    </>
  )
}

// ─── Japanese Garden ─────────────────────────────────────────────────────
function JapaneseGardenDetails() {
  return (
    <>
      <div className="detail-garden-ground" />
      <div className="detail-bamboo-grove" />
      {/* Floating petals / dust motes */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="detail-petal" style={{
          left: `${(i * 57.9) % 85 + 5}%`,
          animationDuration: `${10 + (i % 6) * 3}s`,
          animationDelay: `${(i * 1.1) % 8}s`,
          fontSize: `${8 + (i % 3) * 4}px`,
        }} />
      ))}
      {/* Lantern glow */}
      <div className="detail-lantern" />
    </>
  )
}

// ─── Deep Forest ─────────────────────────────────────────────────────────
function DeepForestDetails() {
  return (
    <>
      <div className="detail-deep-canopy" />
      <div className="detail-deep-ground" />
      {/* Floating spores / firefly-like particles */}
      {[...Array(16)].map((_, i) => (
        <div key={i} className="detail-spore" style={{
          left: `${(i * 67.3) % 90 + 5}%`,
          top:  `${(i * 43.7) % 70 + 10}%`,
          animationDuration: `${5 + (i % 4) * 2}s`,
          animationDelay: `${(i * 0.6) % 4}s`,
        }} />
      ))}
      {/* Mist layers */}
      <div className="detail-forest-mist" />
    </>
  )
}

// ─── Window Frame ────────────────────────────────────────────────────────
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
