import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { xpForNextLevel } from '../../game/progression'
import './progression.css'

export interface LevelUpToastProps {
  /** Niveau atteint. */
  level: number
  onClose?: () => void
}

/**
 * Toast de montée de niveau (US-009) — moment de palier, distinct du toast de
 * récompense courant : plus grand, biseauté, mint, icône + eyebrow + titre
 * display + sous-ligne. Glow pulsé, désactivé sous `prefers-reduced-motion`
 * (voir `progression.css`). Durée d'affichage pilotée par la vue (~4 s).
 */
export function LevelUpToast({ level, onClose }: LevelUpToastProps) {
  const { t } = useTranslation()
  return (
    <div
      className="nw-lvl-toast"
      onClick={onClose}
      style={{
        width: 340,
        position: 'relative',
        padding: '16px 18px',
        background:
          'linear-gradient(140deg, color-mix(in srgb, var(--mint-500) 14%, var(--void-700)), var(--void-700))',
        border: '1px solid var(--mint-500)',
        clipPath: 'var(--clip-bevel-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        cursor: onClose ? 'pointer' : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 2,
          background: 'var(--mint-500)',
          boxShadow: '0 0 10px var(--mint-500)',
        }}
      />
      <div
        className="nw-lvl-spark"
        style={{
          width: 46,
          height: 46,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'color-mix(in srgb, var(--mint-500) 16%, transparent)',
          border: '1px solid var(--mint-500)',
          clipPath: 'var(--clip-bevel-sm)',
          boxShadow: '0 0 14px -2px var(--mint-500)',
        }}
      >
        <Icon name="chevrons-up" size={24} color="var(--mint-500)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.24em',
            color: 'var(--mint-500)',
            marginBottom: 3,
          }}
        >
          {t('contracts.progression.levelUpEyebrow')}
        </div>
        <div
          className="nw-neon-mint"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            lineHeight: 1,
          }}
        >
          {t('contracts.progression.levelUpTitle', { level })}
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
          {t('contracts.progression.levelUpSubline', {
            xp: xpForNextLevel(level),
          })}
        </div>
      </div>
    </div>
  )
}
