import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { CRATE_ODDS, CRATE_QUALITIES, type CrateQuality } from '../../game/crates'
import { RARITY_ORDER, type Rarity } from '../../game/cosmetics'
import { CRATE_STYLE } from './crateStyle'
import { RarityBadge } from './RarityBadge'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'

/** Une ligne : rareté + barre proportionnelle + pourcentage. */
function OddsRow({ rarity, pct }: { rarity: Rarity; pct: number }) {
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 148, flexShrink: 0 }}>
        <RarityBadge rarity={rarity} pips={false} />
      </span>
      <div style={{ flex: 1, position: 'relative', height: 16, background: 'var(--void-900)', border: '1px solid var(--border)', clipPath: 'var(--clip-bevel-sm)', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--grid-lines)', backgroundSize: '10px 10px', opacity: 0.35 }} />
        <div style={{ position: 'relative', width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, rgba(${rgb}, 0.55), ${rarityColor(rarity)})`, boxShadow: glow ? `0 0 12px rgba(${rgb}, ${glow * 0.7})` : 'none', minWidth: pct > 0 ? 3 : 0 }} />
      </div>
      <span style={{ width: 52, flexShrink: 0, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: rarityColor(rarity), textShadow: glow ? `0 0 8px rgba(${rgb}, ${glow * 0.6})` : 'none' }}>
        {pct}
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}> %</span>
      </span>
    </div>
  )
}

export interface CrateOddsTableProps {
  /** Qualité affichée à l'ouverture. @default 'secured' */
  initial?: CrateQuality
}

/**
 * Table de probabilités (US-034) — par qualité (onglets), une ligne par cran de
 * rareté (barre codée rareté + %). Transparence : les % somment à 100 (invariant
 * `game/crates.ts`, C3). Réutilise `RarityBadge` + la rampe de rareté.
 */
export function CrateOddsTable({ initial = 'secured' }: CrateOddsTableProps) {
  const { t } = useTranslation()
  const [quality, setQuality] = useState<CrateQuality>(initial)
  const s = CRATE_STYLE[quality]
  const table = CRATE_ODDS[quality]
  const sum = RARITY_ORDER.reduce((a, r) => a + table[r], 0)

  return (
    <div style={{ position: 'relative', clipPath: 'var(--clip-bevel-md)', border: `1px solid rgba(${s.rgb}, 0.5)`, background: 'var(--bg-panel)', width: 540, maxWidth: '100%', overflow: 'hidden', boxShadow: `var(--shadow-3)` }}>
      {/* En-tête + onglets de qualité */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border)', background: `linear-gradient(120deg, rgba(${s.rgb}, 0.1), transparent 60%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: '0.16em', color: 'var(--text-primary)' }}>
            <Icon name="bar-chart-3" size={16} color="var(--accent)" /> {t('cosmetics.crates.odds.title')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
            {t('cosmetics.crates.odds.sum', { sum })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
          {CRATE_QUALITIES.map((q) => {
            const cs = CRATE_STYLE[q]
            const on = q === quality
            return (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  height: 32,
                  clipPath: 'var(--clip-bevel-sm)',
                  border: `1px solid ${on ? cs.color : 'var(--border)'}`,
                  background: on ? `rgba(${cs.rgb}, 0.14)` : 'var(--void-900)',
                  color: on ? cs.color : 'var(--text-muted)',
                  boxShadow: on ? `0 0 14px -5px rgba(${cs.rgb}, ${cs.glow})` : 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 10.5,
                  letterSpacing: '0.1em',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}
              >
                <Icon name={cs.icon} size={13} /> {t(`cosmetics.crates.quality.${q}.label`)}
              </button>
            )
          })}
        </div>
      </div>
      {/* Lignes */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {RARITY_ORDER.map((r) => (
          <OddsRow key={r} rarity={r} pct={table[r]} />
        ))}
      </div>
      <div style={{ padding: '0 18px 15px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', lineHeight: 1.5, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
        <Icon name="info" size={12} /> {t('cosmetics.crates.odds.note')}
      </div>
    </div>
  )
}
