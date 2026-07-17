import React from 'react';
import { injectCSS } from '../styleUtil.jsx';

const CSS = `
.nt-field{display:flex;flex-direction:column;gap:6px;width:100%;}
.nt-field__label{font-family:var(--font-mono);font-size:var(--fs-2xs);letter-spacing:var(--ls-wider);text-transform:uppercase;color:var(--text-muted);}
.nt-field__label b{color:var(--status-danger);}
.nt-field__wrap{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;background:var(--surface-inset);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out);}
.nt-field__wrap:focus-within{border-color:var(--accent);box-shadow:var(--glow-cyan-soft);}
.nt-field__input{flex:1;min-width:0;border:none;background:transparent;outline:none;color:var(--text-strong);font-family:var(--font-body);font-size:var(--fs-sm);}
.nt-field__input::placeholder{color:var(--text-faint);}
.nt-field__icon{display:inline-flex;color:var(--text-faint);}
.nt-field--error .nt-field__wrap{border-color:var(--status-danger);box-shadow:0 0 12px rgba(255,77,94,.28);}
.nt-field--disabled .nt-field__wrap{opacity:.5;cursor:not-allowed;}
.nt-field__msg{font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-faint);}
.nt-field--error .nt-field__msg{color:var(--status-danger);}
`;

/** Labelled text input with terminal styling and focus/error/disabled states. */
export function TextField({
  label, required = false, leadingIcon, trailingIcon,
  error, hint, disabled = false, className = '', id, ...rest
}) {
  injectCSS('nt-field', CSS);
  const autoId = React.useId ? React.useId() : undefined;
  const fieldId = id || autoId;
  const cls = ['nt-field', error ? 'nt-field--error' : '', disabled ? 'nt-field--disabled' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {label && <label className="nt-field__label" htmlFor={fieldId}>{label}{required && <b> *</b>}</label>}
      <div className="nt-field__wrap">
        {leadingIcon && <span className="nt-field__icon">{leadingIcon}</span>}
        <input id={fieldId} className="nt-field__input" disabled={disabled} aria-invalid={!!error} {...rest} />
        {trailingIcon && <span className="nt-field__icon">{trailingIcon}</span>}
      </div>
      {(error || hint) && <span className="nt-field__msg">{error || hint}</span>}
    </div>
  );
}
