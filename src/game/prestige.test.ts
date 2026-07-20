import { describe, expect, it } from 'vitest'
import {
  canPrestige,
  PRESTIGE_CONFIG,
  prestige,
  prestigeMultiplier,
  type PrestigeCore,
} from './prestige'

const mk = (over: Partial<PrestigeCore> = {}): PrestigeCore => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  unlockedNodes: [],
  prestigeCount: 0,
  ...over,
})

describe('canPrestige', () => {
  it('faux sous le seuil', () => {
    expect(canPrestige(mk({ cycles: PRESTIGE_CONFIG.threshold - 1 }))).toBe(false)
  })
  it('vrai au seuil exact', () => {
    expect(canPrestige(mk({ cycles: PRESTIGE_CONFIG.threshold }))).toBe(true)
  })
})

describe('prestigeMultiplier — composition géométrique', () => {
  it('0 renaissance → 1 (neutre)', () => {
    expect(prestigeMultiplier(0)).toBe(1)
  })
  it('composé, pas additif (1,5 ** n)', () => {
    expect(prestigeMultiplier(1)).toBeCloseTo(1.5)
    expect(prestigeMultiplier(2)).toBeCloseTo(2.25)
    expect(prestigeMultiplier(3)).toBeCloseTo(3.375)
  })
})

describe('prestige', () => {
  it('no-op (même référence) sous le seuil', () => {
    const s = mk({ cycles: 10 })
    expect(prestige(s)).toBe(s)
  })
  it('réinitialise la progression du Réseau et incrémente le compteur', () => {
    const s = mk({
      cycles: PRESTIGE_CONFIG.threshold + 500,
      generators: { scraper: 12, oracle: 1 },
      upgrades: { scraper: 3 },
      data: 800,
      unlockedNodes: ['overclock', 'parallelism'],
      prestigeCount: 1,
    })
    const next = prestige(s)
    expect(next.cycles).toBe(0)
    expect(next.generators).toEqual({})
    expect(next.upgrades).toEqual({})
    expect(next.data).toBe(0)
    expect(next.unlockedNodes).toEqual([])
    expect(next.prestigeCount).toBe(2)
  })
  it('préserve les champs hors PrestigeCore (spread) — ex. accélérateur', () => {
    const s = {
      ...mk({ cycles: PRESTIGE_CONFIG.threshold }),
      acceleratorBoost: { id: 'focus', endsAt: 9999 },
    }
    const next = prestige(s)
    expect(next.acceleratorBoost).toEqual({ id: 'focus', endsAt: 9999 })
  })
})
