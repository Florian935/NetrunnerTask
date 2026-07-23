import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { COSMETIC_BY_ID } from '../../game/cosmetics'
import { milestoneForCosmetic } from '../../game/milestones'
import type { CosmeticUnlockItem } from '../../stores/useFeedbackStore'
import { CosmeticPreview } from './previews'
import { RarityBadge } from './RarityBadge'
import { RARITY_FILL, RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'
import './cosmetics.css'

export interface CosmeticUnlockToastProps {
  item: CosmeticUnlockItem
  onClose: () => void
}

/**
 * Reveal de déblocage (US-033) — encart teinté par la rareté du cosmétique
 * gagné (aperçu animé + nom + rareté + jalon source). Même famille que les
 * toasts de jalon. Hébergé par `AppShell`.
 */
export function CosmeticUnlockToast({ item, onClose }: CosmeticUnlockToastProps) {
  const { t } = useTranslation()
  const cosmetic = COSMETIC_BY_ID[item.cosmeticId]
  if (!cosmetic) return null

  const rgb = rarityRgb(cosmetic.rarity)
  const glow = RARITY_GLOW[cosmetic.rarity]
  const source = milestoneForCosmetic(cosmetic.id)

  return (
    <div
      className="nw-toast-in"
      style={{
        position: 'relative',
        width: 340,
        clipPath: 'var(--clip-bevel-md)',
        padding: 1,
        background: `linear-gradient(135deg, ${rarityColor(cosmetic.rarity)}, rgba(${rgb}, 0.3))`,
        boxShadow: `var(--shadow-3), 0 0 24px -4px rgba(${rgb}, ${0.4 + glow * 0.5})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          clipPath: 'var(--clip-bevel-md)',
          background: `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[cosmetic.rarity] + 0.05}), transparent 55%), var(--bg-surface)`,
          padding: 15,
          overflow: 'hidden',
        }}
      >
        <span className="nw-scanlines" aria-hidden style={{ position: 'absolute', inset: 0 }} />
        {/* En-tête */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.18em', color: rarityColor(cosmetic.rarity), textShadow: glow ? `0 0 10px rgba(${rgb}, ${glow * 0.7})` : 'none' }}>
            <span className="nw-blink" aria-hidden style={{ display: 'inline-flex' }}>
              <Icon name="sparkles" size={16} />
            </span>
            {t('cosmetics.unlock.title')}
          </span>
          <span onClick={onClose} role="button" tabIndex={0} aria-label={t('cosmetics.unlock.close')} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex' }}>
            <Icon name="x" size={15} />
          </span>
        </div>
        {/* Aperçu + identité */}
        <div style={{ position: 'relative', display: 'flex', gap: 13, alignItems: 'center' }}>
          <div className="nw-reveal" style={{ width: 88, flexShrink: 0 }}>
            <CosmeticPreview item={cosmetic} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.04em', color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 3 }}>
              {t(`cosmetics.items.${cosmetic.id}.name`)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 9 }}>
              {t(`cosmetics.items.${cosmetic.id}.sub`)}
            </div>
            <RarityBadge rarity={cosmetic.rarity} />
          </div>
        </div>
        {/* Pied : source */}
        {source && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, marginTop: 13, paddingTop: 11, borderTop: `1px solid rgba(${rgb}, 0.25)`, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
            <Icon name="award" size={12} /> {t(`builder.milestones.items.${source.id}.name`)}
          </div>
        )}
      </div>
    </div>
  )
}
