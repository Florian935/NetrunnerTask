import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * NIGHTWIRE Input — text field with a neon focus glow.
 */
export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  size = 'md',
  icon = null,
  error = false,
  disabled = false,
  hud = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
  const accent = error ? 'var(--red-500)' : 'var(--cyan-500)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        height: heights[size] || heights.md,
        padding: `0 var(--space-3)`,
        background: 'var(--bg-inset)',
        border: `1px solid ${focus ? accent : error ? 'var(--red-500)' : 'var(--border)'}`,
        borderRadius: hud ? 0 : 'var(--radius-md)',
        clipPath: hud ? 'var(--clip-bevel-sm)' : 'none',
        boxShadow: focus ? (error ? 'var(--glow-danger)' : 'var(--glow-cyan)') : 'none',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--dur-fast) var(--ease-out)',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={16} color={focus ? accent : 'var(--text-muted)'} />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          letterSpacing: 'var(--tracking-wide)',
        }}
        {...rest}
      />
    </div>
  );
}
