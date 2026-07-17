import React, { useState } from 'react';

/**
 * NIGHTWIRE Button — the primary action control.
 * Variants: primary (violet→magenta gradient), secondary (neon outline),
 * ghost (bare), danger. Optional `hud` beveled corners.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  hud = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const sizes = {
    sm: { h: 'var(--control-h-sm)', px: '14px', fs: 'var(--text-xs)' },
    md: { h: 'var(--control-h-md)', px: '20px', fs: 'var(--text-sm)' },
    lg: { h: 'var(--control-h-lg)', px: '28px', fs: 'var(--text-md)' },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    height: s.h,
    padding: `0 ${s.px}`,
    fontFamily: 'var(--font-display)',
    fontSize: s.fs,
    fontWeight: 'var(--weight-semibold)',
    letterSpacing: 'var(--tracking-wider)',
    textTransform: 'uppercase',
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    borderRadius: hud ? 0 : 'var(--radius-md)',
    clipPath: hud ? 'var(--clip-bevel-sm)' : 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    transition: 'all var(--dur-fast) var(--ease-out)',
    transform: press && !disabled ? 'translateY(1px)' : 'none',
    opacity: disabled ? 0.4 : 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: {
      background: 'var(--grad-primary)',
      color: 'var(--frost-100)',
      boxShadow: hover && !disabled ? 'var(--glow-violet)' : '0 2px 10px rgba(168,85,247,.25)',
      backgroundSize: '140% 140%',
      backgroundPosition: hover && !disabled ? '100% 0' : '0 0',
    },
    secondary: {
      background: hover && !disabled ? 'rgba(0,240,255,.08)' : 'transparent',
      color: 'var(--cyan-500)',
      borderColor: 'var(--cyan-500)',
      boxShadow: hover && !disabled ? 'var(--glow-cyan)' : 'none',
    },
    ghost: {
      background: hover && !disabled ? 'var(--bg-hover)' : 'transparent',
      color: hover && !disabled ? 'var(--cyan-400)' : 'var(--text-secondary)',
    },
    danger: {
      background: hover && !disabled ? 'rgba(255,46,91,.10)' : 'transparent',
      color: 'var(--red-500)',
      borderColor: 'var(--red-500)',
      boxShadow: hover && !disabled ? 'var(--glow-danger)' : 'none',
    },
  };

  return (
    <button
      type="button"
      className={variant === 'primary' && hover && !disabled ? 'nw-pulse-violet' : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
