import { useTranslation } from 'react-i18next'
import { Checkbox } from '../../components/ui'
import type { Contract } from '../../db'
import { DIFFICULTY_ACCENTS } from '../../game/rewards'
import { contractCode } from '../contracts/contractCode'
import { formatDueShort } from '../contracts/dueDate'
import { PriorityBars } from '../contracts/PriorityBars'

export interface TodayContractRowProps {
  contract: Contract
  /** Groupe d'appartenance : pilote la couleur (liseré + puce d'échéance). */
  kind: 'overdue' | 'today'
  onToggle: (id: string) => void
  onOpen: (contract: Contract) => void
}

/**
 * Ligne compacte du HUD (US-010) : case + priorité + titre + code/difficulté +
 * puce d'échéance, liseré gauche coloré selon le groupe. Volontairement plus
 * légère que `ContractItem` (pas d'outils éditer/supprimer) ; cliquer le titre
 * ouvre le détail.
 */
export function TodayContractRow({
  contract,
  kind,
  onToggle,
  onOpen,
}: TodayContractRowProps) {
  const { t } = useTranslation()
  const accent = DIFFICULTY_ACCENTS[contract.difficulty]
  const color = kind === 'overdue' ? 'var(--red-500)' : 'var(--amber-500)'
  const chipLabel =
    kind === 'overdue'
      ? `${t('contracts.due.overdue')} · ${contract.dueDate ? formatDueShort(contract.dueDate) : ''}`
      : t('contracts.due.today')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 13px',
        background: 'var(--void-700)',
        border: '1px solid var(--border)',
        borderLeft: `2px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <Checkbox checked={false} onChange={() => onToggle(contract.id)} />
      <PriorityBars
        priority={contract.priority}
        label={`${t('contracts.priorityLabel')} ${t(`contracts.priority.${contract.priority}`)}`}
      />
      <button
        type="button"
        onClick={() => onOpen(contract)}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          textAlign: 'left',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            color: 'var(--frost-100)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {contract.title}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.12em',
              color: 'var(--steel-600)',
            }}
          >
            {t('contracts.item.codePrefix')} · {contractCode(contract.id)}
          </span>
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 6px ${accent}`,
                flex: 'none',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.12em',
                color: accent,
              }}
            >
              {t(`contracts.difficulty.${contract.difficulty}`)}
            </span>
          </span>
        </span>
      </button>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          flex: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.1em',
          color,
          clipPath: 'var(--clip-bevel-sm)',
          background: `color-mix(in srgb, ${color} 12%, var(--bg-inset))`,
          border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
        }}
      >
        ◷ <b style={{ fontWeight: 700 }}>{chipLabel}</b>
      </span>
    </div>
  )
}
