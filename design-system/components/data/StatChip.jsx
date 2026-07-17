import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-stat{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:var(--radius-sm);background:var(--surface-inset);border:1px solid color-mix(in srgb,var(--_c,var(--accent)) 40%,var(--border-subtle));box-shadow:0 0 0 1px color-mix(in srgb,var(--_c,var(--accent)) 22%,transparent),0 0 12px color-mix(in srgb,var(--_c,var(--accent)) 32%,transparent);font-family:var(--font-mono);white-space:nowrap;}
.nt-stat__dot{width:7px;height:7px;border-radius:50%;background:var(--_c,var(--accent));box-shadow:0 0 8px var(--_c,var(--accent));flex:none;}
.nt-stat__body{display:flex;flex-direction:column;line-height:1.05;}
.nt-stat__label{font-size:8px;letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-faint);}
.nt-stat__value{font-size:var(--fs-sm);font-weight:var(--fw-bold);color:var(--_c,var(--text-strong));}
.nt-stat--inline{gap:6px;}
.nt-stat--inline .nt-stat__body{flex-direction:row;align-items:baseline;gap:6px;}
`;

const KIND = {
  xp:      'var(--nt-xp)',
  credits: 'var(--nt-credits)',
  rep:     'var(--nt-rep)',
  level:   'var(--accent)',
  streak:  'var(--status-success)',
  neutral: 'var(--text-strong)',
};

/** Compact HUD stat readout — dot + label + value. */
export function StatChip({ kind = 'neutral', label, value, layout = 'stack', color, className = '', ...rest }) {
  injectCSS('nt-stat', CSS);
  const c = color || KIND[kind] || KIND.neutral;
  const cls = ['nt-stat', layout === 'inline' ? 'nt-stat--inline' : '', className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={{ '--_c': c }} {...rest}>
      <span className="nt-stat__dot" />
      <span className="nt-stat__body">
        {label && <span className="nt-stat__label">{label}</span>}
        <span className="nt-stat__value">{value}</span>
      </span>
    </span>
  );
}
