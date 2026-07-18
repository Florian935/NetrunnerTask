import type { CSSProperties, HTMLAttributes } from 'react'
import {
  Activity,
  AlertTriangle,
  Briefcase,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Database,
  Dumbbell,
  Info,
  ListChecks,
  type LucideIcon,
  Plus,
  Radio,
  RadioTower,
  Save,
  ShieldAlert,
  SquarePen,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
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
  briefcase: Briefcase,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'corner-down-left': CornerDownLeft,
  database: Database,
  dumbbell: Dumbbell,
  info: Info,
  'list-checks': ListChecks,
  plus: Plus,
  radio: Radio,
  'radio-tower': RadioTower,
  save: Save,
  'shield-alert': ShieldAlert,
  'square-pen': SquarePen,
  terminal: Terminal,
  'trash-2': Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  x: X,
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
