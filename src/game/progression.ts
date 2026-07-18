// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-009 : courbe de progression (XP → niveau netrunner) et dérivations
// d'affichage. Source de vérité unique de la progression.
//
// Courbe : l'XP nécessaire pour passer du niveau `n` au niveau `n+1` vaut
// `100 × n`. L'XP cumulée pour **atteindre** le niveau `L` vaut donc
// `50 × L × (L − 1)` (⇒ L2 = 100, L3 = 300, L4 = 600, L5 = 1000).
// `xp` reste la source de vérité ; le niveau en est toujours redérivable.

/** Palier : XP à atteindre pour être `level`. Niveau 1 = 0 XP (départ). */
export function xpToReachLevel(level: number): number {
  return 50 * level * (level - 1)
}

/** XP requise pour passer du niveau `level` au suivant (`100 × level`). */
export function xpForNextLevel(level: number): number {
  return 100 * level
}

/**
 * Niveau correspondant à une XP totale : plus grand `L` tel que
 * `xpToReachLevel(L) ≤ xp`. `xp = 0` → niveau 1. Robuste aux montées
 * multi-paliers (on part de l'XP totale, pas d'un décrément).
 */
export function levelForXp(xp: number): number {
  let level = 1
  while (xpToReachLevel(level + 1) <= xp) {
    level += 1
  }
  return level
}

/** Détail d'affichage de la progression dérivé de l'XP totale. */
export interface Progression {
  /** Niveau netrunner courant. */
  level: number
  /** XP acquise dans le niveau courant. */
  xpIntoLevel: number
  /** XP totale requise pour franchir le niveau courant. */
  xpForNextLevel: number
  /** Avancement dans le niveau courant, en pourcentage (0–100). */
  pct: number
}

/** Dérive tout ce dont l'indicateur a besoin à partir de l'XP totale. */
export function progressionFor(xp: number): Progression {
  const level = levelForXp(xp)
  const span = xpForNextLevel(level)
  const xpIntoLevel = xp - xpToReachLevel(level)
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: span,
    pct: (xpIntoLevel / span) * 100,
  }
}
