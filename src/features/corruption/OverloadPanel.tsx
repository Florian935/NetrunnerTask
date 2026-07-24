import { useTranslation } from 'react-i18next'
import { Icon, ProgressBar } from '../../components/ui'
import { canSecure, dopageMultiplier, securedGain } from '../../game/corruption'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { COR_COLOR, COR_COLOR_HOVER, COR_HOT, COR_RGB, corGlow, prefersReducedMotion } from './corruptionStyle'
import { GlitchText } from './GlitchText'
import { Interference } from './Interference'
import { OverloadRing } from './OverloadRing'
import './corruption.css'

/** Danger 0→1 : nul avant ~58 %, plein au seuil critique. */
function dangerOf(gauge: number): number {
  return Math.max(0, Math.min(1, (gauge - 58) / 42))
}

type PhaseKey = 'stable' | 'tension' | 'critique' | 'krach'
function phaseOf(gauge: number, krach: boolean): PhaseKey {
  if (krach) return 'krach'
  if (gauge >= 85) return 'critique'
  if (gauge >= 60) return 'tension'
  return 'stable'
}
const PHASE_META: Record<PhaseKey, { color: string; icon: string }> = {
  stable: { color: COR_COLOR_HOVER, icon: 'activity' },
  tension: { color: COR_COLOR, icon: 'zap' },
  critique: { color: COR_HOT, icon: 'alert-triangle' },
  krach: { color: COR_HOT, icon: 'zap-off' },
}

export interface OverloadPanelProps {
  /** Variante dense (colonne stage). */
  compact?: boolean
}

/**
 * Panneau **Surcharge** de la voie corrompue (US-037) — la surface centrale.
 * Visible **seulement** si la corruption est embrassée. La jauge (anneau
 * `OverloadRing`) charge en temps réel et **dope** la production (×N au centre) ;
 * l'ambiance (`Interference`) et l'alerte de risque montent avec la surcharge ;
 * au seuil critique elle **krache** (secousse + flash, lu depuis le feedback
 * store). Le bouton **Sécuriser** encaisse la surcharge en voltage (sans krach).
 * Toutes les animations respectent `prefers-reduced-motion`.
 */
export function OverloadPanel({ compact = false }: OverloadPanelProps) {
  const { t } = useTranslation()
  const corruption = useCosmeticsStore((s) => s.corruption)
  const surcharge = useBuilderStore((s) => s.surcharge)
  const secure = useBuilderStore((s) => s.secureSurcharge)
  const krachEvt = useFeedbackStore((s) => s.corruptionKrach)

  if (corruption !== 'embraced') return null // voie inactive → panneau masqué

  const krach = krachEvt !== null
  const danger = dangerOf(surcharge)
  const mult = dopageMultiplier(surcharge)
  const phase = phaseOf(surcharge, krach)
  const meta = PHASE_META[phase]
  const canSec = canSecure(surcharge) && !krach
  const gain = securedGain(surcharge)
  const ringSize = compact ? 150 : 210
  const live = !prefersReducedMotion()
  const shake = krach && live

  return (
    <div
      style={{
        position: 'relative',
        clipPath: 'var(--clip-notch, none)',
        border: `1px solid rgba(${COR_RGB}, ${0.4 + danger * 0.4})`,
        background: `linear-gradient(165deg, rgba(${COR_RGB}, ${0.05 + danger * 0.07}), transparent 55%), var(--bg-panel)`,
        overflow: 'hidden',
        boxShadow: krach ? corGlow(1.6) : corGlow(0.6 + danger * 0.8),
        transition: 'box-shadow .2s linear, border-color .2s linear',
      }}
    >
      {/* ambiance locale branchée sur la surcharge : le panneau « chauffe » vers le krach */}
      <Interference level={krach ? 1 : 0.18 + danger * 0.62} animated={live} blocks={danger > 0.3 || krach} />
      {/* flash de krach */}
      {shake && (
        <span
          aria-hidden
          className="nw-cor-anim"
          style={{ position: 'absolute', inset: 0, background: `rgba(${COR_RGB}, 0.28)`, mixBlendMode: 'screen', animation: 'nw-cor-krach-flash .6s steps(2) 1', zIndex: 4, pointerEvents: 'none' }}
        />
      )}
      <div
        className={shake ? 'nw-cor-anim' : undefined}
        style={{
          position: 'relative',
          zIndex: 3,
          padding: compact ? '16px 18px 18px' : '20px 24px 22px',
          animation: shake ? 'nw-cor-krach-shake .6s steps(2) 1' : 'none',
        }}
      >
        {/* en-tête + phase */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: compact ? 12 : 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
            <Icon name="waves" size={14} /> {t('corruption.path.header')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${COR_RGB}, 0.5)`, background: `rgba(${COR_RGB}, 0.08)`, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: meta.color }}>
            <Icon name={meta.icon} size={12} /> {t(`corruption.path.phase.${phase}`)}
          </span>
        </div>

        {/* anneau + lecture dopage */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: compact ? '2px 0 6px' : '4px 0 10px' }}>
          <OverloadRing size={ringSize} gauge={surcharge} danger={danger} krach={krach} live={live}>
            {krach ? (
              <div style={{ textAlign: 'center' }}>
                <GlitchText text={t('corruption.path.krach')} size={compact ? 26 : 34} letterSpacing="0.06em" color={COR_HOT} animated={live} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', color: COR_COLOR_HOVER, marginTop: 4 }}>{t('corruption.path.rampWasted')}</div>
              </div>
            ) : (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.24em', color: 'var(--text-muted)' }}>{t('corruption.path.dopage')}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: compact ? 34 : 46, lineHeight: 1, color: 'var(--frost-100)', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 ${10 + danger * 18}px rgba(${COR_RGB}, ${0.5 + danger * 0.4})` }}>×{mult.toFixed(2)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.14em', color: meta.color, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                  {t('corruption.path.level', { value: Math.round(surcharge) })}
                </span>
              </>
            )}
          </OverloadRing>
        </div>

        {/* trace d'instabilité (lecture secondaire) */}
        <div style={{ marginTop: compact ? 4 : 8, marginBottom: compact ? 12 : 14 }}>
          <ProgressBar value={Math.round(surcharge)} accent="magenta" label={t('corruption.path.trace')} showValue height={8} />
        </div>

        {/* alerte de risque */}
        <div style={{ minHeight: 34, marginBottom: 12 }}>
          {krach ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 34, clipPath: 'var(--clip-bevel-sm)', border: `1px solid ${COR_HOT}`, background: `rgba(${COR_RGB}, 0.18)`, color: COR_HOT, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.14em' }}>
              <Icon name="zap-off" size={15} /> {t('corruption.path.krachLine')}
            </div>
          ) : danger > 0.28 ? (
            <div
              className={live ? 'nw-cor-anim' : undefined}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 34, clipPath: 'var(--clip-bevel-sm)', border: `1px solid ${meta.color}`, background: `rgba(${COR_RGB}, ${0.08 + danger * 0.1})`, color: meta.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', animation: live ? `nw-cor-flicker ${(1.4 - danger).toFixed(1)}s steps(2) infinite` : 'none' }}
            >
              <Icon name="alert-triangle" size={14} /> {danger > 0.72 ? t('corruption.path.riskCritical') : t('corruption.path.riskTension')}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 34, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Icon name="trending-up" size={13} /> {t('corruption.path.riskHint')}
            </div>
          )}
        </div>

        {/* Sécuriser */}
        <button
          type="button"
          onClick={secure}
          disabled={!canSec}
          style={{
            width: '100%',
            cursor: canSec ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            height: 48,
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px solid ${canSec ? COR_COLOR : 'var(--border)'}`,
            background: canSec ? `rgba(${COR_RGB}, ${0.12 + danger * 0.1})` : 'var(--void-900)',
            color: canSec ? COR_COLOR_HOVER : 'var(--text-muted)',
            boxShadow: canSec ? corGlow(0.8 + danger) : 'none',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-md)',
            letterSpacing: '0.14em',
            opacity: canSec ? 1 : 0.55,
            transition: 'all var(--dur-fast) var(--ease-out)',
          }}
        >
          <Icon name="shield-check" size={18} /> {t('corruption.path.secure')}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.06em', opacity: 0.85 }}>
            +{gain.toLocaleString('fr-FR')} V
          </span>
        </button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          {t('corruption.path.secureHint')}
        </div>
      </div>
    </div>
  )
}
