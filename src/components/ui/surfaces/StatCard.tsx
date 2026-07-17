import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export type StatCardAccent = 'cyan' | 'magenta' | 'mint' | 'violet' | 'amber' | 'red'
export type StatCardTrend = 'up' | 'down'

const TONES: Record<StatCardAccent, string> = {
  cyan: 'var(--cyan-500)',
  magenta: 'var(--magenta-500)',
  mint: 'var(--mint-500)',
  violet: 'var(--violet-500)',
  amber: 'var(--amber-500)',
  red: 'var(--red-500)',
}

export interface StatCardProps {
  label: ReactNode
  value: ReactNode
  /** Texte de delta, ex. "+12.5%". */
  delta?: ReactNode
  /** @default "up" */
  trend?: StatCardTrend
  /** Icône Lucide affichée en haut à droite. */
  icon?: string
  /** @default "cyan" */
  accent?: StatCardAccent
  style?: CSSProperties
}

/** Tuile KPI : label, grande valeur display, delta coloré, icône d'angle. */
export function StatCard({
  label,
  value,
  delta,
  trend = 'up',
  icon,
  accent = 'cyan',
  style = {},
  ...rest
}: StatCardProps & Omit<HTMLAttributes<HTMLDivElement>, keyof StatCardProps>) {
  const c = TONES[accent] || TONES.cyan
  const deltaColor = trend === 'down' ? 'var(--red-500)' : 'var(--mint-500)'
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120px 80px at 100% 0, color-mix(in srgb, ${c} 16%, transparent), transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              color: c,
              background: `color-mix(in srgb, ${c} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${c} 35%, transparent)`,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 'var(--space-2)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: deltaColor,
          }}
        >
          <Icon name={trend === 'down' ? 'trending-down' : 'trending-up'} size={14} />
          {delta}
        </div>
      )}
    </div>
  )
}
