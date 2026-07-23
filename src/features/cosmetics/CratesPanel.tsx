import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import { CRATE_QUALITIES, type CrateQuality } from '../../game/crates'
import { CrateIcon } from './CrateIcon'
import { CrateOddsTable } from './CrateOddsTable'
import { CRATE_ACCENT, CRATE_STYLE, crateGlow } from './crateStyle'
import { FragmentBalance } from './FragmentBalance'
import { PityMeter } from './PityMeter'

/** Ligne d'inventaire d'une qualité : coffre + description + compteur + action. */
function CrateSlot({
  quality,
  count,
  onOpen,
  onOdds,
}: {
  quality: CrateQuality
  count: number
  onOpen: () => void
  onOdds: () => void
}) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(false)
  const s = CRATE_STYLE[quality]
  const empty = count <= 0

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '15px 16px',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${empty ? 'var(--border)' : `rgba(${s.rgb}, 0.5)`}`,
        // Disponible = surface **surélevée** opaque (void-400), clairement
        // distincte du panneau ; vide = inset sombre (void-900).
        background: empty ? 'var(--void-900)' : `linear-gradient(120deg, rgba(${s.rgb}, 0.12), transparent 55%), var(--void-400)`,
        opacity: empty ? 0.72 : 1,
      }}
    >
      <CrateIcon quality={quality} size={58} disabled={empty} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.14em', color: empty ? 'var(--text-secondary)' : s.color, textShadow: empty ? 'none' : `0 0 10px rgba(${s.rgb}, ${s.glow * 0.55})` }}>
            {t(`cosmetics.crates.quality.${quality}.label`)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', clipPath: 'var(--clip-bevel-sm)' }}>
            {t('cosmetics.crates.tier', { tier: CRATE_QUALITIES.indexOf(quality) + 1 })}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginTop: 5 }}>
          {t(`cosmetics.crates.quality.${quality}.desc`)}
        </div>
        <button
          type="button"
          onClick={onOdds}
          style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', color: 'var(--accent)' }}
        >
          <Icon name="bar-chart-3" size={11} /> {t('cosmetics.crates.viewOdds')} <Icon name="chevron-right" size={11} />
        </button>
      </div>
      {/* Compteur + action */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: 1, color: empty ? 'var(--steel-600)' : 'var(--text-primary)', textShadow: empty ? 'none' : `0 0 12px rgba(${s.rgb}, 0.4)` }}>
            {count}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)', maxWidth: 56, textAlign: 'left', lineHeight: 1.2 }}>
            {t('cosmetics.crates.count', { count })}
          </span>
        </div>
        {empty ? (
          <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', clipPath: 'var(--clip-bevel-sm)', border: '1px dashed var(--border-strong)', background: 'var(--void-900)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em' }}>
            <Icon name="lock" size={13} /> {t('cosmetics.crates.toEarn')}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpen}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              marginTop: 9,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 36,
              padding: '0 20px',
              clipPath: 'var(--clip-bevel-sm)',
              border: `1px solid ${s.color}`,
              background: hover ? `rgba(${s.rgb}, 0.2)` : `rgba(${s.rgb}, 0.1)`,
              color: s.color,
              boxShadow: hover ? crateGlow(quality, 1.2) : `0 0 12px -4px rgba(${s.rgb}, ${s.glow})`,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.16em',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >
            <Icon name="package-open" size={15} /> {t('cosmetics.crates.open')}
          </button>
        )}
      </div>
    </div>
  )
}

export interface CratesPanelProps {
  crates: Record<CrateQuality, number>
  /** Solde de fragments (US-035) — affiché en en-tête. */
  fragments: number
  /** Compteur de pity (US-035) — jauge « avant légendaire garanti ». */
  pity: number
  /** Ouvre le rituel pour la qualité choisie (câblé au store par l'appelant). */
  onOpen: (quality: CrateQuality) => void
}

/**
 * Inventaire des caisses (US-034) — panneau de la Garde-robe. Une ligne par
 * qualité : compteur de caisses non ouvertes + action « Ouvrir » (désactivée à
 * 0, C2) + accès à la table de probabilités (modale interne). Rappelle le
 * garde-fou « gagnées en jouant, jamais achetées ».
 */
export function CratesPanel({ crates, fragments, pity, onOpen }: CratesPanelProps) {
  const { t } = useTranslation()
  const [oddsFor, setOddsFor] = useState<CrateQuality | null>(null)
  const total = CRATE_QUALITIES.reduce((a, q) => a + crates[q], 0)

  return (
    <Card
      hud
      brackets
      padding="18px 20px"
      style={{ position: 'relative', marginBottom: 30, overflow: 'hidden', background: `linear-gradient(160deg, rgba(var(--crate-secured-rgb), 0.05), transparent 50%), var(--bg-panel)` }}
    >
      {/* En-tête */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
          <Icon name="package" size={18} color={CRATE_ACCENT} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
            {t('cosmetics.crates.title')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
            {t('cosmetics.crates.pending', { count: total })}
          </span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FragmentBalance value={fragments} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 9px', clipPath: 'var(--clip-bevel-sm)' }}>
            <Icon name="info" size={12} /> {t('cosmetics.crates.earnedNote')}
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CRATE_QUALITIES.map((q) => (
          <CrateSlot key={q} quality={q} count={crates[q]} onOpen={() => onOpen(q)} onOdds={() => setOddsFor(q)} />
        ))}
      </div>
      {/* Jauge de pity (US-035) */}
      <div style={{ position: 'relative', marginTop: 12 }}>
        <PityMeter pity={pity} />
      </div>

      {/* Modale de table de probabilités */}
      {oddsFor && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOddsFor(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', padding: 'var(--space-4)', background: 'color-mix(in srgb, var(--bg-app) 78%, transparent)' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOddsFor(null)}
              aria-label={t('cosmetics.unlock.close')}
              style={{ position: 'absolute', top: -12, right: -12, zIndex: 1, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', clipPath: 'var(--clip-bevel-sm)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
            >
              <Icon name="x" size={15} />
            </button>
            <CrateOddsTable initial={oddsFor} />
          </div>
        </div>
      )}
    </Card>
  )
}
