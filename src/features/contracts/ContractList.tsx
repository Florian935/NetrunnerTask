import { AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Contract, Difficulty } from '../../db'
import { ContractItem } from './ContractItem'

export interface ContractListProps {
  contracts: Contract[]
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onSetDifficulty: (id: string, difficulty: Difficulty) => void
  onDelete: (contract: Contract) => void
  /** Id du contrat qui vient d'être récompensé (flash « hack réussi »). */
  flashingId: string | null
}

/** La file d'attente : en-tête de section + compteurs + lignes de contrats. */
export function ContractList({
  contracts,
  onToggle,
  onRename,
  onSetDifficulty,
  onDelete,
  flashingId,
}: ContractListProps) {
  const { t } = useTranslation()
  const active = contracts.filter((c) => c.status === 'open').length
  const done = contracts.length - active

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 13px' }}>
        <span style={{ width: 20, height: 9, background: 'var(--hatch-cyan)', flex: 'none' }} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.26em',
            color: 'var(--cyan-500)',
            textShadow: 'var(--text-glow-cyan)',
          }}
        >
          {t('contracts.queueTitle')}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.14em',
            color: 'var(--steel-400)',
          }}
        >
          {`${t('contracts.activeCount', { count: active })} · ${t('contracts.doneCount', { count: done })}`}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence initial={false}>
          {contracts.map((c) => (
            <ContractItem
              key={c.id}
              contract={c}
              onToggle={onToggle}
              onRename={onRename}
              onSetDifficulty={onSetDifficulty}
              onDelete={onDelete}
              flashing={c.id === flashingId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
