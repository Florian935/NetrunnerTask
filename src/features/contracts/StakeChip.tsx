import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { Difficulty, StakeOutcome } from '../../db'
import { stakePayout } from '../../game/risk'

/**
 * Puce de mise à risque (US-013) sur une ligne de contrat one-shot : icône pièces
 * + montant, teintée selon l'issue — **ambre** en jeu (`pending`), **menthe**
 * gagné (`won`, gain net), **rouge** perdu (`lost`). Rien si pas de mise
 * (`none`). Exclusive de `StreakChip` (série = récurrent, mise = one-shot).
 */
export function StakeChip({
  outcome,
  stake,
  difficulty,
}: {
  outcome: StakeOutcome
  stake: number
  difficulty: Difficulty
}) {
  const { t } = useTranslation()
  if (outcome === 'none' || stake <= 0) return null

  const net = stakePayout(stake, difficulty) - stake
  const { color, text, title } =
    outcome === 'won'
      ? {
          color: 'var(--mint-500)',
          text: `+${net}`,
          title: t('contracts.stake.chipWon', { net }),
        }
      : outcome === 'lost'
        ? {
            color: 'var(--red-500)',
            text: `−${stake}`,
            title: t('contracts.stake.chipLost', { amount: stake }),
          }
        : {
            color: 'var(--amber-500)',
            text: `${stake}`,
            title: t('contracts.stake.chipAtRisk', { amount: stake }),
          }

  return (
    <span
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        flex: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 700,
        letterSpacing: '0.06em',
        color,
        clipPath: 'var(--clip-bevel-sm)',
        background: `color-mix(in srgb, ${color} 12%, var(--bg-inset))`,
        border: `1px solid color-mix(in srgb, ${color} 42%, transparent)`,
      }}
    >
      <Icon name="coins" size={11} />
      {text}
    </span>
  )
}
