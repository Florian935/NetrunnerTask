import { useTranslation } from 'react-i18next'
import { Icon, ProgressBar } from '../../components/ui'
import { CORRUPTION_PATH_TIERS, nextTier } from '../../game/corruption'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { prefersReducedMotion } from './corruptionStyle'
import './corruption.css'

const MINT = 'var(--mint-500)'
const MINT_RGB = '46, 255, 194'

/**
 * Progression de la **voie corrompue** (US-037) — bandeau **permanent** tant que
 * la corruption est embrassée : voltage de voie cumulé + progression vers le
 * prochain palier (toujours visible, pour savoir où l'on en est). Sa **taille ne
 * change jamais**. À chaque **Sécuriser** (événement `secure` du feedback store) :
 * un **pop `+N V`** monte et s'estompe (positionné en absolu → aucune poussée de
 * layout), la carte **flashe** en mint, et la barre progresse. Accent mint = gain
 * sûr (cohérent fragments US-035). Toutes les animations respectent
 * `prefers-reduced-motion`.
 */
export function SecureFeedback() {
  const { t } = useTranslation()
  const corruption = useCosmeticsStore((s) => s.corruption)
  const voltage = useCosmeticsStore((s) => s.securedVoltage)
  const flash = useFeedbackStore((s) => s.secure)

  if (corruption !== 'embraced') return null // voie inactive → bandeau masqué

  const np = nextTier(voltage)
  const prev = [...CORRUPTION_PATH_TIERS].reverse().find((tier) => tier.voltage <= voltage)
  const base = prev ? prev.voltage : 0
  const pct = np ? Math.max(0, Math.min(100, ((voltage - base) / (np.voltage - base)) * 100)) : 100
  const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
  const live = !prefersReducedMotion()

  return (
    <div
      style={{
        position: 'relative',
        clipPath: 'var(--clip-bevel-md, none)',
        border: `1px solid rgba(${MINT_RGB}, 0.4)`,
        background: 'linear-gradient(160deg, rgba(46, 255, 194, 0.06), transparent 55%), var(--bg-panel)',
        overflow: 'hidden',
        padding: '16px 18px',
      }}
    >
      {/* flash mint bref (absolu → aucune poussée de layout) */}
      {flash && (
        <span
          key={`glow-${flash.id}`}
          aria-hidden
          className={live ? 'nw-cor-anim' : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 0 0 30px rgba(${MINT_RGB}, 0.45)`,
            pointerEvents: 'none',
            zIndex: 4,
            animation: live ? 'nw-cor-secure-pulse 0.9s var(--ease-out) 1 forwards' : 'none',
            opacity: live ? undefined : 0.5,
          }}
        />
      )}

      {/* pop de gain « +N V » (absolu, top-right → ne pousse rien) */}
      {flash && (
        <div
          key={`pop-${flash.id}`}
          aria-hidden
          className={live ? 'nw-cor-anim' : undefined}
          style={{
            position: 'absolute',
            top: 10,
            right: 16,
            maxWidth: '42%',
            textAlign: 'right',
            pointerEvents: 'none',
            zIndex: 5,
            animation: live ? 'nw-cor-gain-pop 2.4s var(--ease-out) 1 both' : 'none',
          }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 0.95, color: 'var(--mint-400)', textShadow: 'var(--text-glow-mint, 0 0 14px rgba(46,255,194,.6))', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            +{fmt(flash.gain)} V
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.06em', color: MINT, marginTop: 3 }}>
            {t('corruption.path.secured.popDetail', { at: flash.at, mult: flash.mult.toFixed(2) })}
          </div>
        </div>
      )}

      {/* contenu PERMANENT — taille fixe */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, maxWidth: '55%', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', color: MINT, marginBottom: 14 }}>
          <Icon name="shield-check" size={14} /> {t('corruption.path.progressTitle')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)', marginBottom: 7 }}>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('corruption.path.secured.voie', { value: fmt(voltage) })}</span>
          <span style={{ color: MINT, flexShrink: 0, whiteSpace: 'nowrap' }}>{np ? t('corruption.path.secured.nextPalier', { value: fmt(np.voltage) }) : t('corruption.path.secured.complete')}</span>
        </div>
        <ProgressBar value={Math.round(pct)} accent="mint" showValue height={10} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 16, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: 8 }}>
          {np ? (
            <>
              <Icon name="lock" size={11} /> {t('corruption.path.secured.nextHint', { value: fmt(np.voltage - voltage) })}
            </>
          ) : (
            <>
              <Icon name="check-check" size={11} /> {t('corruption.path.secured.complete')}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
