// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-008 : barème de récompense par difficulté et accents d'affichage.
// (La courbe de niveau d'US-009 pourra rejoindre cette couche.)

import type { Difficulty } from '../db'

/** Récompense octroyée par la complétion d'un contrat. */
export interface Reward {
  xp: number
  credits: number
}

/**
 * Barème de récompense par difficulté (croissant). Source de vérité unique :
 * affichage de la récompense potentielle ET octroi à la complétion s'y réfèrent.
 */
export const REWARDS: Record<Difficulty, Reward> = {
  trivial: { xp: 5, credits: 5 },
  easy: { xp: 10, credits: 10 },
  medium: { xp: 25, credits: 20 },
  hard: { xp: 50, credits: 40 },
  legendary: { xp: 100, credits: 80 },
}

/** Récompense d'une difficulté donnée. */
export function rewardFor(difficulty: Difficulty): Reward {
  return REWARDS[difficulty]
}

/** Ordre d'affichage des difficultés (trivial → légendaire). */
export const DIFFICULTY_ORDER: readonly Difficulty[] = [
  'trivial',
  'easy',
  'medium',
  'hard',
  'legendary',
]

/**
 * Accent NIGHTWIRE par difficulté (échelle croissante). Utilisé pour les
 * pastilles du sélecteur et le libellé de difficulté sur la ligne de contrat.
 */
export const DIFFICULTY_ACCENTS: Record<Difficulty, string> = {
  trivial: 'var(--steel-400)',
  easy: 'var(--cyan-500)',
  medium: 'var(--violet-500)',
  hard: 'var(--amber-500)',
  legendary: 'var(--magenta-500)',
}
