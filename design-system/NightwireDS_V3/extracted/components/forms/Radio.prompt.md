**Radio** — one choice from a small set (2–4). Group several with a shared `name`; `onChange` returns the option's `value`.

```jsx
<Radio name="mode" value="stealth" checked={m==='stealth'} onChange={setM} label="Stealth" />
<Radio name="mode" value="brute"  checked={m==='brute'}  onChange={setM} label="Brute force" />
```

Magenta dot + glow when selected.
