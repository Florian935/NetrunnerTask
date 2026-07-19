// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-011 : série (streak) des contrats récurrents = nombre de périodes
// consécutives complétées à temps, avec conservation du record.

/** Série d'un contrat : valeur courante + record (meilleure série atteinte). */
export interface Streak {
  currentStreak: number
  bestStreak: number
}

/** Début de journée locale (00:00) pour l'epoch ms fourni. */
function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Complétion « à temps » ? `true` s'il n'y a pas d'échéance, ou si le jour de
 * `now` est ≤ au jour de l'échéance. Comparaison au **jour local** (l'échéance
 * est posée à minuit, cf. `recurrence.ts`).
 */
export function isOnTime(dueDate: number | null, now: number): boolean {
  if (dueDate === null) return true
  return startOfDay(now) <= startOfDay(dueDate)
}

/** Période manquée ? Une échéance définie dont le jour est **strictement** passé. */
export function isMissed(dueDate: number | null, now: number): boolean {
  if (dueDate === null) return false
  return startOfDay(now) > startOfDay(dueDate)
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
  now: number,
): Streak {
  if (!isMissed(dueDate, now)) return streak
  return { currentStreak: 0, bestStreak: streak.bestStreak }
}
