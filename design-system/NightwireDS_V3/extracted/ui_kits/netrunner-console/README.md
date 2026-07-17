# Netrunner Console — UI kit

A dark HUD **ops console / analytics dashboard**, the flagship product surface for
NIGHTWIRE. Recreates the dashboard styling from reference image #1 using the
system's own components.

## Flow
`index.html` boots to a **Jack In** login (HudPanel + access code), then into the
console shell: sidebar nav + top bar + routed screens.

- **Overview** — KPI StatCards, neon area chart (traffic), donut (traffic source),
  recent-orders table, system-status ProgressBars + Switch.
- **Analytics** — area + bar charts.
- **Datastream** — terminal-OS screen (ref #4): contract list, decrypt reading pane
  with tabs + mono log, and cyan/magenta wireframe diagrams (Safe/Beta).
- **ICE / Comms / Settings** — HUD "module offline" placeholders.

The shell leans into the terminal/HUD direction: a magenta circuit-trace frame
(`CircuitFrame`), hairline `HudPanel variant="terminal"` panels, mono-heavy chrome.

## Files
- `index.html` — bootstraps React + the DS bundle + Lucide, mounts `ConsoleApp`.
- `app.jsx` — shell (`Sidebar`, `TopBar`), screens (`LoginScreen`,
  `DashboardScreen`, `AnalyticsScreen`, `Placeholder`), `ConsoleApp` router.
- `charts.jsx` — self-contained neon SVG charts (`NeonAreaChart`, `NeonBars`,
  `NeonDonut`, `Sparkline`).

## Notes
Composes DS primitives (`Button`, `Card`, `StatCard`, `HudPanel`, `Badge`,
`ProgressBar`, `Input`, `Switch`, `Icon`) — it does not re-implement them. Charts
are cosmetic recreations, not a real charting lib. Namespace is
`window.NightwireDesignSystem_f7f010`.
