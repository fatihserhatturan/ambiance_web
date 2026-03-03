/**
 * Thin wrapper around Lucide React icons.
 * Accepts a `name` string matching an entry in the MAP below.
 * Tree-shakeable — only the icons listed here are bundled.
 */
import {
  AudioLines, Bird, Bookmark, Check, ChevronLeft, ChevronRight,
  Clock, CloudDrizzle, CloudRain, Coffee, Flame, Layers, Leaf,
  LayoutGrid, Minus, Mountain, Music2, Plus, Radio,
  Save, SlidersHorizontal, Snowflake, TreePine, Volume2,
  VolumeX, Waves, Wind, X, Zap,
} from 'lucide-react'

const MAP = {
  AudioLines, Bird, Bookmark, Check, ChevronLeft, ChevronRight,
  Clock, CloudDrizzle, CloudRain, Coffee, Flame, Layers, Leaf,
  LayoutGrid, Minus, Mountain, Music2, Plus, Radio,
  Save, SlidersHorizontal, Snowflake, TreePine, Volume2,
  VolumeX, Waves, Wind, X, Zap,
}

export default function Icon({ name, size = 15, strokeWidth = 1.5, className, style }) {
  const LucideIcon = MAP[name]
  if (!LucideIcon) return null
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} style={style} />
}
