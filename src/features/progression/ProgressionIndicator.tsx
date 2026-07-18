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
   * Surbrillance transitoire (bordure mint + glow pulsé) juste après un palier.
   * Piloté par la vue le temps de la rétroaction. @default false
   */
  elevated?: boolean
}

/**
 * Indicateur de progression permanent (US-009) : niveau netrunner, avancement
 * vers le niveau suivant et solde de crédits. Bloc cadré + biseauté, distinct
 * des gains de session éphémères. **Autonome** (abonné à `usePlayerStore`,
 * aucune dépendance à l'écran hôte) → réemployable tel quel dans le HUD (US-010).
 */
export function ProgressionIndicator({
  elevated = false,
}: ProgressionIndicatorProps) {
  const { t } = useTranslation()
  const player = usePlayerStore((s) => s.player)
  if (!player) return null

  const { level, xpIntoLevel, xpForNextLevel, pct } = progressionFor(player.xp)

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
