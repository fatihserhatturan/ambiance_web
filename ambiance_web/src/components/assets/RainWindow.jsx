import './RainWindow.css'
import { useMemo } from 'react'

export default function RainWindow({ settings = {}, style = {} }) {
  const { intensity = 0.7, size = 1.0 } = settings

  const drops = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      left:     `${(i * 37.3) % 82 + 6}%`,
      top:      `${(i * 23.7) % 38 + 8}%`,
      delay:    `${(i * 0.58) % 5}s`,
      dur:      `${3.5 + (i % 5) * 0.8}s`,
      w:        `${5 + (i % 5) * 2}px`,
      h:        `${6 + (i % 4) * 2}px`,
    })),
    []
  )

  const rivulets = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      left:  `${10 + (i * 53.7) % 78}%`,
      delay: `${(i * 1.1) % 5}s`,
      dur:   `${3 + (i % 4) * 1.5}s`,
      waver: i % 2 === 0 ? 'riv-waver-a' : 'riv-waver-b',
    })),
    []
  )

  return (
    <div
      className="rw-wrap"
      style={{ '--size': size, '--intensity': intensity, ...style }}
    >
      {/* Glass surface */}
      <div className="rw-glass">
        {/* Condensation fog on bottom */}
        <div className="rw-fog" />

        {/* Individual water drops */}
        {drops.map((d, i) => (
          <div
            key={i}
            className="rw-drop"
            style={{
              left: d.left,
              top: d.top,
              width: d.w,
              height: d.h,
              animationDelay: d.delay,
              animationDuration: d.dur,
            }}
          />
        ))}

        {/* Rivulets dripping down */}
        {rivulets.map((r, i) => (
          <div
            key={i}
            className={`rw-rivulet ${r.waver}`}
            style={{
              left: r.left,
              animationDelay: r.delay,
              animationDuration: r.dur,
            }}
          />
        ))}

        {/* Glass shine / reflection */}
        <div className="rw-shine" />
      </div>
    </div>
  )
}
