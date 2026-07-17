import { Fragment } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export interface PaginationProps {
  page?: number
  pageCount?: number
  onChange?: (page: number) => void
  style?: CSSProperties
}

/** Contrôle de pagination numéroté avec cellule active néon + flèches préc./suiv. */
export function Pagination({
  page = 1,
  pageCount = 1,
  onChange,
  style = {},
  ...rest
}: PaginationProps & Omit<HTMLAttributes<HTMLDivElement>, keyof PaginationProps>) {
  const go = (p: number) => {
    if (p >= 1 && p <= pageCount && onChange) onChange(p)
  }
  const cell = (
    content: ReactNode,
    opts: { active?: boolean; disabled?: boolean; onClick?: () => void } = {},
  ) => {
    const { active = false, disabled = false, onClick } = opts
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        style={{
          minWidth: 30,
          height: 30,
          padding: '0 6px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: active
            ? 'var(--void-900)'
            : disabled
              ? 'var(--text-muted)'
              : 'var(--text-secondary)',
          background: active ? 'var(--cyan-500)' : 'transparent',
          border: `1px solid ${active ? 'var(--cyan-500)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: active ? 'var(--glow-cyan)' : 'none',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {content}
      </button>
    )
  }

  const pages: (number | string)[] = []
  const span = 2
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || (p >= page - span && p <= page + span))
      pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '6px', ...style }}
      {...rest}
    >
      {cell(<Icon name="chevron-left" size={15} />, {
        disabled: page <= 1,
        onClick: () => go(page - 1),
      })}
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`e${i}`}
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              padding: '0 2px',
            }}
          >
            …
          </span>
        ) : (
          <Fragment key={p}>
            {cell(p, { active: p === page, onClick: () => go(p as number) })}
          </Fragment>
        ),
      )}
      {cell(<Icon name="chevron-right" size={15} />, {
        disabled: page >= pageCount,
        onClick: () => go(page + 1),
      })}
    </div>
  )
}
