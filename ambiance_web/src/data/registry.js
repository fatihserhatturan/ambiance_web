// All available backgrounds
export const BACKGROUNDS = [
  {
    id: 'forest-night',
    label: 'Forest Night',
    description: 'Misty pine forest at dusk',
    gradient: 'linear-gradient(180deg, #0a0e1a 0%, #1a2744 35%, #2d4a6e 65%, #1a3020 100%)',
    overlayColor: 'rgba(10, 14, 26, 0.3)',
    ambientSound: 'forest-night',
  },
  {
    id: 'snowy-cabin',
    label: 'Snowy Cabin',
    description: 'Winter landscape outside a cabin window',
    gradient: 'linear-gradient(180deg, #1a1f35 0%, #2d3a5e 40%, #4a5a8a 70%, #c8d8e8 100%)',
    overlayColor: 'rgba(200, 216, 232, 0.08)',
    ambientSound: 'winter-wind',
  },
  {
    id: 'rainy-city',
    label: 'Rainy City',
    description: 'City lights blurred through wet glass',
    gradient: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
    overlayColor: 'rgba(0, 10, 40, 0.4)',
    ambientSound: 'rain-city',
  },
  {
    id: 'autumn-garden',
    label: 'Autumn Garden',
    description: 'Warm golden leaves in an evening garden',
    gradient: 'linear-gradient(180deg, #1a0f05 0%, #3d1f08 30%, #7a3f10 60%, #2d1a08 100%)',
    overlayColor: 'rgba(120, 60, 10, 0.15)',
    ambientSound: 'autumn-wind',
  },
]

// All available scene assets
export const SCENE_ASSETS = [
  {
    id: 'fireplace',
    label: 'Fireplace',
    description: 'Crackling stone fireplace',
    icon: '🔥',
    category: 'warmth',
    defaultSettings: {
      intensity: 0.8,   // flame intensity 0-1
      size: 1.0,        // scale multiplier
      sound: true,
    },
    hasSound: true,
    soundId: 'fireplace-crackle',
  },
  {
    id: 'candle',
    label: 'Candle',
    description: 'Flickering wax candle',
    icon: '🕯️',
    category: 'warmth',
    defaultSettings: {
      intensity: 0.7,
      size: 0.8,
      sound: false,
    },
    hasSound: false,
  },
  {
    id: 'rain-window',
    label: 'Rain on Glass',
    description: 'Raindrops sliding down the window',
    icon: '🌧️',
    category: 'weather',
    defaultSettings: {
      intensity: 0.6,
      sound: true,
    },
    hasSound: true,
    soundId: 'rain-window',
  },
]

// Audio tracks / ambient sounds
export const AUDIO_TRACKS = [
  { id: 'forest-night', label: 'Forest Night', icon: '🌲' },
  { id: 'winter-wind', label: 'Winter Wind', icon: '❄️' },
  { id: 'rain-city', label: 'City Rain', icon: '🌆' },
  { id: 'autumn-wind', label: 'Autumn Wind', icon: '🍂' },
  { id: 'fireplace-crackle', label: 'Fireplace Crackle', icon: '🔥' },
  { id: 'rain-window', label: 'Rain on Window', icon: '💧' },
]