import { rarityRank, type Rarity } from '../../game/cosmetics'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'

export interface RankPipsProps {
  rarity: Rarity
  /** Taille d'un chevron en px. @default 5 */
  size?: number
}

/** Rangs de rareté : chevrons pleins jusqu'au rang du cran, creux au-delà. */
export function RankPips({ rarity, size = 5 }: RankPipsProps) {
  const rank = rarityRank(rarity)
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= rank
        return (
          <span
            key={n}
            aria-hidden
            style={{
              width: size,
              height: size,
              transform: 'rotate(45deg)',
              background: on ? rarityColor(rarity) : 'transparent',
              border: `1px solid rgba(${rgb}, ${on ? 1 : 0.35})`,
              boxShadow: on && glow ? `0 0 5px rgba(${rgb}, ${glow * 0.8})` : 'none',
            }}
          />
        )
      })}
    </span>
  )
}
