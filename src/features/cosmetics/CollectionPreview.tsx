import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import {
  collectionByRarity,
  collectionTotals,
  remainingOfRarity,
} from '../../game/collection'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'
import './cosmetics.css'

export interface CollectionPreviewProps {
  owned: readonly string[]
}

/**
 * Aperçu de collection (US-033) — bandeau en tête de Garde-robe : progression
 * **par rareté** (pastilles teintées) + total global + accroche sur le pool de
 * légendaires restant. Lecture pure via `game/collection.ts`.
 */
export function CollectionPreview({ owned }: CollectionPreviewProps) {
  const { t } = useTranslation()
  const perRarity = collectionByRarity(owned)
  const totals = collectionTotals(owned)
  const legendLeft = remainingOfRarity(owned, 'legendary')

  return (
    <Card hud brackets padding="var(--space-5)" style={{ marginBottom: 24 }}>
      {/* En-tête : titre + total */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
          <Icon name="layout-grid" size={18} color="var(--accent)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
            {t('cosmetics.collection.title')}
          </span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--accent)', textShadow: 'var(--text-glow-cyan)' }}>
            {totals.owned}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>/ {totals.total}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)', marginLeft: 4 }}>
            {t('cosmetics.collection.unlocked')}
          </span>
        </span>
      </div>

      {/* Colonnes par rareté */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {perRarity.map(({ rarity, owned: got, total }) => {
          const rgb = rarityRgb(rarity)
          const glow = RARITY_GLOW[rarity]
          const done = got >= total
          return (
            <div key={rarity}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', color: rarityColor(rarity), textShadow: glow ? `0 0 8px rgba(${rgb}, ${glow * 0.6})` : 'none' }}>
                  {t(`cosmetics.rarity.${rarity}`)}
                </span>
                {done && (
                  <span style={{ color: rarityColor(rarity), display: 'inline-flex' }}>
                    <Icon name="check" size={12} />
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 7, flexWrap: 'wrap' }}>
                {Array.from({ length: total }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      transform: 'rotate(45deg)',
                      background: i < got ? rarityColor(rarity) : 'transparent',
                      border: `1px solid rgba(${rgb}, ${i < got ? 1 : 0.3})`,
                      boxShadow: i < got && glow ? `0 0 6px rgba(${rgb}, ${glow * 0.8})` : 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--text-label)' }}>
                <span style={{ color: rarityColor(rarity) }}>{got}</span> / {total}
              </div>
            </div>
          )
        })}
      </div>

      {/* Accroche : pool de légendaires restant */}
      {legendLeft > 0 && (
        <div style={{ marginTop: 16, paddingTop: 13, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="nw-blink" aria-hidden style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: rarityColor('legendary'), boxShadow: `0 0 8px ${rarityColor('legendary')}` }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
            {t('cosmetics.collection.legendariesLeft', { count: legendLeft })}
          </span>
        </div>
      )}
    </Card>
  )
}
