import type { CSSProperties, HTMLAttributes } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Box,
  Brain,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  Clock,
  Coffee,
  Coins,
  CornerDownLeft,
  Cpu,
  Crosshair,
  Crown,
  Database,
  Download,
  Dumbbell,
  Filter,
  Flame,
  Gauge,
  Ghost,
  Info,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Lock,
  type LucideIcon,
  Minus,
  Package,
  Play,
  Plus,
  Radar,
  Radio,
  RadioTower,
  Save,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Snowflake,
  Split,
  SquarePen,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Undo2,
  Unlock,
  User,
  X,
  XCircle,
  Zap,
} from 'lucide-react'

/**
 * Registre statique des icônes Lucide réellement utilisées par l'application.
 *
 * On n'utilise volontairement PAS le chargement dynamique de lucide-react :
 * il éclate les ~1600 icônes en autant de chunks, tous précachés par la PWA
 * (~2,2 Mo). Le registre statique est tree-shaké → bundle léger, précache
 * réduit, fonctionnement hors-ligne garanti.
 *
 * Pour ajouter une icône : l'importer ci-dessus et l'enregistrer ici sous son
 * nom kebab-case (celui exposé par l'API `name` du composant Icon).
 */
const REGISTRY: Record<string, LucideIcon> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  bell: Bell,
  'bell-off': BellOff,
  box: Box,
  brain: Brain,
  briefcase: Briefcase,
  calendar: Calendar,
  'calendar-clock': CalendarClock,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevrons-up': ChevronsUp,
  clock: Clock,
  coffee: Coffee,
  coins: Coins,
  'corner-down-left': CornerDownLeft,
  cpu: Cpu,
  crosshair: Crosshair,
  crown: Crown,
  database: Database,
  download: Download,
  dumbbell: Dumbbell,
  filter: Filter,
  flame: Flame,
  gauge: Gauge,
  ghost: Ghost,
  info: Info,
  'key-round': KeyRound,
  'layout-dashboard': LayoutDashboard,
  'list-checks': ListChecks,
  lock: Lock,
  minus: Minus,
  package: Package,
  play: Play,
  plus: Plus,
  radar: Radar,
  radio: Radio,
  'radio-tower': RadioTower,
  save: Save,
  'share-2': Share2,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  skull: Skull,
  snowflake: Snowflake,
  split: Split,
  'square-pen': SquarePen,
  terminal: Terminal,
  'trash-2': Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'triangle-alert': TriangleAlert,
  'undo-2': Undo2,
  unlock: Unlock,
  user: User,
  x: X,
  'x-circle': XCircle,
  zap: Zap,
}

export interface IconProps {
  /** Nom d'icône Lucide en kebab-case (ex. "zap", "shield-alert"). */
  name: string
  /** Taille en pixels. @default 18 */
  size?: number
  /** @default 2 */
  strokeWidth?: number
  /** @default "currentColor" */
  color?: string
  style?: CSSProperties
}

/**
 * Icône ligne du set Lucide (iconographie fine du design system NIGHTWIRE).
 * Portée sur `lucide-react` (chargement local, hors-ligne) au lieu du CDN
 * d'origine ; l'API `name` en kebab-case est conservée. Un nom absent du
 * registre ne rend rien (pas d'erreur).
 */
export function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  color = 'currentColor',
  style = {},
  ...rest
}: IconProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof IconProps>) {
  const Glyph = REGISTRY[name]
  return (
    <span
      aria-hidden="true"
      style={{ display: 'inline-flex', color, lineHeight: 0, ...style }}
      {...rest}
    >
      {Glyph && <Glyph size={size} strokeWidth={strokeWidth} />}
    </span>
  )
}
