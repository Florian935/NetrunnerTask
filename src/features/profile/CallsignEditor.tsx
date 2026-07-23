import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon } from '../../components/ui'
import { CALLSIGN_MAX } from '../../game/profile'

export interface CallsignEditorProps {
  /** Callsign courant (déjà normalisé). */
  value: string
  /** Persiste le nouveau callsign (normalisation faite par le store). */
  onSave: (raw: string) => void
}

/**
 * Callsign du runner (US-032) — bascule affichage ↔ édition en place. En
 * affichage : valeur display néon + bouton crayon. En édition : champ bespoke
 * (échelle « héros », le `<Input>` DS boxé ne convient pas) + compteur, avec
 * Valider / Annuler sur `<Button>`.
 */
export function CallsignEditor({ value, onSave }: CallsignEditorProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const start = () => {
    setDraft(value)
    setEditing(true)
  }
  const save = () => {
    onSave(draft)
    setEditing(false)
  }
  const cancel = () => setEditing(false)

  if (!editing) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '2.6rem',
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
            textShadow: 'var(--text-glow-cyan)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={start}
          aria-label={t('profile.callsign.editAria')}
          style={{
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            clipPath: 'var(--clip-bevel-sm)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-inset)',
            color: 'var(--text-label)',
          }}
        >
          <Icon name="pencil" size={16} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          autoFocus
          spellCheck={false}
          maxLength={CALLSIGN_MAX}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') cancel()
          }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '2.6rem',
            letterSpacing: '0.06em',
            lineHeight: 1,
            width: `calc(${Math.max(draft.length, 6)}ch + 2.5ch)`,
            color: 'var(--accent)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderBottom: '2px solid var(--accent)',
            padding: '0 2px 4px',
            textShadow: 'var(--text-glow-cyan)',
            caretColor: 'var(--accent)',
          }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 2,
            bottom: -18,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.1em',
            color: draft.length >= CALLSIGN_MAX ? 'var(--amber-500)' : 'var(--text-muted)',
          }}
        >
          {draft.length}/{CALLSIGN_MAX}
        </span>
      </div>
      <div style={{ display: 'inline-flex', gap: 8 }}>
        <Button
          variant="secondary"
          size="sm"
          hud
          onClick={save}
          leftIcon={<Icon name="check" size={15} />}
        >
          {t('profile.callsign.save')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          hud
          onClick={cancel}
          leftIcon={<Icon name="x" size={15} />}
        >
          {t('profile.callsign.cancel')}
        </Button>
      </div>
    </div>
  )
}
