import React from 'react';

/**
 * NIGHTWIRE Tabs — underline tab bar with a neon active indicator.
 */
export function Tabs({ tabs = [], value, onChange, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--border)', ...style }} {...rest}>
      {tabs.map((t) => {
        const tab = typeof t === 'string' ? { value: t, label: t } : t;
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange && onChange(tab.value)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: active ? 'var(--cyan-400)' : 'var(--text-secondary)',
              textShadow: active ? 'var(--text-glow-cyan)' : 'none',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
          >
            {tab.label}
            {active && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, background: 'var(--cyan-500)', boxShadow: '0 0 8px var(--cyan-500)', animation: 'nw-scan-drift 0s', animationName: 'nw-pulse-cyan', animationDuration: '2.4s', animationIterationCount: 'infinite', animationTimingFunction: 'var(--ease-in-out)' }} />}
          </button>
        );
      })}
    </div>
  );
}
