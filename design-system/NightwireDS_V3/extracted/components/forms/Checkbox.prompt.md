**Checkbox** — independent on/off choice; use for multi-select lists and settings toggles that aren't instant-apply.

```jsx
<Checkbox checked={agree} onChange={setAgree} label="Jack in automatically" />
```

`onChange` receives the next boolean. Cyan fill + glow when checked.
