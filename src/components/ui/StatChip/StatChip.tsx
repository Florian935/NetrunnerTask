import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './StatChip.css'

export type StatKind =
  | 'xp'
  | 'credits'
  | 'rep'
  | 'level'
  | 'streak'
  | 'neutral'
export type StatLayout = 'stack' | 'inline'

const KIND: Record<StatKind, string> = {
  xp: 'var(--nt-xp)',
  credits: 'var(--nt-credits)',
  rep: 'var(--nt-rep)',
  level: 'var(--accent)',
  streak: 'var(--status-success)',
  neutral: 'var(--text-strong)',
}

export interface StatChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  kind?: StatKind
  label?: string
  value: ReactNode
  layout?: StatLayout
  /** Force une couleur (sinon dérivée de `kind`). */
  color?: string
}

/** Lecture compacte d'une stat HUD — point + label + valeur. */
export function StatChip({
  kind = 'neutral',
  label,
  value,
  layout = 'stack',
  color,
  className = '',
  ...rest
}: StatChipProps) {
  const c = color ?? KIND[kind] ?? KIND.neutral
  const cls = [
    'nt-stat',
    layout === 'inline' ? 'nt-stat--inline' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const vars = { '--_c': c } as CSSProperties
  return (
    <span className={cls} style={vars} {...rest}>
      <span className="nt-stat__dot" />
      <span className="nt-stat__body">
        {label && <span className="nt-stat__label">{label}</span>}
        <span className="nt-stat__value">{value}</span>
      </span>
    </span>
  )
}
