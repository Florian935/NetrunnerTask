import { describe, expect, it } from 'vitest'
import { firstOccurrence, nextOccurrence } from './recurrence'

/** Minuit local d'un jour de juillet 2026. */
function july(day: number): number {
  return new Date(2026, 6, day).getTime()
}
/** ISO weekday (1 = lundi … 7 = dimanche) d'un epoch ms. */
function isoWeekday(ms: number): number {
  const d = new Date(ms).getDay()
  return d === 0 ? 7 : d
}

// « Maintenant » de référence : 18/07/2026, midi local.
const NOW = new Date(2026, 6, 18, 12, 0, 0).getTime()

describe('nextOccurrence — intervalle', () => {
  it('quotidien (tous les 1 jour), échéance aujourd’hui → demain', () => {
    expect(
      nextOccurrence(
        { mode: 'interval', every: 1, unit: 'day' },
        july(18),
        NOW,
      ),
    ).toBe(july(19))
  })

  it('tous les 2 jours, échéance aujourd’hui → +2 j', () => {
    expect(
      nextOccurrence(
        { mode: 'interval', every: 2, unit: 'day' },
        july(18),
        NOW,
      ),
    ).toBe(july(20))
  })

  it('hebdomadaire (toutes les 1 semaine) → +7 j', () => {
    expect(
      nextOccurrence(
        { mode: 'interval', every: 1, unit: 'week' },
        july(18),
        NOW,
      ),
    ).toBe(july(25))
  })

  it('sans échéance → ancre sur aujourd’hui', () => {
    expect(
      nextOccurrence({ mode: 'interval', every: 1, unit: 'day' }, null, NOW),
    ).toBe(july(19))
  })

  it('mensuel (tous les 1 mois) → même quantième le mois suivant', () => {
    expect(
      nextOccurrence(
        { mode: 'interval', every: 1, unit: 'month' },
        july(18),
        NOW,
      ),
    ).toBe(new Date(2026, 7, 18).getTime())
  })

  it('mensuel : clamp en fin de mois court (31 janv. → 28 févr.)', () => {
    const now = new Date(2027, 0, 31, 12).getTime()
    expect(
      nextOccurrence(
        { mode: 'interval', every: 1, unit: 'month' },
        new Date(2027, 0, 31).getTime(),
        now,
      ),
    ).toBe(new Date(2027, 1, 28).getTime())
  })

  it('en retard : roll-forward jusqu’à la première occurrence future (phase préservée)', () => {
    // tous les 2 jours, ancré au 15 (15,17,19,…), aujourd’hui = 18 → 19.
    expect(
      nextOccurrence(
        { mode: 'interval', every: 2, unit: 'day' },
        july(15),
        NOW,
      ),
    ).toBe(july(19))
  })
})

describe('firstOccurrence — échéance initiale posée à la définition', () => {
  it('intervalle → dû dès aujourd’hui', () => {
    expect(
      firstOccurrence({ mode: 'interval', every: 3, unit: 'day' }, NOW),
    ).toBe(july(18))
    expect(
      firstOccurrence({ mode: 'interval', every: 2, unit: 'month' }, NOW),
    ).toBe(july(18))
  })

  it('jour de semaine = aujourd’hui → aujourd’hui (inclus)', () => {
    const today = isoWeekday(NOW)
    expect(firstOccurrence({ mode: 'weekday', weekday: today }, NOW)).toBe(
      july(18),
    )
  })

  it('jour de semaine à venir → prochaine occurrence (≤ 6 j)', () => {
    const target = (isoWeekday(NOW) % 7) + 1 // le lendemain (jour ISO valide)
    const next = firstOccurrence({ mode: 'weekday', weekday: target }, NOW)
    expect(isoWeekday(next)).toBe(target)
    expect(next).toBe(july(19))
  })
})

describe('nextOccurrence — jour de semaine', () => {
  it('même jour que la cadence → +7 j (strictement après aujourd’hui)', () => {
    const target = isoWeekday(NOW)
    const next = nextOccurrence(
      { mode: 'weekday', weekday: target },
      july(18),
      NOW,
    )
    expect(isoWeekday(next)).toBe(target)
    expect(next).toBe(july(25)) // 18 + 7
  })

  it('jour à venir dans la semaine → prochaine occurrence de ce jour', () => {
    const target = ((isoWeekday(NOW) + 1) % 7) + 1 // un autre jour ISO valide
    const next = nextOccurrence(
      { mode: 'weekday', weekday: target },
      july(18),
      NOW,
    )
    expect(isoWeekday(next)).toBe(target)
    expect(next).toBeGreaterThan(new Date(2026, 6, 18).getTime())
    expect(next).toBeLessThanOrEqual(july(25))
  })
})
