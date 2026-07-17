import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * NIGHTWIRE IconButton — square icon-only control.
 */
export function IconButton({
  name,
  variant = 'ghost',
  size = 'md',
  hud = false,
  disabled = false,
  onClick,
  title,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const dims = { sm: 30, md: 38, lg: 46 };
  const iconSz = { sm: 15, md: 18, lg: 22 };
  const d = dims[size] || dims.md;

  const variants = {
    ghost: {
      background: hover && !disabled ? 'var(--bg-hover)' : 'transparent',
      color: hover && !disabled ? 'var(--cyan-400)' : 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    solid: {
      background: hover && !disabled ? 'var(--bg-surface)' : 'var(--bg-panel)',
      color: 'var(--cyan-500)',
      border: '1px solid var(--border)',
      boxShadow: hover && !disabled ? 'var(--glow-cyan)' : 'none',
    },
    outline: {
      background: hover && !disabled ? 'rgba(0,240,255,.08)' : 'transparent',
      color: 'var(--cyan-500)',
      border: '1px solid var(--cyan-500)',
      boxShadow: hover && !disabled ? 'var(--glow-cyan)' : 'none',
    },
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: d,
        height: d,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        borderRadius: hud ? 0 : 'var(--radius-md)',
        clipPath: hud ? 'var(--clip-bevel-sm)' : 'none',
        transition: 'all var(--dur-fast) var(--ease-out)',
        ...(variants[variant] || variants.ghost),
        ...style,
      }}
      {...rest}
    >
      <Icon name={name} size={iconSz[size] || 18} />
    </button>
  );
}
