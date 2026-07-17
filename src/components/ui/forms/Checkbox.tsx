import type { CSSProperties, LabelHTMLAttributes, ReactNode } from 'react'
import { Icon } from '../core/Icon'

export interface CheckboxProps {
  checked?: boolean
  onChange?: (next: boolean) => void
  label?: ReactNode
  disabled?: boolean
  style?: CSSProperties
}

/** Case à cocher carrée ; remplissage cyan + halo quand cochée. */
export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  style = {},
  ...rest
}: CheckboxProps & Omit<LabelHTMLAttributes<HTMLLabelElement>, keyof CheckboxProps>) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)',
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 18,
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-xs)',
          border: `1px solid ${checked ? 'var(--cyan-500)' : 'var(--border-strong)'}`,
          background: checked ? 'var(--cyan-500)' : 'var(--bg-inset)',
          boxShadow: checked ? 'var(--glow-cyan)' : 'none',
          color: 'var(--void-900)',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      >
        {checked && <Icon name="check" size={13} strokeWidth={3} />}
      </span>
      {label}
    </label>
  )
}
