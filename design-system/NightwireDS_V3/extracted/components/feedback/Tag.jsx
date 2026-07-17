import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  cyan: 'var(--cyan-500)', magenta: 'var(--magenta-500)', mint: 'var(--mint-500)',
  violet: 'var(--violet-500)', amber: 'var(--amber-500)', red: 'var(--red-500)', neutral: 'var(--steel-400)',
};

/**
 * NIGHTWIRE Tag — dismissable label chip with beveled corner.
 */
export function Tag({ children, tone = 'neutral', icon = null, onRemove, style = {}, ...rest }) {
  const c = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        lineHeight: 1.4,
        color: c,
        background: `color-mix(in srgb, ${c} 10%, var(--bg-inset))`,
        border: `1px solid color-mix(in srgb, ${c} 40%, transparent)`,
        clipPath: 'var(--clip-bevel-sm)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
      {onRemove && (
        <span onClick={onRemove} style={{ display: 'inline-flex', cursor: 'pointer', opacity: 0.7, marginLeft: 2 }}>
          <Icon name="x" size={13} />
        </span>
      )}
    </span>
  );
}
