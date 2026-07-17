**Alert** — persistent inline status message tied to a region of the page (form errors, system notices). Use Toast for transient floating notifications.

```jsx
<Alert kind="danger" title="Intrusion detected" onClose={dismiss}>
  ICE tripped on node 0x4F. Connection severed.
</Alert>
```

Kinds: success (mint), warning (amber), danger (red), info (cyan) — each sets the icon + neon left rail.
