// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-023 (A4) : accélérateurs réels au choix. Le joueur lance volontairement
// une activité courte **vérifiée par l'app** (chrono tenu par l'app) ; s'il va
// au bout, il obtient un boost temporaire de production (« SURCADENCE »,
// distinct du nœud permanent `overclock` de `game/unlockTree.ts`). Jamais
// imposé : `builder.ts` tourne sans ce module. Volontairement **découplé** de
// `builder.ts`/`unlockTree.ts` (types structurels minimaux, aucun import
// croisé) — la couche store compose les multiplicateurs des trois modules
// avant `tick()`, même discipline que US-022.

/** État minimal manipulé par les règles pures (sous-ensemble de `BuilderState`). */
export interface AcceleratorCore {
  /** Session en cours (chrono tenu par l'app) ; `endsAt` = instant absolu (epoch ms) de fin. */
  acceleratorRun: { id: string; endsAt: number } | null
  /** Boost obtenu en menant une session à son terme ; `endsAt` = instant absolu de fin du boost. */
  acceleratorBoost: { id: string; endsAt: number } | null
}

/** Définition d'un accélérateur (donnée du catalogue). Libellés via i18n (`id`). */
export interface AcceleratorDef {
  id: string
  /** Icône du registre (lucide kebab-case). */
  icon: string
  /** Durée annoncée de la session (ms). */
  durationMs: number
  /** Durée annoncée du boost obtenu en cas de session menée à son terme (ms). */
  boostDurationMs: number
  /** Bonus multiplicatif du boost (fraction ajoutée au multiplicateur de base 1). */
  boostEffect: { cycles?: number; data?: number }
}

/**
 * Catalogue des accélérateurs. Réglages placeholder, affinables en recette
 * (même convention que `BUILDER_CONFIG`/`UNLOCK_NODES`) — alignés sur la
 * maquette validée (`network-accelerators`, 20/07/2026). 1 seule entrée pour
 * ce lot ; catalogue **extensible** (comme `GENERATORS`), d'autres
 * accélérateurs s'ajouteront sans réécriture.
 */
export const ACCELERATORS: readonly AcceleratorDef[] = [
  {
    id: 'focus',
    icon: 'clock',
    durationMs: 25 * 60 * 1000,
    boostDurationMs: 15 * 60 * 1000,
    boostEffect: { cycles: 1 },
  },
] as const

/** Index du catalogue par `id`. */
export const ACCELERATOR_BY_ID: Record<string, AcceleratorDef> = Object.fromEntries(
  ACCELERATORS.map((a) => [a.id, a]),
)

/**
 * Peut-on lancer l'accélérateur `id` ? Anti-empilement (AC6) : une seule
 * session/boost à la fois, quel que soit l'accélérateur.
 */
export function canStart(core: AcceleratorCore, id: string): boolean {
  if (!ACCELERATOR_BY_ID[id]) return false
  return core.acceleratorRun === null && core.acceleratorBoost === null
}

/**
 * Lance l'accélérateur `id` : pose `acceleratorRun` avec son échéance
 * absolue. **No-op** (même référence) si `!canStart`.
 */
export function start<T extends AcceleratorCore>(core: T, id: string, now: number): T {
  if (!canStart(core, id)) return core
  return { ...core, acceleratorRun: { id, endsAt: now + ACCELERATOR_BY_ID[id].durationMs } }
}

/**
 * Abandonne la session en cours : vide `acceleratorRun`, retour à l'état
 * repos. **Aucune pénalité** au-delà de l'absence de boost (AC5). **No-op**
 * si aucune session en cours.
 */
export function cancel<T extends AcceleratorCore>(core: T): T {
  if (!core.acceleratorRun) return core
  return { ...core, acceleratorRun: null }
}

/**
 * Résout les transitions dues à `now` (instant absolu, indépendant du
 * premier plan de l'app — voir cadrage US-023) : une session échue devient un
 * boost (ancré sur `run.endsAt`, pas sur `now`, pour ne pas dépendre de la
 * fréquence d'appel) ; un boost échu redevient `null`. Enchaîne les deux
 * transitions dans un seul appel (rattrapage après une fermeture prolongée
 * de l'app). **No-op** (même référence) si rien à résoudre.
 */
export function resolve<T extends AcceleratorCore>(core: T, now: number): T {
  let next: T = core
  if (next.acceleratorRun && now >= next.acceleratorRun.endsAt) {
    const def = ACCELERATOR_BY_ID[next.acceleratorRun.id]
    next = {
      ...next,
      acceleratorRun: null,
      acceleratorBoost: { id: next.acceleratorRun.id, endsAt: next.acceleratorRun.endsAt + def.boostDurationMs },
    }
  }
  if (next.acceleratorBoost && now >= next.acceleratorBoost.endsAt) {
    next = { ...next, acceleratorBoost: null }
  }
  return next
}

/**
 * Multiplicateur composé apporté par le boost actif (`1` = neutre). Vérifie
 * lui-même l'expiration (défensif, comme `dataPerSec` pour `unlockTree`) :
 * un boost non résolu n'accorde aucun bonus passé son `endsAt`.
 */
export function boostMultiplier(
  core: AcceleratorCore,
  now: number,
): { cycles: number; data: number } {
  const boost = core.acceleratorBoost
  if (!boost || now >= boost.endsAt) return { cycles: 1, data: 1 }
  const def = ACCELERATOR_BY_ID[boost.id]
  return { cycles: 1 + (def.boostEffect.cycles ?? 0), data: 1 + (def.boostEffect.data ?? 0) }
}

/** Un segment d'effet de boost dans le temps (US-024). `untilMs` = borne de fin. */
export interface BoostWindow {
  untilMs: number
  /** Multiplicateur cycles sur ce segment (`1` = pas de boost). */
  cycles: number
  /** Multiplicateur data sur ce segment (`1` = pas de boost). */
  data: number
}

/**
 * Calendrier du **boost accélérateur** à partir de `fromMs` (US-024,
 * rattrapage hors-ligne) : découpe la fenêtre en segments selon l'effet du
 * boost, en tenant compte qu'un `run` en cours à `fromMs` se **terminera** à
 * son `endsAt` et déclenchera une SURCADENCE qui expirera à son tour. Renvoie
 * toujours au moins 1 segment, le dernier borné à `Infinity` (état neutre
 * final). Ne connaît **pas** `builder.ts` — les multiplicateurs sont composés
 * par la couche store avec ceux de l'arbre et du prestige.
 *
 * Cas couverts (état à `fromMs`) :
 * - ni run ni boost → `[{Infinity, 1, 1}]`.
 * - boost seul en cours → `[{boost.endsAt, m}, {Infinity, 1, 1}]`.
 * - run en cours → `[{run.endsAt, 1, 1}, {run.endsAt+boostDur, m}, {Infinity, 1, 1}]`.
 * (les bornes ≤ `fromMs`, boost déjà expiré, sont élidées → segment neutre.)
 */
export function boostWindows(core: AcceleratorCore, fromMs: number): BoostWindow[] {
  const windows: BoostWindow[] = []
  const run = core.acceleratorRun
  const boost = core.acceleratorBoost

  // 1) Boost déjà actif à `fromMs` : segment boosté jusqu'à son expiration.
  if (boost && boost.endsAt > fromMs) {
    const def = ACCELERATOR_BY_ID[boost.id]
    windows.push({
      untilMs: boost.endsAt,
      cycles: 1 + (def.boostEffect.cycles ?? 0),
      data: 1 + (def.boostEffect.data ?? 0),
    })
  }

  // 2) Run en cours : segment neutre jusqu'à sa fin, puis segment boosté
  //    (la SURCADENCE qu'il déclenchera) jusqu'à l'expiration de ce boost.
  if (run) {
    const def = ACCELERATOR_BY_ID[run.id]
    const runEnd = Math.max(run.endsAt, fromMs)
    windows.push({ untilMs: runEnd, cycles: 1, data: 1 })
    windows.push({
      untilMs: runEnd + def.boostDurationMs,
      cycles: 1 + (def.boostEffect.cycles ?? 0),
      data: 1 + (def.boostEffect.data ?? 0),
    })
  }

  // 3) Segment neutre final, ouvert.
  windows.push({ untilMs: Infinity, cycles: 1, data: 1 })
  return windows
}
