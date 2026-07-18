// Sélection « contrats du jour » du HUD (US-010) — logique pure, sans React.
// Contrats ouverts à échéance dépassée (overdue) ou aujourd'hui (today).

import type { Contract } from '../../db'
import { daysUntilDue } from '../contracts/dueDate'

/** Groupes de contrats du jour, chacun trié par échéance croissante. */
export interface TodayContracts {
  /** Ouverts dont l'échéance est dépassée (le plus en retard d'abord). */
  overdue: Contract[]
  /** Ouverts dont l'échéance est aujourd'hui. */
  today: Contract[]
}

/**
 * Répartit les contrats **ouverts** à échéance dépassée / aujourd'hui en deux
 * groupes triés par échéance croissante. Ignore les contrats terminés, sans
 * échéance, ou à échéance future (demain et au-delà).
 */
export function todayContracts(
  contracts: Contract[],
  now: number,
): TodayContracts {
  const overdue: Contract[] = []
  const today: Contract[] = []

  for (const c of contracts) {
    if (c.status !== 'open' || c.dueDate === null) continue
    const days = daysUntilDue(c.dueDate, now)
    if (days < 0) overdue.push(c)
    else if (days === 0) today.push(c)
  }

  const byDue = (a: Contract, b: Contract) =>
    (a.dueDate ?? 0) - (b.dueDate ?? 0)
  overdue.sort(byDue)
  today.sort(byDue)
  return { overdue, today }
}
