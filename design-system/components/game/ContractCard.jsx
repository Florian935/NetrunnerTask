import React from 'react';
import { injectCSS } from '../styleUtil.jsx';
import { FactionBadge } from './FactionBadge.jsx';
import { Button } from '../actions/Button.jsx';

const CSS = `
.nt-contract{position:relative;display:flex;flex-direction:column;gap:12px;padding:16px;color:var(--text-body);background:var(--surface-glass);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));filter:drop-shadow(0 0 .6px var(--_c)) drop-shadow(0 0 .6px var(--_c)) drop-shadow(0 0 14px var(--_g1)) drop-shadow(0 0 32px var(--_g2));}
.nt-contract--complete{opacity:.6}
.nt-contract--locked{opacity:.5;filter:grayscale(.6) drop-shadow(0 0 .6px var(--border-strong))}
.nt-contract__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.nt-contract__code{font:600 9px var(--font-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--text-faint)}
.nt-contract__title{margin:3px 0 0;font:600 18px/1.15 var(--font-display);letter-spacing:.01em;color:var(--text-strong);display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.nt-contract__urgent{display:inline-flex;align-items:center;gap:4px;font:600 10px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:#ff9099;background:color-mix(in srgb,var(--status-danger) 26%,transparent);border:1px solid color-mix(in srgb,var(--status-danger) 60%,transparent);box-shadow:0 0 12px rgba(255,77,94,.5),0 0 26px rgba(255,77,94,.3);border-radius:7px;padding:4px 8px}
.nt-contract__desc{margin:0;font:400 14px/1.5 var(--font-body);color:var(--text-muted)}
.nt-contract__pips{display:inline-flex;align-items:center;gap:5px}
.nt-contract__pip{width:8px;height:8px;transform:rotate(45deg);border:1px solid var(--_c)}
.nt-contract__pip--on{background:var(--_c);box-shadow:0 0 6px var(--_c)}
.nt-contract__difflabel{margin-left:4px;font:600 9px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--text-faint)}
.nt-contract__foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:2px}
.nt-contract__rewards{display:flex;gap:12px}
.nt-contract__rw{display:inline-flex;align-items:center;gap:5px;font:700 13px var(--font-mono)}
.nt-contract__rw b{width:5px;height:5px;border-radius:50%;box-shadow:0 0 6px currentColor}
.nt-contract__stamp{display:inline-flex;align-items:center;gap:6px;font:700 10px var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--status-success)}
`;

const DIFF = ['', 'Trivial', 'Faible', 'Modéré', 'Élevé', 'Critique'];

/** Contract (task) card — difficulty pips, faction, XP/credit/rep rewards, complete action. V2 style. */
export function ContractCard({ code, title, description, difficulty = 3, faction, urgent = false, xp = 0, credits = 0, rep = 0, status = 'available', onComplete, className = '', style, ...rest }) {
  injectCSS('nt-contract', CSS);
  const edge = status === 'complete' ? 'var(--status-success)' : (faction?.color || 'var(--accent)');
  const g1 = status === 'available' ? 'rgba(47,229,207,.14)' : `color-mix(in srgb, ${edge} 42%, transparent)`;
  const g2 = status === 'available' ? 'rgba(47,229,207,.08)' : `color-mix(in srgb, ${edge} 22%, transparent)`;
  const cls = ['nt-contract', (status === 'complete' || status === 'locked') ? `nt-contract--${status}` : '', className].filter(Boolean).join(' ');
  return (
    <article className={cls} style={{ '--_c': edge, '--_g1': g1, '--_g2': g2, ...style }} {...rest}>
      <div className="nt-contract__head">
        <div>
          {code && <div className="nt-contract__code">CONTRAT · {code}</div>}
          <h3 className="nt-contract__title">{title}{urgent && <span className="nt-contract__urgent">▲ Urgent</span>}</h3>
        </div>
        {faction && <FactionBadge name={faction.name} color={faction.color} sigil={faction.sigil} />}
      </div>
      {description && <p className="nt-contract__desc">{description}</p>}
      <div className="nt-contract__pips" title={`Difficulté : ${DIFF[difficulty] || difficulty}`}>
        {[1,2,3,4,5].map(i => <span key={i} className={`nt-contract__pip${i <= difficulty ? ' nt-contract__pip--on' : ''}`} />)}
        <span className="nt-contract__difflabel">{DIFF[difficulty] || ''}</span>
      </div>
      <div className="nt-contract__foot">
        <div className="nt-contract__rewards">
          {xp > 0 && <span className="nt-contract__rw" style={{ color: 'var(--nt-xp)' }}><b style={{ background: 'var(--nt-xp)' }} />+{xp} XP</span>}
          {credits > 0 && <span className="nt-contract__rw" style={{ color: 'var(--nt-credits)' }}><b style={{ background: 'var(--nt-credits)' }} />{credits} CR</span>}
          {rep > 0 && <span className="nt-contract__rw" style={{ color: 'var(--nt-rep)' }}><b style={{ background: 'var(--nt-rep)' }} />+{rep} REP</span>}
        </div>
        {status === 'complete'
          ? <span className="nt-contract__stamp">● HACKED</span>
          : status === 'locked'
          ? <Button variant="ghost" size="sm" disabled>Verrouillé</Button>
          : <Button variant="complete" size="sm" onClick={onComplete}>Hack réussi</Button>}
      </div>
    </article>
  );
}
