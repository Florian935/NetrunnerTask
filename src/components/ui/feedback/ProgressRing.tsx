import type { CSSProperties, ReactNode } from 'react'
import type { ProgressAccent } from './ProgressBar'

const ACCENTS: Record<ProgressAccent, string> = {
  cyan: 'var(--cyan-500)',
  magenta: 'var(--magenta-500)',
  mint: 'var(--mint-500)',
  violet: 'var(--violet-500)',
  gradient: 'var(--grad-primary)',
}

export interface ProgressRingProps {
  /** Diamètre extérieur en px. @default 140 */
  size?: number
  /** Épaisseur du trait de l'anneau en px. @default 6 */
  stroke?: number
  /** Progression 0-100. */
  pct?: number
  /** Couleur du trait de progression — token/accent ou couleur CSS. @default "cyan" */
  accent?: ProgressAccent | string
  /** Couleur de la piste de fond. @default piste cyan translucide */
  track?: string
  /**
   * Ajoute un balayage « radar » cosmétique (secteur tournant) au centre.
   * Coupé automatiquement sous `prefers-reduced-motion` (classe `nw-ring-scan`).
   * @default false
   */
  scan?: boolean
  /** Teinte RGB du balayage (ex. "0,240,255"). @default cyan */
  scanRgb?: string
  /** Contenu centré (chrono, libellé, icône). */
  children?: ReactNode
  style?: CSSProperties
}

/**
 * Anneau de progression déterminé (SVG) avec balayage « scan » optionnel —
 * variante circulaire de `ProgressBar`, néon NIGHTWIRE. Purement présentation :
 * `pct` pilote le remplissage, `children` occupe le centre. Le balayage
 * s'appuie sur la classe DS `.nw-ring-scan` (thème `base.css`), donc respecte
 * `prefers-reduced-motion` sans code JS.
 */
export function ProgressRing({
  size = 140,
  stroke = 6,
  pct = 0,
  accent = 'cyan',
  track = 'rgba(0,240,255,.12)',
  scan = false,
  scanRgb = '0,240,255',
  children,
  style = {},
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - clamped / 100)
  const color = ACCENTS[accent as ProgressAccent] || accent

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      {scan && (
        <span
          className="nw-ring-scan"
          aria-hidden
          style={{
            position: 'absolute',
            inset: stroke + 3,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(${scanRgb},.30) 34deg, transparent 62deg)`,
            WebkitMask: 'radial-gradient(circle, transparent 34%, #000 35%)',
            mask: 'radial-gradient(circle, transparent 34%, #000 35%)',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'relative', overflow: 'visible' }}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: 'stroke-dashoffset var(--dur-med) var(--ease-out)',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
