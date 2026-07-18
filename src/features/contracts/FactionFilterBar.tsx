import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFactionsStore } from '../../stores/useFactionsStore'
import { factionLabel } from './factionLabel'

/**
 * Filtre de faction actif sur la liste (US-007). Mono-sélection :
 * - `all` : tous les contrats (défaut) ;
 * - `none` : contrats sans faction ;
 * - `{ factionId }` : une faction précise.
 */
export type FactionFilter =
  | { mode: 'all' }
  | { mode: 'none' }
  | { mode: 'faction'; factionId: string }

export interface FactionFilterBarProps {
  value: FactionFilter
  onChange: (value: FactionFilter) => void
}

/**
 * Barre de chips au-dessus de la liste des contrats (maquette 7c). « Toutes »
 * (neutre) · une chip par faction (pastille colorée) · « Sans faction » (bordure
 * en tirets). Chip active = fond néon plein + glow + texte sombre ; inactive =
 * fond void + hairline. Lit les factions dans le store (autonome).
 */
export function FactionFilterBar({ value, onChange }: FactionFilterBarProps) {
  const { t } = useTranslation()
  const factions = useFactionsStore((s) => s.factions)

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    padding: '6px 13px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-2xs)',
    letterSpacing: '0.14em',
    clipPath: 'var(--clip-bevel-sm)',
    transition: 'all var(--dur-fast) var(--ease-out)',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 18,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Toutes (accent neutre cyan quand actif) */}
      {(() => {
        const active = value.mode === 'all'
        return (
          <span
            role="button"
            onClick={() => onChange({ mode: 'all' })}
            style={{
              ...base,
              color: active ? 'var(--void-900)' : 'var(--steel-400)',
              background: active ? 'var(--cyan-500)' : 'var(--void-700)',
              border: `1px solid ${active ? 'var(--cyan-500)' : 'var(--border)'}`,
              boxShadow: active ? 'var(--glow-cyan)' : 'none',
            }}
          >
            {t('contracts.filter.all')}
          </span>
        )
      })()}

      {/* Une chip par faction */}
      {factions.map((faction) => {
        const active =
          value.mode === 'faction' && value.factionId === faction.id
        const color = faction.color
        return (
          <span
            key={faction.id}
            role="button"
            onClick={() => onChange({ mode: 'faction', factionId: faction.id })}
            style={{
              ...base,
              color: active ? 'var(--void-900)' : 'var(--steel-400)',
              background: active ? color : 'var(--void-700)',
              border: `1px solid ${active ? color : 'var(--border)'}`,
              boxShadow: active ? `0 0 14px -2px ${color}` : 'none',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: active ? 'var(--void-900)' : color,
                flex: 'none',
              }}
            />
            {factionLabel(faction, t)}
          </span>
        )
      })}

      {/* Sans faction (bordure en tirets pour la distinguer d'une faction) */}
      {(() => {
        const active = value.mode === 'none'
        return (
          <span
            role="button"
            onClick={() => onChange({ mode: 'none' })}
            style={{
              ...base,
              color: active ? 'var(--void-900)' : 'var(--steel-400)',
              background: active ? 'var(--cyan-500)' : 'var(--void-700)',
              border: `1px dashed ${active ? 'var(--cyan-500)' : 'var(--border-strong)'}`,
              boxShadow: active ? 'var(--glow-cyan)' : 'none',
            }}
          >
            {t('contracts.filter.none')}
          </span>
        )
      })()}
    </div>
  )
}
