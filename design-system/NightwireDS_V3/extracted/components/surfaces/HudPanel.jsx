import React from 'react';

const TONES = {
  cyan: { c: 'var(--cyan-500)', hatch: 'var(--hatch-cyan)', glow: 'rgba(0,240,255,.28)', dim: 'rgba(0,240,255,.4)' },
  magenta: { c: 'var(--magenta-500)', hatch: 'var(--hatch-magenta)', glow: 'rgba(255,45,149,.28)', dim: 'rgba(255,45,149,.4)' },
  mint: { c: 'var(--mint-500)', hatch: 'var(--hatch-mint)', glow: 'rgba(46,255,194,.28)', dim: 'rgba(46,255,194,.4)' },
  violet: { c: 'var(--violet-500)', hatch: 'var(--hatch-cyan)', glow: 'rgba(168,85,247,.28)', dim: 'rgba(168,85,247,.4)' },
};

/**
 * NIGHTWIRE HudPanel — the signature framed container.
 * - variant="solid" (default): beveled frame, neon edge, filled title bar.
 * - variant="terminal": thin neon hairline outline with corner ticks and an
 *   inset title chip — the RETONIA/terminal-OS look (dense, wireframe-ready).
 */
export function HudPanel({ title, status, accent = 'cyan', variant = 'solid', hatch = true, glow = true, pulse = false, children, style = {}, ...rest }) {
  const t = TONES[accent] || TONES.cyan;
  const pulseClass = pulse && ['cyan', 'magenta', 'mint', 'violet'].includes(accent) ? `nw-pulse-${accent}` : undefined;

  if (variant === 'terminal') {
    const Tick = (p) => <span style={{ position: 'absolute', width: 9, height: 9, borderColor: t.c, borderStyle: 'solid', ...p }} />;
    return (
      <div style={{ position: 'relative', background: 'var(--bg-inset)', border: `1px solid ${t.dim}`, boxShadow: glow ? `inset 0 0 24px -14px ${t.c}, 0 0 14px -8px ${t.glow}` : 'none', ...style }} className={pulseClass} {...rest}>
        <Tick top={-1} left={-1} style={{ borderWidth: '2px 0 0 2px' }} />
        <Tick top={-1} right={-1} style={{ borderWidth: '2px 2px 0 0' }} />
        <Tick bottom={-1} left={-1} style={{ borderWidth: '0 0 2px 2px' }} />
        <Tick bottom={-1} right={-1} style={{ borderWidth: '0 2px 2px 0' }} />
        {(title || status) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: '7px 12px', borderBottom: `1px solid ${t.dim}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {hatch && <span style={{ width: 16, height: 8, background: t.hatch, flexShrink: 0 }} />}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', fontWeight: 700, letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: t.c, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
            </div>
            {status && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{status}</span>}
          </div>
        )}
        <div style={{ padding: 'var(--space-4)' }}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={pulseClass}
      style={{
        clipPath: 'var(--clip-bevel-md)',
        background: t.c,
        padding: 1,
        boxShadow: glow ? `0 0 22px -4px ${t.glow}` : 'none',
        ...style,
      }}
      {...rest}
    >
      <div style={{ clipPath: 'var(--clip-bevel-md)', background: 'var(--bg-panel)', minHeight: 40 }}>
        {(title || status) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', padding: '8px 14px', borderBottom: `1px solid color-mix(in srgb, ${t.c} 30%, transparent)`, background: `color-mix(in srgb, ${t.c} 7%, transparent)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
              {hatch && <span style={{ width: 22, height: 10, background: t.hatch, flexShrink: 0 }} />}
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: t.c, textShadow: `0 0 8px ${t.glow}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
            </div>
            {status && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{status}</span>}
          </div>
        )}
        <div style={{ padding: 'var(--space-4)' }}>{children}</div>
      </div>
    </div>
  );
}
