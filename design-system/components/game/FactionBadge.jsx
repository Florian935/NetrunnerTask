import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-faction{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;padding:4px 9px 4px 5px;border-radius:999px;border:1px solid var(--border-subtle);background:var(--surface-inset);white-space:nowrap;}
.nt-faction__glyph{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;font-size:9px;font-weight:700;color:var(--bg-app);}
`;

/** Faction tag — a coloured sigil chip + faction name. */
export function FactionBadge({ name, color = 'var(--accent)', sigil, className = '', style, ...rest }) {
  injectCSS('nt-faction', CSS);
  const glyph = (sigil || name || '?').toString().slice(0, 2).toUpperCase();
  return (
    <span className={['nt-faction', className].filter(Boolean).join(' ')} style={{ borderColor: `color-mix(in srgb, ${color} 45%, var(--border-subtle))`, boxShadow: `0 0 10px color-mix(in srgb, ${color} 30%, transparent)`, ...style }} {...rest}>
      <span className="nt-faction__glyph" style={{ background: color, boxShadow: `0 0 10px color-mix(in srgb, ${color} 65%, transparent)` }}>{glyph}</span>
      <span style={{ color: 'var(--text-body)' }}>{name}</span>
    </span>
  );
}
