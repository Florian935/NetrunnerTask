import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { CrateEarnedItem } from '../../stores/useFeedbackStore'
import { CrateIcon } from './CrateIcon'
import { CRATE_STYLE } from './crateStyle'
import './cosmetics.css'

export interface CrateEarnedToastProps {
  item: CrateEarnedItem
  onClose: () => void
}

/**
 * Feedback « caisse gagnée » (US-034) — encart teinté par la qualité, annonce
 * qu'une caisse est tombée (renaissance / jalon). Même famille que les toasts de
 * jalon / déblocage. Hébergé par `AppShell`.
 */
export function CrateEarnedToast({ item, onClose }: CrateEarnedToastProps) {
  const { t } = useTranslation()
  const s = CRATE_STYLE[item.quality]

  return (
    <div
      className="nw-toast-in"
      style={{
        position: 'relative',
        width: 300,
        clipPath: 'var(--clip-bevel-md)',
        padding: 1,
        background: `linear-gradient(135deg, ${s.color}, rgba(${s.rgb}, 0.3))`,
        boxShadow: `var(--shadow-3), 0 0 24px -4px rgba(${s.rgb}, ${0.4 + s.glow * 0.5})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          clipPath: 'var(--clip-bevel-md)',
          background: `linear-gradient(160deg, rgba(${s.rgb}, 0.12), transparent 55%), var(--bg-surface)`,
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          overflow: 'hidden',
        }}
      >
        <span className="nw-scanlines" aria-hidden style={{ position: 'absolute', inset: 0 }} />
        <CrateIcon quality={item.quality} size={48} />
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.18em', color: s.color, textShadow: `0 0 10px rgba(${s.rgb}, ${s.glow * 0.7})` }}>
            <span className="nw-blink" aria-hidden style={{ display: 'inline-flex' }}>
              <Icon name="package" size={15} />
            </span>
            {t('cosmetics.crates.earned.title')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-secondary)', marginTop: 4 }}>
            {t('cosmetics.crates.earned.body', { quality: t(`cosmetics.crates.quality.${item.quality}.label`) })}
          </div>
        </div>
        <span onClick={onClose} role="button" tabIndex={0} aria-label={t('cosmetics.unlock.close')} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', flexShrink: 0 }}>
          <Icon name="x" size={15} />
        </span>
      </div>
    </div>
  )
}
