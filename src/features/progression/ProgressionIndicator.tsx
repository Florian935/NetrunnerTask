import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { progressionFor } from '../../game/progression'
import './progression.css'

/** Groupe les milliers par espace fine (ex. 1240 → « 1 240 »). */
function formatCredits(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export interface ProgressionIndicatorProps {
  /**
   * Disposition : `panel` = bloc vertical de l'en-tête (US-009) ; `bar` =
   * variante compacte horizontale de la barre de statut (US-010). @default "panel"
   */
  variant?: 'panel' | 'bar'
  /**
   * Surbrillance transitoire (bordure mint + glow pulsé) juste après un palier.
   * Piloté par la vue le temps de la rétroaction. @default false
   */
  elevated?: boolean
}

/**
 * Indicateur de progression permanent : niveau netrunner, avancement vers le
 * niveau suivant et solde de crédits. **Autonome** (abonné à `usePlayerStore`).
 * Deux dispositions : `panel` (bloc vertical, US-009) et `bar` (compact
 * horizontal de la barre de statut de l'app-shell, US-010).
 */
export function ProgressionIndicator({
  variant = 'panel',
  elevated = false,
}: ProgressionIndicatorProps) {
  const { t } = useTranslation()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { level, xpIntoLevel, xpForNextLevel, pct } = progressionFor(player.xp)

  if (variant === 'bar') {
    return (
      <div
        className={elevated ? 'nw-indicator-elevated' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '6px 12px',
          background: 'var(--bg-inset)',
          border: `1px solid ${elevated ? 'var(--mint-500)' : 'var(--border-strong)'}`,
          clipPath: 'var(--clip-bevel-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            paddingRight: 11,
            borderRight: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              color: 'var(--cyan-500)',
            }}
          >
            {t('contracts.progression.levelShort')}
          </span>
          <span
            className="nw-neon-cyan"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              lineHeight: 1,
            }}
          >
            {String(level).padStart(2, '0')}
          </span>
        </div>
        <div
          style={{
            width: 96,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <div
            style={{
              height: 5,
              background: 'var(--void-800)',
              border: '1px solid var(--border)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--mint-500)',
                boxShadow: pct > 0 ? '0 0 6px var(--mint-500)' : undefined,
                transition: 'width var(--dur-med, 320ms) var(--ease-out)',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--steel-400)',
            }}
          >
            <span style={{ color: 'var(--mint-500)' }}>{xpIntoLevel}</span> /{' '}
            {xpForNextLevel}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingLeft: 11,
            borderLeft: '1px solid var(--border)',
          }}
        >
          <Icon name="coins" size={12} color="var(--amber-500)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--amber-500)',
              textShadow: '0 0 6px rgba(255,176,32,.3)',
            }}
          >
            {formatCredits(player.credits)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--amber-500)',
            }}
          >
            ¢
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={elevated ? 'nw-indicator-elevated' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        background: 'var(--bg-inset)',
        border: `1px solid ${elevated ? 'var(--mint-500)' : 'var(--border-strong)'}`,
        clipPath: 'var(--clip-bevel-md)',
        boxShadow: elevated ? undefined : '0 0 18px -10px var(--cyan-500)',
      }}
    >
      {/* Bloc niveau */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          paddingRight: 16,
          borderRight: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.16em',
            color: 'var(--cyan-500)',
          }}
        >
          {t('contracts.progression.levelShort')}
        </span>
        <span
          className="nw-neon-cyan"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xl)',
            lineHeight: 1,
          }}
        >
          {String(level).padStart(2, '0')}
        </span>
      </div>

      {/* Avancement + crédits */}
      <div
        style={{ width: 210, display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xs)',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: elevated ? 'var(--mint-500)' : 'var(--steel-400)',
            }}
          >
            {t('contracts.progression.nextLevel')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--steel-400)',
            }}
          >
            <span style={{ color: 'var(--mint-500)' }}>{xpIntoLevel}</span> /{' '}
            {xpForNextLevel}
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: 'var(--void-800)',
            border: '1px solid var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--mint-500)',
              boxShadow: pct > 0 ? '0 0 8px var(--mint-500)' : undefined,
              transition: 'width var(--dur-med, 320ms) var(--ease-out)',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="coins" size={13} color="var(--amber-500)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-md)',
              letterSpacing: '0.04em',
              color: 'var(--amber-500)',
              textShadow: '0 0 8px rgba(255,176,32,.35)',
            }}
          >
            {formatCredits(player.credits)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--amber-500)',
            }}
          >
            ¢
          </span>
        </div>
      </div>
    </div>
  )
}
