import { Icon } from '../../components/ui'
import { COR_COLOR, COR_CYAN_RGB, COR_RGB, prefersReducedMotion } from './corruptionStyle'
import './corruption.css'

const HEX = 'polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'

export interface GlitchMarkProps {
  size?: number
  /** Glyphe lucide au centre (kebab-case). */
  glyph?: string
  animated?: boolean
}

/**
 * Marque de l'entité corrompue : hexagone glitché à halo magenta + glyphe. Deux
 * bordures fantômes (magenta/cyan) décalées = aberration chromatique. Statique
 * en reduced-motion. Primitive de la feature corruption (avatars/en-têtes du
 * reveal).
 */
export function GlitchMark({ size = 96, glyph = 'skull', animated = true }: GlitchMarkProps) {
  const live = animated && !prefersReducedMotion()
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-grid', placeItems: 'center' }}>
      <span aria-hidden style={{ position: 'absolute', inset: -10, clipPath: HEX, background: `radial-gradient(circle, rgba(${COR_RGB}, 0.4), transparent 70%)`, filter: 'blur(3px)' }} />
      <span
        aria-hidden
        className={live ? 'nw-cor-anim' : undefined}
        style={{ position: 'absolute', inset: 4, clipPath: HEX, border: `2px solid rgba(${COR_RGB}, 0.85)`, transform: 'translate(2px, 0)', mixBlendMode: 'screen', animation: live ? 'nw-cor-shift-a 1.7s steps(2) infinite' : 'none' }}
      />
      <span aria-hidden style={{ position: 'absolute', inset: 4, clipPath: HEX, border: `2px solid rgba(${COR_CYAN_RGB}, 0.55)`, transform: 'translate(-2px, 0)', mixBlendMode: 'screen' }} />
      <span style={{ position: 'absolute', inset: 0, clipPath: HEX, background: `linear-gradient(150deg, rgba(${COR_RGB}, 0.24), var(--void-900))`, boxShadow: `0 0 26px rgba(${COR_RGB}, 0.6)` }} />
      <span aria-hidden style={{ position: 'absolute', inset: 4, clipPath: HEX, background: 'var(--grid-lines)', backgroundSize: '13px 13px', opacity: 0.3 }} />
      <span
        className={live ? 'nw-cor-anim' : undefined}
        style={{ position: 'relative', color: COR_COLOR, filter: `drop-shadow(0 0 8px rgba(${COR_RGB}, 1))`, animation: live ? 'nw-cor-skew 2.6s steps(3) infinite' : 'none', display: 'inline-flex' }}
      >
        <Icon name={glyph} size={Math.round(size * 0.42)} />
      </span>
    </span>
  )
}
