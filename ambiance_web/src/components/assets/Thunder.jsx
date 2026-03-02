import './Thunder.css'

export default function Thunder({ settings = {}, style = {} }) {
  const { intensity = 0.5, size = 1.0 } = settings
  const flashInterval = Math.max(4, 12 - intensity * 8)

  return (
    <div
      className="thunder-wrap"
      style={{
        '--size':           size,
        '--flash-interval': `${flashInterval}s`,
        ...style,
      }}
    >
      {/* Lightning bolt silhouette */}
      <div className="thunder-bolt" />

      {/* Electric glow halos */}
      <div className="thunder-glow-1" />
      <div className="thunder-glow-2" />

      {/* Flash pulse */}
      <div className="thunder-flash" />
    </div>
  )
}
