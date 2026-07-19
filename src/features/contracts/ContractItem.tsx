import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Checkbox, Icon, IconButton } from '../../components/ui'
import type { Contract } from '../../db'
import { DIFFICULTY_ACCENTS, rewardFor } from '../../game/rewards'
import { contractCode } from './contractCode'
import { FactionBadge } from './FactionBadge'
import { PriorityBars } from './PriorityBars'
import { RecurrenceChip } from './RecurrenceChip'
import { StakeChip } from './StakeChip'
import { StreakChip } from './StreakChip'
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
          const state = dueStatus(
            contract.dueDate,
            contract.dueHasTime,
            Date.now(),
          )
          const tag =
            state === 'overdue'
              ? t('contracts.due.overdue')
              : state === 'soon'
                ? t('contracts.due.soon')
                : ''
          return {
            color: DUE_COLORS[state],
            neutral: state === 'neutral',
            date: formatDueShort(contract.dueDate, contract.dueHasTime),
            tag,
          }
        })()
      : null

  // Rappel actif (US-014) : cloche violette sur la ligne (contrat horodaté ouvert).
  const hasReminder = !done && contract.reminderLead != null

  const subtotal = contract.subtasks.length
  const subdone = contract.subtasks.filter((s) => s.done).length

  // Récurrent **validé** pour ce cycle (US-006) : case cochée mais **verrouillée**
  // (anti-farm) jusqu'à la réactivation ; on montre « ⟳ revient le … ».
  const recurringDone = done && contract.recurrence != null

  // Surface, halo (box-shadow), bordure et coins sont pilotés par CSS (classe
  // `.ctr-row`, cf. contracts.css) — pas en style inline : Framer Motion ne
  // retire pas une clé de style disparue entre deux rendus (un box-shadow/border
  // inline resterait figé). L'inline ne porte que la mise en page + la couleur
  // du halo `--ctr-halo` (accent de difficulté ; muté en gris si terminé).
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '11px 13px',
    ['--ctr-halo']: done ? 'var(--steel-600)' : accent,
  } as CSSProperties
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
      <span className="ctr-row__bracket ctr-row__bracket--tr" aria-hidden />
      <span className="ctr-row__bracket ctr-row__bracket--bl" aria-hidden />
      <Checkbox
        checked={done}
        disabled={recurringDone}
        title={
          recurringDone && contract.dueDate != null
            ? t('contracts.recurrence.lockedTooltip', {
                date: formatDueShort(contract.dueDate, contract.dueHasTime),
              })
            : undefined
        }
        onChange={() => onToggle(contract.id)}
      />
      {!done && (
        <PriorityBars
          priority={contract.priority}
          label={`${t('contracts.priorityLabel')} ${t(`contracts.priority.${contract.priority}`)}`}
        />
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            flexWrap: 'wrap',
          }}
        >
          <FactionBadge factionId={contract.factionId} />
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
                letterSpacing: '0.14em',
                lineHeight: 1,
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
              {t('contracts.reward', {
                xp: reward.xp,
                credits: reward.credits,
              })}
            </span>
          )}
          {contract.recurrence && (
            <StreakChip
              current={contract.currentStreak}
              best={contract.bestStreak}
            />
          )}
          {/* Mise à risque (US-013) — exclusive de la série (one-shot). */}
          <StakeChip
            outcome={contract.stakeOutcome}
            stake={contract.stake}
            difficulty={contract.difficulty}
          />
          {!done && contract.recurrence && (
            <RecurrenceChip recurrence={contract.recurrence} />
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
          {hasReminder && (
            <span
              title={t('contracts.reminder.active')}
              aria-label={t('contracts.reminder.active')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--violet-400)',
                flex: 'none',
              }}
            >
              <Icon name="bell" size={13} />
            </span>
          )}
          {subtotal > 0 && (
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Icon name="list-checks" size={12} color="var(--steel-400)" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-2xs)',
                  letterSpacing: '0.08em',
                  color:
                    subdone === subtotal
                      ? 'var(--mint-500)'
                      : 'var(--steel-400)',
                }}
              >
                {t('contracts.subtasks.progress', {
                  done: subdone,
                  total: subtotal,
                })}
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
            background:
              'color-mix(in srgb, var(--mint-500) 10%, var(--bg-inset))',
            border:
              '1px solid color-mix(in srgb, var(--mint-500) 40%, transparent)',
            clipPath: 'var(--clip-bevel-sm)',
            flex: 'none',
          }}
        >
          {recurringDone && contract.dueDate != null
            ? t('contracts.recurrence.returns', {
                date: formatDueShort(contract.dueDate, contract.dueHasTime),
              })
            : t('contracts.item.done')}
        </span>
      )}
      <div
        className="ctr-tools"
        style={{ display: 'flex', gap: 3, flex: 'none' }}
      >
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
