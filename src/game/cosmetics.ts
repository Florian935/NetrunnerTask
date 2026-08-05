// Couche « règles de jeu » — logique pure, sans Dexie ni React ni i18n.
// US-031 (Phase A3) : socle cosmétique & rareté. Un cosmétique est un objet
// **purement esthétique** — le joueur le possède (`owned`) et l'équipe
// (`equipped`), **un seul par type** à la fois. Contrairement aux autres
// modules `game/*` qui exposent des multiplicateurs composés par le store, ce
// module **n'expose AUCUNE valeur de jeu** et n'importe rien de `builder`/
// `prestige`/… : c'est la garantie structurelle de la contrainte permanente
// « aucun cosmétique ne donne d'avantage fonctionnel » (roadmap / H7).
//
// Les libellés (noms, descriptions, texte des titres) vivent en i18n, indexés
// par `id` (convention `GENERATORS`/`MILESTONE_DEFS`) — jamais ici.

/** Type de cosmétique. `theme` re-skin le HUD ; les 3 autres décorent le profil. */
export type CosmeticType = 'theme' | 'avatar' | 'banner' | 'title'

/** Cran de rareté (signal de prestige, aucun effet fonctionnel). */
export type Rarity = 'common' | 'enhanced' | 'rare' | 'epic' | 'legendary'

/** Ordre croissant de rareté (tri d'affichage : commun → légendaire). */
export const RARITY_ORDER: readonly Rarity[] = [
  'common',
  'enhanced',
  'rare',
  'epic',
  'legendary',
]

/** Rang numérique d'un cran (1 = commun … 5 = légendaire). */
export function rarityRank(rarity: Rarity): number {
  return RARITY_ORDER.indexOf(rarity) + 1
}

/** Définition d'un cosmétique (donnée du catalogue). */
export interface Cosmetic {
  id: string
  type: CosmeticType
  rarity: Rarity
  /**
   * Pour un `theme` : cet `id` est **aussi** la valeur de `data-cosmetic-theme`
   * appliquée au `<html>` (voir `theme/tokens/themes.css`). Pour un `avatar` /
   * une `banner` : `icon` porte le glyphe/motif (registre lucide kebab-case).
   */
  icon?: string
  /**
   * Voie d'acquisition. Absent = **déterministe** (départ ou récompense de jalon,
   * US-033). `'crate'` = **exclusif aux caisses** (US-034 : uniquement le tirage
   * d'une caisse). `'corruption'` = **débloqué en embrassant la corruption**
   * (US-036 : le reveal de la voie sombre — voir `game/reveals.ts`). Un cosmétique
   * à `source` défini ne tombe jamais de la voie déterministe (jalons).
   */
  source?: 'crate' | 'corruption'
  /**
   * Objet de statut **non échangeable** (US-038 / benchmark IA #043) : toujours
   * `false`, jamais `true`. Le **type littéral** interdit qu'un cosmétique devienne
   * vendable — la richesse se gagne, ne s'achète ni ne se revend (« vendre un objet
   * de statut détruit le statut »). Rempli à la construction du catalogue (voir
   * `COSMETICS`), pas dupliqué sur chaque entrée. Taxonomie **préventive** posée
   * AVANT toute production de contenu supplémentaire (rétro-classer = crise garantie).
   */
  tradeable: false
}

/**
 * Spécification d'une entrée de catalogue : un cosmétique **sans** le marqueur de
 * statut `tradeable`, ajouté uniformément à la construction (voir `COSMETICS`).
 */
type CosmeticSpec = Omit<Cosmetic, 'tradeable'>

/**
 * Catalogue des cosmétiques de départ (H4, repris de la maquette `wardrobe`).
 * `id` stable, jamais renommé une fois persisté. **Ajouter un cosmétique = une
 * entrée** (patron `GENERATORS`/`ACCELERATORS`). Tout est débloqué au départ ;
 * le déblocage par mérite/caisses viendra en US-033/US-034.
 */
const COSMETIC_SPECS = [
  // -- Thèmes (l'id = clé `data-cosmetic-theme`) --
  { id: 'nightwire', type: 'theme', rarity: 'common' },
  { id: 'cryo', type: 'theme', rarity: 'rare' },
  { id: 'ecarlate', type: 'theme', rarity: 'epic' },
  // -- Avatars (glyphe hexagonal) --
  { id: 'avatar-daemon', type: 'avatar', rarity: 'common', icon: 'bot' },
  { id: 'avatar-raven', type: 'avatar', rarity: 'enhanced', icon: 'bird' },
  { id: 'avatar-phantom', type: 'avatar', rarity: 'rare', icon: 'ghost' },
  { id: 'avatar-icebreaker', type: 'avatar', rarity: 'epic', icon: 'skull' },
  // -- Bannières (motif + dégradé teinté rareté) --
  { id: 'banner-sweep', type: 'banner', rarity: 'enhanced', icon: 'radar' },
  { id: 'banner-surge', type: 'banner', rarity: 'rare', icon: 'zap' },
  { id: 'banner-apex', type: 'banner', rarity: 'legendary', icon: 'crown' },
  // -- Titres (texte stylé, libellé via i18n) --
  { id: 'title-architect', type: 'title', rarity: 'enhanced' },
  { id: 'title-ghost', type: 'title', rarity: 'rare' },
  { id: 'title-overdrive', type: 'title', rarity: 'epic' },
  { id: 'title-zeroday', type: 'title', rarity: 'legendary' },

  // === Pool EXCLUSIF caisses (US-034, `source: 'crate'`) ===
  // Ne tombent JAMAIS de la voie déterministe (ni départ, ni jalon) : uniquement
  // du tirage d'une caisse. 10 items, ≥ 2 par cran de rareté (garantit un tirage
  // possible à chaque rareté). ids/icônes distincts du reste du catalogue.
  // -- commun --
  { id: 'crate-larva', type: 'avatar', rarity: 'common', icon: 'bug', source: 'crate' },
  { id: 'crate-null', type: 'title', rarity: 'common', source: 'crate' },
  // -- amélioré --
  { id: 'crate-static', type: 'banner', rarity: 'enhanced', icon: 'antenna', source: 'crate' },
  { id: 'crate-wraith', type: 'avatar', rarity: 'enhanced', icon: 'drama', source: 'crate' },
  // -- rare --
  { id: 'crate-glacier', type: 'title', rarity: 'rare', source: 'crate' },
  { id: 'crate-blackout', type: 'banner', rarity: 'rare', icon: 'zap-off', source: 'crate' },
  // -- épique --
  { id: 'crate-nemesis', type: 'avatar', rarity: 'epic', icon: 'biohazard', source: 'crate' },
  { id: 'crate-omega', type: 'title', rarity: 'epic', source: 'crate' },
  // -- légendaire --
  { id: 'crate-obsidian', type: 'theme', rarity: 'legendary', source: 'crate' },
  { id: 'crate-voidsurge', type: 'banner', rarity: 'legendary', icon: 'atom', source: 'crate' },

  // === Récompense EXCLUSIVE de la corruption (US-036, `source: 'corruption'`) ===
  // Titre glitch débloqué en **embrassant la corruption** (le pacte du reveal de
  // la voie sombre). Rareté légendaire (pas de 6ᵉ cran) ; c'est la `source` qui
  // porte l'identité magenta/glitch de la carte (comme le pool caisses).
  { id: 'corrupt-glitch', type: 'title', rarity: 'legendary', source: 'corruption' },

  // === Pool de LA VOIE CORROMPUE (US-037, `source: 'corruption'`) ===
  // Gagnés en parcourant la voie : chaque cosmétique se débloque à un **palier de
  // voltage sécurisé cumulé** (`game/corruption.ts` `CORRUPTION_PATH_TIERS`), voie
  // DÉTERMINISTE (jamais une caisse). Pas de 6ᵉ rareté : le traitement magenta/
  // glitch est piloté par la `source`. Mapping des types = maquette `corrupted-path`
  // recadrée sur nos 4 types (pas de « cadre »/« effet » — effets reportés A3).
  { id: 'cor-fracture', type: 'title', rarity: 'rare', source: 'corruption' },
  { id: 'cor-aberration', type: 'banner', rarity: 'epic', icon: 'waves', source: 'corruption' },
  { id: 'cor-surtension', type: 'avatar', rarity: 'legendary', icon: 'zap', source: 'corruption' },
  { id: 'cor-0xdead', type: 'title', rarity: 'legendary', source: 'corruption' },
] as const satisfies readonly CosmeticSpec[]

/**
 * Catalogue exposé : chaque spécification reçoit `tradeable: false` (#043) à la
 * construction — le marqueur de statut est posé **une fois**, jamais dupliqué sur
 * les entrées, et le type littéral garantit qu'aucun cosmétique n'est vendable.
 */
export const COSMETICS: readonly Cosmetic[] = COSMETIC_SPECS.map((c) => ({
  ...c,
  tradeable: false as const,
}))

/** Index du catalogue par `id`. */
export const COSMETIC_BY_ID: Record<string, Cosmetic> = Object.fromEntries(
  COSMETICS.map((c) => [c.id, c]),
)

/** Les 4 types, dans l'ordre d'affichage de la Garde-robe. */
export const COSMETIC_TYPES: readonly CosmeticType[] = [
  'theme',
  'avatar',
  'banner',
  'title',
]

/**
 * État cosmétique pur : ce que le joueur possède + l'`id` équipé par type.
 * Invariant : chaque `equipped[type]` est possédé et de ce type.
 */
export interface CosmeticsCore {
  owned: string[]
  equipped: Record<CosmeticType, string>
}

/**
 * Cosmétiques **de départ** (US-033) : possédés dès une partie neuve. Les autres
 * se **gagnent** via les accomplissements (récompenses de jalons, US-028). Ce
 * sont les 4 équipés par défaut (un par type).
 */
export const STARTER_COSMETICS: readonly string[] = [
  'nightwire',
  'avatar-daemon',
  'banner-sweep',
  'title-architect',
]

/**
 * État de départ : seuls les `STARTER_COSMETICS` sont possédés (US-033 — le
 * reste se mérite), équipés = ces mêmes cosmétiques de base. Source de vérité du
 * seed (`db/seed.ts`).
 */
export const DEFAULT_COSMETICS: CosmeticsCore = {
  owned: [...STARTER_COSMETICS],
  equipped: {
    theme: 'nightwire',
    avatar: 'avatar-daemon',
    banner: 'banner-sweep',
    title: 'title-architect',
  },
}

/** Un cosmétique fait-il partie du lot de départ (jamais une récompense) ? */
export function isStarter(id: string): boolean {
  return STARTER_COSMETICS.includes(id)
}

/** Pool **exclusif aux caisses** (US-034) — les seuls cosmétiques `source: 'crate'`. */
export function crateCosmetics(): Cosmetic[] {
  return COSMETICS.filter((c) => c.source === 'crate')
}

/** Ce cosmétique n'est-il obtenable que par une caisse (US-034) ? */
export function isCrateExclusive(id: string): boolean {
  return COSMETIC_BY_ID[id]?.source === 'crate'
}

/** Cosmétiques débloqués en **embrassant la corruption** (US-036, `source: 'corruption'`). */
export function corruptionCosmetics(): Cosmetic[] {
  return COSMETICS.filter((c) => c.source === 'corruption')
}

/** Le joueur possède-t-il ce cosmétique ? */
export function isOwned(core: CosmeticsCore, id: string): boolean {
  return core.owned.includes(id)
}

/** `id` du cosmétique équipé pour ce type. */
export function equippedOf(core: CosmeticsCore, type: CosmeticType): string {
  return core.equipped[type]
}

/** Est-il actuellement équipé (pour son type) ? */
export function isEquipped(core: CosmeticsCore, id: string): boolean {
  const c = COSMETIC_BY_ID[id]
  return c !== undefined && core.equipped[c.type] === id
}

/**
 * Cosmétiques du catalogue d'un type donné, triés par rareté croissante
 * (commun → légendaire), ordre du catalogue à rareté égale.
 */
export function cosmeticsByType(type: CosmeticType): Cosmetic[] {
  return COSMETICS.filter((c) => c.type === type).sort(
    (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity),
  )
}

/**
 * Équipe le cosmétique `id` : remplace l'équipé du **même type**. **No-op**
 * (même référence) si l'`id` est inconnu, non possédé, ou déjà équipé —
 * l'appelant peut comparer par référence pour éviter une écriture inutile.
 */
export function equip(core: CosmeticsCore, id: string): CosmeticsCore {
  const c = COSMETIC_BY_ID[id]
  if (c === undefined || !isOwned(core, id)) return core
  if (core.equipped[c.type] === id) return core
  return { ...core, equipped: { ...core.equipped, [c.type]: id } }
}
