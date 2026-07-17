Primary action button — uppercase display type, neon glow on hover; use `variant="complete"` for the signature "hack successful" task-completion action.

```jsx
<Button variant="primary" onClick={jackIn}>Jack In</Button>
<Button variant="complete" leadingIcon={<CheckIcon/>}>Hack Successful</Button>
```

Variants: `primary` (cyan filled), `secondary` (cyan outline), `ghost`, `danger` (red outline), `complete` (phosphor-lime). Sizes: `sm` `md` `lg`. Props: `block`, `disabled`, `leadingIcon`, `trailingIcon`.
