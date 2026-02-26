import './Fireplace.css'

export default function Fireplace({ settings = {}, style = {} }) {
  const { intensity = 0.8, size = 1.0 } = settings

  // Flame speed & glow driven by intensity
  const speed = 0.4 + intensity * 0.8
  const glowOpacity = 0.2 + intensity * 0.5
  const flameCount = Math.round(3 + intensity * 4)

  return (
    <div
      className="fireplace-wrap"
      style={{
        '--size': size,
        '--speed': `${speed}s`,
        '--glow-opacity': glowOpacity,
        ...style,
      }}
    >
      {/* Stone frame */}
      <div className="fireplace-frame">
        {/* Glow bloom on floor */}
        <div className="fireplace-floor-glow" />

        {/* Firebox */}
        <div className="fireplace-box">
          {/* Ember bed */}
          <div className="ember-bed">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="ember" style={{ '--i': i }} />
            ))}
          </div>

          {/* Flame layers */}
          <div className="flames">
            {[...Array(flameCount)].map((_, i) => (
              <div
                key={i}
                className="flame"
                style={{ '--fi': i, '--ftotal': flameCount }}
              />
            ))}
          </div>

          {/* Heat shimmer overlay */}
          <div className="heat-shimmer" />
        </div>

        {/* Mantel shelf */}
        <div className="fireplace-mantel" />
      </div>

      {/* Ambient floor glow cast outward */}
      <div className="ambient-glow" />
    </div>
  )
}