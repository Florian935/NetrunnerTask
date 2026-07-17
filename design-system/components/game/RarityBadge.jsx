import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

export const RARITY = {
  common:    { label: 'Common',    color: 'var(--rarity-common)',    glow: 'var(--rarity-common-glow)' },
  rare:      { label: 'Rare',      color: 'var(--rarity-rare)',      glow: 'var(--rarity-rare-glow)' },
  epic:      { label: 'Epic',      color: 'var(--rarity-epic)',      glow: 'var(--rarity-epic-glow)' },
  legendary: { label: 'Legendary', color: 'var(--rarity-legendary)', glow: 'var(--rarity-legendary-glow)' },
  mythic:    { label: 'Corrupted', color: 'var(--rarity-mythic)',    glow: 'var(--rarity-mythic-glow)' },
};

const CSS = `
.nt-rarity{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-weight:600;text-transform:uppercase;letter-spacing:.14em;border:1px solid;border-radius:4px;line-height:1;white-space:nowrap;}
.nt-rarity__sm{font-size:9px;padding:4px 7px}
.nt-rarity__md{font-size:10px;padding:5px 9px}
.nt-rarity__dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor}
`;

/** Rarity chip for cosmetics/loot. Colour-codes 5 tiers; mythic reads "Corrupted". */
export function RarityBadge({ rarity = 'common', size = 'md', showDot = true, label, className = '', style, ...rest }) {
  injectCSS('nt-rarity', CSS);
  const r = RARITY[rarity] || RARITY.common;
  const cls = ['nt-rarity', `nt-rarity__${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={{ color: r.color, borderColor: `color-mix(in srgb, ${r.color} 60%, transparent)`, background: `color-mix(in srgb, ${r.color} 26%, transparent)`, boxShadow: `0 0 14px ${r.glow}, 0 0 30px ${r.glow}`, ...style }} {...rest}>
      {showDot && <span className="nt-rarity__dot" />}
      {label || r.label}
    </span>
  );
}
