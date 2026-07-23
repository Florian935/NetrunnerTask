import { Icon } from '../../components/ui'
import type { CrateQuality } from '../../game/crates'
import { CRATE_STYLE, crateGlow } from './crateStyle'

export interface CrateIconProps {
  quality: CrateQuality
  /** Côté du coffre (px). @default 64 */
  size?: number
  /** Anticipation du rituel : le coffre « charge » (secousse + anneau). */
  charging?: boolean
  /** Grisé (stock vide / indisponible). */
  disabled?: boolean
}

/**
 * Visuel de coffre biseauté (US-034) — glow montant par qualité (`crateStyle`),
 * hachure diagonale, frange chromatique magenta pour Black ICE. Les animations
 * (secousse + anneau d'anticipation) sont pilotées par CSS et coupées en
 * `prefers-reduced-motion` (voir `cosmetics.css`).
 */
export function CrateIcon({ quality, size = 64, charging = false, disabled = false }: CrateIconProps) {
  const s = CRATE_STYLE[quality]
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {charging && !disabled && (
        <span
          aria-hidden
          className="nw-crate-ring"
          style={{
            position: 'absolute',
            inset: -6,
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px solid rgba(${s.rgb}, 0.7)`,
          }}
        />
      )}
      <span
        aria-hidden
        className={charging && !disabled ? 'nw-crate-shake' : undefined}
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'grid',
          placeItems: 'center',
          clipPath: 'var(--clip-bevel-sm)',
          background: disabled
            ? 'var(--void-900)'
            : `linear-gradient(150deg, rgba(${s.rgb}, 0.18), rgba(${s.rgb}, 0.04) 60%), var(--bg-surface)`,
          border: `1px solid rgba(${s.rgb}, ${disabled ? 0.3 : 0.6})`,
          boxShadow: disabled ? 'none' : crateGlow(quality),
          filter: disabled ? 'grayscale(0.7) brightness(0.7)' : 'none',
        }}
      >
        {/* hachure diagonale */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(-45deg, rgba(${s.rgb}, 0.4) 0, rgba(${s.rgb}, 0.4) 1.5px, transparent 1.5px, transparent 7px)`,
            opacity: disabled ? 0.12 : 0.22,
            clipPath: 'var(--clip-bevel-sm)',
          }}
        />
        {/* aberration chromatique (Black ICE) */}
        {s.chromaRgb && !disabled && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 3,
              clipPath: 'var(--clip-bevel-sm)',
              border: `1px solid rgba(${s.chromaRgb}, 0.4)`,
              mixBlendMode: 'screen',
            }}
          />
        )}
        <Icon
          name={s.icon}
          size={Math.round(size * 0.42)}
          strokeWidth={1.6}
          color={disabled ? 'var(--steel-600)' : s.color}
          style={{ filter: disabled ? 'none' : `drop-shadow(0 0 7px rgba(${s.rgb}, ${s.glow}))` }}
        />
      </span>
    </span>
  )
}
