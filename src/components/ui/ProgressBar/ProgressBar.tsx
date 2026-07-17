import type { CSSProperties, HTMLAttributes } from 'react'
import './ProgressBar.css'

export type ProgressVariant =
  | 'xp'
  | 'rep'
  | 'credits'
  | 'streak'
  | 'level'
  | 'danger'
export type ProgressSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ProgressVariant, { c: string; g: string }> = {
  xp: { c: 'var(--nt-xp)', g: 'var(--nt-cyan-glow)' },
  rep: { c: 'var(--nt-rep)', g: 'var(--nt-magenta-glow)' },
  credits: { c: 'var(--nt-credits)', g: 'var(--rarity-legendary-glow)' },
  streak: { c: 'var(--status-success)', g: 'rgba(157,255,60,.4)' },
  level: { c: 'var(--accent)', g: 'var(--nt-cyan-glow)' },
  danger: { c: 'var(--status-danger)', g: 'rgba(255,77,94,.4)' },
}

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value?: number
  max?: number
  variant?: ProgressVariant
  label?: string
  showValue?: boolean
  /** Remplace l'affichage « value / max ». */
  valueLabel?: string
  size?: ProgressSize
  /** Force une couleur (sinon dérivée du variant). */
  color?: string
}

/** Jauge de progression (niveau / réputation / série). Remplissage lumineux. */
export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'level',
  label,
  showValue = true,
  valueLabel,
  size = 'md',
  color,
  className = '',
  ...rest
}: ProgressBarProps) {
  const v = VARIANT[variant] ?? VARIANT.level
  const c = color ?? v.c
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const h = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px'
  const vars = { '--_c': c, '--_g': v.g, '--_h': h } as CSSProperties
  return (
    <div
      className={['nt-prog', className].filter(Boolean).join(' ')}
      style={vars}
      {...rest}
    >
      {(label || showValue) && (
        <div className="nt-prog__top">
          {label && <span className="nt-prog__label">{label}</span>}
          {showValue && (
            <span className="nt-prog__val">
              {valueLabel ?? `${value} / ${max}`}
            </span>
          )}
        </div>
      )}
      <div
        className="nt-prog__track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="nt-prog__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
