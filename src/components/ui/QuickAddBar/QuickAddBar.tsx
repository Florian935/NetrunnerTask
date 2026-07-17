import { useState } from 'react'
import type { HTMLAttributes } from 'react'
import './QuickAddBar.css'

export interface QuickAddBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  placeholder?: string
  /** Appelée avec la valeur saisie (rognée) à la validation. */
  onAdd?: (value: string) => void
  /** Affiche l'indice clavier (⌘K). */
  showHint?: boolean
  defaultValue?: string
}

/**
 * Champ de capture rapide de tâche — verre, bouton + en tête, indice ⌘K.
 * Entrée valide et vide le champ.
 */
export function QuickAddBar({
  placeholder = 'Ajouter une tâche, une note…',
  onAdd,
  showHint = true,
  defaultValue = '',
  className = '',
  ...rest
}: QuickAddBarProps) {
  const [value, setValue] = useState(defaultValue)
  const submit = () => {
    const v = value.trim()
    if (!v) return
    onAdd?.(v)
    setValue('')
  }
  return (
    <div className={['nt-cap', className].filter(Boolean).join(' ')} {...rest}>
      <button className="nt-cap__btn" onClick={submit} aria-label="Ajouter">
        +
      </button>
      <input
        className="nt-cap__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      {showHint && <span className="nt-cap__kbd">⌘K</span>}
    </div>
  )
}
