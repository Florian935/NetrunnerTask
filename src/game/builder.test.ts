import { describe, expect, it } from 'vitest'
import {
  BUILDER_CONFIG,
  buyGenerator,
  canBuyGenerator,
  hack,
  nextGeneratorCost,
  productionPerSec,
  tick,
} from './builder'

describe('nextGeneratorCost — coût escaladé', () => {
  it('1ᵉʳ daemon = coût de base', () => {
    expect(nextGeneratorCost(0)).toBe(BUILDER_CONFIG.generator.baseCost) // 15
  })

  it('monte géométriquement (×growth, arrondi au supérieur)', () => {
    expect(nextGeneratorCost(1)).toBe(18) // 15 × 1,15 = 17,25 → 18
    expect(nextGeneratorCost(2)).toBe(20) // 15 × 1,15² = 19,84 → 20
  })
})

describe('productionPerSec', () => {
  it('0 daemon → 0/s', () => {
    expect(productionPerSec(0)).toBe(0)
  })

  it('linéaire avec le nombre possédé', () => {
    expect(productionPerSec(5)).toBe(5 * BUILDER_CONFIG.generator.yieldPerSec)
  })
})

describe('hack — production manuelle', () => {
  it('ajoute manualYield cycles sans toucher aux daemons', () => {
    expect(hack({ cycles: 0, generatorCount: 0 }).cycles).toBe(
      BUILDER_CONFIG.manualYield,
    )
    expect(hack({ cycles: 41, generatorCount: 2 })).toEqual({
      cycles: 41 + BUILDER_CONFIG.manualYield,
      generatorCount: 2,
    })
  })
})

describe('canBuyGenerator / buyGenerator', () => {
  it('achat impossible si solde < coût → no-op (référence inchangée)', () => {
    const s = { cycles: 10, generatorCount: 0 } // coût 15
    expect(canBuyGenerator(s)).toBe(false)
    expect(buyGenerator(s)).toBe(s)
  })

  it('achat possible : débite le coût et incrémente', () => {
    const s = { cycles: 20, generatorCount: 0 } // coût 15
    expect(canBuyGenerator(s)).toBe(true)
    expect(buyGenerator(s)).toEqual({ cycles: 5, generatorCount: 1 })
  })

  it('solde exactement égal au coût → achetable', () => {
    expect(canBuyGenerator({ cycles: 15, generatorCount: 0 })).toBe(true)
    expect(buyGenerator({ cycles: 15, generatorCount: 0 })).toEqual({
      cycles: 0,
      generatorCount: 1,
    })
  })
})

describe('tick — production automatique', () => {
  it('sans daemon → inchangé (no-op)', () => {
    const s = { cycles: 100, generatorCount: 0 }
    expect(tick(s, 1000)).toBe(s)
  })

  it('crédite production/s × dt', () => {
    // 3 daemons × 1/s × 2 s = 6
    expect(tick({ cycles: 0, generatorCount: 3 }, 2000).cycles).toBeCloseTo(6)
  })

  it('dt ≤ 0 → no-op (horloge qui recule)', () => {
    const s = { cycles: 10, generatorCount: 5 }
    expect(tick(s, 0)).toBe(s)
    expect(tick(s, -500)).toBe(s)
  })
})
