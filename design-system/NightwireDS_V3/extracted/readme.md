# NIGHTWIRE — Design System

A cyberpunk / edgerunner-futurist design system: **neon-on-void**. High-contrast
interfaces built from dark, blue-tinted surfaces, saturated neon accents, beveled
HUD frames, hatch stripes, monospace data readouts and generous glow.

> NIGHTWIRE is an **original** system authored from a mood set of four reference
> images (see *Sources* below). It is not a recreation of any shipping product or
> brand. There is no client codebase or Figma file behind it.

---

## Sources / provenance

The visual direction was distilled from four reference images the user supplied
(stored in `uploads/`):

1. `pasted-1784282604921-0.png` — a "Cyberpunk UI Design System" dashboard +
   mobile + component spec sheet. **Primary driver of the component inventory**
   (buttons, inputs, cards, controls, tabs, badges, alerts) and the
   product-dashboard styling (rounded panels, gradient buttons, neon charts).
2. `pasted-1784282622651-0.png` — a "Cyberpunk vector pack" of HUD frames.
   Drives the **HUD flavor**: beveled/notched corners, corner brackets, diagonal
   hatch stripes, chromatic-aberration display type, acid-green + cyan + magenta.
3. `pasted-1784282651142-0.png` — a "RETONIA / PRAKSTIENS" terminal OS. Drives the
   **terminal/data aesthetic**: thin neon hairline frames, dense mono text, magenta
   bar charts on deep navy.
4. `pasted-1784282669892-0.png` — a pink-dominant extension terminal. Reinforces
   magenta/pink panels, circuit-edge borders and cyan wireframe diagrams.

No logo was provided, so **NIGHTWIRE renders as a wordmark in the display face**
(with chromatic-aberration treatment) wherever a mark is needed — no logo was
invented. See *Iconography*.

---

## Content fundamentals — voice & copy

The NIGHTWIRE voice is **terse, technical, and a little dangerous** — like a
netrunner's console, not a marketing site.

- **Casing.** UI chrome (buttons, tabs, labels, badges, panel titles) is
  **UPPERCASE with wide letter-spacing**. Body copy is sentence case.
- **Person.** Address the operator directly as **you** ("You are jacked in").
  System messages speak in clipped machine voice ("ACCESS GRANTED", "ICE tripped
  on node 0x4F").
- **Tone.** Confident, high-stakes, in-world. Prefer verbs of action and control:
  *deploy, scan, override, purge, jack in, breach, sync*. Numbers and codes make
  it feel live — timestamps (`24.06.99`), hex node IDs (`0x4F`), version stamps
  (`v3.0`), req/s.
- **Length.** Short. Labels are 1–2 words; status lines are one clause. Let the
  data and glow carry the drama, not the prose.
- **Emoji.** None. The icon vocabulary is Lucide line icons only (see below).
  Unicode glyphs like `>` `///` `+++` `×` appear as decorative HUD marks.
- **Examples.**
  - Button labels: `DEPLOY`, `SCAN`, `OVERRIDE`, `PURGE`, `JACK IN`.
  - Status: `SYSTEM ONLINE`, `ACCESS GRANTED`, `INTRUSION DETECTED`.
  - Empty state: `NO SIGNAL — reconnect to the grid.`
  - Metric label: `CPU LOAD`, `THREAT LEVEL`, `THROUGHPUT`.

---

## Visual foundations

**Palette.** Neon-on-void. Backgrounds are near-black with a cool blue cast —
**never pure `#000`**; text is a cyan-white (`--frost-100 #E6F1FF`), never pure
white. Accents are four saturated neons: **cyan `#00F0FF` (primary)**, **magenta
`#FF2D95` (secondary)**, **mint `#2EFFC2` (tertiary)** and **violet `#A855F7`**,
plus acid lime for spot use. Max two neon accents per surface — pick a dominant
and support it; more than two reads as noise. Semantic: success=mint,
warning=amber, danger=red, info=cyan.

**Gradients.** Four brand gradients, used sparingly on primary buttons and hero
fills: primary (violet→magenta), cyber (cyan→violet), heat (magenta→amber), mint
(mint→cyan). Never gradient a large flat background — reserve for fills and rails.

**Type.** Three families. **Chakra Petch** (angular display) for headings and UI
chrome; **Rajdhani** (condensed) for body and controls; **Share Tech Mono** for
all data, code, timestamps, and terminal readouts. Display type runs uppercase +
wide tracking; mono carries live values. Two hero treatments: **neon glow**
(`--text-glow-*`) and **chromatic aberration** (`--text-chroma`, offset
cyan/magenta shadows).

**Corners & shape.** Radii stay tiny (`2–4px`). The brand's "roundness" comes from
**clip-path chamfers** — the `--clip-bevel-*` cut corners. Two families of
container: rounded **product cards** (dashboard style, ref #1) and beveled **HUD
panels** (vector-pack style, ref #2). Pills only for badges/tags/switches.

**Borders.** 1px, low-opacity steel hairlines for structure (`--border`), neon
1px for focus/active/selected. Beveled panels get their neon edge from a
two-layer clip technique (neon layer behind a 1px-inset panel layer).

**Shadows & glow.** Depth shadows are dark and tight (screens are already dark).
The signature elevation is **glow**, not drop shadow: layered neon
`box-shadow` on focus, active, hover, and hero elements. Text glow for neon
headings.

**Backgrounds & texture.** A faint cyan **grid** backdrop (`--grid-lines`, 32–64px),
optional **scanline** overlay, and diagonal **hatch stripes** (`///`) as HUD
accents. Full-bleed dark radial vignettes anchor hero areas. No photography by
default; imagery, when used, is neon-lit night-city and cool/high-contrast.

**Motion.** Fast, snappy, mechanical — **no bounce**. Durations 80–240ms,
`--ease-out` for enters, `--ease-in-out` for toggles. Hover raises glow / shifts
gradient position; **press** nudges `translateY(1px)` and dims slightly. Focus =
neon ring + glow. Avoid slow fades and springy easing; this UI reacts instantly.

**States.**
- *Hover:* add/intensify glow, lighten neon (`--*-400`), or reveal a tinted fill.
- *Press:* `translateY(1px)`, brief opacity dip.
- *Focus:* neon border + `--glow-*` ring.
- *Selected/active:* neon underline or glowing cell / fill.
- *Disabled:* `opacity: .4`, `not-allowed`, no glow.

**Layout.** Dense, data-forward, grid-aligned on the 4px unit. Dashboards use KPI
tiles + panel grids; terminals use full-bleed dark with hairline dividers. Fixed
chrome (sidebars, top bars) sits on `--bg-panel` above the app void.

---

## Iconography

- **System:** [**Lucide**](https://lucide.dev) line icons (thin 1.75–2px stroke) —
  the closest CDN match to the crisp stroke icons in reference #1. Loaded from CDN
  (`https://unpkg.com/lucide@latest`). **This is a substitution** (no proprietary
  icon set was provided) — flagged for the user; swap if you have a house set.
- **Usage:** icons inherit `currentColor` so they tint with surrounding text /
  accent. Names are Lucide kebab-case (`zap`, `shield-alert`, `cpu`, `radar`).
  Use the `Icon` component (React) or `<i data-lucide="…">` + `lucide.createIcons()`
  (plain HTML).
- **No emoji.** Decorative HUD marks use plain glyphs: `>` prompts, `///` hatch,
  `+++`, `×`, `▲`. Skull/crosshair/fingerprint motifs from the vector pack map to
  Lucide `skull`, `crosshair`, `fingerprint`.
- **No hand-drawn SVG brand art.** Where the vector pack shows bespoke frames, we
  reproduce the *effect* with CSS (bevel clip + neon edge + hatch), not by tracing
  the artwork.

---

## What's in here (index / manifest)

**Root**
- `styles.css` — the single entry point consumers link. `@import`s everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`,
  `effects.css`, `base.css` (resets + brand utility classes `.nw-*`).
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent-Skills manifest for use in Claude Code.
- `readme.md` — this file.

**Components** (`components/…`, React, exported on `window.NightwireDesignSystem_*`)
- **core/** — `Icon`
- **forms/** — `Button`, `IconButton`, `Input`, `Select`, `Checkbox`, `Radio`,
  `Switch`, `Slider`
- **feedback/** — `Badge`, `Tag`, `Alert`, `Toast`, `Tooltip`, `ProgressBar`
- **surfaces/** — `Card`, `StatCard`, `HudPanel`
- **navigation/** — `Tabs`, `Breadcrumbs`, `Pagination`

**Foundation cards** (`guidelines/…`) — Colors, Type, Spacing, Brand specimen
cards shown in the Design System tab.

**UI kits** (`ui_kits/…`)
- `netrunner-console/` — a netrunner dashboard / ops console (dark HUD product).
- `marketing/` — the NIGHTWIRE marketing landing page.

**Intentional additions.** Beyond a standard primitive set, NIGHTWIRE adds
`HudPanel` (the signature beveled frame — core to the brand look) and `StatCard`
(dashboard KPI tile seen in reference #1). Both are load-bearing for the
aesthetic, not generic filler.

**Substitutions to confirm.** Fonts load from **Google Fonts CDN** (Chakra Petch,
Rajdhani, Share Tech Mono) rather than bundled binaries; icons are **Lucide** via
CDN. Swap either if you have house assets.
