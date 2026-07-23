import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon } from '../../components/ui'
import type { Cosmetic } from '../../game/cosmetics'
import { CosmeticPreview } from './previews'
import { RarityBadge } from './RarityBadge'
import { RARITY_FILL, rarityColor, rarityGlow, rarityRgb } from './rarityStyle'
import './cosmetics.css'

export interface CosmeticCardProps {
  item: Cosmetic
  equipped: boolean
  /** Appelé pour équiper ce cosmétique (masqué s'il l'est déjà). */
  onEquip: () => void
}

/**
 * Carte d'un cosmétique (US-031) — composée sur `<Card hud brackets>` + action
 * `<Button>` du DS. Le cadre (bordure + glow) est **teinté par la rareté** ;
 * l'état « équipé » verrouille le glow et affiche un marqueur. Le cran
 * `legendary` respire (`.nw-legend`) quand la carte est active.
 */
export function CosmeticCard({ item, equipped, onEquip }: CosmeticCardProps) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(false)
  const legend = item.rarity === 'legendary'
  const active = equipped || hover
  const rgb = rarityRgb(item.rarity)

  return (
    <Card
      hud
      brackets
      className={legend && active ? 'nw-legend' : undefined}
      padding="var(--space-4)"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid rgba(${rgb}, ${equipped ? 0.7 : active ? 0.6 : 0.4})`,
        boxShadow: legend ? undefined : rarityGlow(item.rarity, active),
        background: `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[item.rarity]}), transparent 55%), var(--bg-panel)`,
        transition: 'box-shadow var(--dur-med) var(--ease-out), border-color var(--dur-med) var(--ease-out)',
      }}
    >
      {/* En-tête : rareté + état */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <RarityBadge rarity={item.rarity} />
        {equipped && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.16em',
              color: rarityColor(item.rarity),
            }}
          >
            <Icon name="check" size={12} /> {t('cosmetics.equippedShort')}
          </span>
        )}
      </div>

      <CosmeticPreview item={item} />

      {/* Nom + sous-titre */}
      <div style={{ marginTop: 11, marginBottom: 12 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-md)',
            letterSpacing: '0.05em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
          }}
        >
          {t(`cosmetics.items.${item.id}.name`)}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          {t(`cosmetics.items.${item.id}.sub`)}
        </div>
      </div>

      {/* Action : Équiper / état Équipé */}
      {equipped ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            height: 'var(--control-h-md)',
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px solid rgba(${rgb}, 0.6)`,
            background: `rgba(${rgb}, 0.12)`,
            color: rarityColor(item.rarity),
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="check-check" size={14} /> {t('cosmetics.equipped')}
        </div>
      ) : (
        <Button
          variant="secondary"
          hud
          onClick={onEquip}
          leftIcon={<Icon name="plus" size={13} />}
          style={{ width: '100%' }}
        >
          {t('cosmetics.equip')}
        </Button>
      )}
    </Card>
  )
}
