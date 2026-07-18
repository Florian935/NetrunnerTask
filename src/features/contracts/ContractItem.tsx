import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Checkbox, Icon, IconButton } from '../../components/ui'
import type { Contract } from '../../db'
import { DIFFICULTY_ACCENTS, rewardFor } from '../../game/rewards'
import { contractCode } from './contractCode'
import { PriorityBars } from './PriorityBars'
import { DUE_COLORS, dueStatus, formatDueShort } from './dueDate'

export interface ContractItemProps {
  contract: Contract
  onToggle: (id: string) => void
  onOpenDetail: (contract: Contract) => void
  onDelete: (contract: Contract) => void
  /** Flash « hack réussi » (glow mint transitoire) après une complétion payante. */
  flashing?: boolean
}

/**
 * Une ligne de contrat (mode vue). Toute l'édition (titre, difficulté, priorité,
 * échéance, sous-tâches) se fait dans la **surface de détail** ouverte via le
 * bouton « modifier » — surface d'édition unique (US-005). Le conteneur est un
 * `motion.div` : `layout` anime le réordonnancement, `AnimatePresence` (côté
 * liste) l'entrée/sortie ; un flash mint souligne la récompense encaissée.
 */
export function ContractItem({
  contract,
  onToggle,
  onOpenDetail,
  onDelete,
  flashing = false,
}: ContractItemProps) {
  const { t } = useTranslation()
  const done = contract.status === 'done'
  const accent = DIFFICULTY_ACCENTS[contract.difficulty]
  const reward = rewardFor(contract.difficulty)

  // Échéance (US-005) : signalée seulement sur un contrat ouvert.
  const due =
    !done && contract.dueDate != null
      ? (() => {
          const state = dueStatus(contract.dueDate, Date.now())
          const tag =
            state === 'overdue'
              ? t('contracts.due.overdue')
              : state === 'soon'
                ? t('contracts.due.soon')
                : ''
          return {
            color: DUE_COLORS[state],
            neutral: state === 'neutral',
            date: formatDueShort(contract.dueDate),
            tag,
          }
        })()
      : null

  const subtotal = contract.subtasks.length
  const subdone = contract.subtasks.filter((s) => s.done).length

  // Le halo (box-shadow) est piloté par CSS (classe `ctr-row--flashing`), pas en
  // style inline : Framer Motion ne retire pas une clé de style disparue entre
  // deux rendus → un box-shadow inline resterait figé.
  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '11px 13px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--void-700)',
    border: `1px solid ${flashing ? 'var(--mint-500)' : 'var(--border)'}`,
    transition: 'border-color var(--dur-med) var(--ease-out)',
  }
  const rowClass = `ctr-row${flashing ? ' ctr-row--flashing' : ''}`

  return (
    <motion.div
      className={rowClass}
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      style={rowStyle}
    >
      <Checkbox checked={done} onChange={() => onToggle(contract.id)} />
      {!done && (
        <PriorityBars
          priority={contract.priority}
          label={`${t('contracts.priorityLabel')} ${t(`contracts.priority.${contract.priority}`)}`}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            letterSpacing: '0.01em',
            color: done ? 'var(--steel-600)' : 'var(--frost-100)',
            textDecoration: done ? 'line-through' : 'none',
            textDecorationColor: 'var(--mint-500)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {contract.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
                letterSpacing: '0.14em',
                color: accent,
                whiteSpace: 'nowrap',
              }}
            >
              {t(`contracts.difficulty.${contract.difficulty}`)}
            </span>
          </span>
          {!done && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.08em',
                color: 'var(--steel-400)',
              }}
            >
              {t('contracts.reward', { xp: reward.xp, credits: reward.credits })}
            </span>
          )}
          {due && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 7px',
                flex: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: '0.1em',
                color: due.color,
                clipPath: 'var(--clip-bevel-sm)',
                background: due.neutral
                  ? 'transparent'
                  : `color-mix(in srgb, ${due.color} 12%, var(--bg-inset))`,
                border: `1px solid ${
                  due.neutral
                    ? 'var(--border)'
                    : `color-mix(in srgb, ${due.color} 45%, transparent)`
                }`,
              }}
            >
              ◷ {due.date}
              {due.tag && <b style={{ fontWeight: 700 }}> · {due.tag}</b>}
            </span>
          )}
          {subtotal > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="list-checks" size={12} color="var(--steel-400)" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: '0.08em',
                  color: subdone === subtotal ? 'var(--mint-500)' : 'var(--steel-400)',
                }}
              >
                {t('contracts.subtasks.progress', { done: subdone, total: subtotal })}
              </span>
            </span>
          )}
        </div>
      </div>
      {done && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 9px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.14em',
            color: 'var(--mint-500)',
            background: 'color-mix(in srgb, var(--mint-500) 10%, var(--bg-inset))',
            border: '1px solid color-mix(in srgb, var(--mint-500) 40%, transparent)',
            clipPath: 'var(--clip-bevel-sm)',
            flex: 'none',
          }}
        >
          {t('contracts.item.done')}
        </span>
      )}
      <div className="ctr-tools" style={{ display: 'flex', gap: 3, flex: 'none' }}>
        <IconButton
          name="square-pen"
          size="sm"
          variant="outline"
          title={t('contracts.item.edit')}
          onClick={() => onOpenDetail(contract)}
        />
        <IconButton
          name="trash-2"
          size="sm"
          title={t('contracts.item.delete')}
          onClick={() => onDelete(contract)}
          style={{ color: 'var(--red-500)' }}
        />
      </div>
    </motion.div>
  )
}
