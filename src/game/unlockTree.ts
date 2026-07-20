// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-022 (A3) : arbre de déblocage — dépense `data` pour acheter des nœuds
// (bonus multiplicatifs sur cycles/data), dont un **caché** (reveal P6).
// Volontairement découplé de `game/builder.ts` (types structurels minimaux,
// aucun import) pour éviter toute dépendance circulaire : c'est la couche
// store (`useBuilderStore`) qui compose les deux (multiplicateurs → `tick()`).

/** État minimal nécessaire à ce module (sous-ensemble de `BuilderCore`). */
export interface UnlockTreeCore {
  data: number
  generators: Record<string, number>
  upgrades: Record<string, number>
  unlockedNodes: string[]
}

/** Condition optionnelle sur l'état des daemons (US-021). */
export interface GeneratorRequirement {
  id: string
  count: number
  upgradeLevel?: number
}

/** Définition d'un nœud (donnée du catalogue). Libellés via i18n (`id`). */
export interface UnlockNodeDef {
  id: string
  /** Icône du registre (lucide kebab-case). */
  icon: string
  /** Coût en `data`. */
  cost: number
  /** Reveal caché (P6) : absent de `visibleNodes` tant que sa condition n'est pas remplie. */
  hidden: boolean
  /** `id` d'un autre nœud de l'arbre à posséder au préalable ; `null` = aucune. */
  requiresNode: string | null
  /** Condition sur les daemons (US-021) ; `null` = aucune. Cumulable avec `requiresNode` (ET). */
  requiresGenerator: GeneratorRequirement | null
  /** Bonus multiplicatif apporté (fraction ajoutée au multiplicateur de base 1). */
  effect: { cycles?: number; data?: number }
}

/**
 * Catalogue des nœuds. Réglages placeholder, affinables en recette. Les
 * noms/effets sont des clés i18n `builder.unlockTree.nodes.<id>.{name,effect}`.
 * `ghost-protocol` (caché) est **indépendant** du reste de l'arbre
 * (`requiresNode: null`) — son reveal ne dépend pas d'avoir fini la branche
 * visible, il surgit d'un axe différent (l'investissement en `wraith`).
 */
export const UNLOCK_NODES: readonly UnlockNodeDef[] = [
  {
    id: 'overclock',
    icon: 'gauge',
    cost: 40,
    hidden: false,
    requiresNode: null,
    requiresGenerator: null,
    effect: { cycles: 0.25 },
  },
  {
    id: 'parallelism',
    icon: 'split',
    cost: 90,
    hidden: false,
    requiresNode: 'overclock',
    requiresGenerator: null,
    effect: { data: 0.5 },
  },
  {
    id: 'cryo-cache',
    icon: 'snowflake',
    cost: 220,
    hidden: false,
    requiresNode: null,
    // « 1× WRAITH-2X » = 1 exemplaire du daemon `wraith` (WRAITH-2X est son
    // nom d'affichage, `builder.generators.wraith.name` — pas un niveau
    // d'upgrade requis).
    requiresGenerator: { id: 'wraith', count: 1 },
    effect: { data: 0.4 },
  },
  {
    id: 'ghost-protocol',
    icon: 'skull',
    cost: 500,
    hidden: true,
    requiresNode: null,
    requiresGenerator: { id: 'wraith', count: 12 },
    effect: { data: 2 },
  },
] as const

/** Index du catalogue par `id`. */
export const UNLOCK_NODE_BY_ID: Record<string, UnlockNodeDef> = Object.fromEntries(
  UNLOCK_NODES.map((n) => [n.id, n]),
)

const acquired = (core: UnlockTreeCore, id: string) => core.unlockedNodes.includes(id)

/** La condition du nœud (chaîne d'arbre + état des daemons) est-elle remplie ? */
export function isConditionMet(node: UnlockNodeDef, core: UnlockTreeCore): boolean {
  if (node.requiresNode !== null && !acquired(core, node.requiresNode)) return false
  if (node.requiresGenerator !== null) {
    const { id, count, upgradeLevel } = node.requiresGenerator
    if ((core.generators[id] ?? 0) < count) return false
    if (upgradeLevel !== undefined && (core.upgrades[id] ?? 0) < upgradeLevel) return false
  }
  return true
}

export type NodeState = 'acquired' | 'available' | 'locked'

/** État d'affichage d'un nœud **déjà visible** (voir `visibleNodes`). */
export function nodeState(node: UnlockNodeDef, core: UnlockTreeCore): NodeState {
  if (acquired(core, node.id)) return 'acquired'
  return isConditionMet(node, core) ? 'available' : 'locked'
}

/**
 * Nœuds à afficher, dans l'ordre du catalogue : tous les non cachés (quel
 * que soit leur état) + les cachés dont la condition est déjà remplie
 * (reveal, AC6 US-022). Un nœud caché n'apparaît jamais en état `locked` —
 * dès qu'il est visible, sa condition est nécessairement remplie (état
 * `available` ou `acquired`).
 */
export function visibleNodes(core: UnlockTreeCore): UnlockNodeDef[] {
  return UNLOCK_NODES.filter(
    (n) => !n.hidden || acquired(core, n.id) || isConditionMet(n, core),
  )
}

/** Peut-on acheter le nœud `id` (visible, condition remplie, solde suffisant) ? */
export function canBuyNode(core: UnlockTreeCore, id: string): boolean {
  const node = UNLOCK_NODE_BY_ID[id]
  if (!node) return false
  return nodeState(node, core) === 'available' && core.data >= node.cost
}

/**
 * Achète le nœud `id` si possible : débite `data`, ajoute l'`id` à
 * `unlockedNodes`. Sinon **no-op** (même référence).
 */
export function buyNode<T extends UnlockTreeCore>(core: T, id: string): T {
  if (!canBuyNode(core, id)) return core
  return {
    ...core,
    data: core.data - UNLOCK_NODE_BY_ID[id].cost,
    unlockedNodes: [...core.unlockedNodes, id],
  }
}

/** Multiplicateur composé sur la production de cycles (`1` = neutre). */
export function cycleMultiplier(core: UnlockTreeCore): number {
  return (
    1 +
    UNLOCK_NODES.reduce(
      (sum, n) => sum + (acquired(core, n.id) ? (n.effect.cycles ?? 0) : 0),
      0,
    )
  )
}

/** Multiplicateur composé sur la production de `data` (`1` = neutre). */
export function dataMultiplier(core: UnlockTreeCore): number {
  return (
    1 +
    UNLOCK_NODES.reduce(
      (sum, n) => sum + (acquired(core, n.id) ? (n.effect.data ?? 0) : 0),
      0,
    )
  )
}
