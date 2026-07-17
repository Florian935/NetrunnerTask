**Tabs** — switch between sibling views within one screen.

```jsx
<Tabs tabs={['Overview','Analytics','Logs']} value={tab} onChange={setTab} />
```

Accepts `string[]` or `{value,label}[]`. Active tab gets a glowing cyan underline + neon text.
