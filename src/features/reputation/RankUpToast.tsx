import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { RankUpItem } from '../../stores/useFeedbackStore'
import './reputation.css'

/**
 * Toast de passage de rang (US-012, maquette 8d-B) — moment de palier, même
 * famille que le `LevelUpToast` : biseauté, teinté faction, liseré supérieur,
 * icône `shield-check`, eyebrow + nom du rang (display) + sous-ligne
 * « ancien → nouveau · seuil ». Glow pulsé (désactivé sous reduced-motion).
 * Durée pilotée par le store (~4 s).
 */
export function RankUpToast({
  item,
  onClose,
}: {
  item: RankUpItem
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const c = item.color
  const toRank = t(`reputation.rank.${item.toRankKey}`)
  const fromRank = t(`reputation.rank.${item.fromRankKey}`)

  return (
    <div
      className="nw-rank-toast"
      onClick={onClose}
      style={
        {
          '--rank-c': c,
          width: 320,
          position: 'relative',
          padding: '15px 17px',
          background: `linear-gradient(140deg, color-mix(in srgb, ${c} 14%, var(--void-700)), var(--void-700))`,
          border: `1px solid ${c}`,
          clipPath: 'var(--clip-bevel-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: onClose ? 'pointer' : undefined,
        } as CSSProperties
      }
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 2,
          background: c,
          boxShadow: `0 0 10px ${c}`,
        }}
      />
      <div
        className="nw-rank-spark"
        style={{
          width: 44,
          height: 44,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `color-mix(in srgb, ${c} 16%, transparent)`,
          border: `1px solid ${c}`,
          clipPath: 'var(--clip-bevel-sm)',
          boxShadow: `0 0 14px -2px ${c}`,
        }}
      >
        <Icon name="shield-check" size={22} color={c} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.22em',
            color: c,
            marginBottom: 3,
          }}
        >
          {t('reputation.rankUp.overline', { faction: item.factionName })}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            lineHeight: 1,
            color: 'var(--frost-100)',
            textShadow: `0 0 12px color-mix(in srgb, ${c} 55%, transparent)`,
          }}
        >
          {toRank}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.08em',
            color: 'var(--steel-400)',
            marginTop: 5,
          }}
        >
          {t('reputation.rankUp.detail', {
            from: fromRank,
            to: toRank,
            threshold: item.threshold,
          })}
        </div>
      </div>
    </div>
  )
}
