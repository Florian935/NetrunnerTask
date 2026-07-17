**HudPanel** — the hero NIGHTWIRE container: a beveled frame with a glowing neon edge, a title bar with hatch stripe, and a mono status readout. Use for terminals, system panels, hero modules, anything that should read as a HUD.

```jsx
<HudPanel title="System Online" status="24.06.99" accent="cyan">
  …content…
</HudPanel>
```

Accents: cyan, magenta, mint, violet. The neon edge follows the chamfered corners. Toggle `hatch` and `glow`.

Set `variant="terminal"` for the thin neon-hairline frame with corner ticks (the RETONIA / terminal-OS look) — ideal for dense mono panels and wireframe diagrams:

```jsx
<HudPanel variant="terminal" title="Data Stream" status="0x4F ++++" accent="magenta">…</HudPanel>
```
