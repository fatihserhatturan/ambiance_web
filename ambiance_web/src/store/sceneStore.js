import { create } from 'zustand'
import { SCENE_ASSETS, BACKGROUNDS } from '../data/registry'

// ─── Preset persistence ────────────────────────────────────────────────────

function loadSavedPresets() {
  try {
    const saved = localStorage.getItem('ambiance-presets')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function savePresetsToStorage(presets) {
  try {
    localStorage.setItem('ambiance-presets', JSON.stringify(presets))
  } catch {
    // localStorage unavailable — silently skip
  }
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useSceneStore = create((set, get) => ({
  // Active background
  activeBackground: 'forest-night',

  // Active assets placed in the scene
  sceneAssets: [],

  // Global audio settings
  audioVolume: 0.6,
  audioMuted: false,

  // Per-channel volumes: soundId → 0-1
  // Persists across asset add/remove so volume is remembered
  channelVolumes: {},

  // UI state
  sidebarOpen: true,
  activePanelTab: 'backgrounds', // 'backgrounds' | 'assets' | 'mixer' | 'presets'

  // Saved ambiance presets (persisted to localStorage)
  presets: loadSavedPresets(),

  // ── Actions ───────────────────────────────────────────────────────────

  setBackground: (id) => set({ activeBackground: id }),

  addAsset: (asset) =>
    set((state) => ({
      sceneAssets: [
        ...state.sceneAssets,
        {
          instanceId: `${asset.id}-${Date.now()}`,
          ...asset,
          position: asset.position ?? { x: 50, y: 70 },
          settings: asset.defaultSettings ?? {},
        },
      ],
    })),

  removeAsset: (instanceId) =>
    set((state) => ({
      sceneAssets: state.sceneAssets.filter((a) => a.instanceId !== instanceId),
    })),

  updateAssetSettings: (instanceId, settings) =>
    set((state) => ({
      sceneAssets: state.sceneAssets.map((a) =>
        a.instanceId === instanceId
          ? { ...a, settings: { ...a.settings, ...settings } }
          : a
      ),
    })),

  updateAssetPosition: (instanceId, position) =>
    set((state) => ({
      sceneAssets: state.sceneAssets.map((a) =>
        a.instanceId === instanceId ? { ...a, position } : a
      ),
    })),

  setAudioVolume: (vol) => set({ audioVolume: vol }),
  toggleMute: () => set((state) => ({ audioMuted: !state.audioMuted })),

  // Per-channel volume control
  setChannelVolume: (soundId, vol) =>
    set((state) => ({
      channelVolumes: { ...state.channelVolumes, [soundId]: vol },
    })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),

  // ── Preset system ──────────────────────────────────────────────────────

  savePreset: (name) => {
    const state = get()
    if (!name.trim()) return

    const bg = BACKGROUNDS.find(b => b.id === state.activeBackground)
    const preset = {
      id: `preset-${Date.now()}`,
      name: name.trim(),
      background: state.activeBackground,
      backgroundLabel: bg?.label || state.activeBackground,
      assets: state.sceneAssets.map((a) => ({
        id: a.id,
        position: { ...a.position },
        settings: { ...a.settings },
      })),
      channelVolumes: { ...state.channelVolumes },
      masterVolume: state.audioVolume,
      createdAt: Date.now(),
    }

    set((state) => {
      const newPresets = [...state.presets, preset]
      savePresetsToStorage(newPresets)
      return { presets: newPresets }
    })
  },

  loadPreset: (presetId) => {
    const state = get()
    const preset = state.presets.find((p) => p.id === presetId)
    if (!preset) return

    // Reconstruct full asset objects from registry definitions
    const reconstructedAssets = preset.assets
      .map((saved) => {
        const def = SCENE_ASSETS.find((a) => a.id === saved.id)
        if (!def) return null
        return {
          instanceId: `${saved.id}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          ...def,
          position: saved.position ?? { x: 50, y: 70 },
          settings: { ...def.defaultSettings, ...saved.settings },
        }
      })
      .filter(Boolean)

    set({
      activeBackground: preset.background,
      sceneAssets: reconstructedAssets,
      channelVolumes: preset.channelVolumes ?? {},
      audioVolume: preset.masterVolume ?? 0.6,
    })
  },

  deletePreset: (presetId) =>
    set((state) => {
      const newPresets = state.presets.filter((p) => p.id !== presetId)
      savePresetsToStorage(newPresets)
      return { presets: newPresets }
    }),
}))
