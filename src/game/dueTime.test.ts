import { describe, expect, it } from 'vitest'
import {
  deadlineInstant,
  dueState,
  isDue,
  isPastDeadline,
  reminderTrigger,
} from './dueTime'

// Jour local fixe : 18/07/2026.
const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime()
const DAY = at(2026, 7, 18) // minuit local du 18/07
const DAY_1842 = at(2026, 7, 18, 18, 42) // 18/07 à 18:42

describe('deadlineInstant', () => {
  it('horodaté : l’instant exact', () => {
    expect(deadlineInstant(DAY_1842, true)).toBe(DAY_1842)
  })
  it('au jour : minuit suivant (fin de journée)', () => {
    expect(deadlineInstant(DAY, false)).toBe(at(2026, 7, 19))
  })
})

describe('isPastDeadline — non-régression au comportement « au jour »', () => {
  // Au jour : en retard ⟺ jour strictement passé (comme isMissed avant US-014).
  it('au jour : pas dépassé le jour même (même tard)', () => {
    expect(isPastDeadline(DAY, false, at(2026, 7, 18, 23, 59))).toBe(false)
  })
  it('au jour : dépassé le lendemain', () => {
    expect(isPastDeadline(DAY, false, at(2026, 7, 19, 0, 1))).toBe(true)
  })
  it('au jour : pas dépassé la veille', () => {
    expect(isPastDeadline(DAY, false, at(2026, 7, 17, 12))).toBe(false)
  })
})

describe('isPastDeadline — horodaté à la minute', () => {
  it('pas dépassé une minute avant', () => {
    expect(isPastDeadline(DAY_1842, true, at(2026, 7, 18, 18, 41))).toBe(false)
  })
  it('dépassé une minute après', () => {
    expect(isPastDeadline(DAY_1842, true, at(2026, 7, 18, 18, 43))).toBe(true)
  })
  it('dépassé pile à l’instant (>=)', () => {
    expect(isPastDeadline(DAY_1842, true, DAY_1842)).toBe(true)
  })
})

describe('dueState', () => {
  it('au jour : aujourd’hui/demain = soon, au-delà = neutral, passé = overdue', () => {
    expect(dueState(DAY, false, at(2026, 7, 18, 9))).toBe('soon') // aujourd'hui
    expect(dueState(DAY, false, at(2026, 7, 17, 9))).toBe('soon') // veille (demain)
    expect(dueState(DAY, false, at(2026, 7, 16, 9))).toBe('neutral') // J-2
    expect(dueState(DAY, false, at(2026, 7, 19, 9))).toBe('overdue') // lendemain
  })
  it('horodaté : soon = dans l’heure avant l’instant', () => {
    expect(dueState(DAY_1842, true, at(2026, 7, 18, 18, 0))).toBe('soon') // 42 min avant
    expect(dueState(DAY_1842, true, at(2026, 7, 18, 17, 30))).toBe('neutral') // 72 min avant
    expect(dueState(DAY_1842, true, at(2026, 7, 18, 19, 0))).toBe('overdue') // après
  })
})

describe('isDue — l’occurrence a commencé (réactivation)', () => {
  it('au jour : dû dès le début de la journée d’échéance (= daysUntilDue ≤ 0)', () => {
    expect(isDue(DAY, false, at(2026, 7, 17, 23, 59))).toBe(false) // veille
    expect(isDue(DAY, false, at(2026, 7, 18, 0, 1))).toBe(true) // jour même
    expect(isDue(DAY, false, at(2026, 7, 19, 12))).toBe(true) // lendemain
  })
  it('horodaté : dû dès l’instant exact', () => {
    expect(isDue(DAY_1842, true, at(2026, 7, 18, 18, 41))).toBe(false)
    expect(isDue(DAY_1842, true, DAY_1842)).toBe(true)
  })
})

describe('reminderTrigger — instant de déclenchement du rappel', () => {
  it('lead 0 = à l’échéance', () => {
    expect(reminderTrigger(DAY_1842, 0)).toBe(DAY_1842)
  })
  it('lead 10 min avant', () => {
    expect(reminderTrigger(DAY_1842, 10)).toBe(at(2026, 7, 18, 18, 32))
  })
  it('lead 60 min avant', () => {
    expect(reminderTrigger(DAY_1842, 60)).toBe(at(2026, 7, 18, 17, 42))
  })
})
