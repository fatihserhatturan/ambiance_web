import './Vacuum.css'

export default function Vacuum({ settings = {}, style = {} }) {
  const { intensity = 0.65, size = 1.0 } = settings

  // Faster vibration / more glow with higher intensity
  const vibDur    = Math.max(0.06, 0.14 - intensity * 0.07)
  const glowAlpha = (0.18 + intensity * 0.28).toFixed(2)

  return (
    <div
      className="vac-wrap"
      style={{
        '--size':      size,
        '--vib-dur':   `${vibDur}s`,
        '--glow':      glowAlpha,
        ...style,
      }}
    >
      {/* Handle tube */}
      <div className="vac-handle">
        <div className="vac-handle-grip" />
      </div>

      {/* Body — main canister */}
      <div className="vac-body">
        {/* Power indicator LED */}
        <div className="vac-led" />

        {/* Dust compartment window */}
        <div className="vac-window">
          <div className="vac-dust" />
        </div>

        {/* Brand stripe */}
        <div className="vac-stripe" />
      </div>

      {/* Hose connector */}
      <div className="vac-connector" />

      {/* Cleaning head */}
      <div className="vac-head">
        {/* Rotating brush indicator */}
        <div className="vac-brush-indicator" />
        {/* Suction slot */}
        <div className="vac-slot" />
        {/* Wheels */}
        <div className="vac-wheel vac-wheel-l" />
        <div className="vac-wheel vac-wheel-r" />
      </div>

      {/* Floor glow — suction effect */}
      <div className="vac-floor-glow" />
    </div>
  )
}
