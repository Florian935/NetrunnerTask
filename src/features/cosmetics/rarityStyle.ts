// US-031 — helpers de PRÉSENTATION de la rareté (couleurs/glows), séparés de la
// logique pure `game/cosmetics.ts`. La teinte vient des tokens `rarity.css` ;
// l'intensité de glow/fill échelonnée par cran est ce qui distingue vraiment
// les crans (au-delà de la seule teinte) — voir maquette `wardrobe`.

import type { Rarity } from '../../game/cosmetics'

/** Intensité de glow par cran (0 = aucun … 1 = maximal). */
export const RARITY_GLOW: Record<Rarity, number> = {
  common: 0,
  enhanced: 0.28,
  rare: 0.5,
  epic: 0.75,
  legendary: 1,
}

/** Opacité du fond teinté par cran. */
export const RARITY_FILL: Record<Rarity, number> = {
  common: 0.05,
  enhanced: 0.07,
  rare: 0.09,
  epic: 0.11,
  legendary: 0.13,
}

/** Couleur pleine du cran (token `rarity.css`). */
export const rarityColor = (r: Rarity): string => `var(--rarity-${r})`

/** Triplet RGB du cran, à composer dans `rgba(...)`. */
export const rarityRgb = (r: Rarity): string => `var(--rarity-${r}-rgb)`

/**
 * Box-shadow « au repos » (ou survol) d'un cran, échelonnée par `RARITY_GLOW`.
 * Le cran `legendary` est animé à part (classe `.nw-legend`) — ne pas composer
 * son box-shadow statique en plus.
 */
export function rarityGlow(r: Rarity, hover = false): string {
  const g = RARITY_GLOW[r]
  const rgb = rarityRgb(r)
  if (g === 0) return hover ? `0 0 0 1px rgba(${rgb}, 0.5)` : 'none'
  const k = hover ? 1.35 : 1
  return (
    `0 0 0 1px rgba(${rgb}, ${(0.45 + g * 0.4).toFixed(2)}),` +
    `0 0 ${Math.round(10 * g * k)}px rgba(${rgb}, ${(g * 0.45).toFixed(2)}),` +
    `0 0 ${Math.round(26 * g * k)}px rgba(${rgb}, ${(g * 0.22).toFixed(2)})`
  )
}
