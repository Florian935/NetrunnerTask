import { useTranslation } from 'react-i18next'
import type { RepGainItem } from '../../stores/useFeedbackStore'
import './reputation.css'

/**
 * Micro-toast de gain de réputation (US-012, maquette 8d-A) : biseauté, teinté
 * de la couleur faction, liseré néon à gauche, « +N » + libellé RÉPUTATION +
 * faction, et `avant→après` à droite. Auto-disparition pilotée par le store (~2,6 s).
 */
export function ReputationGainToast({ item }: { item: RepGainItem }) {
  const { t } = useTranslation()
  const c = item.color
  return (
    <div
      className="nw-repgain-in"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 15px',
        minWidth: 260,
        background: `linear-gradient(100deg, color-mix(in srgb, ${c} 12%, var(--void-700)), var(--void-700))`,
        border: `1px solid color-mix(in srgb, ${c} 50%, transparent)`,
        clipPath: 'var(--clip-bevel-md)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: c,
          boxShadow: `0 0 10px ${c}`,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1,
          color: c,
          textShadow: `0 0 12px color-mix(in srgb, ${c} 65%, transparent)`,
        }}
      >
        +{item.delta}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.2em',
            color: 'var(--steel-400)',
          }}
        >
          {t('reputation.gainLabel')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: c,
              boxShadow: `0 0 6px ${c}`,
              flex: 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.14em',
              color: 'var(--frost-100)',
              textTransform: 'uppercase',
            }}
          >
            {item.factionName}
          </span>
        </span>
      </div>
      <span style={{ flex: 1 }} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--steel-600)',
          whiteSpace: 'nowrap',
        }}
      >
        {item.before}→{item.after}
      </span>
    </div>
  )
}
