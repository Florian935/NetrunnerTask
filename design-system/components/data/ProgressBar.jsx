import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-prog{display:flex;flex-direction:column;gap:6px;width:100%;}
.nt-prog__top{display:flex;align-items:baseline;justify-content:space-between;gap:var(--sp-3);}
.nt-prog__label{font-family:var(--font-mono);font-size:var(--fs-2xs);letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-muted);}
.nt-prog__val{font-family:var(--font-mono);font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--_c,var(--accent));}
.nt-prog__track{position:relative;height:var(--_h,8px);border-radius:var(--radius-pill);background:var(--surface-inset);border:1px solid var(--border-subtle);overflow:hidden;}
.nt-prog__fill{position:absolute;left:0;top:0;bottom:0;border-radius:var(--radius-pill);background:linear-gradient(90deg,color-mix(in srgb,var(--_c,var(--accent)) 70%,transparent),var(--_c,var(--accent)));box-shadow:0 0 12px var(--_g,var(--nt-cyan-glow)),inset 0 0 6px rgba(255,255,255,.25);transition:width var(--dur-slow) var(--ease-out);}
.nt-prog__fill::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0,rgba(255,255,255,.14) 2px,transparent 2px,transparent 8px);opacity:.5;}
.nt-prog--tiers .nt-prog__track{background:transparent;border:none;display:flex;gap:4px;}
`;

const VARIANT = {
  xp:      { c: 'var(--nt-xp)',      g: 'var(--nt-cyan-glow)' },
  rep:     { c: 'var(--nt-rep)',     g: 'var(--nt-magenta-glow)' },
  credits: { c: 'var(--nt-credits)', g: 'var(--rarity-legendary-glow)' },
  streak:  { c: 'var(--status-success)', g: 'rgba(157,255,60,.4)' },
  level:   { c: 'var(--accent)',     g: 'var(--nt-cyan-glow)' },
  danger:  { c: 'var(--status-danger)', g: 'rgba(255,77,94,.4)' },
};

/** Progress gauge for level / reputation / streak. Glowing fill, mono readout. */
export function ProgressBar({
  value = 0, max = 100, variant = 'level',
  label, showValue = true, valueLabel,
  size = 'md', color, className = '', ...rest
}) {
  injectCSS('nt-prog', CSS);
  const v = VARIANT[variant] || VARIANT.level;
  const c = color || v.c;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px';
  return (
    <div className={['nt-prog', className].filter(Boolean).join(' ')} style={{ '--_c': c, '--_g': v.g, '--_h': h }} {...rest}>
      {(label || showValue) && (
        <div className="nt-prog__top">
          {label && <span className="nt-prog__label">{label}</span>}
          {showValue && <span className="nt-prog__val">{valueLabel || `${value} / ${max}`}</span>}
        </div>
      )}
      <div className="nt-prog__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="nt-prog__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
