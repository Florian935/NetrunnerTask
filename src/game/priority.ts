// Couche « règles de jeu » — priorité (US-005). Pur, sans Dexie ni React.

import type { Priority } from '../db'

/** Ordre croissant de priorité (rang = index) : basse < normale < haute. */
export const PRIORITY_ORDER: readonly Priority[] = ['low', 'normal', 'high']

/** Rang de tri : plus haut = plus prioritaire (high = 2). */
export function priorityRank(priority: Priority): number {
  return PRIORITY_ORDER.indexOf(priority)
}

/**
 * Rendu des barres de signal par priorité : nombre de barres allumées (`lit` sur
 * 3), accent et glow (réservé à `high`). La forme porte le niveau — pas la
 * couleur, gardée pour l'échéance.
 */
export const PRIORITY_BARS: Record<
  Priority,
  { lit: number; color: string; glow: boolean }
> = {
  low: { lit: 1, color: 'var(--steel-600)', glow: false },
  normal: { lit: 2, color: 'var(--steel-200)', glow: false },
  high: { lit: 3, color: 'var(--cyan-500)', glow: true },
}
