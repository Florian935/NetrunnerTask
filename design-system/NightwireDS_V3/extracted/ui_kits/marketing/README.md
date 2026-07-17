# Marketing — UI kit

The NIGHTWIRE **marketing landing page**. Leans into the HUD/vector-pack flavor
(reference #2): chromatic-aberration hero, beveled HudPanels, hatch accents, neon
glow, in-world copy.

## Sections
Nav → Hero (chromatic wordmark + CTAs + trust bar) → Modules (3 HudPanels) →
Stat band → Live-console showcase → Pricing (3 tiers) → CTA band → Footer.

## Files
- `index.html` — bootstraps React + DS bundle + Lucide, mounts `LandingPage`.
- `landing.jsx` — all sections + `LandingPage`, exported to `window`.

Composes DS primitives only (`Button`, `HudPanel`, `Card`, `StatCard`, `Badge`,
`Tag`, `ProgressBar`, `Input`, `Icon`). Namespace `window.NightwireDesignSystem_f7f010`.
