import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './IconButton.css'

export type IconButtonVariant = 'ghost' | 'solid' | 'accent'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  /** Libellé accessible (aria-label + title) — requis, le bouton n'a pas de texte. */
  label: string
  children?: ReactNode
}

/** Bouton carré sans libellé, pour une icône unique. */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  label,
  children,
  className = '',
  ...rest
}: IconButtonProps) {
  const cls = [
    'nt-iconbtn',
    `nt-iconbtn__${variant}`,
    `nt-iconbtn__sz-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      className={cls}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  )
}
