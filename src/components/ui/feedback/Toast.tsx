import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export type ToastKind = 'success' | 'warning' | 'danger' | 'info'

const KIND: Record<ToastKind, { c: string; icon: string }> = {
  success: { c: 'var(--mint-500)', icon: 'check-circle' },
  warning: { c: 'var(--amber-500)', icon: 'alert-triangle' },
  danger: { c: 'var(--red-500)', icon: 'shield-alert' },
  info: { c: 'var(--cyan-500)', icon: 'radio' },
}

export interface ToastProps {
  /** @default "info" */
  kind?: ToastKind
  title?: ReactNode
  children?: ReactNode
  onClose?: () => void
  style?: CSSProperties
}

/** Carte de notification transitoire flottante (320px). L'app gère l'empilement/les minuteries. */
export function Toast({
  kind = 'info',
  title,
  children,
  onClose,
  style = {},
  ...rest
}: ToastProps & Omit<HTMLAttributes<HTMLDivElement>, keyof ToastProps>) {
  const k = KIND[kind] || KIND.info
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        width: 320,
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-surface)',
        border: `1px solid color-mix(in srgb, ${k.c} 35%, var(--border))`,
        borderRadius: 'var(--radius-md)',
        boxShadow: `var(--shadow-3), 0 0 16px -4px ${k.c}`,
        clipPath: 'var(--clip-bevel-sm)',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{ color: k.c, display: 'inline-flex', flexShrink: 0, marginTop: 1 }}
      >
        <Icon name={k.icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: 'var(--tracking-wide)',
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              marginTop: 2,
            }}
          >
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <span
          onClick={onClose}
          style={{
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'inline-flex',
          }}
        >
          <Icon name="x" size={15} />
        </span>
      )}
    </div>
  )
}
