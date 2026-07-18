import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { LanguageSwitcher } from '../../features/common/LanguageSwitcher'
import { ProgressionIndicator } from '../../features/progression/ProgressionIndicator'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

/**
 * Barre de statut permanente de l'app-shell (US-010) : nom de l'écran actif +
 * indicateur de niveau compact (variante `bar`) + gains de session + langue.
 * Visible sur toutes les vues.
 */
export function StatusBar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const sessionGains = useFeedbackStore((s) => s.sessionGains)
  const levelUp = useFeedbackStore((s) => s.levelUp)

  const screen = pathname.startsWith('/contracts')
    ? t('nav.contracts')
    : t('nav.dashboard')
  const noGains = sessionGains.xp === 0 && sessionGains.credits === 0

  return (
    <div
      style={{
        height: 56,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        padding: '0 22px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,6,10,.55)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.16em',
          color: 'var(--steel-400)',
          textTransform: 'uppercase',
        }}
      >
        NIGHTWIRE // <span style={{ color: 'var(--cyan-500)' }}>{screen}</span>
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProgressionIndicator variant="bar" elevated={levelUp !== null} />

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              letterSpacing: '0.16em',
              color: 'var(--steel-600)',
            }}
          >
            {t('contracts.sessionGains')}
          </div>
          {noGains ? (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--steel-600)',
              }}
            >
              {t('contracts.sessionGainsEmpty')}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'flex-end',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--mint-500)',
                }}
              >
                +{sessionGains.xp}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--mint-500)',
                }}
              >
                XP
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--amber-500)',
                }}
              >
                +{sessionGains.credits}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--amber-500)',
                }}
              >
                ¢
              </span>
            </div>
          )}
        </div>

        <LanguageSwitcher />
      </div>
    </div>
  )
}
