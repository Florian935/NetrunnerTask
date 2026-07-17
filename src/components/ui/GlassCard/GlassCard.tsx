import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './GlassCard.css'

export type GlassGlow = 'teal' | 'violet' | 'magenta'

// Glows contenus (alpha modéré) : le halo doit rester un liseré de bord,
// pas un lavage de couleur sur l'intérieur translucide.
const GLOW: Record<GlassGlow, { c: string; g1: string; g2: string }> = {
  teal: {
    c: 'var(--accent)',
    g1: 'rgba(47,229,207,.30)',
    g2: 'rgba(47,229,207,.12)',
  },
  violet: {
    c: 'var(--nt-violet-500)',
    g1: 'rgba(198,87,255,.30)',
    g2: 'rgba(198,87,255,.12)',
  },
  magenta: {
    c: 'var(--nt-magenta-500)',
    g1: 'rgba(255,77,141,.30)',
    g2: 'rgba(255,77,141,.12)',
  },
}

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Teinte du halo néon. */
  glow?: GlassGlow
  /** Coins arrondis au lieu du chanfrein + halo. */
  rounded?: boolean
  /** Affiche les équerres HUD (coins). */
  brackets?: boolean
  children?: ReactNode
}

/**
 * Panneau en verre dépoli — la surface de base. Look V2 : coins chanfreinés +
 * halo néon en drop-shadow (suit le chanfrein, jamais rogné). `rounded` remplace
 * le chanfrein par des coins doux. Équerres HUD optionnelles.
 */
export function GlassCard({
  glow = 'teal',
  rounded = false,
  brackets = false,
  className = '',
  style,
  children,
  ...rest
}: GlassCardProps) {
  const g = GLOW[glow] ?? GLOW.teal
  const cls = [
    'nt-glasscard',
    rounded ? 'nt-glasscard--rounded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const vars = {
    '--_c': g.c,
    '--_g1': g.g1,
    '--_g2': g.g2,
    ...style,
  } as CSSProperties
  return (
    <div className={cls} style={vars} {...rest}>
      {brackets && (
        <span className="nt-glasscard__brk">
          <i className="tl" />
          <i className="br" />
        </span>
      )}
      {children}
    </div>
  )
}
