**IconButton** — compact icon-only action; use in toolbars, card headers, table rows, and dense UI where a labelled button is too heavy.

```jsx
<IconButton name="settings" variant="solid" title="Settings" />
<IconButton name="x" variant="ghost" onClick={close} />
```

Variants: `ghost` (bare), `solid` (paneled), `outline` (neon border). Sizes `sm|md|lg`. Always pass `title` for accessibility.
