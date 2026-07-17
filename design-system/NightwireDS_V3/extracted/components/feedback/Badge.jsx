import React from 'react';

const TONES = {
  cyan: { c: 'var(--cyan-500)', g: 'var(--cyan-glow)' },
  magenta: { c: 'var(--magenta-500)', g: 'var(--magenta-glow)' },
  mint: { c: 'var(--mint-500)', g: 'rgba(46,255,194,.5)' },
  violet: { c: 'var(--violet-500)', g: 'var(--violet-glow)' },
  amber: { c: 'var(--amber-500)', g: 'rgba(255,176,32,.5)' },
  red: { c: 'var(--red-500)', g: 'rgba(255,46,91,.5)' },
  neutral: { c: 'var(--steel-400)', g: 'transparent' },
};

/**
 * NIGHTWIRE Badge — tiny status pill (NEW, HOT, BETA, counts).
 * `solid` fills with the tone; otherwise a subtle tinted outline.
 */
export function Badge({ children, tone = 'cyan', solid = false, glow = false, style = {}, ...rest }) {
  const t = TONES[tone] || TONES.cyan;
  const pulseable = { cyan: 1, magenta: 1, mint: 1, violet: 1 };
  return (
    <span
      className={glow && pulseable[tone] ? `nw-pulse-${tone}` : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        lineHeight: 1.4,
        borderRadius: 'var(--radius-pill)',
        color: solid ? 'var(--void-900)' : t.c,
        background: solid ? t.c : `color-mix(in srgb, ${t.c} 14%, transparent)`,
        border: `1px solid ${solid ? 'transparent' : `color-mix(in srgb, ${t.c} 45%, transparent)`}`,
        boxShadow: glow ? `0 0 10px ${t.g}` : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
