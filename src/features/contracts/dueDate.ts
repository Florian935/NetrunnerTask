// Logique pure d'échéance (US-005) : statut d'alerte + format court. Sans React.

/** Statut visuel d'une échéance (aucune pénalité — signal seul). */
export type DueState = 'overdue' | 'soon' | 'neutral'

/** Début de journée locale (00:00) pour l'epoch ms fourni. */
function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Statut d'une échéance par rapport à `now`, comparé au **début de journée**
 * local : dépassée (< aujourd'hui) → `overdue` ; aujourd'hui ou demain (≤ 1 j) →
 * `soon` ; au-delà → `neutral`.
 */
export function dueStatus(dueDate: number, now: number): DueState {
  const days = Math.round((startOfDay(dueDate) - startOfDay(now)) / 86_400_000)
  if (days < 0) return 'overdue'
  if (days <= 1) return 'soon'
  return 'neutral'
}

/** Accent NIGHTWIRE associé à un statut d'échéance. */
export const DUE_COLORS: Record<DueState, string> = {
  overdue: 'var(--red-500)',
  soon: 'var(--amber-500)',
  neutral: 'var(--steel-400)',
}

/** Format court « JJ.MM » (jour local). */
export function formatDueShort(dueDate: number): string {
  const d = new Date(dueDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}`
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
