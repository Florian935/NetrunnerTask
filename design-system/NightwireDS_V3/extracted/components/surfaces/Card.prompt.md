**Card** — the default panel/surface for grouping content. Use everywhere you need a bounded region.

```jsx
<Card title="Traffic overview" subtitle="last 24h" accent="cyan" actions={<IconButton name="more-horizontal" />}>
  …chart…
</Card>
```

Rounded by default; set `hud` for beveled corners. `accent` adds a glowing top rail + tinted border; `glow` adds an outer neon halo.
