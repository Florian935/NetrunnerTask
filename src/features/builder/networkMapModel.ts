// Couche de présentation pure de la « Carte du Réseau » (US-029). AUCUNE règle
// de jeu nouvelle : ce module ne fait que **composer** les sélecteurs déjà purs
// et testés de `game/builder.ts` (daemons) et `game/unlockTree.ts` (arbre) en
// vue-modèles positionnés pour un rendu spatial (graphe de nœuds). Le layout
// (positions manuelles) et les arêtes sont dérivés des **vraies dépendances**
// des catalogues — pas des données inventées de la maquette (voir US §3).

import {
  BUILDER_CONFIG,
  GENERATORS,
  isUnlocked,
  type BuilderCore,
} from '../../game/builder'
import {
  isConditionMet,
  nodeState as treeNodeState,
  UNLOCK_NODES,
  type UnlockTreeCore,
} from '../../game/unlockTree'

/** Espace de coordonnées de la carte (positions manuelles, %-projetées au rendu). */
export const MAP_VIEWBOX = { w: 1040, h: 640 } as const

/** Devise/famille d'un nœud → couleur de système (réutilise les accents DS). */
export type MapCurrency = 'daemon' | 'data' | 'crypto'

/** RGB (pour rgba() inline) par devise — miroir des accents DS violet/magenta/amber. */
export const CURRENCY_RGB: Record<MapCurrency, string> = {
  daemon: '168,85,247',
  data: '255,45,149',
  crypto: '255,176,32',
}
/** Vert mint (état acquis) et acier (état scellé) — accents DS. */
export const MINT_RGB = '46,255,194'
export const STEEL_RGB = '139,155,180'

/** Couleur d'anneau/halo d'un nœud selon son état (acquis→mint, scellé→acier, sinon devise). */
export function nodeRgb(currency: MapCurrency, state: MapNodeState): string {
  if (state === 'acquired') return MINT_RGB
  if (state === 'sealed') return STEEL_RGB
  return CURRENCY_RGB[currency]
}

export type MapNodeKind = 'generator' | 'tree'

/** État visuel d'un nœud sur la carte. `sealed` = caché non révélé (pas de spoiler). */
export type MapNodeState = 'acquired' | 'available' | 'locked' | 'sealed'

/** Vue-modèle d'un nœud prêt à rendre (aucune logique de jeu ici). */
export interface MapNodeVM {
  id: string
  kind: MapNodeKind
  currency: MapCurrency
  icon: string
  hidden: boolean
  state: MapNodeState
  /** Daemons uniquement : exemplaires possédés / niveau d'upgrade. */
  owned?: number
  level?: number
  x: number
  y: number
}

/** Type d'arête, pour le style de trait au rendu. */
export type MapEdgeKind = 'branch' | 'cross' | 'visual'

export interface MapEdge {
  a: string
  b: string
  kind: MapEdgeKind
}

/**
 * Positions manuelles des 13 nœuds (placeholder, **affinées en recette live**,
 * même convention que les coûts des catalogues). Structure spatiale = **vraie
 * chaîne de dépendances** (arbitrage PO, US §3) : épine des daemons en bas,
 * branche data qui monte au centre-gauche, RELAIS DE MARCHÉ en passerelle
 * centrale, branche crypto qui prolonge vers le haut, anomalies cachées sur
 * les flancs.
 */
export const MAP_LAYOUT: Record<string, { x: number; y: number }> = {
  // Épine des daemons (bas, gauche → droite = ordre de déblocage)
  scraper: { x: 110, y: 505 },
  sifter: { x: 330, y: 520 },
  wraith: { x: 560, y: 520 },
  oracle: { x: 810, y: 505 },
  // Branche data (magenta), enracinée sur wraith (cryo) et oracle (overclock)
  'cryo-cache': { x: 450, y: 420 },
  'breach-market': { x: 500, y: 288 }, // passerelle vers la crypto
  overclock: { x: 700, y: 415 },
  parallelism: { x: 775, y: 268 },
  'ghost-protocol': { x: 250, y: 320 }, // caché, flanc gauche
  // Branche crypto (ambre), prolonge breach-market vers le haut
  'arbitrage-auto': { x: 470, y: 150 },
  'rate-floor': { x: 610, y: 92 },
  'ghost-laundry': { x: 780, y: 140 },
  'dark-pool': { x: 930, y: 315 }, // caché, flanc droit
}

/**
 * Arêtes dérivées des **vraies dépendances** des catalogues (donc toujours
 * vraies même si un catalogue évolue) :
 * - `branch` : chaîne de déblocage (`unlockAfter` daemons, `requiresNode` arbre) ;
 * - `cross` : dépendance transverse daemon→nœud (`requiresGenerator`) ;
 * - `visual` : rattachement purement esthétique des nœuds sans dépendance dure
 *   (`overclock` n'a ni `requiresNode` ni `requiresGenerator` — il est débloqué
 *   par la simple présence de `data`, qui vient d'`oracle` ; on l'ancre donc
 *   visuellement sur `oracle`). N'a **aucune incidence de jeu**.
 */
export const MAP_EDGES: MapEdge[] = [
  ...GENERATORS.filter((d) => d.unlockAfter !== null).map(
    (d): MapEdge => ({ a: d.unlockAfter as string, b: d.id, kind: 'branch' }),
  ),
  ...UNLOCK_NODES.filter((n) => n.requiresNode !== null).map(
    (n): MapEdge => ({ a: n.requiresNode as string, b: n.id, kind: 'branch' }),
  ),
  ...UNLOCK_NODES.filter((n) => n.requiresGenerator !== null).map(
    (n): MapEdge => ({ a: (n.requiresGenerator as { id: string }).id, b: n.id, kind: 'cross' }),
  ),
  { a: 'oracle', b: 'overclock', kind: 'visual' },
]

/** État minimal nécessaire pour dériver la carte (sous-ensemble de `BuilderState`). */
export interface MapCore {
  generators: Record<string, number>
  upgrades: Record<string, number>
  data: number
  crypto: number
  unlockedNodes: string[]
}

/** État visuel d'un daemon : `acquired` si ≥1 possédé, sinon `available`/`locked`. */
function generatorState(core: MapCore, id: string): MapNodeState {
  const owned = core.generators[id] ?? 0
  if (owned >= 1) return 'acquired'
  const def = GENERATORS.find((d) => d.id === id)
  if (!def) return 'locked'
  const builderCore: BuilderCore = {
    cycles: 0,
    generators: core.generators,
    upgrades: core.upgrades,
    data: core.data,
    unlockedNodes: core.unlockedNodes,
  }
  return isUnlocked(def, builderCore) ? 'available' : 'locked'
}

/**
 * Vue-modèles des 13 nœuds pour l'état courant. Compose les sélecteurs purs
 * existants (`isUnlocked`, `treeNodeState`/`isConditionMet`) — aucune règle
 * nouvelle. Le masquage des cachés non révélés (`sealed`) est dérivé de la
 * même condition que `visibleNodes` (AC4).
 */
export function buildMapNodes(core: MapCore): MapNodeVM[] {
  const treeCore: UnlockTreeCore = {
    data: core.data,
    crypto: core.crypto,
    generators: core.generators,
    upgrades: core.upgrades,
    unlockedNodes: core.unlockedNodes,
  }

  const generators: MapNodeVM[] = GENERATORS.map((def) => ({
    id: def.id,
    kind: 'generator',
    currency: 'daemon',
    icon: def.icon,
    hidden: false,
    state: generatorState(core, def.id),
    owned: core.generators[def.id] ?? 0,
    level: core.upgrades[def.id] ?? 0,
    ...MAP_LAYOUT[def.id],
  }))

  // Une branche n'est « vivante » qu'une fois sa ressource débloquée : `data`
  // ne circule qu'avec le daemon `oracle` (BUILDER_CONFIG), la `crypto` qu'une
  // fois `breach-market` acheté. Avant ça, un nœud dont la condition d'arbre
  // est techniquement remplie (ex. `overclock`, sans prérequis) ne doit pas
  // clignoter « disponible » alors que le joueur n'a pas encore la ressource —
  // il reste `locked` (reproduit le fait que l'ancienne UI cachait la branche
  // tant que la ressource n'était pas ouverte).
  const dataLive = (core.generators[BUILDER_CONFIG.dataUnlockGenerator] ?? 0) >= 1
  const cryptoLive = core.unlockedNodes.includes('breach-market')

  const tree: MapNodeVM[] = UNLOCK_NODES.map((def) => {
    const acquired = core.unlockedNodes.includes(def.id)
    const sealed = def.hidden && !acquired && !isConditionMet(def, treeCore)
    let state: MapNodeState = sealed ? 'sealed' : treeNodeState(def, treeCore)
    if (state === 'available') {
      const resourceLive = def.currency === 'crypto' ? cryptoLive : dataLive
      if (!resourceLive) state = 'locked'
    }
    return {
      id: def.id,
      kind: 'tree',
      currency: def.currency,
      icon: def.icon,
      hidden: def.hidden,
      state,
      ...MAP_LAYOUT[def.id],
    }
  })

  return [...generators, ...tree]
}

/** État visuel d'une arête, dérivé de l'état de ses deux extrémités. */
export type MapEdgeVisual = 'both-acquired' | 'feeds-available' | 'toward-available' | 'cross-live' | 'cross-dim' | 'locked'

/**
 * Style d'une arête (pur). Retourne `null` si une extrémité est `sealed` (pas
 * de spoiler d'un nœud caché via ses arêtes).
 */
export function mapEdgeVisual(
  edge: MapEdge,
  stateById: Record<string, MapNodeState>,
): MapEdgeVisual | null {
  const sa = stateById[edge.a]
  const sb = stateById[edge.b]
  if (sa === 'sealed' || sb === 'sealed') return null
  if (edge.kind === 'cross') return sa === 'acquired' ? 'cross-live' : 'cross-dim'
  if (sa === 'acquired' && sb === 'acquired') return 'both-acquired'
  if (sa === 'acquired' && sb === 'available') return 'feeds-available'
  if (sb === 'available') return 'toward-available'
  return 'locked'
}
