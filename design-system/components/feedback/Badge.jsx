import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--fs-2xs);font-weight:var(--fw-semibold);letter-spacing:var(--ls-wide);text-transform:uppercase;line-height:1;padding:5px 9px;border-radius:var(--radius-xs);border:1px solid transparent;white-space:nowrap;}
.nt-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor;}
.nt-badge--soft{background:color-mix(in srgb,var(--_c) 22%,transparent);color:var(--_c);border-color:color-mix(in srgb,var(--_c) 50%,transparent);}
.nt-badge--solid{background:var(--_c);color:var(--bg-app);}
.nt-badge--outline{background:transparent;color:var(--_c);border-color:color-mix(in srgb,var(--_c) 55%,transparent);}
`;

const TONE = {
  success: { c: 'var(--status-success)', t: 'var(--tint-success)' },
  warning: { c: 'var(--status-warning)', t: 'var(--tint-warning)' },
  danger:  { c: 'var(--status-danger)',  t: 'var(--tint-danger)' },
  info:    { c: 'var(--status-info)',    t: 'var(--tint-info)' },
  accent:  { c: 'var(--accent)',         t: 'var(--tint-accent)' },
  urgent:  { c: 'var(--status-danger)', t: 'var(--tint-danger)' },
  neutral: { c: 'var(--text-muted)',     t: 'var(--surface-elevated)' },
};

/** Status badge — success / warning / danger / info / accent / neutral. */
export function Badge({ tone = 'neutral', variant = 'soft', dot = false, children, className = '', ...rest }) {
  injectCSS('nt-badge', CSS);
  const t = TONE[tone] || TONE.neutral;
  const cls = ['nt-badge', `nt-badge--${variant}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={{ '--_c': t.c, '--_tint': t.t }} {...rest}>
      {dot && <span className="nt-badge__dot" />}
      {children}
    </span>
  );
}
