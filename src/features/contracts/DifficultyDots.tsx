import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { Difficulty } from '../../db'
import { DIFFICULTY_ACCENTS, DIFFICULTY_ORDER, rewardFor } from '../../game/rewards'

export interface DifficultyDotsProps {
  value: Difficulty
  onChange: (difficulty: Difficulty) => void
}

/**
 * Rangée de 5 pastilles biseautées pour choisir la difficulté (US-008).
 * Sélection = pastille pleine + glow de l'accent ; les autres sont en contour.
 * Utilisée à la création rapide et en mode édition d'une ligne.
 */
export function DifficultyDots({ value, onChange }: DifficultyDotsProps) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {DIFFICULTY_ORDER.map((key) => {
        const accent = DIFFICULTY_ACCENTS[key]
        const selected = key === value
        const reward = rewardFor(key)
        const style: CSSProperties = {
          width: 20,
          height: 16,
          cursor: 'pointer',
          flex: 'none',
          clipPath: 'var(--clip-bevel-sm)',
          background: selected ? accent : 'transparent',
          border: `1px solid ${selected ? accent : `color-mix(in srgb, ${accent} 45%, transparent)`}`,
          boxShadow: selected ? `0 0 10px ${accent}` : 'none',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }
        return (
          <div
            key={key}
            role="button"
            aria-label={`${t(`contracts.difficulty.${key}`)} · +${reward.xp} XP · +${reward.credits} ¢`}
            title={`${t(`contracts.difficulty.${key}`)} · +${reward.xp} XP · +${reward.credits} ¢`}
            onClick={() => onChange(key)}
            style={style}
          />
        )
      })}
    </div>
  )
}
