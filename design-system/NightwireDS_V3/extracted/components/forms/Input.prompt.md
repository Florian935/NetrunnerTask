**Input** — single-line text entry; use for forms, search, filters, terminals.

```jsx
<Input placeholder="Search the grid…" icon="search" />
<Input value={v} onChange={e=>setV(e.target.value)} error />
```

Neon cyan focus glow (red when `error`). Text is set in the mono face for that terminal feel. Sizes `sm|md|lg`; pass `icon` for a leading glyph, `hud` for beveled corners.
