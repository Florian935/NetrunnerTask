import type { CSSProperties } from 'react'
import type { Priority } from '../../db'
import { PRIORITY_BARS } from '../../game/priority'

export interface PriorityBarsProps {
  priority: Priority
  /** Libellé accessible (déjà traduit). */
  label: string
}

/**
 * Trois barres de signal croissantes indiquant la priorité (US-005). La
 * **forme** (nombre de barres allumées) porte le niveau ; la couleur reste
 * neutre (réservée à l'échéance), sauf `high` (accent cyan + glow).
 */
export function PriorityBars({ priority, label }: PriorityBarsProps) {
  const { lit, color, glow } = PRIORITY_BARS[priority]
  return (
    <div
      style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 15, flex: 'none' }}
      title={label}
      aria-label={label}
    >
      {[0, 1, 2].map((i) => {
        const on = i < lit
        const style: CSSProperties = {
          width: 3,
          height: 15 - (2 - i) * 3,
          alignSelf: 'flex-end',
          flex: 'none',
          background: on ? color : 'var(--void-500)',
          boxShadow: on && glow ? `0 0 6px ${color}` : 'none',
        }
        return <span key={i} style={style} />
      })}
    </div>
  )
}
