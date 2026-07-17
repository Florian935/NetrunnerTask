**Toast** — transient floating notification, usually stacked in a screen corner and auto-dismissed. Use Alert for persistent inline messages.

```jsx
<Toast kind="success" title="Upload complete" onClose={pop}>
  data_shard.enc synced to the grid.
</Toast>
```

Presentational only — you manage the stack container, positioning, and auto-dismiss timers.
