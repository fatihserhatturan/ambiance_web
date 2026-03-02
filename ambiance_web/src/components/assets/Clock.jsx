import './Clock.css'
import { useState, useEffect } from 'react'

export default function Clock({ settings = {}, style = {} }) {
  const { size = 1.0 } = settings
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const sec = now.getSeconds()
  const min = now.getMinutes()
  const hr  = now.getHours() % 12

  const secDeg  = sec  *  6
  const minDeg  = min  *  6 + sec  * 0.1
  const hourDeg = hr   * 30 + min  * 0.5

  // Tick: second hand snaps with a slight overshoot via CSS
  const secTransition = sec === 0
    ? 'none'
    : 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'

  return (
    <div className="clock-wrap" style={{ '--size': size, ...style }}>
      {/* Wooden outer frame */}
      <div className="clock-frame" />

      {/* Clock face */}
      <div className="clock-face">
        {/* Hour markers (12 positions) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`clock-mark ${i % 3 === 0 ? 'major' : 'minor'}`}
            style={{ '--deg': `${i * 30}deg` }}
          />
        ))}

        {/* Roman numerals at cardinal points */}
        {[
          { label: 'XII', deg:   0 },
          { label: 'III', deg:  90 },
          { label: 'VI',  deg: 180 },
          { label: 'IX',  deg: 270 },
        ].map(({ label, deg }) => (
          <div key={label} className="clock-numeral" style={{ '--deg': `${deg}deg` }}>
            {label}
          </div>
        ))}

        {/* Hour hand */}
        <div
          className="clock-hand hour-hand"
          style={{ transform: `rotate(${hourDeg}deg)`, transition: 'transform 0.5s ease' }}
        />

        {/* Minute hand */}
        <div
          className="clock-hand min-hand"
          style={{ transform: `rotate(${minDeg}deg)`, transition: 'transform 0.5s ease' }}
        />

        {/* Second hand */}
        <div
          className="clock-hand sec-hand"
          style={{ transform: `rotate(${secDeg}deg)`, transition: secTransition }}
        />

        {/* Center cap */}
        <div className="clock-center" />
      </div>
    </div>
  )
}
