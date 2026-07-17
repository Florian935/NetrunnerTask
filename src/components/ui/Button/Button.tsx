import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'complete'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Occupe toute la largeur disponible. */
  block?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  children?: ReactNode
}

/**
 * Bouton d'action principal. Type display en majuscules, halo néon au survol.
 * `variant="complete"` est l'action signature « hack réussi » (complétion).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = [
    'nt-btn',
    `nt-btn__${variant}`,
    `nt-btn__sz-${size}`,
    block ? 'nt-btn__block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {leadingIcon}
      {children != null && <span>{children}</span>}
      {trailingIcon}
    </button>
  )
}
