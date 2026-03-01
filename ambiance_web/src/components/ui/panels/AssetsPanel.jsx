import { useSceneStore } from '../../../store/sceneStore'
import { SCENE_ASSETS, ASSET_GROUPS } from '../../../data/registry'

export default function AssetsPanel() {
  const sceneAssets         = useSceneStore((s) => s.sceneAssets)
  const addAsset            = useSceneStore((s) => s.addAsset)
  const removeAsset         = useSceneStore((s) => s.removeAsset)
  const updateAssetSettings = useSceneStore((s) => s.updateAssetSettings)

  const isActive    = (id) => sceneAssets.some((a) => a.id === id)
  const getInstance = (id) => sceneAssets.find((a) => a.id === id)

  const toggleAsset = (assetDef) => {
    if (isActive(assetDef.id)) {
      const inst = getInstance(assetDef.id)
      if (inst) removeAsset(inst.instanceId)
    } else {
      addAsset(assetDef)
    }
  }

  return (
    <div className="panel-section">
      <p className="panel-hint">Sahneye ses nesneleri ekle</p>

      {ASSET_GROUPS.map((group) => {
        const assets = SCENE_ASSETS.filter((a) => a.category === group.key)
        if (!assets.length) return null
        return (
          <div key={group.key} className="asset-group">
            <span className="asset-group-label">
              <span className="asset-group-icon">{group.icon}</span>
              {group.label}
            </span>

            <div className="asset-list">
              {assets.map((assetDef) => {
                const active   = isActive(assetDef.id)
                const instance = getInstance(assetDef.id)
                return (
                  <div
                    key={assetDef.id}
                    className={`asset-card ${active ? 'active' : ''}`}
                  >
                    <div className="asset-card-header">
                      <span className="asset-icon">{assetDef.icon}</span>
                      <div className="asset-info">
                        <span className="asset-name">{assetDef.label}</span>
                        <span className="asset-desc">{assetDef.description}</span>
                      </div>
                      <button
                        className={`asset-toggle ${active ? 'on' : 'off'}`}
                        onClick={() => toggleAsset(assetDef)}
                      >
                        {active ? 'Kaldır' : 'Ekle'}
                      </button>
                    </div>

                    {active && instance && (
                      <div className="asset-settings">
                        <label className="setting-row">
                          <span>Yoğunluk</span>
                          <input
                            type="range" min={0} max={1} step={0.05}
                            value={instance.settings.intensity ?? 0.7}
                            onChange={(e) => updateAssetSettings(instance.instanceId, {
                              intensity: parseFloat(e.target.value)
                            })}
                          />
                          <span className="setting-val">
                            {Math.round((instance.settings.intensity ?? 0.7) * 100)}%
                          </span>
                        </label>
                        {instance.settings.size !== undefined && (
                          <label className="setting-row">
                            <span>Boyut</span>
                            <input
                              type="range" min={0.5} max={2} step={0.05}
                              value={instance.settings.size ?? 1}
                              onChange={(e) => updateAssetSettings(instance.instanceId, {
                                size: parseFloat(e.target.value)
                              })}
                            />
                            <span className="setting-val">
                              {Math.round((instance.settings.size ?? 1) * 100)}%
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
