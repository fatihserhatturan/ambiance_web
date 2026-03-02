// Background-specific decorative details.
// CSS classes are defined in SceneCanvas.css (imported by SceneCanvas).

// ─── Forest Night ──────────────────────────────────────────────────────────
function ForestNight() {
  return (
    <>
      {/* Moon with atmospheric corona */}
      <div className="detail-moon fn-moon" />

      {/* Three-layer parallax trees */}
      <div className="fn-trees-far" />
      <div className="fn-mid-mist" />
      <div className="fn-trees-mid" />
      <div className="fn-ground-mist" />
      <div className="fn-trees-near" />

      {/* Stars — varied sizes with glow */}
      {[...Array(45)].map((_, i) => (
        <div key={i} className="detail-star fn-star" style={{
          left:              `${(Math.sin(i * 137.508) * 0.5 + 0.5) * 100}%`,
          top:               `${Math.abs(Math.cos(i * 73.1)) * 42}%`,
          width:             `${1 + (i % 4)}px`,
          height:            `${1 + (i % 4)}px`,
          opacity:           0.25 + (i % 5) * 0.15,
          animationDelay:    `${(i * 0.37) % 4.5}s`,
          animationDuration: `${1.8 + (i % 3) * 0.8}s`,
        }} />
      ))}

      {/* Fireflies */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="fn-firefly" style={{
          left:              `${20 + (i * 53.7) % 58}%`,
          top:               `${50 + (i * 37.3) % 30}%`,
          animationDelay:    `${(i * 0.73) % 3.5}s`,
          animationDuration: `${2.5 + (i % 4)}s`,
        }} />
      ))}
    </>
  )
}

// ─── Snowy Cabin ──────────────────────────────────────────────────────────
function SnowyDabin() {
  return (
    <>
      {/* Snow-covered ground with depth */}
      <div className="sc-ground" />
      <div className="sc-snowbank" />

      {/* Pine tree silhouettes */}
      <div className="sc-pines" />

      {/* CSS snowflakes (no emoji) */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="sc-snow-particle" style={{
          left:              `${(i * 47.3) % 100}%`,
          '--flake-size':    `${4 + (i % 5) * 2}px`,
          animationDuration: `${5 + (i % 6) * 1.5}s`,
          animationDelay:    `${(i * 0.48) % 5}s`,
          opacity:           0.55 + (i % 4) * 0.12,
        }} />
      ))}

      {/* Wind-blown surface drift */}
      <div className="sc-snow-drift" />
    </>
  )
}

// ─── Rainy City ──────────────────────────────────────────────────────────
function RainyCity() {
  return (
    <>
      {/* Building silhouettes */}
      <div className="rc-buildings-far" />
      <div className="rc-buildings-near" />

      {/* Street-level light puddles */}
      <div className="detail-city-lights" />
      <div className="rc-puddle-reflect" />

      {/* Angled rain streaks */}
      {[...Array(55)].map((_, i) => (
        <div key={i} className="rc-raindrop" style={{
          left:              `${(i * 37.1) % 110 - 5}%`,
          animationDuration: `${0.38 + (i % 5) * 0.08}s`,
          animationDelay:    `${(i * 0.06) % 0.8}s`,
          height:            `${10 + (i % 5) * 5}px`,
          opacity:           0.50 + (i % 4) * 0.10,
        }} />
      ))}

      {/* Neon glow bands */}
      <div className="rc-neon-glow" />
    </>
  )
}

// ─── Autumn Garden ────────────────────────────────────────────────────────
function AutumnGarden() {
  return (
    <>
      {/* Ground with layered depth */}
      <div className="ag-ground" />

      {/* Bare tree silhouettes */}
      <div className="ag-trees" />

      {/* CSS leaf shapes */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className={`ag-leaf leaf-type-${(i % 3) + 1}`} style={{
          left:              `${(i * 51.3) % 90 + 4}%`,
          animationDuration: `${7 + (i % 6) * 2}s`,
          animationDelay:    `${(i * 0.68) % 6}s`,
          '--hue':           `${18 + (i % 5) * 6}deg`,
        }} />
      ))}

      {/* Fallen leaves on ground */}
      <div className="ag-leaf-pile" />
    </>
  )
}

// ─── Ocean Coast ─────────────────────────────────────────────────────────
function OceanCoast() {
  return (
    <>
      {/* Sky-to-water horizon */}
      <div className="detail-ocean-horizon" />

      {/* Multi-layer water body */}
      <div className="detail-ocean-water" />
      <div className="oc-water-deep" />
      <div className="oc-water-mid" />

      {/* Wave layers — different speeds */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="oc-wave" style={{
          bottom:            `${6 + i * 5}%`,
          animationDelay:    `${i * 1.1}s`,
          animationDuration: `${4.5 + i * 0.8}s`,
          opacity:           0.65 - i * 0.10,
        }} />
      ))}

      {/* Sea foam */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="detail-sea-foam" style={{
          left:           `${(i * 43.7) % 88}%`,
          bottom:         `${5 + (i % 4) * 3}%`,
          animationDelay: `${(i * 0.55) % 3}s`,
          width:          `${28 + (i % 5) * 18}px`,
        }} />
      ))}

      {/* Shore mist */}
      <div className="oc-shore-mist" />

      {/* Night stars */}
      {[...Array(22)].map((_, i) => (
        <div key={i} className="detail-star" style={{
          left:              `${Math.sin(i * 113.5) * 50 + 50}%`,
          top:               `${Math.abs(Math.cos(i * 89.1)) * 32}%`,
          animationDelay:    `${(i * 0.38) % 3}s`,
          width:             `${1 + (i % 3)}px`,
          height:            `${1 + (i % 3)}px`,
          opacity:           0.3 + (i % 4) * 0.15,
        }} />
      ))}
    </>
  )
}

// ─── Thunderstorm ────────────────────────────────────────────────────────
function Thunderstorm() {
  return (
    <>
      {/* Layered storm clouds */}
      <div className="ts-clouds-far" />
      <div className="ts-clouds-near" />

      {/* Dim city glow below */}
      <div className="detail-city-lights" style={{ opacity: 0.28 }} />

      {/* Heavy diagonal rain */}
      {[...Array(70)].map((_, i) => (
        <div key={i} className="ts-raindrop" style={{
          left:              `${(i * 29.7) % 115 - 8}%`,
          animationDuration: `${0.22 + (i % 4) * 0.06}s`,
          animationDelay:    `${(i * 0.04) % 0.5}s`,
          height:            `${14 + (i % 6) * 6}px`,
          opacity:           0.50 + (i % 3) * 0.12,
        }} />
      ))}

      {/* Lightning bolt + flash */}
      <div className="ts-lightning-bolt" />
      <div className="ts-lightning-flash" />
    </>
  )
}

// ─── Coffee Shop ─────────────────────────────────────────────────────────
function CoffeeShop() {
  return (
    <>
      {/* Cafe interior warm glow */}
      <div className="cs-interior-glow" />
      <div className="detail-cafe-lights" />

      {/* Window condensation */}
      <div className="cs-window-fog" />

      {/* Multiple steam columns */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="cs-steam-col" style={{
          left:           `${28 + i * 16}%`,
          animationDelay: `${i * 0.9}s`,
        }} />
      ))}

      {/* Soft rain on window */}
      {[...Array(22)].map((_, i) => (
        <div key={i} className="detail-raindrop detail-raindrop-soft" style={{
          left:              `${(i * 41.3) % 100}%`,
          animationDuration: `${0.8 + (i % 4) * 0.18}s`,
          animationDelay:    `${(i * 0.14) % 1.2}s`,
          height:            `${6 + (i % 3) * 4}px`,
          opacity:           0.28 + (i % 3) * 0.10,
        }} />
      ))}

      {/* Cup silhouette glow */}
      <div className="cs-cup-glow" />
    </>
  )
}

// ─── Mountain Peak ───────────────────────────────────────────────────────
function MountainPeak() {
  return (
    <>
      {/* Aurora borealis */}
      <div className="mp-aurora" />
      <div className="mp-aurora-2" />

      {/* Multi-ridge mountain silhouettes */}
      <div className="mp-ridge-far" />
      <div className="mp-ridge-mid" />
      <div className="mp-ridge-near" />

      {/* Snow caps on peaks */}
      <div className="detail-mountain-snow" />

      {/* Dense starfield */}
      {[...Array(50)].map((_, i) => (
        <div key={i} className="detail-star mp-star" style={{
          left:              `${Math.sin(i * 97.3) * 50 + 50}%`,
          top:               `${Math.abs(Math.cos(i * 61.7)) * 52}%`,
          animationDelay:    `${(i * 0.24) % 3}s`,
          width:             `${1 + (i % 4)}px`,
          height:            `${1 + (i % 4)}px`,
          opacity:           0.35 + (i % 5) * 0.13,
          animationDuration: `${1.5 + (i % 4) * 0.6}s`,
        }} />
      ))}

      {/* Milky way band */}
      <div className="detail-milky-way mp-milky-way" />

      {/* Occasional shooting star */}
      <div className="mp-shooting-star" />
    </>
  )
}

// ─── Japanese Garden ─────────────────────────────────────────────────────
function JapaneseGarden() {
  return (
    <>
      {/* Garden floor */}
      <div className="detail-garden-ground" />

      {/* Pond / water reflection */}
      <div className="jg-pond" />

      {/* Bamboo grove */}
      <div className="detail-bamboo-grove" />
      <div className="jg-bamboo-leaves" />

      {/* Stone lantern with glow */}
      <div className="jg-lantern-body" />
      <div className="detail-lantern" />

      {/* CSS cherry blossom petals */}
      {[...Array(14)].map((_, i) => (
        <div key={i} className="jg-petal" style={{
          left:              `${(i * 57.9) % 85 + 5}%`,
          animationDuration: `${11 + (i % 6) * 3}s`,
          animationDelay:    `${(i * 1.05) % 9}s`,
          '--petal-hue':     `${340 + (i % 3) * 8}deg`,
          '--petal-size':    `${7 + (i % 4) * 3}px`,
        }} />
      ))}
    </>
  )
}

// ─── Deep Forest ─────────────────────────────────────────────────────────
function DeepForest() {
  return (
    <>
      {/* Multi-layer canopy */}
      <div className="df-canopy-far" />
      <div className="df-canopy-mid" />
      <div className="df-canopy-near" />

      {/* Ancient tree trunks */}
      <div className="df-trunks" />

      {/* Multiple atmospheric fog layers */}
      <div className="df-fog-low" />
      <div className="df-fog-mid" />

      {/* Bioluminescent spores */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="df-spore" style={{
          left:              `${(i * 67.3) % 88 + 6}%`,
          top:               `${(i * 43.7) % 65 + 15}%`,
          animationDuration: `${5 + (i % 5) * 2}s`,
          animationDelay:    `${(i * 0.55) % 4.5}s`,
          '--spore-color':   i % 3 === 0
            ? 'rgba(100, 220, 120, 0.85)'
            : i % 3 === 1
            ? 'rgba(80, 200, 240, 0.75)'
            : 'rgba(200, 140, 255, 0.70)',
        }} />
      ))}

      {/* Light rays through canopy */}
      <div className="df-light-rays" />
    </>
  )
}

// ─── Registry map: bgId → component ──────────────────────────────────────
const BACKGROUND_DETAILS = {
  'forest-night':    ForestNight,
  'snowy-cabin':     SnowyDabin,
  'rainy-city':      RainyCity,
  'autumn-garden':   AutumnGarden,
  'ocean-coast':     OceanCoast,
  'thunderstorm':    Thunderstorm,
  'coffee-shop':     CoffeeShop,
  'mountain-peak':   MountainPeak,
  'japanese-garden': JapaneseGarden,
  'deep-forest':     DeepForest,
}

export default function BackgroundDetails({ bgId }) {
  const Component = BACKGROUND_DETAILS[bgId]
  return Component ? <Component /> : null
}
