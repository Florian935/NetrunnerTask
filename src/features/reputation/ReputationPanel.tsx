import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { HudPanel, Icon } from '../../components/ui'
import type { Faction } from '../../db'
import { reputationProgress } from '../../game/reputation'
import { factionLabel } from '../contracts/factionLabel'
import { useFactionsStore } from '../../stores/useFactionsStore'
import { RankInsignia } from './RankInsignia'

/**
 * Couleur de **départ** du dégradé de barre, par couleur de faction : une teinte
 * voisine vive (façon dégradés signature du design system). La barre part de
 * cette teinte et **termine sur la couleur de la faction**. Repli : même couleur.
 */
const BAR_GRADIENT_FROM: Record<string, string> = {
  'var(--cyan-500)': 'var(--violet-500)', // Boulot
  'var(--magenta-500)': 'var(--violet-500)', // Sport
  'var(--violet-500)': 'var(--magenta-500)', // Perso
  'var(--mint-500)': 'var(--cyan-500)', // Santé
  'var(--amber-500)': 'var(--magenta-500)', // Apprentissage
}

/**
 * Panneau « RÉPUTATION DES FACTIONS » (US-012, maquette 8a) — section du tableau
 * de bord. Une ligne par faction : pastille + nom + insigne de rang + rang, puis
 * barre de progression teintée vers le prochain seuil (ou état LÉGENDE / RANG MAX).
 * Réactif au store des factions (la réputation y est mise à jour à la complétion
 * et à la casse d'un streak).
 */
export function ReputationPanel() {
  const { t } = useTranslation()
  const factions = useFactionsStore((s) => s.factions)
  if (factions.length === 0) return null

  return (
    <HudPanel
      accent="cyan"
      title={t('reputation.panelTitle')}
      status={t('reputation.factionsTag', { count: factions.length })}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {factions.map((f, i) => (
          <ReputationRow key={f.id} faction={f} first={i === 0} />
        ))}
      </div>
    </HudPanel>
  )
}

function ReputationRow({ faction, first }: { faction: Faction; first: boolean }) {
  const { t } = useTranslation()
  const p = reputationProgress(faction.reputation)
  const color = faction.color
  const name = factionLabel(faction, t)
  const rankName = t(`reputation.rank.${p.rankKey}`)
  const isUnknown = p.rankKey === 'unknown'

  const rankStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.18em',
    color: isUnknown ? 'var(--steel-400)' : color,
    textShadow: isUnknown
      ? 'none'
      : `0 0 9px color-mix(in srgb, ${color} 60%, transparent)`,
    whiteSpace: 'nowrap',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '15px 2px',
        borderTop: first ? 'none' : '1px solid var(--border)',
      }}
    >
      {/* En-tête : pastille + nom + insigne + rang */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            flex: 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            letterSpacing: '0.09em',
            color: 'var(--frost-100)',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </span>
        <RankInsignia rankIndex={p.rankIndex} color={color} />
        <span style={{ flex: 1 }} />
        {p.isMax ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="crown" size={13} color={color} />
            <span style={rankStyle}>{rankName}</span>
          </span>
        ) : (
          <span style={rankStyle}>{rankName}</span>
        )}
      </div>

      {/* Progression : barre + valeur/seuil + prochain rang (ou RANG MAX) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div
          style={{
            flex: 1,
            minWidth: 60,
            position: 'relative',
            height: 6,
            background: 'var(--bg-inset)',
            border: `1px solid ${
              p.isMax
                ? `color-mix(in srgb, ${color} 45%, transparent)`
                : 'var(--border)'
            }`,
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
          }}
        >
          {p.ratio > 0 && (
            <div
              style={{
                position: 'absolute',
                inset: p.isMax ? 0 : '0 auto 0 0',
                width: p.isMax ? undefined : `${Math.round(p.ratio * 100)}%`,
                // En cours : dégradé de teinte vive partant de la teinte voisine
                // pour **terminer sur la couleur de la faction** (façon barre du
                // design system). LÉGENDE : plein.
                background: p.isMax
                  ? color
                  : `linear-gradient(90deg, ${BAR_GRADIENT_FROM[color] ?? color} 0%, ${color} 100%)`,
                boxShadow: `0 0 10px ${color}`,
                borderRadius: 'var(--radius-pill)',
              }}
            />
          )}
          {p.isMax && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'repeating-linear-gradient(-45deg,rgba(5,6,10,.32) 0 3px,transparent 3px 7px)',
              }}
            />
          )}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            color: p.isMax ? color : 'var(--frost-100)',
            whiteSpace: 'nowrap',
          }}
        >
          {p.current}
          {!p.isMax && (
            <span style={{ color: 'var(--steel-600)' }}> / {p.next}</span>
          )}
        </span>
        {p.isMax ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.14em',
              color: 'var(--void-900)',
              background: color,
              boxShadow: `0 0 10px color-mix(in srgb, ${color} 55%, transparent)`,
              padding: '3px 9px',
              clipPath: 'var(--clip-bevel-sm)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('reputation.maxRank')}
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.1em',
              color: 'var(--steel-400)',
              whiteSpace: 'nowrap',
              textAlign: 'right',
            }}
          >
            {t('reputation.next', {
              rank: p.nextRankKey ? t(`reputation.rank.${p.nextRankKey}`) : '',
            })}
          </span>
        )}
      </div>
    </div>
  )
}
