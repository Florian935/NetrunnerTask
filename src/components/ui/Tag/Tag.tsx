import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './Tag.css'

export interface TagProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  children?: ReactNode
  /** Affiche le préfixe « # ». */
  hash?: boolean
  /** Rend le tag supprimable (bouton croix). */
  onRemove?: () => void
  /** Teinte de bordure/texte personnalisée. */
  color?: string
}

/** Petit tag / label mono, optionnellement supprimable. */
export function Tag({
  children,
  hash = true,
  onRemove,
  onClick,
  color,
  className = '',
  ...rest
}: TagProps) {
  const cls = ['nt-tag', onClick ? 'nt-tag--clickable' : '', className]
    .filter(Boolean)
    .join(' ')
  const style: CSSProperties | undefined = color
    ? {
        borderColor: `color-mix(in srgb, ${color} 45%, var(--border-subtle))`,
        color,
      }
    : undefined
  return (
    <span className={cls} style={style} onClick={onClick} {...rest}>
      {hash && <span className="nt-tag__hash">#</span>}
      {children}
      {onRemove && (
        <button
          className="nt-tag__x"
          aria-label="Retirer"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
