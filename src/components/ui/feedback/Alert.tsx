import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export type AlertKind = 'success' | 'warning' | 'danger' | 'info'

const KIND: Record<AlertKind, { c: string; icon: string; g: string }> = {
  success: { c: 'var(--mint-500)', icon: 'check-circle', g: 'var(--glow-mint)' },
  warning: {
    c: 'var(--amber-500)',
    icon: 'alert-triangle',
    g: '0 0 14px rgba(255,176,32,.3)',
  },
  danger: { c: 'var(--red-500)', icon: 'shield-alert', g: 'var(--glow-danger)' },
  info: { c: 'var(--cyan-500)', icon: 'info', g: 'var(--glow-cyan)' },
}

export interface AlertProps {
  /** @default "info" */
  kind?: AlertKind
  title?: ReactNode
  children?: ReactNode
  /** Si fourni, affiche une croix × et l'appelle au clic. */
  onClose?: () => void
  style?: CSSProperties
}

/** Bannière de statut inline avec rail néon à gauche + icône de statut. */
export function Alert({
  kind = 'info',
  title,
  children,
  onClose,
  style = {},
  ...rest
}: AlertProps & Omit<HTMLAttributes<HTMLDivElement>, keyof AlertProps>) {
  const k = KIND[kind] || KIND.info
  return (
    <div
      role="alert"
      style={{
        position: 'relative',
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        paddingLeft: 'var(--space-4)',
        background: `color-mix(in srgb, ${k.c} 8%, var(--bg-panel))`,
        borderLeft: `2px solid ${k.c}`,
        border: `1px solid color-mix(in srgb, ${k.c} 30%, transparent)`,
        borderLeftWidth: '2px',
        boxShadow: `inset 3px 0 12px -8px ${k.c}`,
        color: 'var(--text-primary)',
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
              textTransform: 'uppercase',
              color: k.c,
              marginBottom: children ? 2 : 0,
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
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
          <Icon name="x" size={16} />
        </span>
      )}
    </div>
  )
}
