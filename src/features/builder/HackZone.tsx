import { type PointerEvent, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'

interface Float {
  id: number
  x: number
  y: number
}

/** Respecte la préférence système de réduction des animations. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Zone HACK (US-020) — le geste manuel « juteux ». Chaque appui produit des
 * cycles (via `onHack`) et, hors réduction d'animations, émet un **anneau
 * d'onde** + un **`+N` qui gicle** au point de contact, nettoyés après l'anim.
 */
export function HackZone({ onHack, gain }: { onHack: () => void; gain: number }) {
  const { t } = useTranslation()
  const [rings, setRings] = useState<number[]>([])
  const [floats, setFloats] = useState<Float[]>([])
  const idRef = useRef(0)

  const hit = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      onHack()
      if (prefersReducedMotion()) return
      const id = ++idRef.current
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setRings((r) => [...r, id])
      setFloats((f) => [...f, { id, x, y }])
      window.setTimeout(() => {
        setRings((r) => r.filter((k) => k !== id))
        setFloats((f) => f.filter((k) => k.id !== id))
      }, 720)
    },
    [onHack],
  )

  return (
    <div className="builder__hack">
      <div className="builder__hack-halo" />
      {rings.map((id) => (
        <span key={id} className="builder__hack-ring" />
      ))}
      {floats.map((f) => (
        <span
          key={f.id}
          className="builder__hack-float"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        >
          +{gain}
        </span>
      ))}
      <button
        type="button"
        className="builder__hack-core"
        onPointerDown={hit}
        aria-label={t('builder.hackAria')}
      >
        <span className="builder__hack-icon">
          <Icon name="zap" size={40} />
        </span>
        <span className="builder__hack-word">{t('builder.hack')}</span>
        <span className="builder__hack-sub">{t('builder.hackSub')}</span>
      </button>
    </div>
  )
}
