**Select** — single-choice dropdown; use when there are >4 mutually-exclusive options.

```jsx
<Select value={region} onChange={e=>setRegion(e.target.value)}
  options={['Night City','Watson','Pacifica']} />
```

Accepts `string[]` or `{value,label}[]`. Neon chevron, cyan focus glow, mono option text.
