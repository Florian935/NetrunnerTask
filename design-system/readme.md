# Netrunner Task — Design System

A design system for **Netrunner Task** — a task- and habit-tracker reframed as a cyberpunk RPG: real tasks become **contracts** to fulfil for XP, credits, faction reputation and cosmetics. Mobile-first. The visual direction (frozen as **V2**) was developed from a daily-planner reference screen the user loved (the « Aujourd'hui » screen in `Aujourdhui.html`) and applied to the Netrunner product surfaces.

**Art direction — "cyberpunk élégant / haut de gamme".** Futuristic, technological, terminal-flavoured HUD — but this is a daily utility, so the *wahou* lives in the neon accents, micro-interactions and the opening animation, never in permanent visual overload. Clean, highly legible base; targeted neon. Think *premium spaceship interface*, not flashy.

> **Core tension:** immersive tech chrome vs. fast, calm daily legibility. When they conflict, legibility and calm win.

---

## Sources

No codebase, Figma or brand assets were provided. This system was authored **from the written brief** and from reference renders the user validated (dark hero screen, day-planning & task-detail screens, quick-add screen). It began as a game-flavoured task app ("Netrunner Task") and was **re-founded** on the planner direction the user chose — the RPG-specific primitives (rarity, cosmetics, contracts, factions) were removed.

**Flagged substitutions (please confirm or replace):**
- **Fonts** — Google Fonts nearest matches: **Chakra Petch** (display / greeting / titles — techy, angular, cyberpunk), **Space Grotesk** (body / task content), **JetBrains Mono** (HUD labels, numbers, times). They load via `@import` in `tokens/fonts.css`, so the compiler reports "0 fonts" (no local `@font-face`) — expected. The display font is fully tokenised (`--font-display`) — swapping it is a one-line change.
- **Icons** — no set supplied. [Lucide](https://lucide.dev) (thin 2px stroke, CDN) is the recommended set; the current screens mostly use functional glyphs (`+`, `▲`, `•••`, HUD brackets) rather than an icon library. See *Iconography*.
- **Logo** — none supplied; rendered as a type-only wordmark. No mark was invented.

---

## Content fundamentals

**Language: French.** The assistant's voice is a **calm, reassuring handler** — "je peux tout lâcher, l'app ne laissera rien filer". Confident, quiet, never chatty or cute.

- **Person / tone:** second-person, gentle imperative from the assistant ("Cale la présentation ce matin tant que tu es frais"). The briefing is 1–2 sentences, plain, prioritising.
- **Casing:** UPPERCASE + wide tracking (mono) for HUD labels, section headers, dates, times and system readouts (`JEU. 16 JUILLET`, `SYS·OK`, `TÂCHES 02`, `DANS 3 J`). Sentence case for task titles and body so real content reads naturally.
- **Numbers as reassurance:** counts, streaks, ETAs and "REPORT AUTO · ACTIF" are surfaced in monospace — they signal *nothing is slipping*. Don't invent stats without meaning.
- **Examples:** status line `3 tâches · 2 routines restantes`; briefing `Journée chargée côté client. Cale la présentation ce matin tant que tu es frais ; garde les mails et le sport pour ce soir.`; reminder `Déclaration URSSAF · DANS 3 J`.
- **No emoji.** Meaning is carried by colour + glyph + label together — never colour alone (accessibility).

---

## Visual foundations

**Vibe:** a premium HUD at night (dark hero) with a matching bright "cyberpunk de jour" (light). Flat, calm base; neon reserved for *signal* (active, urgent, streak, reminder).

- **Dual theme.** Dark is the default `:root`; add class **`.theme-light`** to switch. Both share the same semantic aliases, so components adapt automatically.
- **Colour.** Dark: blue-tinted near-black ramp (`--nt-ink-950…500`, app bg `#070a14` — never pure black), frosted-glass surfaces. Light: frosted-white glass on a luminous `#eef2f8`. Accents: **teal `#2fe6cf`** (primary signal / XP / active), **violet `#9b6bff`** (routines / streak / reminders), **magenta `#ff4d8d`** (urgent / alerts), amber for warnings. In light, neons darken for contrast (teal `#00b39c`, violet `#7c4dff`, magenta `#e0348a`).
- **Glass.** `--surface-glass` + `--glass-blur` (blur 18px, saturate 1.2) + a luminous 1px `--glass-brd` + `--glass-shadow` (inset top highlight + soft drop). The `.nt-glass` helper applies all of it.
- **Ambient background.** Composed behind glass: `--aurora` (slow-drifting gradient mesh), `--mesh` (subtle grid), `--scanlines` (faint), plus `--grid-dots`. Kept quiet enough to never hurt reading; the aurora drifts on an 18s loop.
- **HUD details.** Corner **brackets** (⌐ ¬ ⌐) on the screen frame and highlighted cards, an ETA readout with a bracketed right edge, `SYS·OK ▪▪▪▪` signal squares, a dynamic-island status bar.
- **Type.** Chakra Petch display (greeting, titles — slight positive tracking), Space Grotesk body (1.5 line-height), JetBrains Mono for everything HUD. Scale is 1.25 on a 15px base.
- **Glow & focus.** Targeted glows (`--glow-teal/-violet/-magenta`) only on important elements. Focus is **always** the teal `--focus-ring` (double ring + glow) — never colour alone.
- **Corners & spacing.** 4px grid; cards 14–18px radius, pill for gauges/streaks/mood. Deep, low-opacity shadows tuned per theme.
- **Motion (the *wahou*).** Opening "materialisation": aurora fades in, greeting rises, cards assemble in a 90ms cascade each swept by a teal scan line, streak counters count up from 0. Micro-interactions: checking pulses (`nt-pulse`), streaks can pulse (`hot`), transitions use `--ease-out`/`--ease-spring`. All decorative motion respects `prefers-reduced-motion`.

---

## Iconography

- **Recommended set:** [Lucide](https://lucide.dev) — thin 2px stroke, matches the technical register, inherits `currentColor` (muted at rest, teal on hover/active). CDN.
- **HUD glyphs:** functional marks are used directly — `+` (capture), `▲` (urgent), `•••` (menu), `◧`, corner brackets, the `SYS·OK` squares, the streak diamond `◆`. Control affordances (check tick) are tiny inline SVGs inside components.
- **No emoji.** Substitution flag: Lucide is a stand-in for an unspecified icon set — confirm or replace.

---

## Foundations (Design System tab)

`guidelines/` specimen cards, grouped: **Colors** (Accent, Neutrals sombre, Semantic, Light theme), **Type** (Display, Body, Mono, Scale), **Spacing** (Scale, Radii), **Brand** (Neon Glows, Ambient & Textures, Glassmorphism, Elevation).

## Tokens

`styles.css` (root) is the consumer entry point — `@import`s only:
- `tokens/fonts.css` — webfont `@import`
- `tokens/colors.css` — dark `:root` + `.theme-light`; ink/slate ramps, teal/violet/magenta accents, glass, semantic aliases
- `tokens/typography.css` — Chakra Petch / Space Grotesk / JetBrains Mono, 1.25 scale, tracking
- `tokens/spacing.css` — 4px grid, radii, layout dims
- `tokens/effects.css` — glass, ambient (aurora/mesh/scanlines), neon glows, shadows, motion keyframes

## Components

React primitives (namespace `window.NetrunnerTaskDesignSystem_d40f1e`), under `components/`:

- **surfaces/** — `GlassCard` (frosted glass panel — V2 chamfered corners + neon drop-shadow halo; `rounded` + `brackets` options)
- **game/** — `ContractCard` (task unit: difficulty pips, faction, XP/credit/rep rewards, urgent tag, complete action), `RarityBadge` (5 cosmetic tiers), `CosmeticCard` (inventory item, rarity-tinted frame), `FactionBadge` (faction sigil chip)
- **actions/** — `Button` (teal gradient primary + secondary/ghost/danger/complete), `IconButton`
- **forms/** — `QuickAddBar` (fast capture), `TextField`, `Checkbox`
- **data/** — `ProgressBar` (level / rep / streak gauges), `StatChip` (HUD readouts)
- **feedback/** — `Badge` (incl. `urgent` tone), `Tag`

Each component directory has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one `@dsCard` HTML demo.

## UI kits

- **ui_kits/netrunner/** — the Netrunner contract-board screen composed from the DS components, in the frozen V2 style. See its `README.md`.

## Root index / manifest

- `styles.css` — token entry point (consumers link this)
- `tokens/` — CSS custom properties + fonts
- `components/` — React primitives (6 groups, 15 components)
- `guidelines/` — foundation specimen cards
- `ui_kits/netrunner/` — product recreation (contract board, V2 style)
- `assets/` — wordmark note (no logo supplied)
- `thumbnail.html` — homepage tile
- `HANDOFF.md` — developer handoff guide
- `SKILL.md` — Agent Skills manifest
- `readme.md` — this guide

## Intentional additions

Authored from a brief with no source inventory, so the component set is an original set tuned to the product: the **game/** group (`ContractCard`, `RarityBadge`, `CosmeticCard`, `FactionBadge`) plus the reward-oriented `ProgressBar`/`StatChip` serve the cyberpunk-RPG task framing (contracts, XP, credits, reputation, cosmetics).
