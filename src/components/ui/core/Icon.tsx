import type { CSSProperties, HTMLAttributes } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpCircle,
  BadgeCheck,
  Bell,
  BellOff,
  Bird,
  Bot,
  Box,
  Brain,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  CircleDashed,
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
  Flag,
  FlagTriangleRight,
  Flame,
  Gauge,
  GaugeCircle,
  Ghost,
  Gift,
  GitBranch,
  HelpCircle,
  Hourglass,
  Info,
  KeyRound,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Lock,
  type LucideIcon,
  Milestone,
  Minus,
  MousePointerClick,
  Orbit,
  Package,
  Palette,
  Pencil,
  Play,
  Plus,
  Radar,
  Radio,
  RadioTower,
  Save,
  ScanSearch,
  ScrollText,
  Server,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  Skull,
  Snowflake,
  Sparkles,
  Split,
  SquarePen,
  Terminal,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Undo2,
  Unlock,
  User,
  UserRound,
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
  'arrow-left-right': ArrowLeftRight,
  'arrow-right': ArrowRight,
  'arrow-up-circle': ArrowUpCircle,
  'badge-check': BadgeCheck,
  bell: Bell,
  'bell-off': BellOff,
  bird: Bird,
  bot: Bot,
  box: Box,
  brain: Brain,
  briefcase: Briefcase,
  calendar: Calendar,
  'calendar-clock': CalendarClock,
  check: Check,
  'check-check': CheckCheck,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevrons-up': ChevronsUp,
  'circle-dashed': CircleDashed,
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
  flag: Flag,
  'flag-triangle-right': FlagTriangleRight,
  flame: Flame,
  gauge: Gauge,
  'gauge-circle': GaugeCircle,
  ghost: Ghost,
  gift: Gift,
  'git-branch': GitBranch,
  'help-circle': HelpCircle,
  hourglass: Hourglass,
  info: Info,
  'key-round': KeyRound,
  landmark: Landmark,
  'layout-dashboard': LayoutDashboard,
  'list-checks': ListChecks,
  lock: Lock,
  milestone: Milestone,
  minus: Minus,
  'mouse-pointer-click': MousePointerClick,
  orbit: Orbit,
  package: Package,
  palette: Palette,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  radar: Radar,
  radio: Radio,
  'radio-tower': RadioTower,
  save: Save,
  'scan-search': ScanSearch,
  'scroll-text': ScrollText,
  server: Server,
  'share-2': Share2,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  shirt: Shirt,
  skull: Skull,
  snowflake: Snowflake,
  sparkles: Sparkles,
  split: Split,
  'square-pen': SquarePen,
  terminal: Terminal,
  timer: Timer,
  'trash-2': Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'triangle-alert': TriangleAlert,
  'undo-2': Undo2,
  unlock: Unlock,
  user: User,
  'user-round': UserRound,
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
