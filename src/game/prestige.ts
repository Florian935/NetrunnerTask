// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-024 (A5) : embryon de prestige / renaissance. Une action volontaire et
// irréversible réinitialise la progression du Réseau (cycles, daemons,
// upgrades, data, arbre de déblocage) en échange d'un **bonus permanent** de
// production (`prestigeMultiplier`) qui survit à toutes les renaissances.
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
}

/** Réglage global (placeholder, affinable en recette). */
export const PRESTIGE_CONFIG = {
  /** Seuil de cycles requis pour renaître (flat — ne progresse pas avec `prestigeCount`). */
  threshold: 1_000_000,
  /** Facteur de bonus **par** renaissance (composé/géométrique). */
  nextMult: 1.5,
} as const

/** Peut-on renaître ? (solde de cycles courant ≥ seuil). */
export function canPrestige(core: PrestigeCore): boolean {
  return core.cycles >= PRESTIGE_CONFIG.threshold
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
  }
}
