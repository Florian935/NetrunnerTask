// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-006 : calcul de la prochaine échéance d'un contrat récurrent.

import type { Recurrence } from '../db'

/** Début de journée locale (00:00) pour l'epoch ms fourni. */
function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Ajoute `n` jours (arithmétique calendaire locale, robuste au changement d'heure). */
function addDays(ms: number, n: number): number {
  const d = new Date(ms)
  d.setDate(d.getDate() + n)
  return d.getTime()
}

/** Ajoute `n` mois en conservant le quantième, avec clamp sur la fin du mois cible. */
function addMonths(ms: number, n: number): number {
  const d = new Date(ms)
  const day = d.getDate()
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate()
  target.setDate(Math.min(day, lastDay))
  return target.getTime()
}

/** ISO weekday (1 = lundi … 7 = dimanche). */
function isoWeekday(ms: number): number {
  const d = new Date(ms).getDay()
  return d === 0 ? 7 : d
}

/** Avance une date d'une période d'intervalle. */
function stepInterval(
  ms: number,
  every: number,
  unit: 'day' | 'week' | 'month',
): number {
  if (unit === 'day') return addDays(ms, every)
  if (unit === 'week') return addDays(ms, every * 7)
  return addMonths(ms, every)
}

/**
 * Première échéance (epoch ms, minuit local) à poser quand on **définit** une
 * récurrence sur un contrat **sans échéance** (US-006). Intervalle → dû dès
 * aujourd'hui ; jour de semaine → prochaine occurrence de ce jour, **aujourd'hui
 * inclus** (contrairement à `nextOccurrence`, qui est strictement future).
 */
export function firstOccurrence(recurrence: Recurrence, now: number): number {
  const today = startOfDay(now)
  if (recurrence.mode === 'weekday') {
    const delta = (recurrence.weekday - isoWeekday(today) + 7) % 7
    return addDays(today, delta)
  }
  return today
}

/**
 * Prochaine échéance (epoch ms, minuit local) d'un contrat récurrent, **toujours
 * strictement future** (> aujourd'hui). Ancrage Option A : on part de l'échéance
 * actuelle (`anchor`) si définie, sinon d'aujourd'hui, puis on avance d'une
 * période ; en cas de retard, on continue d'avancer jusqu'à la première
 * occurrence future (roll-forward), en préservant la cadence.
 */
export function nextOccurrence(
  recurrence: Recurrence,
  anchor: number | null,
  now: number,
): number {
  const today = startOfDay(now)

  if (recurrence.mode === 'weekday') {
    // Prochaine date de ce jour ISO, strictement après aujourd'hui.
    const delta = (recurrence.weekday - isoWeekday(today) + 7) % 7 || 7
    return addDays(today, delta)
  }

  const base = anchor !== null ? startOfDay(anchor) : today
  let next = stepInterval(base, recurrence.every, recurrence.unit)
  while (next <= today) {
    next = stepInterval(next, recurrence.every, recurrence.unit)
  }
  return next
}
