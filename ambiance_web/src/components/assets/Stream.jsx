import './Stream.css'

export default function Stream({ settings = {}, style = {} }) {
  const { intensity = 0.7, size = 1.0 } = settings
  const speed = 0.6 + intensity * 1.0

  return (
    <div
      className="stream-wrap"
      style={{ '--size': size, '--speed': `${speed}s`, ...style }}
    >
      {/* Rocky banks */}
      <div className="stream-bank-left" />
      <div className="stream-bank-right" />

      {/* Water body */}
      <div className="stream-water">
        {/* Flowing current layers */}
        <div className="stream-current c1" />
        <div className="stream-current c2" />
        <div className="stream-current c3" />

        {/* Horizontal surface shimmer */}
        <div className="stream-surface" />

        {/* Expanding ripples */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="stream-ripple"
            style={{
              left: `${14 + (i * 39.7) % 72}%`,
              top:  `${18 + (i * 27.3) % 64}%`,
              animationDelay:    `${(i * 0.62) % 2.5}s`,
              animationDuration: `${1.4 + (i % 3) * 0.5}s`,
            }}
          />
        ))}

        {/* Foam patches */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="stream-foam"
            style={{
              left: `${8 + (i * 57.3) % 84}%`,
              top:  `${25 + (i * 33.7) % 50}%`,
              animationDelay: `${(i * 0.8) % 2}s`,
            }}
          />
        ))}

        {/* Light caustic reflections */}
        <div className="stream-caustics" />
      </div>

      {/* Pebbles on the bed */}
      <div className="stream-pebbles" />
    </div>
  )
}
