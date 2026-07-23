// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-034 (Phase A3) : caisses & rituel d'ouverture — la **voie aléatoire** de
// l'acquisition hybride (la voie déterministe = jalons → cosmétiques garantis,
// US-033). Une caisse gagnée en jouant s'ouvre et lâche **un** cosmétique
// EXCLUSIF aux caisses (`source: 'crate'`, voir `cosmetics.ts`) selon une table
// de probabilités par rareté propre à sa qualité.
//
// US-035 : **pity + fragments** (approfondit les caisses). Le tirage devient
// **pur aléatoire** (les doublons sont désormais possibles) : retomber sur un
// cosmétique déjà possédé le **convertit en fragments** (monnaie de complétion,
// indexée sur la rareté), au lieu de la garantie « toujours du neuf » + la
// consolation crédits d'US-034 (supprimées). Deux filets anti-frustration :
//  · **pity** — après `PITY_CONFIG.threshold` ouvertures sans légendaire, la
//    suivante force ce cran ;
//  · **forge** (côté store) — dépenser des fragments pour débloquer un cosmétique
//    choisi (`FORGE_COST`), filet déterministe.
//
// Comme `cosmetics.ts`, ce module **n'expose AUCUNE valeur de jeu**. Le hasard
// est **injecté** (`rng: () => number`, défaut `Math.random`) pour des tests
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
 * Fragments gagnés en convertissant un **doublon** (US-035), par rareté du
 * cosmétique retombé. Valeurs de la maquette `pity-fragments` (ajustables).
 */
export const FRAGMENT_VALUE: Record<Rarity, number> = {
  common: 5,
  enhanced: 12,
  rare: 30,
  epic: 75,
  legendary: 200,
}

/**
 * Coût de **forge** (US-035) par rareté — dépense de fragments pour débloquer un
 * cosmétique choisi. Monte fortement avec la rareté (≈ 7-8 doublons du même
 * cran) : la forge est un **filet**, pas un raccourci. Ajustable en recette.
 */
export const FORGE_COST: Record<Rarity, number> = {
  common: 40,
  enhanced: 100,
  rare: 250,
  epic: 600,
  legendary: 1500,
}

/**
 * Filet anti-malchance (US-035) : après `threshold` ouvertures **sans** le cran
 * `rarity`, la prochaine ouverture le **force**. Le compteur `pity` (persisté)
 * est réinitialisé à l'obtention de ce cran. `threshold` ajustable en recette.
 */
export const PITY_CONFIG: { threshold: number; rarity: Rarity } = {
  threshold: 30,
  rarity: 'legendary',
}

/**
 * Résultat d'une ouverture : un cosmétique **nouveau**, ou un **doublon** converti
 * en fragments (`dupId` = le cosmétique retombé, pour l'affichage du rituel).
 */
export type CrateDraw =
  | { kind: 'cosmetic'; id: string }
  | { kind: 'fragments'; amount: number; dupId?: string }

/** Résultat complet d'`openCrate` : le tirage + le compteur de pity mis à jour. */
export interface CrateOpenResult {
  draw: CrateDraw
  pity: number
}

/** Source d'aléa injectable (défaut `Math.random`). */
export type Rng = () => number

/** Tire une rareté selon `weights` (poids entiers), via `roll` dans [0,1). */
function rollRarity(weights: Record<Rarity, number>, roll: number): Rarity {
  const total = RARITY_ORDER.reduce((a, r) => a + weights[r], 0)
  let x = roll * total
  for (const r of RARITY_ORDER) {
    x -= weights[r]
    if (x < 0) return r
  }
  return RARITY_ORDER[RARITY_ORDER.length - 1]
}

/**
 * Ouvre une caisse de qualité `quality` (US-034 + US-035). Tirage **pur** :
 * une rareté (via `CRATE_ODDS`, ou **forcée** au cran de pity si `pity + 1 ≥
 * threshold`), puis un item **uniforme** de cette rareté dans le `pool` exclusif
 * (possédé **ou non**). Item déjà dans `owned` → **doublon** converti en
 * fragments ; sinon → cosmétique **nouveau**. Renvoie aussi le `pity` mis à jour
 * (réinitialisé si le cran de pity est obtenu, incrémenté sinon). `rng` injecté.
 */
export function openCrate(
  quality: CrateQuality,
  owned: readonly string[],
  pool: readonly Cosmetic[],
  pity: number,
  rng: Rng = Math.random,
): CrateOpenResult {
  // Rareté : forcée par le pity, sinon tirée à la table.
  const forced = pity + 1 >= PITY_CONFIG.threshold
  const rarity = forced ? PITY_CONFIG.rarity : rollRarity(CRATE_ODDS[quality], rng())

  // Item uniforme dans la rareté (repli sur tout le pool si la rareté est vide).
  const candidates = pool.filter((c) => c.rarity === rarity)
  const items = candidates.length > 0 ? candidates : pool
  const picked = items[Math.min(items.length - 1, Math.floor(rng() * items.length))]

  // pity : réinitialisé si le cran cible est obtenu, incrémenté sinon.
  const nextPity = picked.rarity === PITY_CONFIG.rarity ? 0 : pity + 1

  const draw: CrateDraw = owned.includes(picked.id)
    ? { kind: 'fragments', amount: FRAGMENT_VALUE[picked.rarity], dupId: picked.id }
    : { kind: 'cosmetic', id: picked.id }

  return { draw, pity: nextPity }
}

/** Peut-on forger un cosmétique de rareté `rarity` avec `fragments` en solde ? */
export function canForge(fragments: number, rarity: Rarity): boolean {
  return fragments >= FORGE_COST[rarity]
}
