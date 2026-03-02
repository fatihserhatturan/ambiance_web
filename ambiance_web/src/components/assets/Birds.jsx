import './Birds.css'
import { useMemo } from 'react'

export default function Birds({ settings = {}, style = {} }) {
  const { intensity = 0.5, size = 1.0 } = settings
  const count = Math.round(3 + intensity * 4)

  // Each bird: position, drift timing, relative scale
  const birds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      top:   `${18 + (i * 23.7) % 48}%`,
      left:  `${8  + (i * 39.3) % 55}%`,
      scale: 0.45 + (i % 4) * 0.18,
      flapDur:   `${0.45 + (i % 3) * 0.12}s`,
      driftDur:  `${9    + (i % 5) * 2}s`,
      driftDelay:`${(i * 1.7) % 5}s`,
      flapDelay: `${(i * 0.4) % 0.5}s`,
    })),
    [count]
  )

  return (
    <div className="birds-wrap" style={{ '--size': size, ...style }}>
      {birds.map((b, i) => (
        <div
          key={i}
          className="bird"
          style={{
            top:              b.top,
            left:             b.left,
            '--bird-scale':   b.scale,
            animationDuration:  b.driftDur,
            animationDelay:     b.driftDelay,
          }}
        >
          {/* Left wing */}
          <div
            className="bird-wing bird-wing-l"
            style={{ animationDuration: b.flapDur, animationDelay: b.flapDelay }}
          />
          {/* Body dot */}
          <div className="bird-body-dot" />
          {/* Right wing */}
          <div
            className="bird-wing bird-wing-r"
            style={{ animationDuration: b.flapDur, animationDelay: b.flapDelay }}
          />
        </div>
      ))}
    </div>
  )
}
