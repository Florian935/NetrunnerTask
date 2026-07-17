import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * NIGHTWIRE Breadcrumbs — mono path trail with chevron separators.
 */
export function Breadcrumbs({ items = [], onNavigate, style = {}, ...rest }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', ...style }} {...rest}>
      {items.map((it, i) => {
        const item = typeof it === 'string' ? { label: it } : it;
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <span
              onClick={() => !last && onNavigate && onNavigate(item, i)}
              style={{
                color: last ? 'var(--cyan-400)' : 'var(--text-muted)',
                cursor: last ? 'default' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
            {!last && <Icon name="chevron-right" size={13} color="var(--void-200)" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
