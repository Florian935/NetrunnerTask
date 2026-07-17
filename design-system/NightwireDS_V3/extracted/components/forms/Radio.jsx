import React from 'react';

/**
 * NIGHTWIRE Radio — round single-choice control with a neon dot.
 */
export function Radio({ checked = false, onChange, label, name, value, disabled = false, style = {}, ...rest }) {
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
        onClick={() => !disabled && onChange && onChange(value)}
        style={{
          width: 18,
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '999px',
          border: `1px solid ${checked ? 'var(--magenta-500)' : 'var(--border-strong)'}`,
          background: 'var(--bg-inset)',
          boxShadow: checked ? 'var(--glow-magenta)' : 'none',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '999px', background: checked ? 'var(--magenta-500)' : 'transparent', transition: 'all var(--dur-fast) var(--ease-out)' }} />
      </span>
      {label}
    </label>
  );
}
