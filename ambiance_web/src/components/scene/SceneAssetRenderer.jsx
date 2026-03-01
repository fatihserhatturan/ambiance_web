import { useRef, useState } from 'react'
import { useSceneStore } from '../../store/sceneStore'
import { ASSET_COMPONENTS } from '../assets'
import './SceneAssetRenderer.css'

export default function SceneAssetRenderer({ asset }) {
  const updatePosition = useSceneStore((s) => s.updateAssetPosition)
  const removeAsset = useSceneStore((s) => s.removeAsset)

  const [dragging, setDragging] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const dragStart = useRef(null)

  const AssetComponent = ASSET_COMPONENTS[asset.id]
  if (!AssetComponent) return null

  // --- Drag to reposition ---
  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    const parent = e.currentTarget.closest('.layer-objects')
    const rect = parent.getBoundingClientRect()
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: asset.position.x,
      origY: asset.position.y,
      pw: rect.width,
      ph: rect.height,
    }
    const onMove = (me) => {
      const ds = dragStart.current
      const dx = ((me.clientX - ds.startX) / ds.pw) * 100
      const dy = ((me.clientY - ds.startY) / ds.ph) * 100
      updatePosition(asset.instanceId, {
        x: Math.max(5, Math.min(95, ds.origX + dx)),
        y: Math.max(5, Math.min(95, ds.origY + dy)),
      })
    }
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      className={`asset-wrapper ${dragging ? 'dragging' : ''} ${showControls ? 'show-controls' : ''}`}
      style={{
        left: `${asset.position.x}%`,
        top: `${asset.position.y}%`,
        transform: 'translate(-50%, -100%)',
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Controls tooltip */}
      <div className="asset-controls">
        <div className="asset-label">{asset.label}</div>
        <button className="asset-remove-btn" onClick={() => removeAsset(asset.instanceId)} title="Remove">
          ✕
        </button>
      </div>

      {/* Drag handle */}
      <div className="asset-drag-handle" onMouseDown={handleMouseDown} title="Drag to reposition">
        <span className="drag-icon">⠿</span>
      </div>

      {/* The actual asset */}
      <AssetComponent settings={asset.settings} />
    </div>
  )
}