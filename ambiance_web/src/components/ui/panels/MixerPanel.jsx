import { useState, useEffect, useRef } from 'react'
import { useSceneStore } from '../../../store/sceneStore'
import { BACKGROUNDS, AUDIO_TRACKS } from '../../../data/registry'
import { audioEngine } from '../../../audio/AudioEngine'

const SOUND_ICON = Object.fromEntries(AUDIO_TRACKS.map((t) => [t.id, t.icon]))

// ─── VU Bars ─────────────────────────────────────────────────────────────
// Polls AudioEngine's analyser every 150ms and drives CSS animations.
function VUBars({ soundId, bars = 6 }) {
  const [active, setActive] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const lvl = soundId === '__master__'
        ? audioEngine.getMasterLevel()
        : audioEngine.getChannelLevel(soundId)
      setActive(lvl > 0.008)
    }, 150)
    return () => clearInterval(intervalRef.current)
  }, [soundId])

  return (
    <div className={`vu-bars ${active ? 'active' : ''}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <div key={i} className={`vu-bar vu-bar-${i + 1}`} />
      ))}
    </div>
  )
}

// ─── Channel Strip ────────────────────────────────────────────────────────
function ChannelStrip({ soundId, label, icon, badge, badgeType, isMaster = false }) {
  const channelVolumes   = useSceneStore((s) => s.channelVolumes)
  const audioVolume      = useSceneStore((s) => s.audioVolume)
  const audioMuted       = useSceneStore((s) => s.audioMuted)
  const setChannelVolume = useSceneStore((s) => s.setChannelVolume)
  const setAudioVolume   = useSceneStore((s) => s.setAudioVolume)
  const toggleMute       = useSceneStore((s) => s.toggleMute)

  const [channelMuted, setChannelMuted] = useState(false)
  const prevVolRef = useRef(1)

  const handleChannelMute = () => {
    if (isMaster) {
      toggleMute()
      return
    }
    if (channelMuted) {
      setChannelVolume(soundId, prevVolRef.current)
      setChannelMuted(false)
    } else {
      prevVolRef.current = channelVolumes[soundId] ?? 1
      setChannelVolume(soundId, 0)
      setChannelMuted(true)
    }
  }

  const isMuted = isMaster ? audioMuted : channelMuted
  const volume  = isMaster ? audioVolume : (channelVolumes[soundId] ?? 1)

  const handleVolumeChange = (val) => {
    if (isMaster) {
      setAudioVolume(val)
    } else {
      if (channelMuted && val > 0) setChannelMuted(false)
      setChannelVolume(soundId, val)
    }
  }

  return (
    <div className={`mixer-channel ${isMaster ? 'mixer-master' : ''} ${isMuted ? 'muted' : ''}`}>
      <div className="mixer-channel-header">
        <span className="mixer-channel-icon">{icon}</span>
        <span className="mixer-channel-name">{label}</span>
        {badge && (
          <span className={`mixer-channel-badge badge-${badgeType}`}>{badge}</span>
        )}
      </div>

      <div className="mixer-channel-controls">
        <button
          className={`mixer-mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleChannelMute}
          title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <VUBars soundId={isMaster ? '__master__' : soundId} />

        <input
          type="range" min={0} max={1} step={0.01}
          value={isMuted && isMaster ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="mixer-slider"
        />

        <span className="mixer-vol-label">
          {isMuted ? '—' : `${Math.round(volume * 100)}%`}
        </span>
      </div>
    </div>
  )
}

// ─── Mixer Panel ──────────────────────────────────────────────────────────
export default function MixerPanel() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)

  const activeBg = BACKGROUNDS.find((b) => b.id === activeBackground)
  const bgIcon   = activeBg ? (SOUND_ICON[activeBg.ambientSound] || '🌿') : '🌿'

  const activeAssets = sceneAssets.filter(
    (a) => a.hasSound && a.settings?.sound !== false
  )

  return (
    <div className="panel-section mixer-panel">
      <div className="mixer-section-label">Master</div>
      <ChannelStrip
        soundId="__master__"
        label="Master"
        icon="🎛️"
        isMaster
      />

      <div className="mixer-section-label" style={{ marginTop: 20 }}>Kanallar</div>

      {activeBg && (
        <ChannelStrip
          soundId={activeBg.ambientSound}
          label={activeBg.label}
          icon={bgIcon}
          badge="zemin"
          badgeType="background"
        />
      )}

      {activeAssets.map((asset) => (
        <ChannelStrip
          key={asset.instanceId}
          soundId={asset.soundId}
          label={asset.label}
          icon={asset.icon}
          badge="nesne"
          badgeType="asset"
        />
      ))}

      {activeAssets.length === 0 && (
        <p className="mixer-empty">
          Nesneler panelinden ses nesnesi ekle
        </p>
      )}

      <p className="panel-hint" style={{ marginTop: 20, fontSize: '10px' }}>
        Sesi başlatmak için sahneye tıkla
      </p>
    </div>
  )
}
