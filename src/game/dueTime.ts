// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-014 : cœur temporel des échéances. Unifie « au jour » (comportement
// historique) et « horodaté » via un unique **instant limite**. Tout se ramène à
// `now >= deadlineInstant` — garantissant zéro régression sur l'existant.

/** Statut visuel d'une échéance (aucune pénalité — signal seul). */
export type DueState = 'overdue' | 'soon' | 'neutral'

const DAY = 86_400_000
const HOUR = 3_600_000

/** Début de journée locale (00:00) pour l'epoch ms fourni. */
function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Minuit du **lendemain** — calculé par arithmétique de date (**DST-safe**) et
 * non par `+ 24 h` (les jours de changement d'heure font 23 h ou 25 h).
 */
function startOfNextDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d.getTime()
}

/**
 * Instant (epoch ms) où l'échéance devient **dépassée** :
 * - **horodaté** (`hasTime`) → l'instant exact `dueDate` ;
 * - **au jour** → **minuit suivant** (fin de la journée d'échéance), ce qui
 *   reproduit à l'identique l'ancien « en retard = jour strictement passé »
 *   (comparaison de minuits, robuste au changement d'heure).
 */
export function deadlineInstant(dueDate: number, hasTime: boolean): number {
  return hasTime ? dueDate : startOfNextDay(dueDate)
}

/** L'échéance est-elle dépassée à `now` ? (`now >= deadlineInstant`) */
export function isPastDeadline(
  dueDate: number,
  hasTime: boolean,
  now: number,
): boolean {
  return now >= deadlineInstant(dueDate, hasTime)
}

/**
 * Instant où l'occurrence **commence** (l'échéance « arrive ») :
 * - **horodaté** → l'instant exact `dueDate` ;
 * - **au jour** → **début** de la journée d'échéance (00:00).
 * Sert à la **réactivation** d'un récurrent (au début de la période, pas à la fin
 * de journée comme `deadlineInstant`).
 */
export function occurrenceInstant(dueDate: number, hasTime: boolean): number {
  return hasTime ? dueDate : startOfDay(dueDate)
}

/** L'échéance est-elle **arrivée** à `now` ? (`now >= occurrenceInstant`) */
export function isDue(dueDate: number, hasTime: boolean, now: number): boolean {
  return now >= occurrenceInstant(dueDate, hasTime)
}

/**
 * Statut d'affichage d'une échéance à `now` :
 * - **dépassée** → `overdue` ;
 * - **bientôt** (`soon`) : horodaté = **dans l'heure** avant l'instant ; au jour =
 *   **aujourd'hui ou demain** (comportement historique) ;
 * - sinon `neutral`.
 */
export function dueState(
  dueDate: number,
  hasTime: boolean,
  now: number,
): DueState {
  if (isPastDeadline(dueDate, hasTime, now)) return 'overdue'
  if (hasTime) return dueDate - now <= HOUR ? 'soon' : 'neutral'
  const days = Math.round((startOfDay(dueDate) - startOfDay(now)) / DAY)
  return days <= 1 ? 'soon' : 'neutral'
}

/**
 * Instant de déclenchement d'un rappel : `lead` minutes **avant** l'échéance.
 * Le rappel exige une heure (US-014) → l'échéance est l'instant exact `dueDate`.
 * `lead = 0` → à l'échéance.
 */
export function reminderTrigger(dueDate: number, lead: number): number {
  return dueDate - lead * 60_000
}
