import './WindChimes.css'

const CHIMES = [
  { height: 72, delay: 0.00, swayDir:  1 },
  { height: 95, delay: 0.28, swayDir: -1 },
  { height: 58, delay: 0.55, swayDir:  1 },
  { height: 84, delay: 0.18, swayDir: -1 },
  { height: 66, delay: 0.42, swayDir:  1 },
]

export default function WindChimes({ settings = {}, style = {} }) {
  const { intensity = 0.5, size = 1.0 } = settings
  const swaySpeed  = 2.8 - intensity * 1.4   // slower = gentler breeze
  const swayAngle  = 5 + intensity * 9        // degrees

  return (
    <div
      className="wc-wrap"
      style={{
        '--size':       size,
        '--sway-speed': `${swaySpeed}s`,
        '--sway-angle': `${swayAngle}deg`,
        ...style,
      }}
    >
      {/* Top mounting bar */}
      <div className="wc-bar" />

      {/* Clapper cord and striker */}
      <div className="wc-clapper-cord" />
      <div className="wc-clapper-sail" />

      {/* Chime tubes */}
      <div className="wc-tubes">
        {CHIMES.map((c, i) => (
          <div
            key={i}
            className={`wc-chime-unit ${c.swayDir > 0 ? 'sway-pos' : 'sway-neg'}`}
            style={{ animationDelay: `${c.delay}s` }}
          >
            {/* String from bar to tube */}
            <div className="wc-string" />
            {/* Metallic tube */}
            <div
              className="wc-tube"
              style={{ height: `${c.height}px` }}
            />
            {/* End cap */}
            <div className="wc-cap" />
          </div>
        ))}
      </div>
    </div>
  )
}
