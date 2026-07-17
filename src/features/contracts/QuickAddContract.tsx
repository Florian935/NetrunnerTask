import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../../components/ui'
import type { Difficulty } from '../../db'
import { DIFFICULTY_ACCENTS, rewardFor } from '../../game/rewards'
import { DifficultyDots } from './DifficultyDots'

export interface QuickAddContractProps {
  /** Appelée avec un titre non vide (déjà trimmé) et la difficulté choisie. */
  onCreate: (title: string, difficulty: Difficulty) => void | Promise<void>
}

/**
 * Barre de création rapide d'un contrat — règle des 2 s : taper un titre puis
 * Entrée (ou cliquer « AJOUTER »). Le champ garde le focus et se vide pour
 * enchaîner. Titre vide → flash rouge, aucune création. Un sélecteur de
 * difficulté (défaut TRIVIAL, optionnel) accompagne le champ ; le dernier
 * niveau choisi est conservé pour enchaîner des contrats similaires.
 */
export function QuickAddContract({ onCreate }: QuickAddContractProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('trivial')
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
    void onCreate(title, difficulty)
    setDraft('')
    setError(false)
    // Difficulté conservée volontairement pour enchaîner. Focus inchangé.
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  const reward = rewardFor(difficulty)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 'none' }}>
          <DifficultyDots value={difficulty} onChange={setDifficulty} />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: '0.12em',
              color: DIFFICULTY_ACCENTS[difficulty],
              whiteSpace: 'nowrap',
            }}
          >
            {t(`contracts.difficulty.${difficulty}`)} ·{' '}
            {t('contracts.reward', { xp: reward.xp, credits: reward.credits })}
          </div>
        </div>
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
