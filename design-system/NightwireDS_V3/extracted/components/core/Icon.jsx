import React, { useRef, useEffect } from 'react';

/**
 * NIGHTWIRE Icon — thin wrapper around Lucide line icons.
 * Requires the Lucide UMD script loaded on the page (window.lucide).
 * Renders imperatively into a span React leaves empty, so there is no
 * React/DOM conflict when Lucide swaps the <i> for an <svg>.
 */
export function Icon({ name, size = 18, strokeWidth = 2, color = 'currentColor', style = {}, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    el.appendChild(i);
    window.lucide.createIcons({
      nameAttr: 'data-lucide',
      attrs: { width: size, height: size, 'stroke-width': strokeWidth },
    });
  }, [name, size, strokeWidth]);
  return <span ref={ref} aria-hidden="true" style={{ display: 'inline-flex', color, lineHeight: 0, ...style }} {...rest} />;
}
