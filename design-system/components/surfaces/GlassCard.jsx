import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-glasscard{position:relative;padding:16px;color:var(--text-body);background:linear-gradient(155deg,rgba(255,255,255,.08),rgba(255,255,255,.015) 34%,transparent 62%),var(--surface-glass);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));filter:drop-shadow(0 0 1px var(--_c)) drop-shadow(0 0 2px var(--_c)) drop-shadow(0 0 8px var(--_g1)) drop-shadow(0 0 20px var(--_g2));}
.nt-glasscard::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0 2px,rgba(150,220,240,.05) 2px 3px);opacity:.5;mix-blend-mode:screen;}
.nt-glasscard--rounded{clip-path:none;border-radius:16px;filter:none;border:1px solid color-mix(in srgb,var(--_c) 55%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--_c) 28%,transparent),0 0 14px var(--_g1),0 0 38px var(--_g2),var(--glass-shadow);}
.nt-glasscard__brk i{position:absolute;width:13px;height:13px;opacity:.9;border-color:var(--_c);}
.nt-glasscard__brk .tl{top:0;left:0;border-top:1.5px solid;border-left:1.5px solid;border-top-left-radius:2px;}
.nt-glasscard__brk .br{bottom:0;right:0;border-bottom:1.5px solid;border-right:1.5px solid;border-bottom-right-radius:2px;}
`;

const GLOW = {
  teal:    { c: 'var(--accent)',        g1: 'rgba(47,229,207,.30)', g2: 'rgba(47,229,207,.12)' },
  violet:  { c: 'var(--nt-violet-500)', g1: 'rgba(198,87,255,.30)', g2: 'rgba(198,87,255,.12)' },
  magenta: { c: 'var(--nt-magenta-500)',g1: 'rgba(255,77,141,.30)', g2: 'rgba(255,77,141,.12)' },
};

/**
 * Frosted-glass panel — the base surface. V2 look: chamfered corners + a neon
 * drop-shadow halo (follows the chamfer, never clipped). `rounded` swaps the
 * chamfer for soft corners. Optional HUD corner brackets.
 */
export function GlassCard({ glow = 'teal', rounded = false, brackets = false, className = '', style, children, ...rest }) {
  injectCSS('nt-glasscard', CSS);
  const g = GLOW[glow] || GLOW.teal;
  const cls = ['nt-glasscard', rounded ? 'nt-glasscard--rounded' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ '--_c': g.c, '--_g1': g.g1, '--_g2': g.g2, ...style }} {...rest}>
      {brackets && <span className="nt-glasscard__brk"><i className="tl" /><i className="br" /></span>}
      {children}
    </div>
  );
}
