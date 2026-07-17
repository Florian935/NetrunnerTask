import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Checkbox, IconButton, Input } from '../../components/ui'
import type { Contract, Difficulty } from '../../db'
import { DIFFICULTY_ACCENTS, rewardFor } from '../../game/rewards'
import { contractCode } from './contractCode'
import { DifficultyDots } from './DifficultyDots'

export interface ContractItemProps {
  contract: Contract
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onSetDifficulty: (id: string, difficulty: Difficulty) => void
  onDelete: (contract: Contract) => void
  /** Flash « hack réussi » (glow mint transitoire) après une complétion payante. */
  flashing?: boolean
}

/**
 * Une ligne de contrat : mode vue (cocher / éditer / supprimer) ou édition du
 * titre + difficulté. Le conteneur est un `motion.div` : `layout` anime le
 * réordonnancement (terminé/ré-ouvert) et `AnimatePresence` (côté liste)
 * l'entrée/sortie. Un flash mint souligne la récompense encaissée.
 */
export function ContractItem({
  contract,
  onToggle,
  onRename,
  onSetDifficulty,
  onDelete,
  flashing = false,
}: ContractItemProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(contract.title)
  const done = contract.status === 'done'
  const accent = DIFFICULTY_ACCENTS[contract.difficulty]
  const reward = rewardFor(contract.difficulty)

  const startEdit = () => {
    setDraft(contract.title)
    setEditing(true)
  }
  const save = () => {
    const title = draft.trim()
    if (title) onRename(contract.id, title)
    setEditing(false)
  }
  const cancel = () => setEditing(false)
  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') cancel()
  }

  const borderColor = editing
    ? 'var(--cyan-500)'
    : flashing
      ? 'var(--mint-500)'
      : 'var(--border)'
  // Le halo (box-shadow) est piloté par CSS (classes `ctr-row--editing` /
  // `ctr-row--flashing`), pas en style inline : Framer Motion applique les styles
  // de façon impérative et ne *retire* pas une clé disparue entre deux rendus →
  // un box-shadow inline resterait figé après édition/flash. Les classes évitent
  // ce piège et préservent le liseré au survol quand la ligne est au repos.
  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: editing ? 10 : 13,
    padding: '11px 13px',
    borderRadius: 'var(--radius-sm)',
    background: editing ? 'var(--bg-inset)' : 'var(--void-700)',
    border: `1px solid ${borderColor}`,
    transition: 'border-color var(--dur-med) var(--ease-out)',
  }
  const rowClass = `ctr-row${editing ? ' ctr-row--editing' : ''}${
    flashing ? ' ctr-row--flashing' : ''
  }`

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
      {editing ? (
        <>
          <Input
            size="md"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onEditKey}
            style={{ flex: 1 }}
          />
          <div
            style={{ flex: 'none' }}
            title={t('contracts.difficultyLabel')}
          >
            <DifficultyDots
              value={contract.difficulty}
              onChange={(d) => onSetDifficulty(contract.id, d)}
            />
          </div>
          <IconButton
            name="check"
            size="sm"
            variant="outline"
            title={t('contracts.item.save')}
            onClick={save}
          />
          <IconButton
            name="x"
            size="sm"
            title={t('contracts.item.cancel')}
            onClick={cancel}
          />
        </>
      ) : (
        <>
          <Checkbox checked={done} onChange={() => onToggle(contract.id)} />
          <div
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
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
              title={t('contracts.item.edit')}
              onClick={startEdit}
            />
            <IconButton
              name="trash-2"
              size="sm"
              title={t('contracts.item.delete')}
              onClick={() => onDelete(contract)}
              style={{ color: 'var(--red-500)' }}
            />
          </div>
        </>
      )}
    </motion.div>
  )
}
