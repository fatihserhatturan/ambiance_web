import { create } from 'zustand'

export const useSceneStore = create((set) => ({
  // Active background
  activeBackground: 'forest-night',

  // Active assets placed in the scene (id, position, settings)
  sceneAssets: [],

  // Global audio settings
  audioVolume: 0.6,
  audioMuted: false,

  // UI state
  sidebarOpen: true,
  activePanelTab: 'backgrounds', // 'backgrounds' | 'assets' | 'audio'

  // Actions
  setBackground: (id) => set({ activeBackground: id }),

  addAsset: (asset) =>
    set((state) => ({
      sceneAssets: [
        ...state.sceneAssets,
        {
          instanceId: `${asset.id}-${Date.now()}`,
          ...asset,
          position: asset.position ?? { x: 50, y: 70 }, // % based
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
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
}))