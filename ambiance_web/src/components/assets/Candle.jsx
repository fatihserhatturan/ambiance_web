import './Candle.css'

export default function Candle({ settings = {}, style = {} }) {
  const { intensity = 0.7, size = 1.0 } = settings

  const speed    = 0.5 + intensity * 0.7
  const glowOp   = 0.15 + intensity * 0.45
  const flicker  = intensity > 0.5 ? 'candle-flicker-fast' : 'candle-flicker-slow'

  return (
    <div
      className="candle-wrap"
      style={{
        '--size': size,
        '--speed': `${speed}s`,
        '--glow-op': glowOp,
        ...style,
      }}
    >
      {/* Floor ambient glow */}
      <div className="candle-ambient" />

      <div className="candle-assembly">
        {/* Wax column */}
        <div className="candle-body">
          {/* Wax drips */}
          <div className="candle-drip drip-1" />
          <div className="candle-drip drip-2" />
          <div className="candle-drip drip-3" />

          {/* Melt pool at top */}
          <div className="candle-melt-pool" />

          {/* Wick + flame assembly */}
          <div className="candle-flame-area">
            <div className="candle-wick" />

            <div className={`candle-flame ${flicker}`}>
              {/* Outer halo */}
              <div className="cf-outer" />
              {/* Main flame */}
              <div className="cf-main" />
              {/* Bright inner core */}
              <div className="cf-core" />
              {/* White tip */}
              <div className="cf-tip" />
            </div>

            {/* Rising smoke */}
            <div className="candle-smoke smoke-1" />
            <div className="candle-smoke smoke-2" />
          </div>
        </div>

        {/* Holder */}
        <div className="candle-plate" />
      </div>
    </div>
  )
}
