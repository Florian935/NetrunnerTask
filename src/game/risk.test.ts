import { describe, expect, it } from 'vitest'
import {
  isStakeEligible,
  isStakeLost,
  STAKE_MULTIPLIERS,
  stakePayout,
} from './risk'

// Jours locaux fixes pour les comparaisons d'échéance (au jour, comme US-006).
const day = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h).getTime()
const DUE = day(2026, 7, 19) // échéance : 19/07/2026 (posée à midi ici)

describe('STAKE_MULTIPLIERS — barème par difficulté', () => {
  it('suit le barème 1,5 / 2 / 2,5 / 3 / 4', () => {
    expect(STAKE_MULTIPLIERS.trivial).toBe(1.5)
    expect(STAKE_MULTIPLIERS.easy).toBe(2)
    expect(STAKE_MULTIPLIERS.medium).toBe(2.5)
    expect(STAKE_MULTIPLIERS.hard).toBe(3)
    expect(STAKE_MULTIPLIERS.legendary).toBe(4)
  })
})

describe('stakePayout — retour total (mise × multiplicateur)', () => {
  it('applique le multiplicateur de la difficulté', () => {
    expect(stakePayout(120, 'trivial')).toBe(180) // 120 × 1,5
    expect(stakePayout(120, 'easy')).toBe(240) // 120 × 2
    expect(stakePayout(120, 'medium')).toBe(300) // 120 × 2,5
    expect(stakePayout(120, 'hard')).toBe(360) // 120 × 3
    expect(stakePayout(120, 'legendary')).toBe(480) // 120 × 4
  })

  it('arrondit à l’entier (multiplicateurs à virgule)', () => {
    expect(stakePayout(5, 'trivial')).toBe(8) // 7,5 → 8
    expect(stakePayout(3, 'medium')).toBe(8) // 7,5 → 8
    expect(stakePayout(1, 'trivial')).toBe(2) // 1,5 → 2
  })

  it('mise nulle → retour nul', () => {
    expect(stakePayout(0, 'legendary')).toBe(0)
  })
})

describe('isStakeEligible — one-shot, à échéance, ouvert', () => {
  const base = {
    recurrence: null,
    dueDate: DUE,
    status: 'open' as const,
  }

  it('éligible : one-shot ouvert avec échéance', () => {
    expect(isStakeEligible(base)).toBe(true)
  })

  it('non éligible : sans échéance', () => {
    expect(isStakeEligible({ ...base, dueDate: null })).toBe(false)
  })

  it('non éligible : récurrent', () => {
    expect(
      isStakeEligible({
        ...base,
        recurrence: { mode: 'interval', every: 1, unit: 'week' },
      }),
    ).toBe(false)
  })

  it('non éligible : déjà terminé', () => {
    expect(isStakeEligible({ ...base, status: 'done' })).toBe(false)
  })
})

describe('isStakeLost — pending, ouvert, échéance dépassée', () => {
  const base = {
    stakeOutcome: 'pending' as const,
    dueDate: DUE,
    status: 'open' as const,
  }

  it('perdu : le jour d’échéance est strictement passé', () => {
    expect(isStakeLost(base, day(2026, 7, 20))).toBe(true)
  })

  it('pas perdu : le jour même de l’échéance reste gagnable', () => {
    expect(isStakeLost(base, day(2026, 7, 19, 23))).toBe(false)
  })

  it('pas perdu : avant l’échéance', () => {
    expect(isStakeLost(base, day(2026, 7, 18))).toBe(false)
  })

  it('pas perdu : mise non en jeu (none / won / lost)', () => {
    const late = day(2026, 7, 20)
    expect(isStakeLost({ ...base, stakeOutcome: 'none' }, late)).toBe(false)
    expect(isStakeLost({ ...base, stakeOutcome: 'won' }, late)).toBe(false)
    expect(isStakeLost({ ...base, stakeOutcome: 'lost' }, late)).toBe(false)
  })

  it('pas perdu : contrat déjà terminé (gagné avant résolution)', () => {
    expect(isStakeLost({ ...base, status: 'done' }, day(2026, 7, 20))).toBe(
      false,
    )
  })

  it('pas perdu : sans échéance (rien pour déclencher la perte)', () => {
    expect(isStakeLost({ ...base, dueDate: null }, day(2026, 7, 20))).toBe(false)
  })
})
