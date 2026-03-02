// Asset component registry — maps asset id → React component.
import Fireplace  from './Fireplace'
import Candle     from './Candle'
import RainWindow from './RainWindow'
import Thunder    from './Thunder'
import Stream     from './Stream'
import Birds      from './Birds'
import WindChimes from './WindChimes'
import Fan        from './Fan'
import Clock      from './Clock'

export const ASSET_COMPONENTS = {
  fireplace:     Fireplace,
  candle:        Candle,
  'rain-window': RainWindow,
  thunder:       Thunder,
  stream:        Stream,
  birds:         Birds,
  'wind-chimes': WindChimes,
  fan:           Fan,
  clock:         Clock,
}
