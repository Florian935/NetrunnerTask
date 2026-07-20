// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-020 (A1) : noyau incrémental « Réseau ». US-021 (A2) : généralisation en
// **catalogue de daemons** (data-driven) + **upgrade par type** + déblocage
// chaîné. Ajouter un daemon = une entrée dans GENERATORS (aucune migration).
// US-022 (A3) : 2ᵉ ressource `data` (dérivée de la production, une fois
// `oracle` possédé) + `unlockedNodes` (arbre de déblocage, voir
// `game/unlockTree.ts` — module volontairement découplé de celui-ci, voir
// `tick()`).

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface BuilderCore {
  /** Ressource courante (cycles), fractionnaire possible, plancher 0. */
  cycles: number
  /** Nombre de daemons possédés, par type (`id` → compte). */
  generators: Record<string, number>
  /** Niveau d'upgrade, par type (`id` → niveau ; 0 par défaut). */
  upgrades: Record<string, number>
  /** 2ᵉ ressource (US-022), fractionnaire possible, plancher 0. */
  data: number
  /** `id` des nœuds de l'arbre de déblocage déjà achetés (US-022). */
  unlockedNodes: string[]
}

/** Définition d'un type de daemon (donnée du catalogue). Libellés via i18n (`id`). */
export interface GeneratorDef {
  id: string
  /** Icône du registre (lucide kebab-case). */
  icon: string
  /** Coût du 1ᵉʳ exemplaire. */
  baseCost: number
  /** Facteur d'escalade du coût par exemplaire possédé. */
  costGrowth: number
  /** Production automatique par exemplaire (cycles/s), avant upgrade. */
  baseYieldPerSec: number
  /** Piste d'amélioration **par type** : coût escaladé, effet multiplicatif/niveau. */
  upgrade: { baseCost: number; costGrowth: number; multiplier: number }
  /** `id` du daemon dont il faut posséder ≥ 1 pour débloquer ; `null` = 1ᵉʳ (toujours). */
  unlockAfter: string | null
}

/** Réglage global (placeholder, affinable en recette). */
export const BUILDER_CONFIG = {
  /** Cycles produits par HACK manuel. */
  manualYield: 1,
  /** `id` du daemon qui débloque l'extraction de données (US-022). */
  dataUnlockGenerator: 'oracle',
  /** Proportion de `productionPerSec` convertie en `data`/s, avant nœuds. */
  dataRate: 0.1,
} as const

/**
 * Catalogue des daemons (débloqués en chaîne). Réglages placeholder. Les noms/
 * rôles sont des clés i18n `builder.generators.<id>.{name,role}`.
 */
export const GENERATORS: readonly GeneratorDef[] = [
  { id: 'scraper', icon: 'cpu', baseCost: 15, costGrowth: 1.15, baseYieldPerSec: 1, upgrade: { baseCost: 120, costGrowth: 3.2, multiplier: 2 }, unlockAfter: null },
  { id: 'sifter', icon: 'filter', baseCost: 180, costGrowth: 1.17, baseYieldPerSec: 8, upgrade: { baseCost: 900, costGrowth: 3.2, multiplier: 2 }, unlockAfter: 'scraper' },
  { id: 'wraith', icon: 'ghost', baseCost: 2100, costGrowth: 1.19, baseYieldPerSec: 47, upgrade: { baseCost: 9500, costGrowth: 3.2, multiplier: 2 }, unlockAfter: 'sifter' },
  { id: 'oracle', icon: 'radar', baseCost: 24000, costGrowth: 1.21, baseYieldPerSec: 260, upgrade: { baseCost: 120000, costGrowth: 3.2, multiplier: 2 }, unlockAfter: 'wraith' },
] as const

/** Index du catalogue par `id`. */
export const GENERATOR_BY_ID: Record<string, GeneratorDef> = Object.fromEntries(
  GENERATORS.map((d) => [d.id, d]),
)

const owned = (core: BuilderCore, id: string) => core.generators[id] ?? 0
const level = (core: BuilderCore, id: string) => core.upgrades[id] ?? 0

/** Coût (entier) du **prochain** exemplaire quand on en possède déjà `count`. */
export function generatorCost(def: GeneratorDef, count: number): number {
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, count))
}

/** Coût (entier) du **prochain** niveau d'upgrade quand on est au niveau `lvl`. */
export function upgradeCost(def: GeneratorDef, lvl: number): number {
  return Math.ceil(def.upgrade.baseCost * Math.pow(def.upgrade.costGrowth, lvl))
}

/** Multiplicateur de production apporté par l'upgrade au niveau `lvl`. */
export function upgradeMultiplier(def: GeneratorDef, lvl: number): number {
  return Math.pow(def.upgrade.multiplier, lvl)
}

/** Production (cycles/s) d'un type donné pour `count` exemplaires au niveau `lvl`. */
export function generatorProduction(
  def: GeneratorDef,
  count: number,
  lvl: number,
): number {
  return count * def.baseYieldPerSec * upgradeMultiplier(def, lvl)
}

/** Production automatique **totale** (somme de tous les types possédés). */
export function productionPerSec(core: BuilderCore): number {
  return GENERATORS.reduce(
    (sum, def) => sum + generatorProduction(def, owned(core, def.id), level(core, def.id)),
    0,
  )
}

/** Un type est-il débloqué ? (1ᵉʳ toujours ; sinon posséder ≥ 1 du précédent). */
export function isUnlocked(def: GeneratorDef, core: BuilderCore): boolean {
  return def.unlockAfter === null || owned(core, def.unlockAfter) >= 1
}

/** Liste des types débloqués (dans l'ordre du catalogue). */
export function unlockedGenerators(core: BuilderCore): GeneratorDef[] {
  return GENERATORS.filter((def) => isUnlocked(def, core))
}

/** Prochain type verrouillé (à teaser), ou `null` si tout est débloqué. */
export function nextLockedGenerator(core: BuilderCore): GeneratorDef | null {
  return GENERATORS.find((def) => !isUnlocked(def, core)) ?? null
}

/**
 * Production de `data`/s (US-022) : `0` tant que le daemon
 * `BUILDER_CONFIG.dataUnlockGenerator` n'est pas possédé (mécanique
 * invisible) ; sinon une proportion (`dataRate`) de `productionPerSec`,
 * modulée par `dataMult` (multiplicateur composé par l'arbre de déblocage,
 * voir `game/unlockTree.ts` — appliqué depuis la couche store, pas ici).
 */
export function dataPerSec(core: BuilderCore, dataMult = 1): number {
  if (owned(core, BUILDER_CONFIG.dataUnlockGenerator) < 1) return 0
  return productionPerSec(core) * BUILDER_CONFIG.dataRate * dataMult
}

/** Un HACK manuel : ajoute `manualYield` cycles. */
export function hack(core: BuilderCore): BuilderCore {
  return { ...core, cycles: core.cycles + BUILDER_CONFIG.manualYield }
}

/** Peut-on acheter un exemplaire du type `id` (solde suffisant) ? */
export function canBuyGenerator(core: BuilderCore, id: string): boolean {
  return core.cycles >= generatorCost(GENERATOR_BY_ID[id], owned(core, id))
}

/**
 * Achète un exemplaire du type `id` si le solde le permet : débite le coût,
 * incrémente le compte. Sinon **no-op** (même référence).
 */
export function buyGenerator(core: BuilderCore, id: string): BuilderCore {
  const cost = generatorCost(GENERATOR_BY_ID[id], owned(core, id))
  if (core.cycles < cost) return core
  return {
    ...core,
    cycles: core.cycles - cost,
    generators: { ...core.generators, [id]: owned(core, id) + 1 },
  }
}

/** Peut-on acheter le prochain niveau d'upgrade du type `id` ? */
export function canBuyUpgrade(core: BuilderCore, id: string): boolean {
  return core.cycles >= upgradeCost(GENERATOR_BY_ID[id], level(core, id))
}

/**
 * Achète le prochain niveau d'upgrade du type `id` si le solde le permet.
 * Sinon **no-op** (même référence).
 */
export function buyUpgrade(core: BuilderCore, id: string): BuilderCore {
  const cost = upgradeCost(GENERATOR_BY_ID[id], level(core, id))
  if (core.cycles < cost) return core
  return {
    ...core,
    cycles: core.cycles - cost,
    upgrades: { ...core.upgrades, [id]: level(core, id) + 1 },
  }
}

/**
 * Avance la production automatique de `dtMs` ms. `dt ≤ 0` = no-op (horloge qui
 * recule). Pas de rattrapage hors-ligne ici — le hook borne `dt` (A5/US-024).
 * `mult` (US-022) : multiplicateurs composés par l'arbre de déblocage
 * (`game/unlockTree.ts`) et fournis par la couche store — `builder.ts` ne
 * connaît pas `unlockTree.ts` (découplage volontaire, voir cadrage
 * technique US-022). Défaut = `1` → comportement A1/A2 inchangé.
 */
export function tick(
  core: BuilderCore,
  dtMs: number,
  mult: { cycles?: number; data?: number } = {},
): BuilderCore {
  if (dtMs <= 0) return core
  const dtSec = dtMs / 1000
  const cyclesGain = productionPerSec(core) * (mult.cycles ?? 1) * dtSec
  const dataGain = dataPerSec(core, mult.data ?? 1) * dtSec
  if (cyclesGain === 0 && dataGain === 0) return core
  return { ...core, cycles: core.cycles + cyclesGain, data: core.data + dataGain }
}
