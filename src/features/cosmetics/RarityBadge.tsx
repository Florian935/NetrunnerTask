import { useTranslation } from 'react-i18next'
import type { Rarity } from '../../game/cosmetics'
import { RankPips } from './RankPips'
import { RARITY_FILL, RARITY_GLOW, rarityColor, rarityGlow, rarityRgb } from './rarityStyle'
import './cosmetics.css'

export interface RarityBadgeProps {
  rarity: Rarity
  /** Affiche les chevrons de rang à droite du libellé. @default true */
  pips?: boolean
}

/**
 * Badge de rareté (US-031) — libellé i18n + liseré/glow échelonnés par cran +
 * rangs. Bespoke (les crans `--rarity-*` ne mappent pas les tons de `<Badge>`),
 * mais dans le même langage visuel (clip biseauté, mono capitales).
 */
export function RarityBadge({ rarity, pips = true }: RarityBadgeProps) {
  const { t } = useTranslation()
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  const legend = rarity === 'legendary'
  return (
    <span
      className={legend ? 'nw-legend' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '3px 9px 3px 7px',
        clipPath: 'var(--clip-bevel-sm)',
        background: `rgba(${rgb}, ${RARITY_FILL[rarity] + 0.04})`,
        border: `1px solid rgba(${rgb}, 0.6)`,
        color: rarityColor(rarity),
        boxShadow: legend ? undefined : rarityGlow(rarity, false),
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 8,
          background: `repeating-linear-gradient(-45deg, ${rarityColor(rarity)} 0, ${rarityColor(rarity)} 2px, transparent 2px, transparent 5px)`,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.16em',
          textShadow: glow ? `0 0 8px rgba(${rgb}, ${glow * 0.7})` : 'none',
        }}
      >
        {t(`cosmetics.rarity.${rarity}`)}
      </span>
      {pips && <RankPips rarity={rarity} />}
    </span>
  )
}
