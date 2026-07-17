import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import './TextField.css'

export interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  /** Message d'erreur (active l'état error). */
  error?: string
  /** Aide affichée sous le champ (ignorée si `error`). */
  hint?: string
}

/** Champ texte labellisé, style terminal, états focus / erreur / désactivé. */
export function TextField({
  label,
  required = false,
  leadingIcon,
  trailingIcon,
  error,
  hint,
  disabled = false,
  className = '',
  id,
  ...rest
}: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const cls = [
    'nt-field',
    error ? 'nt-field--error' : '',
    disabled ? 'nt-field--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls}>
      {label && (
        <label className="nt-field__label" htmlFor={fieldId}>
          {label}
          {required && <b> *</b>}
        </label>
      )}
      <div className="nt-field__wrap">
        {leadingIcon && <span className="nt-field__icon">{leadingIcon}</span>}
        <input
          id={fieldId}
          className="nt-field__input"
          disabled={disabled}
          aria-invalid={!!error}
          {...rest}
        />
        {trailingIcon && <span className="nt-field__icon">{trailingIcon}</span>}
      </div>
      {(error || hint) && (
        <span className="nt-field__msg">{error || hint}</span>
      )}
    </div>
  )
}
