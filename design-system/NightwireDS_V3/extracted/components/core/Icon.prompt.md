**Icon** — a Lucide line icon, the NIGHTWIRE icon system. Use inside buttons, list rows, nav, badges — anywhere you need a glyph.

```jsx
<Icon name="zap" size={18} />
<Icon name="shield-alert" color="var(--red-500)" />
```

Names are Lucide kebab-case (`activity`, `terminal`, `cpu`, `radar`, `wifi`). The page must load the Lucide UMD script (`https://unpkg.com/lucide@latest`). Inherits `currentColor` by default so it tints with surrounding text.
