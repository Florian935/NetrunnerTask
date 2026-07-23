import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { PITY_CONFIG } from '../../game/crates'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'
import './cosmetics.css'

export interface PityMeterProps {
  /** Ouvertures depuis le dernier légendaire (`cosmeticsState.pity`). */
  pity: number
}

/**
 * Jauge de pity (US-035) — « X ouvertures avant légendaire garanti ». Segments
 * remplis = ouvertures effectuées ; les derniers crans « chauffent » ; au seuil,
 * l'état « garanti au prochain » s'allume (halo légendaire, coupé en
 * reduced-motion). Lit `PITY_CONFIG` (source de vérité du seuil/cran).
 */
export function PityMeter({ pity }: PityMeterProps) {
  const { t } = useTranslation()
  const total = PITY_CONFIG.threshold
  const done = Math.min(pity, total)
  const left = Math.max(0, total - done)
  const guaranteed = left <= 0
  const rgb = rarityRgb(PITY_CONFIG.rarity)
  const color = rarityColor(PITY_CONFIG.rarity)
  const glow = RARITY_GLOW[PITY_CONFIG.rarity]

  return (
    <div
      style={{
        position: 'relative',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${guaranteed ? `rgba(${rgb}, 0.7)` : 'var(--border-strong)'}`,
        background: 'var(--bg-inset)',
        padding: '13px 15px',
        overflow: 'hidden',
      }}
    >
      {guaranteed && <span aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 100% 0, rgba(${rgb}, 0.14), transparent 60%)` }} />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: 'var(--text-secondary)' }}>
          <Icon name="crown" size={13} color={color} /> {t('cosmetics.pity.title')}
        </span>
        {guaranteed ? (
          <span className="nw-pity-glow" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color, padding: '2px 8px', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${rgb}, 0.7)` }}>
            {t('cosmetics.pity.guaranteed')}
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            {done}/{total}
          </span>
        )}
      </div>
      {/* Jauge segmentée */}
      <div style={{ position: 'relative', display: 'flex', gap: 3 }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < done
          const near = !guaranteed && i >= done && i >= total - 3
          return (
            <span
              key={i}
              style={{
                flex: 1,
                height: 9,
                clipPath: 'polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)',
                background: filled ? `linear-gradient(90deg, rgba(${rgb}, 0.55), ${color})` : near ? `rgba(${rgb}, 0.14)` : 'var(--void-700)',
                border: `1px solid ${filled ? `rgba(${rgb}, 0.8)` : near ? `rgba(${rgb}, 0.4)` : 'var(--border)'}`,
                boxShadow: filled ? `0 0 8px rgba(${rgb}, ${glow * 0.45})` : 'none',
              }}
            />
          )
        })}
      </div>
      <div style={{ position: 'relative', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
        {guaranteed ? (
          <span style={{ color }}>{t('cosmetics.pity.guaranteedHint')}</span>
        ) : (
          t('cosmetics.pity.remaining', { count: left })
        )}
      </div>
    </div>
  )
}
