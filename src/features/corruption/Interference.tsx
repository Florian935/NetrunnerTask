import { COR_CYAN_RGB, COR_RGB, prefersReducedMotion } from './corruptionStyle'
import './corruption.css'

export interface InterferenceProps {
  /** Intensité 0..1 (léger = ambiance continue ; fort = pacte). */
  level?: number
  /** Anime (barre de scan, grain, blocs). Ignoré si reduced-motion. */
  animated?: boolean
  /** Ajoute les blocs de glitch (les tranches qui sautent). */
  blocks?: boolean
}

/**
 * Interférence ambiante de la corruption : scanlines renforcées + grain magenta
 * + vignette + barre de scan + blocs de glitch. `level` pilote l'intensité (une
 * ambiance légère reste supportable en continu ; le pacte monte à 1). Overlay
 * décoratif absolu (`aria-hidden`), à placer dans un conteneur `position:
 * relative; overflow: hidden`. Neutralisé en reduced-motion.
 */
export function Interference({ level = 1, animated = true, blocks = true }: InterferenceProps) {
  const live = animated && !prefersReducedMotion()
  return (
    <span
      aria-hidden
      className={live ? 'nw-cor-anim' : undefined}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}
    >
      {/* scanlines renforcées */}
      <span style={{ position: 'absolute', inset: 0, background: 'var(--scanlines)', opacity: 0.35 + level * 0.35, mixBlendMode: 'overlay' }} />
      {/* grain magenta (dérive animée) */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(${COR_RGB}, 0.5) .5px, transparent .5px)`,
          backgroundSize: '3px 3px',
          opacity: 0.05 + level * 0.1,
          animation: live ? 'nw-cor-noise 1.4s steps(3) infinite' : 'none',
        }}
      />
      {/* vignette magenta */}
      <span style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(${COR_RGB}, ${0.08 + level * 0.14}) 100%)` }} />
      {live && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(180deg, transparent, rgba(${COR_RGB}, ${0.05 + level * 0.12}), transparent)`,
            animation: `nw-cor-scanfast ${(2.6 - level).toFixed(1)}s linear infinite`,
          }}
        />
      )}
      {live && blocks && (
        <span style={{ position: 'absolute', inset: 0, background: `rgba(${COR_RGB}, 0.14)`, mixBlendMode: 'screen', animation: 'nw-cor-block 3.4s steps(2) infinite' }} />
      )}
      {live && blocks && (
        <span style={{ position: 'absolute', inset: 0, background: `rgba(${COR_CYAN_RGB}, 0.1)`, mixBlendMode: 'screen', animation: 'nw-cor-block 4.7s steps(2) 0.8s infinite' }} />
      )}
    </span>
  )
}
