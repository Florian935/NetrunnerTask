import { useTranslation } from 'react-i18next'
import type { Recurrence } from '../../db'
import { recurrenceLabel } from './recurrenceLabel'

/**
 * Puce informative de récurrence (US-006) sur une ligne de contrat. Sobre
 * (teinte réseau/cyan discrète) — la récurrence est une info, pas une alerte.
 */
export function RecurrenceChip({ recurrence }: { recurrence: Recurrence }) {
  const { t } = useTranslation()
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        flex: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        letterSpacing: '0.1em',
        color: 'var(--cyan-500)',
        clipPath: 'var(--clip-bevel-sm)',
        background: 'color-mix(in srgb, var(--cyan-500) 9%, var(--bg-inset))',
        border:
          '1px solid color-mix(in srgb, var(--cyan-500) 32%, transparent)',
      }}
    >
      {recurrenceLabel(recurrence, t)}
    </span>
  )
}
