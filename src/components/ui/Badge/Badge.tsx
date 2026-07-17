import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

export type BadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'urgent'
  | 'neutral'
export type BadgeVariant = 'soft' | 'solid' | 'outline'

const TONE: Record<BadgeTone, { c: string; t: string }> = {
  success: { c: 'var(--status-success)', t: 'var(--tint-success)' },
  warning: { c: 'var(--status-warning)', t: 'var(--tint-warning)' },
  danger: { c: 'var(--status-danger)', t: 'var(--tint-danger)' },
  info: { c: 'var(--status-info)', t: 'var(--tint-info)' },
  accent: { c: 'var(--accent)', t: 'var(--tint-accent)' },
  urgent: { c: 'var(--status-danger)', t: 'var(--tint-danger)' },
  neutral: { c: 'var(--text-muted)', t: 'var(--surface-elevated)' },
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  variant?: BadgeVariant
  /** Affiche une pastille lumineuse en tête. */
  dot?: boolean
  children?: ReactNode
}

/** Badge de statut — success / warning / danger / info / accent / neutral. */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  dot = false,
  children,
  className = '',
  style,
  ...rest
}: BadgeProps) {
  const t = TONE[tone] ?? TONE.neutral
  const cls = ['nt-badge', `nt-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ')
  const vars = { '--_c': t.c, '--_tint': t.t, ...style } as CSSProperties
  return (
    <span className={cls} style={vars} {...rest}>
      {dot && <span className="nt-badge__dot" />}
      {children}
    </span>
  )
}
