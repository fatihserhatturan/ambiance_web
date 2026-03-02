import './Fan.css'

export default function Fan({ settings = {}, style = {} }) {
  const { intensity = 0.7, size = 1.0 } = settings
  // Faster spin with higher intensity
  const rotDur   = Math.max(0.18, 1.8 - intensity * 1.5)
  const blurAmt  = Math.round(intensity * 3)

  return (
    <div
      className="fan-wrap"
      style={{
        '--size':    size,
        '--rot-dur': `${rotDur}s`,
        '--blur':    `${blurAmt}px`,
        ...style,
      }}
    >
      {/* Circular housing */}
      <div className="fan-housing">
        {/* Protective grill */}
        <div className="fan-grill">
          {[...Array(9)].map((_, i) => (
            <div key={`h${i}`} className="grill-line grill-h" style={{ top: `${10 + i * 9}%` }} />
          ))}
          {[...Array(7)].map((_, i) => (
            <div key={`v${i}`} className="grill-line grill-v" style={{ left: `${10 + i * 12}%` }} />
          ))}
          <div className="grill-ring" />
        </div>

        {/* Spinning rotor */}
        <div className="fan-rotor">
          <div className="fan-blade b1" />
          <div className="fan-blade b2" />
          <div className="fan-blade b3" />
          {/* Center hub */}
          <div className="fan-hub" />
        </div>

        {/* Air-movement shimmer overlay */}
        <div className="fan-air-shimmer" />
      </div>

      {/* Neck */}
      <div className="fan-neck" />

      {/* Base */}
      <div className="fan-base">
        <div className="fan-base-detail" />
      </div>
    </div>
  )
}
