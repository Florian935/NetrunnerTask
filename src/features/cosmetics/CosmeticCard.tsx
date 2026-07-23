import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon } from '../../components/ui'
import type { Cosmetic } from '../../game/cosmetics'
import { CosmeticPreview } from './previews'
import { RarityBadge } from './RarityBadge'
import { RARITY_FILL, rarityColor, rarityGlow, rarityRgb } from './rarityStyle'
import './cosmetics.css'

/** État d'une carte : verrouillé (à débloquer) / possédé non équipé / équipé. */
export type CosmeticCardState = 'locked' | 'unequipped' | 'equipped'

export interface CosmeticCardProps {
  item: Cosmetic
  state: CosmeticCardState
  /** Indice de déblocage (libellé i18n du jalon source) — requis si `locked`. */
  hint?: string
  /** Appelé pour équiper ce cosmétique (ignoré si verrouillé/déjà équipé). */
  onEquip?: () => void
}

/**
 * Carte d'un cosmétique (US-031 + état verrouillé US-033) — sur `<Card hud
 * brackets>` + action `<Button>`. Le cadre est teinté par la rareté ; l'état
 * **verrouillé** grise l'aperçu (cadenas + hachures) et remplace l'action par
 * un indice « Débloqué par ». Le cran `legendary` respire quand la carte est
 * active (jamais verrouillée).
 */
export function CosmeticCard({ item, state, hint, onEquip }: CosmeticCardProps) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(false)
  const locked = state === 'locked'
  const equipped = state === 'equipped'
  const legend = item.rarity === 'legendary'
  const active = !locked && (equipped || hover)
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
        border: `1px solid ${locked ? 'var(--border)' : `rgba(${rgb}, ${equipped ? 0.7 : active ? 0.6 : 0.4})`}`,
        boxShadow: locked ? 'none' : legend ? undefined : rarityGlow(item.rarity, active),
        background: locked
          ? 'var(--bg-inset)'
          : `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[item.rarity]}), transparent 55%), var(--bg-panel)`,
        transition: 'box-shadow var(--dur-med) var(--ease-out), border-color var(--dur-med) var(--ease-out)',
      }}
    >
      {/* En-tête : rareté (toujours visible) + état */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <RarityBadge rarity={item.rarity} />
        {equipped && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: rarityColor(item.rarity) }}>
            <Icon name="check" size={12} /> {t('cosmetics.equippedShort')}
          </span>
        )}
        {locked && (
          <span style={{ display: 'inline-flex', color: 'var(--steel-400)' }}>
            <Icon name="lock" size={15} />
          </span>
        )}
      </div>

      {/* Aperçu (grisé + cadenas si verrouillé) */}
      <div style={{ position: 'relative' }}>
        <div style={{ filter: locked ? 'grayscale(1) brightness(0.7)' : 'none' }}>
          <CosmeticPreview item={item} />
        </div>
        {locked && (
          <>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                clipPath: 'var(--clip-bevel-sm)',
              }}
            >
              <span style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--border-strong)', background: 'color-mix(in srgb, var(--bg-app) 70%, transparent)', color: 'var(--text-label)' }}>
                <Icon name="lock" size={20} />
              </span>
            </span>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'var(--clip-bevel-sm)',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(139,155,180,.08) 0, rgba(139,155,180,.08) 1px, transparent 1px, transparent 7px)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>

      {/* Nom + sous-titre */}
      <div style={{ marginTop: 11, marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '0.05em', color: locked ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.15 }}>
          {t(`cosmetics.items.${item.id}.name`)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
          {t(`cosmetics.items.${item.id}.sub`)}
        </div>
      </div>

      {/* Action selon l'état */}
      {locked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 'var(--control-h-md)', padding: '7px 10px', clipPath: 'var(--clip-bevel-sm)', border: '1px dashed var(--border-strong)', background: 'var(--bg-inset)' }}>
          <span style={{ color: 'var(--amber-500)', display: 'inline-flex', flexShrink: 0 }}>
            <Icon name="key-round" size={14} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {t('cosmetics.unlockedBy')}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--text-label)', marginTop: 2, lineHeight: 1.25 }}>
              {hint}
            </span>
          </span>
        </div>
      ) : equipped ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 'var(--control-h-md)', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${rgb}, 0.6)`, background: `rgba(${rgb}, 0.12)`, color: rarityColor(item.rarity), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          <Icon name="check-check" size={14} /> {t('cosmetics.equipped')}
        </div>
      ) : (
        <Button variant="secondary" hud onClick={onEquip} leftIcon={<Icon name="plus" size={13} />} style={{ width: '100%' }}>
          {t('cosmetics.equip')}
        </Button>
      )}
    </Card>
  )
}
