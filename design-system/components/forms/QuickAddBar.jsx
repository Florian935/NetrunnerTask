import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-cap{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:16px;background:var(--surface-glass);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1px solid var(--border-subtle);box-shadow:var(--glass-shadow);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out);}
.nt-cap:focus-within{border-color:var(--accent);box-shadow:var(--glow-cyan-soft);}
.nt-cap__btn{flex:none;width:36px;height:36px;border-radius:11px;border:none;cursor:pointer;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent-press));color:var(--text-on-accent);box-shadow:0 0 16px var(--nt-teal-glow);font-size:20px;font-weight:600;line-height:1;transition:transform var(--dur-fast) var(--ease-out);}
.nt-cap__btn:hover{transform:scale(1.05);}
.nt-cap__btn:active{transform:scale(.95);}
.nt-cap__input{flex:1;min-width:0;border:none;background:transparent;outline:none;color:var(--text-strong);font:500 15px var(--font-body);}
.nt-cap__input::placeholder{color:var(--text-muted);}
.nt-cap__kbd{flex:none;font:600 11px var(--font-mono);letter-spacing:.05em;color:var(--text-faint);border:1px solid var(--border-subtle);border-radius:7px;padding:5px 8px;}
`;

/** Fast task-capture field — glass, leading + button, ⌘K hint. Enter submits & clears. */
export function QuickAddBar({
  placeholder = 'Ajouter une tâche, une note…',
  onAdd, showHint = true, defaultValue = '', className = '', ...rest
}) {
  injectCSS('nt-cap', CSS);
  const [value, setValue] = React.useState(defaultValue);
  const submit = () => { const v = value.trim(); if (!v) return; onAdd && onAdd(v); setValue(''); };
  return (
    <div className={['nt-cap', className].filter(Boolean).join(' ')} {...rest}>
      <button className="nt-cap__btn" onClick={submit} aria-label="Ajouter">+</button>
      <input className="nt-cap__input" value={value} placeholder={placeholder}
        onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
      {showHint && <span className="nt-cap__kbd">⌘K</span>}
    </div>
  );
}
