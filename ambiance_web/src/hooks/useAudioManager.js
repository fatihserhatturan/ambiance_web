import { useEffect, useRef } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { audioEngine } from '../audio/AudioEngine'

/**
 * Connects the Zustand scene store to the AudioEngine.
 * Mount once in App — listens to background, assets, volume, and mute changes.
 */
export function useAudioManager() {
  const activeBackground = useSceneStore((s) => s.activeBackground)
  const sceneAssets      = useSceneStore((s) => s.sceneAssets)
  const audioVolume      = useSceneStore((s) => s.audioVolume)
  const audioMuted       = useSceneStore((s) => s.audioMuted)

  const started   = useRef(false)
  const prevBg    = useRef(null)
  const prevAssets = useRef([])

  // ── Start on first user interaction (browser autoplay policy) ──────────
  useEffect(() => {
    const start = () => {
      if (started.current) return
      started.current = true
      audioEngine.playAmbient(activeBackground)
      prevBg.current = activeBackground
    }
    // Any click or keypress will trigger
    document.addEventListener('click',   start, { once: true })
    document.addEventListener('keydown', start, { once: true })
    return () => {
      document.removeEventListener('click',   start)
      document.removeEventListener('keydown', start)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Background change ──────────────────────────────────────────────────
  useEffect(() => {
    if (!started.current) return
    if (prevBg.current === activeBackground) return
    prevBg.current = activeBackground
    audioEngine.playAmbient(activeBackground)
  }, [activeBackground])

  // ── Asset sound lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    if (!started.current) return

    const prev = prevAssets.current
    const curr = sceneAssets

    // Assets added → start their sound
    curr.forEach((asset) => {
      if (!asset.hasSound || !asset.soundId) return
      if (asset.settings?.sound === false) return
      const wasHere = prev.some((a) => a.instanceId === asset.instanceId)
      if (!wasHere) audioEngine.playAssetSound(asset.soundId)
    })

    // Assets removed → stop their sound
    prev.forEach((asset) => {
      if (!asset.hasSound || !asset.soundId) return
      const stillHere = curr.some((a) => a.instanceId === asset.instanceId)
      if (!stillHere) audioEngine.stopAssetSound(asset.soundId)
    })

    prevAssets.current = curr
  }, [sceneAssets])

  // ── Volume ────────────────────────────────────────────────────────────
  useEffect(() => {
    audioEngine.setVolume(audioVolume)
  }, [audioVolume])

  // ── Mute ──────────────────────────────────────────────────────────────
  useEffect(() => {
    audioEngine.setMute(audioMuted)
  }, [audioMuted])
}