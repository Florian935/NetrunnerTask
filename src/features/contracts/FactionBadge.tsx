import { useTranslation } from 'react-i18next'
import { useFactionsStore } from '../../stores/useFactionsStore'
import { factionLabel } from './factionLabel'

export interface FactionBadgeProps {
  /** Faction rattachée au contrat ; `null` = aucune → aucun badge rendu. */
  factionId: string | null
}

/**
 * Badge de faction sur la ligne d'un contrat (US-007). Autonome : résout la
 * faction depuis le store à partir de son `id` et rend `null` s'il n'y a pas de
 * faction (ou si elle est introuvable) — l'appelant écrit simplement
 * `<FactionBadge factionId={contract.factionId} />`. Pastille couleur + libellé
 * mono en capitales sur un fond biseauté teinté (même facture que la puce
 * d'échéance). La couleur vient de `faction.color` (token NIGHTWIRE).
 */
export function FactionBadge({ factionId }: FactionBadgeProps) {
  const { t } = useTranslation()
  const faction = useFactionsStore((s) =>
    factionId ? (s.factions.find((f) => f.id === factionId) ?? null) : null,
  )
  if (!faction) return null

  const color = faction.color
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 7px',
        flex: 'none',
        clipPath: 'var(--clip-bevel-sm)',
        background: `color-mix(in srgb, ${color} 12%, var(--bg-inset))`,
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flex: 'none',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.14em',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {factionLabel(faction, t)}
      </span>
    </span>
  )
}
