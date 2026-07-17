import React from 'react';
// Internal helper — injects a component's stateful CSS (hover/focus/active/disabled)
// once per id. Lowercase export → intentionally NOT exposed on the DS namespace.
const injected = new Set();
export function injectCSS(id, css) {
  if (typeof document === 'undefined' || injected.has(id)) return;
  injected.add(id);
  const el = document.createElement('style');
  el.setAttribute('data-nt-style', id);
  el.textContent = css;
  document.head.appendChild(el);
}
