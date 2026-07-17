---
name: nightwire-design
description: Use this skill to generate well-branded interfaces and assets for NIGHTWIRE (a cyberpunk / edgerunner-futurist design system — neon-on-void, HUD frames, mono data readouts), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference
- **Entry point:** link `styles.css` (pulls in all tokens + fonts). Fonts load from Google Fonts CDN; icons from Lucide CDN (`https://unpkg.com/lucide@latest`).
- **Palette:** neon-on-void. Dark blue-tinted surfaces (`--void-*`), cyan-white text (`--frost-100`), four neon accents — cyan (primary), magenta, mint, violet. Never pure black or white. Max two neon accents per surface.
- **Type:** Chakra Petch (display/chrome, UPPERCASE + wide tracking), Rajdhani (body/controls), Share Tech Mono (data/code/timestamps).
- **Shape:** tiny radii; the brand look comes from `--clip-bevel-*` chamfers + neon edges. Rounded product cards OR beveled HUD panels.
- **Signature motifs:** neon glow (not drop shadow), diagonal hatch stripes (`///`), corner brackets, chromatic-aberration display type, grid/scanline textures.
- **Voice:** terse, technical, in-world netrunner tone. Deploy / scan / override / jack in. No emoji.
- **Components:** React, on `window.NightwireDesignSystem_*` — see README index. Signature components: `HudPanel`, `StatCard`, `Button`, `Card`.
