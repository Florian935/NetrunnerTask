import type { ReactNode } from 'react'
import { COR_HOT, COR_RGB, prefersReducedMotion } from './corruptionStyle'
import './corruption.css'

export interface OverloadRingProps {
  /** Diamètre extérieur (px). @default 210 */
  size?: number
  /** Surcharge courante 0-100. */
  gauge: number
  /** Niveau de danger 0-1 (proximité du krach) — pilote couleur/épaisseur/tremblement. */
  danger: number
  /** Krach en cours (anneau vidé, couleur brûlante). */
  krach: boolean
  /** Animations vivantes (coupé si reduced-motion). @default true */
  live?: boolean
  /** Contenu centré (dopage ×N ou « KRACH »). */
  children?: ReactNode
}

/** Magenta « froid » → magenta « brûlant » selon le danger (blanchit sous tension). */
function ringColor(danger: number): string {
  const g = Math.round(92 + (205 - 92) * danger)
  const b = Math.round(174 + (231 - 174) * danger)
  return `rgb(255, ${g}, ${b})`
}

/**
 * Anneau de **surcharge** de la voie corrompue (US-037) — variante « instable
 * magenta » du `ProgressRing` du DS : la boucle qui se referme vers le seuil +
 * le **tremblement** à l'approche du krach portent la tension mieux qu'une barre.
 * Ajoute une **redline** (zone critique 85→100 toujours visible), des graduations,
 * un balayage radar, et une couleur pilotée par le danger. Purement présentation.
 * Toutes les animations sont coupées en `prefers-reduced-motion` (classe
 * `nw-cor-anim`).
 */
export function OverloadRing({ size = 210, gauge, danger, krach, live = true, children }: OverloadRingProps) {
  const stroke = 10 + danger * 3
  const r = (size - 18) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.max(0, Math.min(100, gauge)) / 100)
  const color = krach ? COR_HOT : ringColor(danger)
  const animate = live && !prefersReducedMotion()
  const trembling = animate && danger > 0.12 && !krach

  return (
    <div
      className={trembling ? 'nw-cor-anim' : undefined}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        animation: trembling ? `nw-cor-tremble ${(0.42 - danger * 0.28).toFixed(2)}s steps(2) infinite` : 'none',
      }}
    >
      {/* balayage radar (scan cosmétique) */}
      {animate && (
        <span
          className="nw-cor-anim"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(${COR_RGB}, 0.32) 34deg, transparent 62deg)`,
            WebkitMask: 'radial-gradient(circle, transparent 62%, #000 63%)',
            mask: 'radial-gradient(circle, transparent 62%, #000 63%)',
            animation: `nw-cor-spin ${(4.5 - danger * 2.6).toFixed(1)}s linear infinite`,
          }}
        />
      )}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', overflow: 'visible' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`rgba(${COR_RGB}, 0.12)`} strokeWidth={stroke} />
        {/* redline : zone critique 85→100, toujours visible */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COR_HOT}
          strokeWidth={stroke}
          strokeLinecap="butt"
          opacity={0.42}
          strokeDasharray={`${0.15 * c} ${c}`}
          strokeDashoffset={-0.85 * c}
        />
        {/* remplissage de la surcharge */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 ${6 + danger * 12}px ${color})`,
            transition: live ? 'stroke-dashoffset .12s linear, stroke .3s linear' : 'none',
          }}
        />
      </svg>
      {/* graduations */}
      {[0, 25, 50, 75].map((t) => {
        const a = (t / 100) * 360
        return (
          <span
            key={t}
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2,
              height: 6,
              background: `rgba(${COR_RGB}, 0.4)`,
              transformOrigin: `0 ${size / 2 - 4}px`,
              transform: `translate(-50%, -${size / 2 - 4}px) rotate(${a}deg)`,
            }}
          />
        )
      })}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  )
}
