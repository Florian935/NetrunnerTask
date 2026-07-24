import { describe, expect, it } from 'vitest'
import {
  canSecure,
  chargeSurcharge,
  CORRUPTION_PATH_TIERS,
  dopageMultiplier,
  DOPAGE_MAX,
  nextTier,
  pathRewardsFor,
  securedGain,
  SURCHARGE_CONFIG,
  tierVoltageFor,
} from './corruption'

describe('dopageMultiplier — croissant, borné, déterministe', () => {
  it('vaut 1 (neutre) à surcharge 0', () => {
    expect(dopageMultiplier(0)).toBe(1)
  })
  it('vaut DOPAGE_MAX au seuil critique', () => {
    expect(dopageMultiplier(SURCHARGE_CONFIG.critical)).toBeCloseTo(DOPAGE_MAX, 10)
  })
  it('est strictement croissant', () => {
    let prev = -1
    for (let s = 0; s <= SURCHARGE_CONFIG.critical; s += 5) {
      const v = dopageMultiplier(s)
      expect(v).toBeGreaterThan(prev)
      prev = v
    }
  })
  it('borne les surcharges hors plage (clamp)', () => {
    expect(dopageMultiplier(-50)).toBe(1)
    expect(dopageMultiplier(999)).toBeCloseTo(DOPAGE_MAX, 10)
  })
  it('est déterministe (mêmes entrées → mêmes sorties)', () => {
    expect(dopageMultiplier(63)).toBe(dopageMultiplier(63))
  })
})

describe('chargeSurcharge — charge linéaire + krach au seuil', () => {
  it('avance de chargeRatePerSec × dtSec', () => {
    const { surcharge, krached } = chargeSurcharge(10, 1)
    expect(krached).toBe(false)
    expect(surcharge).toBeCloseTo(10 + SURCHARGE_CONFIG.chargeRatePerSec, 10)
  })
  it('krache (reset 0) en atteignant le seuil critique', () => {
    const { surcharge, krached } = chargeSurcharge(SURCHARGE_CONFIG.critical - 1, 1)
    expect(krached).toBe(true)
    expect(surcharge).toBe(0)
  })
  it('no-op si dtSec ≤ 0 (horloge qui recule)', () => {
    expect(chargeSurcharge(42, 0)).toEqual({ surcharge: 42, krached: false })
    expect(chargeSurcharge(42, -3)).toEqual({ surcharge: 42, krached: false })
  })
  it('est déterministe', () => {
    expect(chargeSurcharge(30, 0.5)).toEqual(chargeSurcharge(30, 0.5))
  })
})

describe('securedGain / canSecure', () => {
  it('0 (et sécurisation interdite) sous le seuil minimal', () => {
    expect(securedGain(SURCHARGE_CONFIG.minSecure - 0.5)).toBe(0)
    expect(canSecure(SURCHARGE_CONFIG.minSecure - 0.5)).toBe(false)
    expect(canSecure(SURCHARGE_CONFIG.minSecure)).toBe(true)
  })
  it('est non-linéaire et croissant (viser haut rapporte plus)', () => {
    const g40 = securedGain(40)
    const g80 = securedGain(80)
    expect(g80).toBeGreaterThan(g40 * 2) // convexité : doubler la surcharge > double le gain
  })
  it('renvoie des entiers', () => {
    for (let s = 5; s <= 100; s += 7) expect(Number.isInteger(securedGain(s))).toBe(true)
  })
})

describe('paliers de voie — franchissement déterministe', () => {
  it('les paliers sont strictement croissants', () => {
    for (let i = 1; i < CORRUPTION_PATH_TIERS.length; i++) {
      expect(CORRUPTION_PATH_TIERS[i].voltage).toBeGreaterThan(CORRUPTION_PATH_TIERS[i - 1].voltage)
    }
  })
  it('pathRewardsFor ne renvoie que les paliers franchis (prev, next]', () => {
    expect(pathRewardsFor(0, 100)).toEqual([])
    expect(pathRewardsFor(0, 200)).toEqual(['cor-fracture'])
    expect(pathRewardsFor(0, 700)).toEqual(['cor-fracture', 'cor-aberration'])
    expect(pathRewardsFor(200, 700)).toEqual(['cor-aberration']) // ne re-livre pas le déjà atteint
    expect(pathRewardsFor(3000, 9999)).toEqual([]) // voie complétée
  })
  it('couvre tous les paliers sur une grande amplitude', () => {
    expect(pathRewardsFor(0, 3000)).toEqual(CORRUPTION_PATH_TIERS.map((t) => t.reward))
  })
  it('nextTier / tierVoltageFor', () => {
    expect(nextTier(0)?.voltage).toBe(200)
    expect(nextTier(250)?.voltage).toBe(600)
    expect(nextTier(3000)).toBe(null)
    expect(tierVoltageFor('cor-surtension')).toBe(1400)
    expect(tierVoltageFor('inconnu')).toBeUndefined()
  })
})
