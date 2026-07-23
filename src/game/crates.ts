// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-034 (Phase A3) : caisses & rituel d'ouverture — la **voie aléatoire** de
// l'acquisition hybride (la voie déterministe = jalons → cosmétiques garantis,
// US-033). Une caisse gagnée en jouant s'ouvre et lâche **un** cosmétique
// EXCLUSIF aux caisses (`source: 'crate'`, voir `cosmetics.ts`) selon une table
// de probabilités par rareté propre à sa qualité.
//
// Comme `cosmetics.ts`, ce module **n'expose AUCUNE valeur de jeu**. C'est aussi
// la **première introduction de hasard** dans `game/*` (tout le reste est
// déterministe : `marketRate`, chronos en instant absolu…) — le RNG est donc
// **injecté** (`rng: () => number`, défaut `Math.random`) pour des tests
// déterministes et pour préserver la pureté du module.

import { RARITY_ORDER, type Cosmetic, type Rarity } from './cosmetics'

/** Qualité de caisse (palier montant : standard → sécurisée → Black ICE). */
export type CrateQuality = 'standard' | 'secured' | 'blackice'

/** Ordre montant des qualités (affichage + gain indexé sur l'effort). */
export const CRATE_QUALITIES: readonly CrateQuality[] = ['standard', 'secured', 'blackice']

/**
 * Tables de probabilité par qualité — **poids entiers sommant à 100** (affichés
 * tels quels dans la table de probas, C3). Qualité montante = poids déplacé vers
 * les hautes raretés. Valeurs de la maquette `crates` (validées PO,
 * **ajustables en recette**).
 */
export const CRATE_ODDS: Record<CrateQuality, Record<Rarity, number>> = {
  standard: { common: 55, enhanced: 28, rare: 12, epic: 4, legendary: 1 },
  secured: { common: 30, enhanced: 33, rare: 24, epic: 10, legendary: 3 },
  blackice: { common: 8, enhanced: 22, rare: 34, epic: 24, legendary: 12 },
}

/**
 * Consolation en crédits versée quand le pool exclusif est **entièrement
 * possédé** (décision technique #3 : couture reprise par le pity + fragments
 * d'US-035). Réglable en recette.
 */
export const CONSOLATION_CREDITS = 120

/** Résultat d'une ouverture : un cosmétique tiré, ou une consolation crédits. */
export type CrateDraw =
  | { kind: 'cosmetic'; id: string }
  | { kind: 'credits'; amount: number }

/** Source d'aléa injectable (défaut `Math.random`). */
export type Rng = () => number

/**
 * Ouvre une caisse de qualité `quality` : tire **un** cosmétique dans le `pool`
 * exclusif, selon `CRATE_ODDS[quality]`, en **ignorant les items déjà possédés**
 * (`owned`) — garantit du neuf tant qu'il en reste (C6). Le tirage renormalise
 * la table sur les seules raretés encore disponibles (une rareté sans item neuf
 * n'est jamais tirée). Si tout le pool est possédé → consolation crédits
 * (décision #3). `rng` injecté pour la testabilité.
 */
export function openCrate(
  quality: CrateQuality,
  owned: readonly string[],
  pool: readonly Cosmetic[],
  rng: Rng = Math.random,
): CrateDraw {
  const ownedSet = new Set(owned)
  const unowned = pool.filter((c) => !ownedSet.has(c.id))
  if (unowned.length === 0) {
    return { kind: 'credits', amount: CONSOLATION_CREDITS }
  }

  // Items neufs regroupés par rareté.
  const byRarity = new Map<Rarity, Cosmetic[]>()
  for (const c of unowned) {
    const arr = byRarity.get(c.rarity)
    if (arr) arr.push(c)
    else byRarity.set(c.rarity, [c])
  }

  // Raretés encore disponibles (ordre croissant), poids renormalisés sur elles.
  const table = CRATE_ODDS[quality]
  const rarities = RARITY_ORDER.filter((r) => byRarity.has(r))
  const weights = rarities.map((r) => table[r])
  const totalWeight = weights.reduce((a, w) => a + w, 0)

  // Tirage de la rareté. Repli uniforme si la table donne un poids total nul
  // sur les raretés disponibles (théoriquement impossible ici — défensif).
  let chosen: Rarity
  if (totalWeight <= 0) {
    chosen = rarities[Math.min(rarities.length - 1, Math.floor(rng() * rarities.length))]
  } else {
    let roll = rng() * totalWeight
    chosen = rarities[rarities.length - 1]
    for (let i = 0; i < rarities.length; i++) {
      roll -= weights[i]
      if (roll < 0) {
        chosen = rarities[i]
        break
      }
    }
  }

  // Tirage uniforme de l'item dans la rareté choisie.
  const items = byRarity.get(chosen)!
  const idx = Math.min(items.length - 1, Math.floor(rng() * items.length))
  return { kind: 'cosmetic', id: items[idx].id }
}
