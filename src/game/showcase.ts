// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-038 (Phase A5) : la Salle des trophées. Un présentoir **composé par le
// joueur** — des emplacements où l'on épingle des trophées, PAS un inventaire.
// Comme `cosmetics.ts`, ce module est **purement esthétique** : il n'expose
// aucune valeur de jeu et n'importe rien de `builder`/`prestige`. Il ne connaît
// que le catalogue cosmétique (pour lire la rareté d'une pièce épinglée) et un
// **compte de jalons** passé en argument (jamais le store builder) → le nombre
// d'emplacements est DÉRIVÉ des jalons, pas un champ persisté redondant.
//
// Règle d'or (#043) : la richesse exposée = rareté et paliers gagnés, jamais une
// quantité d'objets. Ce module ne compte donc jamais « combien d'objets » ; il
// dérive une rareté maîtresse et une progression d'emplacements.

import { COSMETIC_BY_ID, rarityRank, type Rarity } from './cosmetics'

/**
 * Un trophée épinglé. **Type discriminé** : en V1 un seul variant, un cosmétique
 * possédé (`ref` = `id` du catalogue `COSMETICS`). Le discriminant `kind` est
 * posé dès maintenant pour qu'US-039 ajoute `'milestone'`/`'prestige'`/
 * `'corruption'` **sans migration de forme** de l'état persisté.
 */
export type ShowcasePin = { kind: 'cosmetic'; ref: string }

/** Un emplacement du présentoir : un trophée épinglé, ou `null` (vide). */
export type ShowcaseSlot = ShowcasePin | null

/**
 * Configuration des emplacements (à régler en recette, patron `SURCHARGE_CONFIG`).
 * `baseSlots` sont ouverts d'entrée ; chaque seuil de `tierThresholds` ouvre un
 * emplacement de plus à l'atteinte de ce nombre de **jalons** (US-028). Le nombre
 * total d'emplacements est donc **constant** (`baseSlots + tierThresholds.length`),
 * indépendant des jalons — seuls les emplacements *ouverts* en dépendent.
 */
export const SHOWCASE_CONFIG = {
  baseSlots: 3,
  /** Jalons requis pour ouvrir le Nᵉ emplacement au-delà de la base (croissant). */
  tierThresholds: [3, 6, 9, 11] as const,
} as const

/** Nombre total d'emplacements du présentoir (ouverts + verrouillés) — constant. */
export function totalSlots(): number {
  return SHOWCASE_CONFIG.baseSlots + SHOWCASE_CONFIG.tierThresholds.length
}

/** Nombre d'emplacements **ouverts** pour ce nombre de jalons atteints. */
export function unlockedSlots(achievedCount: number): number {
  const tiers = SHOWCASE_CONFIG.tierThresholds.filter((t) => t <= achievedCount).length
  return SHOWCASE_CONFIG.baseSlots + tiers
}

/**
 * Jalons requis pour ouvrir l'emplacement d'index `slotIndex` (0-based), ou
 * `null` si l'emplacement fait partie de la base (aucune condition) ou dépasse le
 * total. Sert au libellé « ATTEINS N JALONS » de l'état verrouillé.
 */
export function slotRequirement(slotIndex: number): number | null {
  const tierIndex = slotIndex - SHOWCASE_CONFIG.baseSlots
  if (tierIndex < 0 || tierIndex >= SHOWCASE_CONFIG.tierThresholds.length) return null
  return SHOWCASE_CONFIG.tierThresholds[tierIndex]
}

/**
 * Progression des emplacements (en-tête du présentoir) : `open` ouverts sur
 * `total`, `nextAt` = jalons requis pour le prochain emplacement (`null` si tous
 * ouverts), `achieved` = jalons atteints. Jamais un compteur d'objets (#043).
 */
export function slotProgress(achievedCount: number): {
  open: number
  total: number
  nextAt: number | null
  achieved: number
} {
  const open = unlockedSlots(achievedCount)
  const total = totalSlots()
  const nextAt = open < total ? slotRequirement(open) : null
  return { open, total, nextAt, achieved: achievedCount }
}

/**
 * Rareté **maîtresse exposée** : la rareté la plus haute parmi les trophées
 * épinglés (tuile « pièce maîtresse exposée »). `null` si le présentoir est vide.
 * Ignore les pins dont la `ref` est inconnue du catalogue (robustesse).
 */
export function topExposedRarity(showcase: readonly ShowcaseSlot[]): Rarity | null {
  let best: Rarity | null = null
  let bestRank = 0
  for (const slot of showcase) {
    if (slot === null) continue
    const cosmetic = COSMETIC_BY_ID[slot.ref]
    if (cosmetic === undefined) continue
    const rank = rarityRank(cosmetic.rarity)
    if (rank > bestRank) {
      bestRank = rank
      best = cosmetic.rarity
    }
  }
  return best
}

/** La `ref` est-elle déjà épinglée quelque part (hors emplacement `exceptSlot`) ? */
function isPinnedElsewhere(
  showcase: readonly ShowcaseSlot[],
  ref: string,
  exceptSlot: number,
): boolean {
  return showcase.some((slot, i) => slot !== null && slot.ref === ref && i !== exceptSlot)
}

/**
 * Épingle le cosmétique `ref` dans l'emplacement `slot` (remplace le contenu
 * précédent). **No-op** (renvoie le présentoir inchangé, même référence) si :
 * `ref` non possédé, `slot` hors bornes (`0 ≤ slot < totalSlots`), `ref` déjà
 * épinglé ailleurs (unicité par `ref` ; on n'expose pas deux fois la même pièce),
 * ou `ref` déjà en place à cet emplacement. Les pièces d'un **même type** peuvent
 * cohabiter (le présentoir est agnostique au type, contrairement à l'équipement).
 * La borne « emplacement ouvert » (dérivée des jalons) est garantie par
 * l'appelant.
 */
export function pinSlot(
  showcase: readonly ShowcaseSlot[],
  slot: number,
  ref: string,
  owned: readonly string[],
): ShowcaseSlot[] {
  // No-op → renvoie la MÊME référence (patron `equip`) : le store peut comparer
  // par référence et éviter une écriture inutile.
  if (slot < 0 || slot >= totalSlots()) return showcase as ShowcaseSlot[]
  if (!owned.includes(ref)) return showcase as ShowcaseSlot[]
  if (isPinnedElsewhere(showcase, ref, slot)) return showcase as ShowcaseSlot[]
  if (showcase[slot]?.ref === ref) return showcase as ShowcaseSlot[]
  const next = [...showcase]
  while (next.length <= slot) next.push(null)
  next[slot] = { kind: 'cosmetic', ref }
  return next
}

/**
 * Retire le trophée de l'emplacement `slot` (le laisse vide). **No-op** si
 * l'emplacement est hors bornes ou déjà vide.
 */
export function unpinSlot(showcase: readonly ShowcaseSlot[], slot: number): ShowcaseSlot[] {
  if (slot < 0 || slot >= showcase.length) return showcase as ShowcaseSlot[]
  if (showcase[slot] === null) return showcase as ShowcaseSlot[]
  const next = [...showcase]
  next[slot] = null
  return next
}

/**
 * Réconcilie le présentoir avec l'état possédé (robustesse au `load()`) : vide
 * les emplacements dont la `ref` n'est plus possédée (cas rare — `owned` est
 * append-only) ou en doublon (garde la première occurrence), et **plafonne** la
 * longueur au total d'emplacements. `owned` étant append-only, c'est surtout un
 * filet de sécurité (données éditées, contenu retiré du catalogue).
 */
export function reconcileShowcase(
  showcase: readonly ShowcaseSlot[],
  owned: readonly string[],
): ShowcaseSlot[] {
  const ownedSet = new Set(owned)
  const seen = new Set<string>()
  const capped = showcase.slice(0, totalSlots())
  return capped.map((slot) => {
    if (slot === null) return null
    if (!ownedSet.has(slot.ref) || seen.has(slot.ref)) return null
    seen.add(slot.ref)
    return slot
  })
}
