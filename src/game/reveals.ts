// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-036 (Phase A4) : le MOTEUR DE REVEALS — le cadre extensible des
// « dévoilements » qui rendent le jeu sans fin (P6, « ça ne s'arrête jamais »).
// Un reveal = un contenu caché qui s'arme quand l'état de jeu franchit une
// condition, se découvre **une fois**, et se mémorise (ledger append-only).
//
// Ce module ne décrit QUE le **déclenchement** (un prédicat pur sur l'état) ; le
// **contenu révélé** (ici la corruption : thème + pacte + titre) vit dans le
// store / l'UI, pas ici. Premier reveal du registre : la CORRUPTION, armée par
// la renaissance. Ajouter un reveal = ajouter une entrée au registre.
//
// **Déterministe, zéro RNG** — contrairement à `crates.ts` (le seul module
// hasardeux de `game/*`). Point d'entrée unique : `newlyTriggeredReveals`.

/** Identifiant d'un reveal (extensible : réveil de l'IA, fausses limites…). */
export type RevealId = 'corruption'

/** Instantané de l'état de jeu lu par les prédicats de déclenchement. */
export interface RevealContext {
  /** Nombre de renaissances effectuées (US-024, `prestigeCount`). */
  prestigeCount: number
}

/** Définition d'un reveal : son `id` + son prédicat de déclenchement **pur**. */
export interface RevealDef {
  id: RevealId
  trigger: (ctx: RevealContext) => boolean
}

/**
 * Seuil de la corruption : après ce nombre de renaissances, le Réseau se dérègle
 * et le reveal s'arme. Placé assez **tard** pour avoir goûté au prestige
 * « normal » d'abord — l'effet « tu croyais avoir tout vu » ne fonctionne que si
 * la corruption surprend un joueur déjà installé. **Ajustable en recette.**
 */
export const CORRUPTION_PRESTIGE_THRESHOLD = 3

/** Registre des reveals. Ajouter un reveal = ajouter une entrée ici. */
export const REVEALS: readonly RevealDef[] = [
  {
    id: 'corruption',
    trigger: (ctx) => ctx.prestigeCount >= CORRUPTION_PRESTIGE_THRESHOLD,
  },
]

/**
 * Reveals dont le prédicat déclenche pour `ctx` **et** pas encore présents dans
 * `discovered` (ledger append-only des reveals déjà dévoilés, persisté). Pur et
 * déterministe : appelé après une action qui peut faire basculer un prédicat
 * (renaissance) et au chargement (rattrapage).
 */
export function newlyTriggeredReveals(
  discovered: readonly string[],
  ctx: RevealContext,
): RevealId[] {
  const seen = new Set(discovered)
  return REVEALS.filter((r) => !seen.has(r.id) && r.trigger(ctx)).map((r) => r.id)
}
