// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-012 : réputation par faction — barème de gain, rangs par seuils,
// progression vers le prochain rang, application avec plancher 0.

import type { Difficulty } from '../db'

/** Réputation gagnée (et perdue, en négatif) pour un contrat, selon sa difficulté. */
export const REPUTATION_GAIN: Record<Difficulty, number> = {
  trivial: 1,
  easy: 2,
  medium: 4,
  hard: 7,
  legendary: 12,
}

/** Réputation octroyée par un contrat de difficulté donnée. */
export function reputationGain(difficulty: Difficulty): number {
  return REPUTATION_GAIN[difficulty]
}

/** Clé de rang (statut, sans avantage fonctionnel). */
export type ReputationRankKey =
  | 'unknown'
  | 'contact'
  | 'associate'
  | 'fixer'
  | 'legend'

export interface ReputationRank {
  key: ReputationRankKey
  /** Seuil minimal de réputation pour atteindre ce rang. */
  min: number
}

/** Échelle des rangs (croissante). Le dernier est le rang maximum. */
export const REPUTATION_RANKS: readonly ReputationRank[] = [
  { key: 'unknown', min: 0 },
  { key: 'contact', min: 25 },
  { key: 'associate', min: 75 },
  { key: 'fixer', min: 200 },
  { key: 'legend', min: 500 },
]

/** Rang courant (clé + index dans l'échelle) pour une réputation donnée. */
export function rankForReputation(rep: number): {
  key: ReputationRankKey
  index: number
} {
  let index = 0
  for (let i = 0; i < REPUTATION_RANKS.length; i++) {
    if (rep >= REPUTATION_RANKS[i].min) index = i
    else break
  }
  return { key: REPUTATION_RANKS[index].key, index }
}

export interface ReputationProgress {
  rankKey: ReputationRankKey
  rankIndex: number
  /** Réputation courante (bornée à ≥ 0). */
  current: number
  /** Seuil du prochain rang, ou `null` au rang maximum. */
  next: number | null
  /** Clé du prochain rang, ou `null` au rang maximum. */
  nextRankKey: ReputationRankKey | null
  /** Remplissage de la barre : `courant / seuil suivant` (depuis 0), borné 0..1 ;
   *  `1` au rang maximum. */
  ratio: number
  /** Rang maximum atteint ? */
  isMax: boolean
}

/** Décrit la progression d'affichage (barre + libellés) pour une réputation. */
export function reputationProgress(rep: number): ReputationProgress {
  const current = Math.max(0, rep)
  const { key, index } = rankForReputation(current)
  const isMax = index === REPUTATION_RANKS.length - 1
  const next = isMax ? null : REPUTATION_RANKS[index + 1].min
  const nextRankKey = isMax ? null : REPUTATION_RANKS[index + 1].key
  const ratio = next === null ? 1 : Math.min(1, current / next)
  return { rankKey: key, rankIndex: index, current, next, nextRankKey, ratio, isMax }
}

/** Applique un delta (gain positif ou perte négative) avec **plancher 0**. */
export function applyReputationDelta(rep: number, delta: number): number {
  return Math.max(0, rep + delta)
}
