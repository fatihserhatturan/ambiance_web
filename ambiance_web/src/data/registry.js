// ─── Backgrounds ──────────────────────────────────────────────────────────
// Her sahne: gradient (görsel), overlayColor (atmosfer), ambientSound (ses ID)

export const BACKGROUNDS = [

  // ── Doğa / Gece ──────────────────────────────────────────────────────

  {
    id: 'forest-night',
    label: 'Orman Gecesi',
    description: 'Puslu çam ormanı, cırcır böcekleri',
    gradient: 'linear-gradient(180deg, #050a14 0%, #0e1e38 35%, #1a3420 65%, #0d1a0d 100%)',
    overlayColor: 'rgba(8, 12, 22, 0.32)',
    ambientSound: 'forest-night',
    group: 'nature',
  },
  {
    id: 'deep-forest',
    label: 'Derin Orman',
    description: 'Antik yağmur ormanı, sis ve gölge',
    gradient: 'linear-gradient(180deg, #020806 0%, #061410 30%, #0e2416 60%, #0a1c10 100%)',
    overlayColor: 'rgba(2, 10, 5, 0.40)',
    ambientSound: 'deep-forest',
    group: 'nature',
  },
  {
    id: 'japanese-garden',
    label: 'Japon Bahçesi',
    description: 'Bambu korusu, rüzgar çanları, dinginlik',
    gradient: 'linear-gradient(180deg, #040c08 0%, #0c1e14 30%, #14302a 65%, #1a2a1e 100%)',
    overlayColor: 'rgba(0, 18, 10, 0.28)',
    ambientSound: 'japanese-garden',
    group: 'nature',
  },

  // ── Hava / Mevsim ────────────────────────────────────────────────────

  {
    id: 'snowy-cabin',
    label: 'Karlı Kabin',
    description: 'Kış manzarası, kabin penceresi',
    gradient: 'linear-gradient(180deg, #0e1428 0%, #1e2a4a 40%, #2e3e6e 70%, #aabccc 100%)',
    overlayColor: 'rgba(180, 200, 220, 0.07)',
    ambientSound: 'winter-wind',
    group: 'weather',
  },
  {
    id: 'rainy-city',
    label: 'Yağmurlu Şehir',
    description: 'Islak camdan şehir ışıkları',
    gradient: 'linear-gradient(180deg, #080808 0%, #141428 40%, #101830 70%, #0a2444 100%)',
    overlayColor: 'rgba(0, 8, 36, 0.42)',
    ambientSound: 'rain-city',
    group: 'weather',
  },
  {
    id: 'autumn-garden',
    label: 'Sonbahar Bahçesi',
    description: 'Altın yapraklar, akşam esintisi',
    gradient: 'linear-gradient(180deg, #140a02 0%, #321606 30%, #663210 60%, #261406 100%)',
    overlayColor: 'rgba(100, 50, 8, 0.16)',
    ambientSound: 'autumn-wind',
    group: 'weather',
  },
  {
    id: 'thunderstorm',
    label: 'Gök Gürültüsü',
    description: 'Fırtına, şimşek, sağanak yağmur',
    gradient: 'linear-gradient(180deg, #06060e 0%, #10101e 30%, #181428 60%, #101820 100%)',
    overlayColor: 'rgba(15, 8, 35, 0.48)',
    ambientSound: 'thunderstorm',
    group: 'weather',
  },

  // ── Manzara ──────────────────────────────────────────────────────────

  {
    id: 'ocean-coast',
    label: 'Okyanus Kıyısı',
    description: 'Şafakta kaya kıyısı, kırılan dalgalar',
    gradient: 'linear-gradient(180deg, #080e1c 0%, #0e2242 35%, #145678 65%, #1a6e60 100%)',
    overlayColor: 'rgba(0, 22, 50, 0.26)',
    ambientSound: 'ocean-coast',
    group: 'landscape',
  },
  {
    id: 'mountain-peak',
    label: 'Dağ Zirvesi',
    description: 'Alp yaylası, alacakaranlık, ince hava',
    gradient: 'linear-gradient(180deg, #04060e 0%, #0c1428 35%, #162240 65%, #2a1c38 100%)',
    overlayColor: 'rgba(8, 16, 44, 0.32)',
    ambientSound: 'mountain-peak',
    group: 'landscape',
  },

  // ── İç Mekan ─────────────────────────────────────────────────────────

  {
    id: 'coffee-shop',
    label: 'Kafe Köşesi',
    description: 'Sıcak kafe, yağmurlu gün, fısıltılar',
    gradient: 'linear-gradient(180deg, #140a04 0%, #2e1606 30%, #563010 60%, #3c2008 100%)',
    overlayColor: 'rgba(60, 30, 0, 0.20)',
    ambientSound: 'coffee-shop',
    group: 'indoor',
  },
]

// ─── UI Grouping Metadata ──────────────────────────────────────────────────
// Background grupları — BACKGROUNDS[].group alanıyla eşleşir
export const BG_GROUPS = [
  { key: 'nature',    label: 'Doğa & Gece' },
  { key: 'weather',   label: 'Hava & Mevsim' },
  { key: 'landscape', label: 'Manzara' },
  { key: 'indoor',    label: 'İç Mekan' },
]

// Asset kategorileri — SCENE_ASSETS[].category alanıyla eşleşir
export const ASSET_GROUPS = [
  { key: 'warmth',   label: 'Sıcaklık', icon: '🔥' },
  { key: 'weather',  label: 'Hava',     icon: '🌧️' },
  { key: 'nature',   label: 'Doğa',     icon: '🌿' },
  { key: 'ambiance', label: 'Ortam',    icon: '🎶' },
]

// ─── Scene Assets ─────────────────────────────────────────────────────────
// Sahneye eklenebilir nesneler; bazılarının ses katmanı vardır.

export const SCENE_ASSETS = [

  // ── Sıcaklık ──────────────────────────────────────────────────────────

  {
    id: 'fireplace',
    label: 'Şömine',
    description: 'Taş şömine, odun çatırtısı',
    icon: '🔥',
    category: 'warmth',
    categoryLabel: 'Sıcaklık',
    defaultSettings: { intensity: 0.8, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'fireplace-crackle',
  },
  {
    id: 'candle',
    label: 'Mum',
    description: 'Titrek balmumu mum',
    icon: '🕯️',
    category: 'warmth',
    categoryLabel: 'Sıcaklık',
    defaultSettings: { intensity: 0.7, size: 0.8, sound: false },
    hasSound: false,
  },

  // ── Hava ──────────────────────────────────────────────────────────────

  {
    id: 'rain-window',
    label: 'Yağmur / Cam',
    description: 'Pencereden süzülen yağmur damlacıkları',
    icon: '🌧️',
    category: 'weather',
    categoryLabel: 'Hava',
    defaultSettings: { intensity: 0.6, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'rain-window',
  },
  {
    id: 'thunder',
    label: 'Gök Gürültüsü',
    description: 'Düşük, yuvarlanarak gelen gürültü',
    icon: '⛈️',
    category: 'weather',
    categoryLabel: 'Hava',
    defaultSettings: { intensity: 0.5, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'thunder-rumble',
  },

  // ── Doğa ──────────────────────────────────────────────────────────────

  {
    id: 'stream',
    label: 'Dere',
    description: 'Akan dağ deresi, çakıl taşları',
    icon: '🏞️',
    category: 'nature',
    categoryLabel: 'Doğa',
    defaultSettings: { intensity: 0.65, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'stream-water',
  },
  {
    id: 'birds',
    label: 'Kuş Sesleri',
    description: 'Orman kuşları, sabah korosu',
    icon: '🐦',
    category: 'nature',
    categoryLabel: 'Doğa',
    defaultSettings: { intensity: 0.55, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'forest-birds',
  },
  {
    id: 'wind-chimes',
    label: 'Rüzgar Çanı',
    description: 'Kristal rüzgar çanları, yumuşak tınılar',
    icon: '🎐',
    category: 'nature',
    categoryLabel: 'Doğa',
    defaultSettings: { intensity: 0.5, size: 0.9, sound: true },
    hasSound: true,
    soundId: 'wind-chimes',
  },

  // ── Ortam ─────────────────────────────────────────────────────────────

  {
    id: 'fan',
    label: 'Vantilatör',
    description: 'Elektrik vantilatör, sakin uğultu',
    icon: '🌀',
    category: 'ambiance',
    categoryLabel: 'Ortam',
    defaultSettings: { intensity: 0.6, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'desk-fan',
  },
  {
    id: 'clock',
    label: 'Duvar Saati',
    description: 'Ritimli tik-tak, mekanik ses',
    icon: '🕰️',
    category: 'ambiance',
    categoryLabel: 'Ortam',
    defaultSettings: { intensity: 0.7, size: 1.0, sound: true },
    hasSound: true,
    soundId: 'clock-ticking',
  },
]

// ─── Audio Tracks reference list ──────────────────────────────────────────

export const AUDIO_TRACKS = [
  // Ambient backgrounds
  { id: 'forest-night',   label: 'Orman Gecesi',       icon: '🌲' },
  { id: 'deep-forest',    label: 'Derin Orman',         icon: '🌳' },
  { id: 'japanese-garden',label: 'Japon Bahçesi',       icon: '🎋' },
  { id: 'winter-wind',    label: 'Kış Rüzgarı',         icon: '❄️' },
  { id: 'rain-city',      label: 'Yağmurlu Şehir',      icon: '🌆' },
  { id: 'autumn-wind',    label: 'Sonbahar Esintisi',   icon: '🍂' },
  { id: 'thunderstorm',   label: 'Gök Gürültüsü',       icon: '⛈️' },
  { id: 'ocean-coast',    label: 'Okyanus Kıyısı',      icon: '🌊' },
  { id: 'mountain-peak',  label: 'Dağ Zirvesi',         icon: '⛰️' },
  { id: 'coffee-shop',    label: 'Kafe',                icon: '☕' },
  // Asset sounds
  { id: 'fireplace-crackle', label: 'Şömine Çatırtısı', icon: '🔥' },
  { id: 'rain-window',    label: 'Cam Yağmuru',          icon: '💧' },
  { id: 'thunder-rumble', label: 'Gök Gürültüsü',        icon: '⛈️' },
  { id: 'stream-water',   label: 'Dere Suyu',            icon: '🏞️' },
  { id: 'wind-chimes',    label: 'Rüzgar Çanı',          icon: '🎐' },
  { id: 'forest-birds',   label: 'Orman Kuşları',        icon: '🐦' },
  { id: 'desk-fan',       label: 'Vantilatör',           icon: '🌀' },
  { id: 'clock-ticking',  label: 'Duvar Saati',          icon: '🕰️' },
]
