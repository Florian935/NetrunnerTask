import React from 'react';

/**
 * NIGHTWIRE Switch — pill toggle with a glowing knob.
 */
export function Switch({ checked = false, onChange, label, disabled = false, size = 'md', style = {}, ...rest }) {
  const dims = size === 'sm' ? { w: 38, h: 20, k: 14 } : { w: 46, h: 24, k: 18 };
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
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
          position: 'relative',
          width: dims.w,
          height: dims.h,
          borderRadius: '999px',
          background: checked ? 'var(--grad-mint)' : 'var(--bg-inset)',
          border: `1px solid ${checked ? 'var(--mint-500)' : 'var(--border-strong)'}`,
          boxShadow: checked ? 'var(--glow-mint)' : 'inset 0 1px 3px rgba(0,0,0,.5)',
          transition: 'all var(--dur-med) var(--ease-out)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: checked ? `calc(100% - ${dims.k + 3}px)` : '3px',
            transform: 'translateY(-50%)',
            width: dims.k,
            height: dims.k,
            borderRadius: '999px',
            background: checked ? 'var(--void-900)' : 'var(--steel-400)',
            transition: 'all var(--dur-med) var(--ease-out)',
          }}
        />
      </span>
      {label}
    </label>
  );
}
