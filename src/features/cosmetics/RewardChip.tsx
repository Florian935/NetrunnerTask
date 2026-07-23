import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { COSMETIC_BY_ID, type CosmeticType } from '../../game/cosmetics'
import { RarityBadge } from './RarityBadge'
import { rarityColor, rarityRgb } from './rarityStyle'

/** Icône représentant le type de cosmétique récompensé. */
const TYPE_ICON: Record<CosmeticType, string> = {
  theme: 'palette',
  avatar: 'user-round',
  banner: 'flag',
  title: 'badge-check',
}

export interface RewardChipProps {
  /** `id` du cosmétique récompense ; ignoré si `sealed`. */
  cosmeticId?: string
  /** Récompense masquée (jalon caché non atteint) → « ??? » + cadenas. */
  sealed?: boolean
}

/**
 * Puce « récompense » (US-033) — le cosmétique débloqué par un accomplissement,
 * affiché dans le `MilestonesPanel`. Scellé = récompense masquée.
 */
export function RewardChip({ cosmeticId, sealed = false }: RewardChipProps) {
  const { t } = useTranslation()
  const cosmetic = cosmeticId ? COSMETIC_BY_ID[cosmeticId] : undefined
  const showSealed = sealed || cosmetic === undefined
  const rgb = cosmetic ? rarityRgb(cosmetic.rarity) : ''

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 11px 6px 7px',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${showSealed ? 'var(--border-strong)' : `rgba(${rgb}, 0.55)`}`,
        background: showSealed ? 'var(--void-900)' : `rgba(${rgb}, 0.07)`,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          clipPath: 'var(--clip-bevel-sm)',
          border: `1px solid ${showSealed ? 'var(--border-strong)' : `rgba(${rgb}, 0.5)`}`,
          background: showSealed ? 'var(--bg-inset)' : `rgba(${rgb}, 0.12)`,
          color: showSealed || !cosmetic ? 'var(--steel-400)' : rarityColor(cosmetic.rarity),
          flexShrink: 0,
        }}
      >
        <Icon name={showSealed || !cosmetic ? 'lock' : TYPE_ICON[cosmetic.type]} size={15} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
          {t('cosmetics.reward')}
        </span>
        {showSealed || !cosmetic ? (
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.14em', color: 'var(--steel-400)' }}>
            ? ? ?
          </span>
        ) : (
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', letterSpacing: '0.04em', color: rarityColor(cosmetic.rarity) }}>
            {t(`cosmetics.items.${cosmetic.id}.name`)}
          </span>
        )}
      </span>
      {!showSealed && cosmetic && <RarityBadge rarity={cosmetic.rarity} pips={false} />}
    </div>
  )
}
