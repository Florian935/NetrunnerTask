// US-034 — helpers de PRÉSENTATION des caisses (couleurs/glows/icône), séparés
// de la logique pure `game/crates.ts`. La teinte vient des tokens `crate.css` ;
// l'intensité de glow échelonnée par qualité distingue les 3 paliers (au-delà de
// la seule teinte) — même principe que `rarityStyle.ts` pour la rareté.

import type { CrateQuality } from '../../game/crates'

interface CrateStyle {
  /** Couleur pleine (token `crate.css`). */
  color: string
  /** Triplet RGB, à composer dans `rgba(...)`. */
  rgb: string
  /** Intensité de glow (0 → 1 : palier montant). */
  glow: number
  /** Icône du coffre (registre lucide). */
  icon: string
  /** Aberration chromatique (RGB) du cran le plus prestigieux, sinon absente. */
  chromaRgb?: string
}

/** Métadonnées de présentation par qualité (ordre montant standard → Black ICE). */
export const CRATE_STYLE: Record<CrateQuality, CrateStyle> = {
  standard: { color: 'var(--crate-standard)', rgb: 'var(--crate-standard-rgb)', glow: 0.12, icon: 'package' },
  secured: { color: 'var(--crate-secured)', rgb: 'var(--crate-secured-rgb)', glow: 0.6, icon: 'shield' },
  blackice: {
    color: 'var(--crate-blackice)',
    rgb: 'var(--crate-blackice-rgb)',
    glow: 1,
    icon: 'snowflake',
    chromaRgb: 'var(--crate-blackice-chroma-rgb)',
  },
}

/** Accent générique caisses (en-têtes, indice « Trouvé en caisse »). */
export const CRATE_ACCENT = 'var(--crate-accent)'
export const CRATE_ACCENT_RGB = 'var(--crate-accent-rgb)'

/**
 * Box-shadow du coffre d'une qualité, échelonnée par `glow`. `k` intensifie
 * (survol/anticipation). Ajoute la frange chromatique pour Black ICE.
 */
export function crateGlow(quality: CrateQuality, k = 1): string {
  const s = CRATE_STYLE[quality]
  if (s.glow <= 0.12) return `0 0 0 1px rgba(${s.rgb}, 0.45)`
  const parts = [
    `0 0 0 1px rgba(${s.rgb}, ${(0.45 + s.glow * 0.4).toFixed(2)})`,
    `0 0 ${Math.round(14 * s.glow * k)}px rgba(${s.rgb}, ${(s.glow * 0.5).toFixed(2)})`,
    `0 0 ${Math.round(34 * s.glow * k)}px rgba(${s.rgb}, ${(s.glow * 0.26).toFixed(2)})`,
  ]
  if (s.chromaRgb) parts.push(`0 0 ${Math.round(24 * k)}px rgba(${s.chromaRgb}, 0.28)`)
  return parts.join(',')
}
