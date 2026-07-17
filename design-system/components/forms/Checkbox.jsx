import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-check{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none;font-family:var(--font-body);font-size:var(--fs-sm);color:var(--text-body);line-height:var(--lh-snug);}
.nt-check--disabled{opacity:.45;cursor:not-allowed;}
.nt-check__box{position:relative;flex:none;width:18px;height:18px;margin-top:1px;border:1px solid var(--border-strong);border-radius:var(--radius-xs);background:var(--surface-inset);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),background var(--dur-fast);}
.nt-check:hover .nt-check__box{border-color:var(--accent);}
.nt-check__native{position:absolute;opacity:0;width:1px;height:1px;}
.nt-check__native:focus-visible + .nt-check__box{box-shadow:var(--focus-ring);}
.nt-check__mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-on-accent);opacity:0;transform:scale(.5);transition:opacity var(--dur-fast),transform var(--dur-fast) var(--ease-spring);}
.nt-check__native:checked + .nt-check__box{background:var(--accent);border-color:var(--accent);box-shadow:var(--glow-cyan-soft);}
.nt-check__native:checked + .nt-check__box .nt-check__mark{opacity:1;transform:scale(1);}
.nt-check__mark svg{display:block;}
`;

/** Custom checkbox with a cyan glow when checked. */
export function Checkbox({ label, checked, defaultChecked, disabled = false, onChange, className = '', id, ...rest }) {
  injectCSS('nt-check', CSS);
  const autoId = React.useId ? React.useId() : undefined;
  const fieldId = id || autoId;
  const cls = ['nt-check', disabled ? 'nt-check--disabled' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls} htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" className="nt-check__native"
        checked={checked} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange} {...rest} />
      <span className="nt-check__box">
        <span className="nt-check__mark">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.6 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
