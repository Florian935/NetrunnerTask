import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-tag{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-body);background:var(--surface-elevated);border:1px solid var(--border-subtle);border-radius:var(--radius-pill);padding:4px 10px;line-height:1;white-space:nowrap;transition:border-color var(--dur-fast),color var(--dur-fast);}
.nt-tag__hash{color:var(--text-faint);}
.nt-tag--clickable{cursor:pointer;}
.nt-tag--clickable:hover{border-color:var(--accent);color:var(--text-strong);}
.nt-tag__x{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border:none;background:transparent;color:var(--text-faint);cursor:pointer;padding:0;border-radius:var(--radius-xs);}
.nt-tag__x:hover{color:var(--status-danger);}
`;

/** Small mono tag / label pill, optionally removable. */
export function Tag({ children, hash = true, onRemove, onClick, color, className = '', ...rest }) {
  injectCSS('nt-tag', CSS);
  const cls = ['nt-tag', onClick ? 'nt-tag--clickable' : '', className].filter(Boolean).join(' ');
  const style = color ? { borderColor: `color-mix(in srgb, ${color} 45%, var(--border-subtle))`, color } : undefined;
  return (
    <span className={cls} style={style} onClick={onClick} {...rest}>
      {hash && <span className="nt-tag__hash">#</span>}
      {children}
      {onRemove && (
        <button className="nt-tag__x" aria-label="Remove" onClick={e => { e.stopPropagation(); onRemove(); }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      )}
    </span>
  );
}
