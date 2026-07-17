**Button** — the primary action control; use for any click-to-act affordance.

```jsx
<Button variant="primary" onClick={go}>Deploy</Button>
<Button variant="secondary" hud leftIcon={<Icon name="zap" />}>Scan</Button>
```

Variants: `primary` (violet→magenta gradient, glows on hover), `secondary` (cyan neon outline), `ghost` (bare), `danger` (red outline). Sizes `sm|md|lg`. Set `hud` for beveled/chamfered corners (the HUD look). All labels render UPPERCASE with wide letter-spacing.
