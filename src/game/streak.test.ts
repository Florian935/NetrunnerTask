import { describe, expect, it } from 'vitest'
import type { Streak } from './streak'
import { applyCompletion, isMissed, isOnTime, resetIfMissed } from './streak'

/** Minuit local d'un jour de juillet 2026. */
function july(day: number): number {
  return new Date(2026, 6, day).getTime()
}
// « Maintenant » de référence : 18/07/2026, midi local.
const NOW = new Date(2026, 6, 18, 12, 0, 0).getTime()

describe('isOnTime / isMissed', () => {
  it('sans échéance : toujours à temps, jamais manqué', () => {
    expect(isOnTime(null, false, NOW)).toBe(true)
    expect(isMissed(null, false, NOW)).toBe(false)
  })

  it('échéance aujourd’hui (même jour, heure différente) : à temps', () => {
    expect(isOnTime(july(18), false, NOW)).toBe(true)
    expect(isMissed(july(18), false, NOW)).toBe(false)
  })

  it('échéance demain : à temps', () => {
    expect(isOnTime(july(19), false, NOW)).toBe(true)
    expect(isMissed(july(19), false, NOW)).toBe(false)
  })

  it('échéance hier : en retard / manqué', () => {
    expect(isOnTime(july(17), false, NOW)).toBe(false)
    expect(isMissed(july(17), false, NOW)).toBe(true)
  })

  it('horodaté : à temps avant l’instant, manqué après (même jour)', () => {
    const at1842 = new Date(2026, 6, 18, 18, 42).getTime()
    expect(isOnTime(at1842, true, NOW)).toBe(true) // NOW = 12:00
    expect(isMissed(at1842, true, NOW)).toBe(false)
    const at1100 = new Date(2026, 6, 18, 11, 0).getTime()
    expect(isMissed(at1100, true, NOW)).toBe(true) // 11:00 dépassé à 12:00
  })
})

describe('applyCompletion', () => {
  it('à temps : série +1 et record suit s’il est dépassé', () => {
    const s: Streak = { currentStreak: 4, bestStreak: 4 }
    expect(applyCompletion(s, true)).toEqual({ currentStreak: 5, bestStreak: 5 })
  })

  it('à temps depuis 0 : série à 1', () => {
    expect(applyCompletion({ currentStreak: 0, bestStreak: 0 }, true)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
    })
  })

  it('à temps sous le record : le record ne bouge pas', () => {
    const s: Streak = { currentStreak: 2, bestStreak: 7 }
    expect(applyCompletion(s, true)).toEqual({ currentStreak: 3, bestStreak: 7 })
  })

  it('en retard : la série repart à 1, le record est préservé', () => {
    const s: Streak = { currentStreak: 5, bestStreak: 9 }
    expect(applyCompletion(s, false)).toEqual({ currentStreak: 1, bestStreak: 9 })
  })
})

describe('resetIfMissed', () => {
  it('période manquée : série à 0, record préservé', () => {
    const s: Streak = { currentStreak: 6, bestStreak: 8 }
    expect(resetIfMissed(s, july(17), false, NOW)).toEqual({
      currentStreak: 0,
      bestStreak: 8,
    })
  })

  it('échéance aujourd’hui : rien ne change', () => {
    const s: Streak = { currentStreak: 6, bestStreak: 8 }
    expect(resetIfMissed(s, july(18), false, NOW)).toBe(s)
  })

  it('sans échéance : rien ne change', () => {
    const s: Streak = { currentStreak: 3, bestStreak: 3 }
    expect(resetIfMissed(s, null, false, NOW)).toBe(s)
  })
})
