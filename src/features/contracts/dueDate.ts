// Logique pure d'échéance (US-005) : format court + parsing des champs date/heure.
// US-014 : le statut d'alerte est délégué au cœur temporel `game/dueTime.ts`
// (échéance au jour **ou** horodatée).

import { dueState } from '../../game/dueTime'
import type { DueState } from '../../game/dueTime'

export type { DueState }

/** Début de journée locale (00:00) pour l'epoch ms fourni. */
function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Nombre de jours (calendaires, locaux) entre aujourd'hui et l'échéance :
 * `< 0` = dépassée, `0` = aujourd'hui, `1` = demain, etc. Sert au **tri** et à
 * l'affichage (le statut passe par `dueState`).
 */
export function daysUntilDue(dueDate: number, now: number): number {
  return Math.round((startOfDay(dueDate) - startOfDay(now)) / 86_400_000)
}

/**
 * Statut visuel d'une échéance — délègue à `dueState` (US-014, tient compte de
 * l'heure). Conservé ici pour les consommateurs existants.
 */
export function dueStatus(
  dueDate: number,
  hasTime: boolean,
  now: number,
): DueState {
  return dueState(dueDate, hasTime, now)
}

/** Accent NIGHTWIRE associé à un statut d'échéance. */
export const DUE_COLORS: Record<DueState, string> = {
  overdue: 'var(--red-500)',
  soon: 'var(--amber-500)',
  neutral: 'var(--steel-400)',
}

/** Format court « JJ.MM » (jour local), avec l'heure « · HH:MM » si horodatée. */
export function formatDueShort(dueDate: number, hasTime = false): string {
  const d = new Date(dueDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const date = `${dd}.${mm}`
  if (!hasTime) return date
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${date} · ${hh}:${mi}`
}

/** epoch ms → valeur `<input type="time">` (`HH:MM`, heure locale). */
export function toTimeInputValue(dueDate: number): string {
  const d = new Date(dueDate)
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

/**
 * Applique une heure `HH:MM` à l'échéance existante (même jour local) → epoch ms.
 * `value` vide → renvoie l'échéance ramenée à **minuit** (retrait de l'heure).
 */
export function applyTimeToDue(dueDate: number, value: string): number {
  const base = startOfDay(dueDate)
  if (!value) return base
  const [hh, mi] = value.split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mi)) return base
  return base + hh * 3_600_000 + mi * 60_000
}

/** epoch ms → valeur `<input type="date">` (`YYYY-MM-DD`, jour local). */
export function toDateInputValue(dueDate: number): string {
  const d = new Date(dueDate)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Valeur `<input type="date">` (`YYYY-MM-DD`) → epoch ms (minuit local), ou `null`. */
export function fromDateInputValue(value: string): number | null {
  if (!value) return null
  const [yyyy, mm, dd] = value.split('-').map(Number)
  if (!yyyy || !mm || !dd) return null
  return new Date(yyyy, mm - 1, dd).getTime()
}
