**Switch** — instant-apply on/off toggle (e.g. "Enable ICE", "Dark mode"). Use instead of Checkbox when the change takes effect immediately.

```jsx
<Switch checked={ice} onChange={setIce} label="Intrusion countermeasures" />
```

Mint gradient track + glow when on. `onChange` receives the next boolean.
