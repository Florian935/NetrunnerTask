import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type BadgeTone =
  | 'cyan'
  | 'magenta'
  | 'mint'
  | 'violet'
  | 'amber'
  | 'red'
  | 'neutral'

const TONES: Record<BadgeTone, { c: string; g: string }> = {
  cyan: { c: 'var(--cyan-500)', g: 'var(--cyan-glow)' },
  magenta: { c: 'var(--magenta-500)', g: 'var(--magenta-glow)' },
  mint: { c: 'var(--mint-500)', g: 'rgba(46,255,194,.5)' },
  violet: { c: 'var(--violet-500)', g: 'var(--violet-glow)' },
  amber: { c: 'var(--amber-500)', g: 'rgba(255,176,32,.5)' },
  red: { c: 'var(--red-500)', g: 'rgba(255,46,91,.5)' },
  neutral: { c: 'var(--steel-400)', g: 'transparent' },
}

export interface BadgeProps {
  children?: ReactNode
  /** @default "cyan" */
  tone?: BadgeTone
  /** Rempli au lieu de contour teinté. @default false */
  solid?: boolean
  /** Ajoute un halo néon. @default false */
  glow?: boolean
  style?: CSSProperties
}

/** Petite pastille de statut en capitales : NEW, HOT, BETA, compteurs, statuts. */
export function Badge({
  children,
  tone = 'cyan',
  solid = false,
  glow = false,
  style = {},
  ...rest
}: BadgeProps & Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeProps>) {
  const t = TONES[tone] || TONES.cyan
  const pulseable: Partial<Record<BadgeTone, boolean>> = {
    cyan: true,
    magenta: true,
    mint: true,
    violet: true,
  }
  return (
    <span
      className={glow && pulseable[tone] ? `nw-pulse-${tone}` : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        lineHeight: 1.4,
        borderRadius: 'var(--radius-pill)',
        color: solid ? 'var(--void-900)' : t.c,
        background: solid ? t.c : `color-mix(in srgb, ${t.c} 14%, transparent)`,
        border: `1px solid ${solid ? 'transparent' : `color-mix(in srgb, ${t.c} 45%, transparent)`}`,
        boxShadow: glow ? `0 0 10px ${t.g}` : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
