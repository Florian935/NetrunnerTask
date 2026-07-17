import React from 'react';
import { injectCSS } from '../styleUtil.jsx';
import { RarityBadge, RARITY } from './RarityBadge.jsx';

const CSS = `
.nt-cos{position:relative;display:flex;flex-direction:column;width:180px;color:var(--text-body);background:var(--surface-glass);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));filter:drop-shadow(0 0 .6px var(--_c)) drop-shadow(0 0 .6px var(--_c)) drop-shadow(0 0 16px var(--_g)) drop-shadow(0 0 36px var(--_g));cursor:pointer;transition:transform var(--dur-base) var(--ease-out);}
.nt-cos:hover{transform:translateY(-3px)}
.nt-cos--locked{cursor:not-allowed;filter:grayscale(.7) drop-shadow(0 0 .6px var(--border-strong))}
.nt-cos__art{position:relative;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 34%,color-mix(in srgb,var(--_c) 22%,var(--surface-inset)),var(--surface-inset));border-bottom:1px solid var(--border-subtle)}
.nt-cos__art::after{content:"";position:absolute;inset:0;background:var(--scanlines);opacity:.5}
.nt-cos__glyph{font-family:var(--font-display);font-weight:700;font-size:44px;color:var(--_c)}
.nt-cos__rank{position:absolute;top:8px;left:8px}
.nt-cos__equip{position:absolute;top:8px;right:8px;font:600 8px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--status-success);border:1px solid var(--status-success);border-radius:4px;padding:3px 5px;background:var(--tint-success)}
.nt-cos__lock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 10px var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);background:rgba(5,7,14,.55)}
.nt-cos__body{padding:12px;display:flex;flex-direction:column;gap:4px}
.nt-cos__cat{font:500 9px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--text-faint)}
.nt-cos__name{font:600 15px var(--font-display);letter-spacing:.01em;color:var(--text-strong)}
`;

/** Inventory cosmetic card — rarity-tinted chamfered frame + neon halo, art well, name. */
export function CosmeticCard({ name, category, rarity = 'common', glyph, equipped = false, locked = false, className = '', style, children, ...rest }) {
  injectCSS('nt-cos', CSS);
  const r = RARITY[rarity] || RARITY.common;
  const cls = ['nt-cos', locked ? 'nt-cos--locked' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ '--_c': r.color, '--_g': r.glow, ...style }} role="button" tabIndex={locked ? -1 : 0} {...rest}>
      <div className="nt-cos__art">
        <span className="nt-cos__rank"><RarityBadge rarity={rarity} size="sm" showDot={false} /></span>
        {equipped && !locked && <span className="nt-cos__equip">Équipé</span>}
        {children || <span className="nt-cos__glyph">{glyph || '◆'}</span>}
        {locked && <span className="nt-cos__lock">Verrouillé</span>}
      </div>
      <div className="nt-cos__body">
        {category && <span className="nt-cos__cat">{category}</span>}
        <span className="nt-cos__name">{name}</span>
      </div>
    </div>
  );
}
