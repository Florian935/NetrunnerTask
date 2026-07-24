// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-024 (A5) : embryon de prestige / renaissance. Une action volontaire et
// irréversible réinitialise la progression du Réseau (cycles, daemons,
// upgrades, data, arbre de déblocage) en échange d'un **bonus permanent** de
// production (`prestigeMultiplier`) qui survit à toutes les renaissances.
// US-026 (A2) : le seuil de renaissance devient **incrémental** — il monte à
// chaque renaissance (`prestigeThreshold`, croissance géométrique) pour que les
// renaissances restent rares et significatives malgré le bonus composé.
// Volontairement **découplé** de `builder.ts`/`unlockTree.ts`/`accelerators.ts`
// (types structurels minimaux) — la couche store compose ce multiplicateur
// avec ceux de l'arbre et du boost avant `tick()`/`offlineTick()`.

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface PrestigeCore {
  cycles: number
  generators: Record<string, number>
  upgrades: Record<string, number>
  data: number
  /** 3ᵉ ressource (US-027) — remise à zéro comme le reste de l'économie du Réseau. */
  crypto: number
  unlockedNodes: string[]
  prestigeCount: number
  /**
   * Jauge de surcharge de la voie corrompue (US-037) — jauge **live** de
   * l'économie du Réseau, remise à zéro par la renaissance (le voltage sécurisé
   * cumulé, lui, survit — il est porté par `cosmeticsState`, hors `PrestigeCore`).
   */
  surcharge: number
}

/** Réglage global (valeurs affinables en recette). */
export const PRESTIGE_CONFIG = {
  /** Seuil de base : cycles requis pour la **1ʳᵉ** renaissance (`prestigeCount = 0`). */
  base: 1_000_000,
  /**
   * Facteur de croissance **géométrique** du seuil par renaissance (US-026).
   * Doit rester `> nextMult` pour que l'effort d'atteinte croisse d'une
   * renaissance à l'autre (invariant anti-boucle) — voir `prestigeThreshold`.
   */
  growth: 2.5,
  /** Facteur de bonus **par** renaissance (composé/géométrique). */
  nextMult: 1.5,
} as const

/**
 * Seuil de cycles requis pour la renaissance suivante, **incrémental** (US-026) :
 * `base × growth ** count`. Source de vérité du seuil — dérivé de `prestigeCount`,
 * jamais persisté (compatibilité ascendante : une sauvegarde recalcule son seuil
 * au chargement). `count = 0` → `base`. Strictement croissant en `count`.
 *
 * Comme `growth (2,5) > nextMult (1,5)`, le rapport `seuil / bonus permanent`
 * (`prestigeMultiplier`) **croît** avec `count` : chaque renaissance demande plus
 * d'effort relatif que la précédente — pas de boucle triviale (limite US-024).
 */
export function prestigeThreshold(count: number): number {
  return PRESTIGE_CONFIG.base * PRESTIGE_CONFIG.growth ** count
}

/** Peut-on renaître ? (solde de cycles courant ≥ seuil incrémental du `prestigeCount` courant). */
export function canPrestige(core: PrestigeCore): boolean {
  return core.cycles >= prestigeThreshold(core.prestigeCount)
}

/**
 * Bonus **permanent** de production apporté par `count` renaissances
 * (composé : `nextMult ** count`). `count = 0` → `1` (neutre).
 */
export function prestigeMultiplier(count: number): number {
  return Math.pow(PRESTIGE_CONFIG.nextMult, count)
}

/**
 * Renaissance : réinitialise la progression du Réseau (dont `crypto` et
 * l'arbre partagé US-027 — un solde crypto orphelin sans le nœud qui
 * débloque le marché serait incohérent) et incrémente `prestigeCount`.
 * **No-op** (même référence) si le seuil n'est pas atteint. Ne touche
 * **pas** `acceleratorRun`/`acceleratorBoost` (hors de `PrestigeCore`) : un
 * focus en cours est un engagement réel du joueur, indépendant de
 * l'économie remise à zéro.
 */
export function prestige<T extends PrestigeCore>(core: T): T {
  if (!canPrestige(core)) return core
  return {
    ...core,
    cycles: 0,
    generators: {},
    upgrades: {},
    data: 0,
    crypto: 0,
    unlockedNodes: [],
    prestigeCount: core.prestigeCount + 1,
    surcharge: 0,
  }
}
