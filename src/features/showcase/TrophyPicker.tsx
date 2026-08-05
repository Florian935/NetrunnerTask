import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import {
  COSMETIC_BY_ID,
  COSMETIC_TYPES,
  RARITY_ORDER,
  type Cosmetic,
  type CosmeticType,
  type Rarity,
} from '../../game/cosmetics'
import { CosmeticPreview } from '../cosmetics/previews'
import { RarityBadge } from '../cosmetics/RarityBadge'
import { RARITY_FILL, rarityColor, rarityGlow, rarityRgb } from '../cosmetics/rarityStyle'
import './showcase.css'

export interface TrophyPickerProps {
  /** Emplacement 0-based visé (l'en-tête affiche le n° 1-based). */
  slotIndex: number
  /** `id` déjà épinglés ailleurs (exclus du sélecteur — pas de doublon). */
  pinnedRefs: readonly string[]
  /** `id` possédés (seuls épinglables). */
  owned: readonly string[]
  /** Épingle `ref` dans l'emplacement puis ferme. */
  onPick: (ref: string) => void
  onClose: () => void
}

/** Raretés en ordre décroissant (légendaire → commun) pour le regroupement. */
const RARITY_DESC: readonly Rarity[] = [...RARITY_ORDER].reverse()

/**
 * Sélecteur d'épinglage (US-038) — modal superposé (patron `CrateOpeningModal`).
 * Ne présente que des cosmétiques **possédés non déjà exposés**, groupés par
 * rareté décroissante, filtrables par type. Ferme sur Échap / clic sur le voile.
 */
export function TrophyPicker({ slotIndex, pinnedRefs, owned, onPick, onClose }: TrophyPickerProps) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<CosmeticType | 'all'>('all')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pinned = new Set(pinnedRefs)
  const pool = owned
    .map((id) => COSMETIC_BY_ID[id])
    .filter((c): c is Cosmetic => c !== undefined && !pinned.has(c.id))
    .filter((c) => filter === 'all' || c.type === filter)

  const groups = RARITY_DESC.map((rarity) => ({
    rarity,
    items: pool.filter((c) => c.rarity === rarity),
  })).filter((g) => g.items.length > 0)

  const chips: Array<{ key: CosmeticType | 'all'; label: string }> = [
    { key: 'all', label: t('showcase.picker.filterAll') },
    ...COSMETIC_TYPES.map((tp) => ({ key: tp, label: t(`cosmetics.types.${tp}`) })),
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'grid', placeItems: 'center', padding: 24 }}>
      <span
        aria-hidden
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(6,9,15,.82)', backdropFilter: 'blur(3px)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('showcase.picker.title')}
        style={{
          position: 'relative',
          width: 'min(920px, 100%)',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          clipPath: 'var(--clip-bevel-md)',
          padding: 1,
          background: 'linear-gradient(135deg, var(--cyan-500), transparent 45%, transparent 55%, rgba(0,240,255,.35))',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        <div
          className="nw-scanlines"
          style={{
            position: 'relative',
            clipPath: 'var(--clip-bevel-md)',
            background: 'var(--bg-panel)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* En-tête */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 22px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(160deg, rgba(0,240,255,.06), transparent 70%)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.28em', color: 'var(--cyan-400)', marginBottom: 7 }}>
                {t('showcase.picker.kicker', { n: String(slotIndex + 1).padStart(2, '0') })}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '0.18em', color: 'var(--frost-100)' }}>
                {t('showcase.picker.title')}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: 7 }}>
                {t('showcase.picker.subtitle')}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('showcase.picker.close')}
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                clipPath: 'var(--clip-bevel-sm)',
                border: '1px solid var(--border-strong)',
                background: 'var(--void-900)',
                color: 'var(--text-label)',
              }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Filtres par type */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 22px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {chips.map((chip) => {
              const on = filter === chip.key
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilter(chip.key)}
                  style={{
                    cursor: 'pointer',
                    padding: '5px 12px',
                    clipPath: 'var(--clip-bevel-sm)',
                    border: `1px solid ${on ? 'var(--cyan-500)' : 'var(--border)'}`,
                    background: on ? 'rgba(0,240,255,.10)' : 'var(--void-900)',
                    color: on ? 'var(--cyan-400)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.16em',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>

          {/* Liste groupée par rareté */}
          <div style={{ overflowY: 'auto', padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {groups.map(({ rarity, items }) => (
              <section key={rarity}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 18,
                      height: 9,
                      background: `repeating-linear-gradient(-45deg, ${rarityColor(rarity)} 0, ${rarityColor(rarity)} 2px, transparent 2px, transparent 5px)`,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.24em', color: rarityColor(rarity) }}>
                    {t(`cosmetics.rarity.${rarity}`)}
                  </span>
                  <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(${rarityRgb(rarity)}, 0.4), transparent)` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 12 }}>
                  {items.map((item) => (
                    <PickCard key={item.id} item={item} onPick={() => onPick(item.id)} />
                  ))}
                </div>
              </section>
            ))}
            {groups.length === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
                {t('showcase.picker.empty')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Carte compacte du sélecteur — aperçu + rareté ; révèle « Épingler » au focus. */
function PickCard({ item, onPick }: { item: Cosmetic; onPick: () => void }) {
  const { t } = useTranslation()
  const rgb = rarityRgb(item.rarity)
  const legend = item.rarity === 'legendary'
  return (
    <button
      type="button"
      onClick={onPick}
      className={`nw-pick${legend ? ' nw-legend' : ''}`}
      style={{
        position: 'relative',
        clipPath: 'var(--clip-bevel-sm)',
        cursor: 'pointer',
        font: 'inherit',
        textAlign: 'left',
        padding: 9,
        border: `1px solid rgba(${rgb}, 0.45)`,
        background: `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[item.rarity]}), transparent 60%), var(--bg-panel)`,
        boxShadow: legend ? undefined : rarityGlow(item.rarity),
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: 9 }}>
        <CosmeticPreview item={item} />
      </div>
      <RarityBadge rarity={item.rarity} pips={false} />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12.5, letterSpacing: '0.04em', color: 'var(--text-primary)', marginTop: 7, lineHeight: 1.2 }}>
        {t(`cosmetics.items.${item.id}.name`)}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.18em', color: 'var(--text-muted)', marginTop: 3 }}>
        {t(`cosmetics.types.${item.type}`)}
      </div>
      <span
        className="nw-pick-hint"
        aria-hidden
        style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(10,14,23,.72)' }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 14px',
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px solid ${rarityColor(item.rarity)}`,
            background: `rgba(${rgb}, 0.14)`,
            color: rarityColor(item.rarity),
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.2em',
          }}
        >
          <Icon name="pin" size={13} /> {t('showcase.picker.pin')}
        </span>
      </span>
    </button>
  )
}
