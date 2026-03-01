// Background-specific decorative details.
// CSS classes are defined in SceneCanvas.css (imported by SceneCanvas).

// ─── Forest Night ──────────────────────────────────────────────────────────
function ForestNight() {
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
function SnowyDabin() {
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
function RainyCity() {
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
function AutumnGarden() {
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
function OceanCoast() {
  return (
    <>
      <div className="detail-ocean-horizon" />
      <div className="detail-ocean-water" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="detail-wave" style={{
          animationDelay: `${i * 1.4}s`,
          bottom: `${8 + i * 6}%`,
          opacity: 0.6 - i * 0.15,
        }} />
      ))}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="detail-sea-foam" style={{
          left: `${(i * 43.7) % 90}%`,
          bottom: `${6 + (i % 3) * 3}%`,
          animationDelay: `${(i * 0.6) % 3}s`,
          width: `${30 + (i % 4) * 15}px`,
        }} />
      ))}
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
function Thunderstorm() {
  return (
    <>
      <div className="detail-storm-clouds" />
      <div className="detail-city-lights" style={{ opacity: 0.35 }} />
      {[...Array(55)].map((_, i) => (
        <div key={i} className="detail-raindrop detail-raindrop-heavy" style={{
          left: `${(i * 29.7) % 100}%`,
          animationDuration: `${0.28 + (i % 4) * 0.06}s`,
          animationDelay: `${(i * 0.05) % 0.6}s`,
          height: `${12 + (i % 5) * 5}px`,
          opacity: 0.55 + (i % 3) * 0.1,
        }} />
      ))}
      <div className="detail-lightning-flash" />
    </>
  )
}

// ─── Coffee Shop ─────────────────────────────────────────────────────────
function CoffeeShop() {
  return (
    <>
      <div className="detail-cafe-window-rain" />
      <div className="detail-cafe-lights" />
      <div className="detail-cafe-steam" />
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
function MountainPeak() {
  return (
    <>
      <div className="detail-mountain-range" />
      <div className="detail-mountain-snow" />
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
      <div className="detail-milky-way" />
    </>
  )
}

// ─── Japanese Garden ─────────────────────────────────────────────────────
function JapaneseGarden() {
  return (
    <>
      <div className="detail-garden-ground" />
      <div className="detail-bamboo-grove" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="detail-petal" style={{
          left: `${(i * 57.9) % 85 + 5}%`,
          animationDuration: `${10 + (i % 6) * 3}s`,
          animationDelay: `${(i * 1.1) % 8}s`,
          fontSize: `${8 + (i % 3) * 4}px`,
        }} />
      ))}
      <div className="detail-lantern" />
    </>
  )
}

// ─── Deep Forest ─────────────────────────────────────────────────────────
function DeepForest() {
  return (
    <>
      <div className="detail-deep-canopy" />
      <div className="detail-deep-ground" />
      {[...Array(16)].map((_, i) => (
        <div key={i} className="detail-spore" style={{
          left: `${(i * 67.3) % 90 + 5}%`,
          top:  `${(i * 43.7) % 70 + 10}%`,
          animationDuration: `${5 + (i % 4) * 2}s`,
          animationDelay: `${(i * 0.6) % 4}s`,
        }} />
      ))}
      <div className="detail-forest-mist" />
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
