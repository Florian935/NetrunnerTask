import React from 'react';

const ACCENTS = {
  cyan: 'var(--cyan-500)', magenta: 'var(--magenta-500)', mint: 'var(--mint-500)',
  violet: 'var(--violet-500)', gradient: 'var(--grad-primary)',
};

/**
 * NIGHTWIRE ProgressBar — neon determinate progress track.
 * Set `striped` for animated HUD hatch fill.
 */
export function ProgressBar({ value = 0, max = 100, accent = 'cyan', label, showValue = false, height = 8, style = {}, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = ACCENTS[accent] || accent;
  const glowColor = accent === 'gradient' ? 'var(--magenta-500)' : fill;
  return (
    <div style={{ ...style }} {...rest}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--text-secondary)' }}>
          <span>{label}</span>
          {showValue && <span style={{ color: 'var(--text-primary)' }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ position: 'relative', height, background: 'var(--bg-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: fill, boxShadow: `0 0 10px ${glowColor}`, borderRadius: 'var(--radius-pill)', transition: 'width var(--dur-med) var(--ease-out)' }} />
      </div>
    </div>
  );
}
