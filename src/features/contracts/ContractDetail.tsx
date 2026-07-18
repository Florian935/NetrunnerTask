import { useEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Checkbox,
  HudPanel,
  IconButton,
  Input,
  ProgressBar,
} from '../../components/ui'
import type {
  Contract,
  Difficulty,
  Faction,
  Priority,
  Recurrence,
} from '../../db'
import { DIFFICULTY_ACCENTS, rewardFor } from '../../game/rewards'
import { PRIORITY_BARS, PRIORITY_ORDER } from '../../game/priority'
import { contractCode } from './contractCode'
import { DifficultyDots } from './DifficultyDots'
import { fromDateInputValue, toDateInputValue } from './dueDate'
import { factionLabel } from './factionLabel'
import { RecurrenceControl } from './RecurrenceControl'

export interface ContractDetailProps {
  contract: Contract
  /** Factions disponibles pour le sélecteur (US-007). */
  factions: Faction[]
  onRename: (id: string, title: string) => void
  onSetDifficulty: (id: string, difficulty: Difficulty) => void
  onSetFaction: (id: string, factionId: string | null) => void
  onSetPriority: (id: string, priority: Priority) => void
  onSetDueDate: (id: string, dueDate: number | null) => void
  onSetRecurrence: (id: string, recurrence: Recurrence | null) => void
  onAddSubtask: (id: string, title: string) => void
  onToggleSubtask: (id: string, subtaskId: string) => void
  onRemoveSubtask: (id: string, subtaskId: string) => void
  onClose: () => void
}

/**
 * Surface de détail d'un contrat (US-005) : réglage de la priorité, de
 * l'échéance et des sous-tâches. Overlay + `HudPanel` cyan (même coque que
 * `ConfirmDialog` — NIGHTWIRE n'a pas de composant modal). Titre et difficulté
 * en lecture seule (édition via le crayon inline). Échap / clic-hors = fermer.
 */
export function ContractDetail({
  contract,
  factions,
  onRename,
  onSetDifficulty,
  onSetFaction,
  onSetPriority,
  onSetDueDate,
  onSetRecurrence,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onClose,
}: ContractDetailProps) {
  const { t } = useTranslation()
  const [subDraft, setSubDraft] = useState('')
  // Titre édité en local ; persisté seulement quand il n'est pas vide (on ne
  // supprime jamais le titre par une saisie vide transitoire).
  const [titleDraft, setTitleDraft] = useState(contract.title)

  const onTitleChange = (value: string) => {
    setTitleDraft(value)
    const trimmed = value.trim()
    if (trimmed) onRename(contract.id, trimmed)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const stop = (e: MouseEvent) => e.stopPropagation()

  const accent = DIFFICULTY_ACCENTS[contract.difficulty]
  const reward = rewardFor(contract.difficulty)
  const subs = contract.subtasks
  const subdone = subs.filter((s) => s.done).length
  const subpct = subs.length ? (subdone / subs.length) * 100 : 0
  // Affichage : sous-tâches ouvertes d'abord, cochées en bas (tri stable dérivé —
  // l'ordre stocké est inchangé). Cocher fait glisser l'étape vers le bas.
  const orderedSubs = [...subs].sort((a, b) => Number(a.done) - Number(b.done))
  const hasDue = contract.dueDate != null

  const addSub = () => {
    const title = subDraft.trim()
    if (!title) return
    onAddSubtask(contract.id, title)
    setSubDraft('')
  }
  const onSubKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSub()
    }
  }

  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-2xs)',
    letterSpacing: '0.16em',
    color: 'var(--steel-400)',
  }

  return (
    <div
      className="nw-overlay-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 22,
        background: 'rgba(5,6,10,.76)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="nw-modal-in"
        onClick={stop}
        style={{ width: 520, maxWidth: '100%' }}
      >
        <HudPanel
          accent="cyan"
          title={t('contracts.detail.title')}
          status={contractCode(contract.id)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Intitulé + difficulté (éditables) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>{t('contracts.detail.titleField')}</span>
              <Input
                size="md"
                value={titleDraft}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <DifficultyDots
                  value={contract.difficulty}
                  onChange={(d) => onSetDifficulty(contract.id, d)}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-2xs)',
                    letterSpacing: '0.12em',
                    color: accent,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t(`contracts.difficulty.${contract.difficulty}`)} ·{' '}
                  {t('contracts.reward', {
                    xp: reward.xp,
                    credits: reward.credits,
                  })}
                </span>
              </div>
            </div>

            {/* Faction (US-007) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>{t('contracts.faction.label')}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {/* Aucune faction */}
                {(() => {
                  const selected = contract.factionId == null
                  return (
                    <span
                      role="button"
                      onClick={() => onSetFaction(contract.id, null)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '6px 11px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        letterSpacing: '0.12em',
                        clipPath: 'var(--clip-bevel-sm)',
                        color: selected
                          ? 'var(--frost-100)'
                          : 'var(--steel-400)',
                        background: selected
                          ? 'var(--steel-600)'
                          : 'var(--bg-inset)',
                        border: `1px solid ${selected ? 'var(--steel-400)' : 'var(--border)'}`,
                        transition: 'all var(--dur-fast) var(--ease-out)',
                      }}
                    >
                      {t('contracts.faction.none')}
                    </span>
                  )
                })()}
                {factions.map((faction) => {
                  const selected = contract.factionId === faction.id
                  const color = faction.color
                  return (
                    <span
                      key={faction.id}
                      role="button"
                      onClick={() => onSetFaction(contract.id, faction.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        padding: '6px 11px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        letterSpacing: '0.12em',
                        clipPath: 'var(--clip-bevel-sm)',
                        color: selected ? 'var(--void-900)' : 'var(--steel-400)',
                        background: selected ? color : 'var(--bg-inset)',
                        border: `1px solid ${selected ? color : 'var(--border)'}`,
                        boxShadow: selected ? `0 0 12px -2px ${color}` : 'none',
                        transition: 'all var(--dur-fast) var(--ease-out)',
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: selected ? 'var(--void-900)' : color,
                          flex: 'none',
                        }}
                      />
                      {factionLabel(faction, t)}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Priorité + échéance */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span style={labelStyle}>{t('contracts.priorityLabel')}</span>
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {PRIORITY_ORDER.map((key) => {
                    const selected = key === contract.priority
                    const color = PRIORITY_BARS[key].color
                    const segStyle: CSSProperties = {
                      flex: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      padding: '8px 4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-2xs)',
                      letterSpacing: '0.14em',
                      color: selected
                        ? key === 'high'
                          ? 'var(--void-900)'
                          : 'var(--frost-100)'
                        : 'var(--steel-400)',
                      background: selected ? color : 'transparent',
                      boxShadow:
                        selected && key === 'high'
                          ? `0 0 12px ${color}`
                          : 'none',
                      transition: 'all var(--dur-fast) var(--ease-out)',
                    }
                    return (
                      <div
                        key={key}
                        role="button"
                        onClick={() => onSetPriority(contract.id, key)}
                        style={segStyle}
                      >
                        {t(`contracts.priority.${key}`)}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span style={labelStyle}>{t('contracts.dueDateLabel')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="date"
                    value={
                      hasDue ? toDateInputValue(contract.dueDate as number) : ''
                    }
                    onChange={(e) =>
                      onSetDueDate(
                        contract.id,
                        fromDateInputValue(e.target.value),
                      )
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 40,
                      padding: '0 11px',
                      background: 'var(--bg-inset)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--frost-100)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      letterSpacing: '0.04em',
                      colorScheme: 'dark',
                    }}
                  />
                  {hasDue && (
                    <IconButton
                      name="x"
                      size="sm"
                      title={t('contracts.due.clear')}
                      onClick={() => onSetDueDate(contract.id, null)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Récurrence (US-006) */}
            <RecurrenceControl
              value={contract.recurrence}
              onChange={(r) => onSetRecurrence(contract.id, r)}
            />

            {/* Sous-tâches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={labelStyle}>{t('contracts.subtasks.title')}</span>
                {subs.length > 0 && (
                  <>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-2xs)',
                        letterSpacing: '0.1em',
                        color: 'var(--mint-500)',
                      }}
                    >
                      {t('contracts.subtasks.progress', {
                        done: subdone,
                        total: subs.length,
                      })}
                    </span>
                    <span style={{ flex: 1, maxWidth: 180 }}>
                      <ProgressBar
                        value={subpct}
                        max={100}
                        accent="mint"
                        height={4}
                      />
                    </span>
                  </>
                )}
              </div>

              {subs.length === 0 && (
                <div
                  style={{
                    padding: 14,
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--steel-600)',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {t('contracts.subtasks.empty')}
                </div>
              )}

              <AnimatePresence initial={false}>
                {orderedSubs.map((sub) => (
                  <motion.div
                    key={sub.id}
                    className="ctr-row"
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '8px 11px',
                      background: 'var(--void-700)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Checkbox
                      checked={sub.done}
                      onChange={() => onToggleSubtask(contract.id, sub.id)}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-md)',
                        color: sub.done
                          ? 'var(--steel-600)'
                          : 'var(--frost-100)',
                        textDecoration: sub.done ? 'line-through' : 'none',
                        textDecorationColor: 'var(--mint-500)',
                      }}
                    >
                      {sub.title}
                    </span>
                    <span className="ctr-tools">
                      <IconButton
                        name="x"
                        size="sm"
                        title={t('contracts.subtasks.remove')}
                        onClick={() => onRemoveSubtask(contract.id, sub.id)}
                      />
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input
                  size="md"
                  icon="plus"
                  placeholder={t('contracts.subtasks.addPlaceholder')}
                  value={subDraft}
                  onChange={(e) => setSubDraft(e.target.value)}
                  onKeyDown={onSubKey}
                  style={{ flex: 1 }}
                />
                <IconButton
                  name="corner-down-left"
                  size="md"
                  variant="outline"
                  title={t('contracts.subtasks.add')}
                  onClick={addSub}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                paddingTop: 2,
              }}
            >
              <Button variant="secondary" size="md" hud onClick={onClose}>
                {t('contracts.detail.close')}
              </Button>
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  )
}
