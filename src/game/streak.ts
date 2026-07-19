// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-011 : série (streak) des contrats récurrents = nombre de périodes
// consécutives complétées à temps, avec conservation du record.
// US-014 : « à temps / manqué » s'appuie sur l'instant limite (`dueTime`) →
// gère l'échéance horodatée comme l'échéance au jour, sans régression.

import { isPastDeadline } from './dueTime'

/** Série d'un contrat : valeur courante + record (meilleure série atteinte). */
export interface Streak {
  currentStreak: number
  bestStreak: number
}

/**
 * Complétion « à temps » ? `true` s'il n'y a pas d'échéance, ou tant que
 * l'**instant limite** n'est pas dépassé (`dueTime`). Au jour = fin de la journée
 * d'échéance ; horodaté = l'instant exact.
 */
export function isOnTime(
  dueDate: number | null,
  hasTime: boolean,
  now: number,
): boolean {
  if (dueDate === null) return true
  return !isPastDeadline(dueDate, hasTime, now)
}

/** Période manquée ? Une échéance définie dont l'**instant limite** est dépassé. */
export function isMissed(
  dueDate: number | null,
  hasTime: boolean,
  now: number,
): boolean {
  if (dueDate === null) return false
  return isPastDeadline(dueDate, hasTime, now)
}

/**
 * Applique une complétion à la série. À temps → `currentStreak + 1` ; en retard
 * → la série repart à `1` (la chaîne à temps est rompue). Le record suit la
 * série courante mais **ne diminue jamais**.
 */
export function applyCompletion(streak: Streak, onTime: boolean): Streak {
  const currentStreak = onTime ? streak.currentStreak + 1 : 1
  return {
    currentStreak,
    bestStreak: Math.max(streak.bestStreak, currentStreak),
  }
}

/**
 * Remet la série courante à `0` si la période est manquée (record préservé).
 * Renvoie l'objet inchangé (même référence) sinon.
 */
export function resetIfMissed(
  streak: Streak,
  dueDate: number | null,
  hasTime: boolean,
  now: number,
): Streak {
  if (!isMissed(dueDate, hasTime, now)) return streak
  return { currentStreak: 0, bestStreak: streak.bestStreak }
}
