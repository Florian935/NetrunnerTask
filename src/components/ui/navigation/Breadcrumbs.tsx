import { Fragment } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export interface Crumb {
  label: ReactNode
  href?: string
}

export interface BreadcrumbsProps {
  /** string[] ou {label,href}[]. Le dernier élément est la page courante. */
  items?: (string | Crumb)[]
  onNavigate?: (item: Crumb, index: number) => void
  style?: CSSProperties
}

/** Fil d'Ariane mono avec séparateurs chevron ; le dernier segment est mis en avant. */
export function Breadcrumbs({
  items = [],
  onNavigate,
  style = {},
  ...rest
}: BreadcrumbsProps & Omit<HTMLAttributes<HTMLElement>, keyof BreadcrumbsProps>) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        ...style,
      }}
      {...rest}
    >
      {items.map((it, i) => {
        const item: Crumb = typeof it === 'string' ? { label: it } : it
        const last = i === items.length - 1
        return (
          <Fragment key={i}>
            <span
              onClick={() => !last && onNavigate && onNavigate(item, i)}
              style={{
                color: last ? 'var(--cyan-400)' : 'var(--text-muted)',
                cursor: last ? 'default' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
            {!last && <Icon name="chevron-right" size={13} color="var(--void-200)" />}
          </Fragment>
        )
      })}
    </nav>
  )
}
