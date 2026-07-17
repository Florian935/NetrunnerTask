import React from 'react';

/**
 * NIGHTWIRE Card — the base surface container.
 * Rounded by default (product style); set `hud` for beveled HUD corners.
 */
export function Card({ children, title, subtitle, actions, accent, hud = false, glow = false, padding = 'var(--space-5)', style = {}, ...rest }) {
  const accentColor = accent ? `var(--${accent}-500)` : null;
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--bg-panel)',
        border: `1px solid ${accentColor ? `color-mix(in srgb, ${accentColor} 35%, var(--border))` : 'var(--border)'}`,
        borderRadius: hud ? 0 : 'var(--radius-md)',
        clipPath: hud ? 'var(--clip-bevel-md)' : 'none',
        boxShadow: glow && accentColor ? `var(--shadow-2), 0 0 20px -6px ${accentColor}` : 'var(--shadow-2)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {accentColor && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />}
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', padding, paddingBottom: 'var(--space-3)' }}>
          <div>
            {title && <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-primary)' }}>{title}</div>}
            {subtitle && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase' }}>{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      <div style={{ padding, paddingTop: (title || actions) ? 0 : padding }}>{children}</div>
    </div>
  );
}
