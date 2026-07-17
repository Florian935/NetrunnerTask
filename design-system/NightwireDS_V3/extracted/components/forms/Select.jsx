import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * NIGHTWIRE Select — styled native select with a neon chevron.
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  size = 'md',
  disabled = false,
  hud = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        height: heights[size] || heights.md,
        background: 'var(--bg-inset)',
        border: `1px solid ${focus ? 'var(--cyan-500)' : 'var(--border)'}`,
        borderRadius: hud ? 0 : 'var(--radius-md)',
        clipPath: hud ? 'var(--clip-bevel-sm)' : 'none',
        boxShadow: focus ? 'var(--glow-cyan)' : 'none',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--dur-fast) var(--ease-out)',
        ...style,
      }}
    >
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          letterSpacing: 'var(--tracking-wide)',
          padding: '0 34px 0 var(--space-3)',
          height: '100%',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        {...rest}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value} style={{ background: 'var(--void-600)', color: 'var(--text-primary)' }}>{opt.label}</option>;
        })}
      </select>
      <span style={{ position: 'absolute', right: 'var(--space-3)', pointerEvents: 'none', color: focus ? 'var(--cyan-500)' : 'var(--text-muted)', display: 'inline-flex' }}>
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}
