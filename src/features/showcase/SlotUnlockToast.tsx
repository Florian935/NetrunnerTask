import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { ShowcaseSlotItem } from '../../stores/useFeedbackStore'
import './showcase.css'

export interface SlotUnlockToastProps {
  item: ShowcaseSlotItem
  /** Deep-link : ouvre la Salle des trophées + le sélecteur sur le nouvel emplacement. */
  onPin: () => void
  onClose: () => void
}

/**
 * Toast « nouvel emplacement de vitrine » (US-038) — sceau hexagonal, accent cyan
 * (chrome système ; la rareté n'intervient qu'au moment d'épingler). Ton factuel :
 * le palier de jalons, jamais le volume de collection (#043). Hébergé par
 * `AppShell` ; entrée neutralisée sous `prefers-reduced-motion` (classe globale).
 */
export function SlotUnlockToast({ item, onPin, onClose }: SlotUnlockToastProps) {
  const { t } = useTranslation()
  return (
    <div
      className="nw-toast-in"
      style={{
        position: 'relative',
        width: 348,
        clipPath: 'var(--clip-bevel-md)',
        padding: 1,
        background: 'linear-gradient(135deg, var(--cyan-500), rgba(168,85,247,.5))',
        boxShadow: 'var(--shadow-3), 0 0 26px -8px var(--cyan-500)',
      }}
    >
      <div
        className="nw-scanlines"
        style={{
          position: 'relative',
          clipPath: 'var(--clip-bevel-md)',
          background: 'linear-gradient(160deg, rgba(0,240,255,.09), transparent 60%), var(--bg-surface)',
          padding: '14px 15px',
          overflow: 'hidden',
          display: 'flex',
          gap: 13,
        }}
      >
        {/* Sceau hexagonal */}
        <span
          style={{
            position: 'relative',
            width: 42,
            height: 42,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            clipPath: 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
            background: 'rgba(0,240,255,.12)',
            color: 'var(--cyan-400)',
            boxShadow: '0 0 18px -4px var(--cyan-500)',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 2,
              clipPath: 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
              border: '1px solid rgba(0,240,255,.6)',
            }}
          />
          <Icon name="award" size={20} strokeWidth={1.6} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, letterSpacing: '0.2em', color: 'var(--frost-100)' }}>
            {t('showcase.toast.title')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
            {t('showcase.toast.body', { n: item.threshold })}
          </div>
          <button
            type="button"
            onClick={onPin}
            style={{
              marginTop: 10,
              cursor: 'pointer',
              padding: '5px 11px',
              clipPath: 'var(--clip-bevel-sm)',
              border: '1px solid var(--cyan-500)',
              background: 'rgba(0,240,255,.08)',
              color: 'var(--cyan-400)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="pin" size={12} /> {t('showcase.toast.pin')}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('showcase.toast.close')}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
          }}
        >
          <Icon name="x" size={13} />
        </button>
      </div>
    </div>
  )
}
