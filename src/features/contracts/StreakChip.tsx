import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'

/**
 * Puce de série (US-011) sur une ligne de contrat récurrent : icône flamme +
 * série courante. Teintée ambre quand la série est active (> 0), neutre à 0.
 * Le record est rappelé en infobulle / libellé accessible.
 */
export function StreakChip({ current, best }: { current: number; best: number }) {
  const { t } = useTranslation()
  const active = current > 0
  const color = active ? 'var(--amber-500)' : 'var(--steel-600)'
  return (
    <span
      title={t('contracts.streak.chipTitle', { count: current, best })}
      aria-label={t('contracts.streak.aria', { count: current, best })}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        flex: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        letterSpacing: '0.1em',
        color,
        clipPath: 'var(--clip-bevel-sm)',
        background: active
          ? 'color-mix(in srgb, var(--amber-500) 9%, var(--bg-inset))'
          : 'var(--bg-inset)',
        border: `1px solid ${
          active
            ? 'color-mix(in srgb, var(--amber-500) 32%, transparent)'
            : 'var(--border)'
        }`,
      }}
    >
      <Icon name="flame" size={11} />
      {current}
    </span>
  )
}
