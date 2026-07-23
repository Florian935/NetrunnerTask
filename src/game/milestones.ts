// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-028 (Phase A2) : jalons de progression du Réseau (« REGISTRE », maquette
// `network-milestones`). Contrairement aux autres modules `game/*`
// (volontairement découplés les uns des autres, la couche store composant
// leurs effets), `milestones.ts` est **transversal par nature** — c'est la
// carte de tous les systèmes — et peut donc légitimement lire un sous-ensemble
// de `builder.ts` (`BUILDER_CONFIG`) et des `id` du catalogue
// `unlockTree.ts` (littéraux, même convention que `BuilderView.tsx`).
//
// Un jalon est un **prédicat pur évalué sur l'état courant** (pas de diff
// avant/après, pas de nouveau compteur cumulatif) : `cycles`/`data`/`crypto`/
// `unlockedNodes` redescendent à l'achat et se réinitialisent à la
// renaissance, donc un prédicat comme « `unlockedNodes.length > 0` »
// redeviendrait faux après un `prestige()` si on ne le figeait pas. Le flag
// persisté `BuilderState.achievedMilestones` (append-only, jamais retiré, y
// compris après une renaissance) est la seule garantie qu'un jalon acquis le
// reste pour toujours — `checkMilestones` ignore donc systématiquement les
// ids déjà atteints.
//
// Exception : le jalon `hack` (premier HACK manuel) n'a **aucune** condition
// d'état observable — c'est l'appel de l'action elle-même qui est
// l'événement. Voir `checkHackMilestone`, à appeler uniquement depuis
// l'action `hack()` du store (jamais depuis `checkMilestones`, qui
// déclencherait sinon ce jalon sur n'importe quelle autre action).

import { BUILDER_CONFIG } from './builder'

/** État minimal manipulé par les prédicats (sous-ensemble de `BuilderState`). */
export interface MilestoneCore {
  generators: Record<string, number>
  upgrades: Record<string, number>
  unlockedNodes: string[]
  /** 3ᵉ ressource (US-027). */
  crypto: number
  /** Boost SURCADENCE actif (US-023) ; `null` = aucun. */
  acceleratorBoost: { id: string; endsAt: number } | null
  /** Nombre de renaissances (US-024). */
  prestigeCount: number
}

/** `id` du jalon événementiel « premier hack » (voir `checkHackMilestone`). */
export const HACK_MILESTONE_ID = 'hack'

/** Définition d'un jalon (donnée du catalogue). Libellés via i18n (`id`). */
export interface MilestoneDef {
  id: string
  /** Icône du registre (lucide kebab-case). */
  icon: string
  /** `null` pour le seul jalon événementiel (`hack`, voir en-tête du module). */
  condition: ((core: MilestoneCore) => boolean) | null
  /** Jalon de reveal caché (US-022/US-027) — masqué dans le panneau tant que non atteint. */
  hidden?: boolean
  /**
   * `id` du cosmétique **débloqué** en atteignant ce jalon (US-033, voie
   * déterministe de l'acquisition). Absent = aucune récompense cosmétique
   * (le jalon reste de la reconnaissance pure). Rareté ~ difficulté du jalon ;
   * les jalons cachés portent les récompenses les plus rares.
   */
  reward?: string
}

/**
 * Catalogue des 11 jalons (maquette `network-milestones` validée PO,
 * 22/07/2026). `id` stable, jamais renommé une fois persisté.
 */
export const MILESTONE_DEFS: readonly MilestoneDef[] = [
  { id: HACK_MILESTONE_ID, icon: 'zap', condition: null, reward: 'avatar-raven' },
  { id: 'daemon', icon: 'cpu', condition: (c) => Object.keys(c.generators).length >= 1, reward: 'avatar-phantom' },
  { id: 'roster', icon: 'server', condition: (c) => Object.keys(c.generators).length >= 2, reward: 'banner-surge' },
  { id: 'upgrade', icon: 'arrow-up-circle', condition: (c) => Object.keys(c.upgrades).length >= 1, reward: 'title-ghost' },
  {
    id: 'data',
    icon: 'database',
    condition: (c) => (c.generators[BUILDER_CONFIG.dataUnlockGenerator] ?? 0) >= 1,
    reward: 'cryo',
  },
  { id: 'tree', icon: 'git-branch', condition: (c) => c.unlockedNodes.length >= 1, reward: 'avatar-icebreaker' },
  { id: 'accel', icon: 'gauge-circle', condition: (c) => c.acceleratorBoost !== null, reward: 'title-overdrive' },
  { id: 'crypto', icon: 'coins', condition: (c) => c.crypto > 0, reward: 'ecarlate' },
  { id: 'reborn', icon: 'flame', condition: (c) => c.prestigeCount >= 1, reward: 'banner-apex' },
  {
    id: 'ghost',
    icon: 'ghost',
    condition: (c) => c.unlockedNodes.includes('ghost-protocol'),
    hidden: true,
    reward: 'title-zeroday',
  },
  {
    id: 'cartel',
    icon: 'landmark',
    condition: (c) => c.unlockedNodes.includes('dark-pool'),
    hidden: true,
  },
] as const

/** Index du catalogue par `id`. */
export const MILESTONE_BY_ID: Record<string, MilestoneDef> = Object.fromEntries(
  MILESTONE_DEFS.map((m) => [m.id, m]),
)

/**
 * Jalons **nouvellement** atteints (ids absents de `achieved` dont le
 * prédicat est vrai sur `core`), dans l'ordre du catalogue. Ne réévalue
 * jamais un jalon déjà atteint. Le jalon événementiel `hack` est exclu
 * (`condition: null`) — voir `checkHackMilestone`.
 */
export function checkMilestones(core: MilestoneCore, achieved: readonly string[]): string[] {
  const achievedSet = new Set(achieved)
  const next: string[] = []
  for (const m of MILESTONE_DEFS) {
    if (m.condition === null || achievedSet.has(m.id)) continue
    if (m.condition(core)) next.push(m.id)
  }
  return next
}

/**
 * Jalon événementiel « premier hack » : retourne `['hack']` si absent de
 * `achieved`, `[]` sinon. À appeler uniquement depuis l'action `hack()` du
 * store (voir en-tête du module).
 */
export function checkHackMilestone(achieved: readonly string[]): string[] {
  return achieved.includes(HACK_MILESTONE_ID) ? [] : [HACK_MILESTONE_ID]
}

/** Map inverse `cosmeticId → milestoneId` (récompenses, US-033). */
const REWARD_TO_MILESTONE: Record<string, string> = Object.fromEntries(
  MILESTONE_DEFS.filter((m) => m.reward !== undefined).map((m) => [m.reward as string, m.id]),
)

/**
 * `id` du cosmétique récompensé par ces jalons (US-033), dans l'ordre du
 * catalogue, en ignorant les jalons sans récompense. Sert au câblage du
 * déblocage (store) : `rewardsFor(newlyAchievedIds)`.
 */
export function rewardsFor(milestoneIds: readonly string[]): string[] {
  const set = new Set(milestoneIds)
  const out: string[] = []
  for (const m of MILESTONE_DEFS) {
    if (m.reward !== undefined && set.has(m.id)) out.push(m.reward)
  }
  return out
}

/**
 * `id` du jalon qui débloque ce cosmétique (US-033), ou `undefined` s'il n'est
 * la récompense d'aucun jalon (ex. cosmétique de départ). Sert à l'état
 * verrouillé de la Garde-robe (indice + masquage des cachés).
 */
export function milestoneForCosmetic(cosmeticId: string): MilestoneDef | undefined {
  const id = REWARD_TO_MILESTONE[cosmeticId]
  return id === undefined ? undefined : MILESTONE_BY_ID[id]
}
