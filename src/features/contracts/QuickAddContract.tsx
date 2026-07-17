import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../../components/ui'

export interface QuickAddContractProps {
  /** Appelée avec un titre non vide (déjà trimmé) lors de la validation. */
  onCreate: (title: string) => void | Promise<void>
}

/**
 * Barre de création rapide d'un contrat — règle des 2 s : taper un titre puis
 * Entrée (ou cliquer « AJOUTER »). Le champ garde le focus et se vide pour
 * enchaîner. Titre vide → flash rouge, aucune création.
 */
export function QuickAddContract({ onCreate }: QuickAddContractProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const errorTimer = useRef<number | undefined>(undefined)

  const submit = () => {
    const title = draft.trim()
    if (!title) {
      setError(true)
      window.clearTimeout(errorTimer.current)
      errorTimer.current = window.setTimeout(() => setError(false), 420)
      return
    }
    void onCreate(title)
    setDraft('')
    setError(false)
    // Soumission clavier : aucun blur → le focus reste dans l'input.
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, marginBottom: 9 }}>
        <Input
          size="lg"
          icon="terminal"
          autoFocus
          error={error}
          placeholder={t('contracts.placeholder')}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(false)
          }}
          onKeyDown={onKeyDown}
          style={{ flex: 1 }}
        />
        <Button variant="secondary" size="lg" hud onClick={submit}>
          {t('contracts.addButton')}
        </Button>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: '0.08em',
          color: 'var(--steel-600)',
        }}
      >
        {t('contracts.hint')}
      </div>
    </div>
  )
}
