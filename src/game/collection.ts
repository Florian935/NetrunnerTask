// Couche « règles de jeu » — logique pure. US-033 : aperçu de collection.
// Dérive la progression du joueur par rareté à partir de ce qu'il possède
// (`owned`) et du catalogue `COSMETICS`. Lecture seule, aucun effet de jeu.

import { COSMETICS, RARITY_ORDER, type Rarity } from './cosmetics'

/** Progression d'un cran de rareté : possédés / total du catalogue. */
export interface RarityProgress {
  rarity: Rarity
  owned: number
  total: number
}

/** Progression par cran (ordre `RARITY_ORDER`, commun → légendaire). */
export function collectionByRarity(owned: readonly string[]): RarityProgress[] {
  const ownedSet = new Set(owned)
  return RARITY_ORDER.map((rarity) => {
    const items = COSMETICS.filter((c) => c.rarity === rarity)
    return {
      rarity,
      owned: items.filter((c) => ownedSet.has(c.id)).length,
      total: items.length,
    }
  })
}

/** Total possédés / total catalogue (tous crans confondus). */
export function collectionTotals(owned: readonly string[]): { owned: number; total: number } {
  const ownedSet = new Set(owned)
  const inCatalog = COSMETICS.filter((c) => ownedSet.has(c.id)).length
  return { owned: inCatalog, total: COSMETICS.length }
}

/** Nombre de cosmétiques d'un cran **restant à débloquer**. */
export function remainingOfRarity(owned: readonly string[], rarity: Rarity): number {
  const p = collectionByRarity(owned).find((r) => r.rarity === rarity)
  return p ? p.total - p.owned : 0
}
