**Tag** — categorical label / filter chip, optionally removable. Use for applied filters, keywords, metadata; use Badge for tiny non-interactive statuses.

```jsx
<Tag tone="cyan" icon="cpu">netrunner</Tag>
<Tag tone="magenta" onRemove={() => drop(id)}>#eddies</Tag>
```

Beveled corner, mono text. Pass `onRemove` to show the × affordance.
