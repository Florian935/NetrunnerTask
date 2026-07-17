import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Checkbox, IconButton, Input } from '../../components/ui'
import type { Contract } from '../../db'
import { contractCode } from './contractCode'

export interface ContractItemProps {
  contract: Contract
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (contract: Contract) => void
}

/**
 * Une ligne de contrat : mode vue (cocher / éditer / supprimer) ou édition du
 * titre. Le conteneur est un `motion.div` : `layout` anime le réordonnancement
 * (terminé/ré-ouvert) et `AnimatePresence` (côté liste) l'entrée/sortie.
 */
export function ContractItem({
  contract,
  onToggle,
  onRename,
  onDelete,
}: ContractItemProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(contract.title)
  const done = contract.status === 'done'

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

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: editing ? 10 : 13,
    padding: '11px 13px',
    borderRadius: 'var(--radius-sm)',
    background: editing ? 'var(--bg-inset)' : 'var(--void-700)',
    border: `1px solid ${editing ? 'var(--cyan-500)' : 'var(--border)'}`,
    ...(editing ? { boxShadow: 'var(--glow-cyan)' } : {}),
  }

  return (
    <motion.div
      className="ctr-row"
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
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}
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
