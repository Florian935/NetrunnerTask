import { COR_CYAN_RGB, COR_RGB, prefersReducedMotion } from './corruptionStyle'
import './corruption.css'

export interface GlitchTextProps {
  text: string
  /** Taille de police (px). */
  size?: number
  /** Couleur du texte principal (les fantômes restent magenta/cyan). */
  color?: string
  /** Interlettrage. */
  letterSpacing?: string
  weight?: number
  /** Anime le décalage RGB (ignoré si reduced-motion). */
  animated?: boolean
}

/**
 * Texte à **décalage RGB** (aberration chromatique) — la signature typographique
 * de la corruption. Deux calques fantômes (magenta / cyan) décalés derrière le
 * texte net. Statique et lisible en `prefers-reduced-motion` (les fantômes
 * restent, sans animation). Primitive réutilisable de la feature corruption.
 */
export function GlitchText({
  text,
  size = 32,
  color = 'var(--frost-100, #eaf6ff)',
  letterSpacing = '0.08em',
  weight = 800,
  animated = true,
}: GlitchTextProps) {
  const live = animated && !prefersReducedMotion()
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: weight,
    fontSize: size,
    letterSpacing,
    whiteSpace: 'nowrap',
  }
  const ghost: React.CSSProperties = {
    ...base,
    position: 'absolute',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
  }
  return (
    <span
      className={live ? 'nw-cor-anim' : undefined}
      style={{
        ...base,
        position: 'relative',
        display: 'inline-block',
        color,
        animation: live ? 'nw-cor-skew 2.8s steps(3) infinite' : 'none',
      }}
    >
      <span
        aria-hidden
        style={{ ...ghost, color: `rgba(${COR_RGB}, 0.85)`, transform: 'translate(2px, 0)', animation: live ? 'nw-cor-shift-a 1.7s steps(2) infinite' : 'none' }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{ ...ghost, color: `rgba(${COR_CYAN_RGB}, 0.7)`, transform: 'translate(-2px, 0)', animation: live ? 'nw-cor-shift-b 1.9s steps(2) infinite' : 'none' }}
      >
        {text}
      </span>
      <span style={{ position: 'relative' }}>{text}</span>
    </span>
  )
}
