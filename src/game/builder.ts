// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-020 (builder A1) : le noyau incrémental « Réseau ». Une ressource (cycles)
// produite à la main (HACK) et automatiquement par des daemons générateurs.
// Réglages regroupés en un objet config (pas de nombres magiques épars) — un
// futur monde / builder = un autre config, sans réécriture (voir US-020 §2). La
// généralisation multi-générateurs (data-driven) viendra en A2, sur 2 cas réels.

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface BuilderCore {
  /** Ressource courante (cycles), fractionnaire possible, plancher 0. */
  cycles: number
  /** Nombre de daemons générateurs possédés. */
  generatorCount: number
}

/**
 * Réglages du builder A1. Valeurs de départ (placeholder, affinables en recette).
 */
export const BUILDER_CONFIG = {
  /** Cycles produits par HACK manuel. */
  manualYield: 1,
  generator: {
    /** Coût du 1ᵉʳ daemon. */
    baseCost: 15,
    /** Facteur d'escalade du coût par daemon déjà possédé. */
    growth: 1.15,
    /** Production automatique par daemon (cycles/s). */
    yieldPerSec: 1,
  },
} as const

/** Coût (entier) du **prochain** daemon quand on en possède déjà `owned`. */
export function nextGeneratorCost(owned: number): number {
  const { baseCost, growth } = BUILDER_CONFIG.generator
  return Math.ceil(baseCost * Math.pow(growth, owned))
}

/** Production automatique totale (cycles/s) pour `owned` daemons. */
export function productionPerSec(owned: number): number {
  return owned * BUILDER_CONFIG.generator.yieldPerSec
}

/** Un HACK manuel : ajoute `manualYield` cycles. */
export function hack(core: BuilderCore): BuilderCore {
  return { ...core, cycles: core.cycles + BUILDER_CONFIG.manualYield }
}

/** Peut-on acheter le prochain daemon (solde suffisant) ? */
export function canBuyGenerator(core: BuilderCore): boolean {
  return core.cycles >= nextGeneratorCost(core.generatorCount)
}

/**
 * Achète un daemon si le solde le permet : débite le coût, incrémente le nombre
 * possédé. Sinon renvoie l'état **inchangé** (no-op, même référence).
 */
export function buyGenerator(core: BuilderCore): BuilderCore {
  const cost = nextGeneratorCost(core.generatorCount)
  if (core.cycles < cost) return core
  return { cycles: core.cycles - cost, generatorCount: core.generatorCount + 1 }
}

/**
 * Avance la production automatique de `dtMs` millisecondes : `cycles` augmente de
 * `productionPerSec × dtMs/1000`. `dt ≤ 0` = no-op (protège d'une horloge qui
 * recule). Pas de rattrapage hors-ligne ici — le hook borne `dt` (A5/US-024).
 */
export function tick(core: BuilderCore, dtMs: number): BuilderCore {
  if (dtMs <= 0) return core
  const gain = productionPerSec(core.generatorCount) * (dtMs / 1000)
  if (gain === 0) return core
  return { ...core, cycles: core.cycles + gain }
}
