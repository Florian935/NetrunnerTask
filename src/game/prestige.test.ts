import { describe, expect, it } from 'vitest'
import {
  canPrestige,
  PRESTIGE_CONFIG,
  prestige,
  prestigeMultiplier,
  prestigeThreshold,
  type PrestigeCore,
} from './prestige'

const mk = (over: Partial<PrestigeCore> = {}): PrestigeCore => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  crypto: 0,
  unlockedNodes: [],
  prestigeCount: 0,
  ...over,
})

describe('prestigeThreshold — seuil incrémental (US-026)', () => {
  it('count 0 → seuil de base', () => {
    expect(prestigeThreshold(0)).toBe(PRESTIGE_CONFIG.base)
    expect(prestigeThreshold(0)).toBe(1_000_000)
  })
  it('croissance géométrique base × growth ** count', () => {
    expect(prestigeThreshold(1)).toBe(2_500_000)
    expect(prestigeThreshold(2)).toBe(6_250_000)
    expect(prestigeThreshold(3)).toBe(15_625_000)
  })
  it('strictement croissant en count (C3)', () => {
    for (let n = 0; n < 10; n++) {
      expect(prestigeThreshold(n + 1)).toBeGreaterThan(prestigeThreshold(n))
    }
  })
  it('anti-boucle (C4) : seuil / bonus permanent strictement croissant', () => {
    // growth (2,5) > nextMult (1,5) ⇒ l'effort relatif d'une renaissance monte.
    for (let n = 0; n < 10; n++) {
      const ratio = (k: number) => prestigeThreshold(k) / prestigeMultiplier(k)
      expect(ratio(n + 1)).toBeGreaterThan(ratio(n))
    }
  })
  it('invariant de config : growth > nextMult', () => {
    expect(PRESTIGE_CONFIG.growth).toBeGreaterThan(PRESTIGE_CONFIG.nextMult)
  })
})

describe('canPrestige', () => {
  it('faux sous le seuil (count 0)', () => {
    expect(canPrestige(mk({ cycles: prestigeThreshold(0) - 1 }))).toBe(false)
  })
  it('vrai au seuil exact (count 0)', () => {
    expect(canPrestige(mk({ cycles: prestigeThreshold(0) }))).toBe(true)
  })
  it('éligibilité recalculée sur le seuil du prestigeCount courant', () => {
    // Après quelques renaissances, l'ancien seuil ne suffit plus (C6).
    const cycles = prestigeThreshold(0)
    expect(canPrestige(mk({ cycles, prestigeCount: 0 }))).toBe(true)
    expect(canPrestige(mk({ cycles, prestigeCount: 2 }))).toBe(false)
    expect(canPrestige(mk({ cycles: prestigeThreshold(2), prestigeCount: 2 }))).toBe(true)
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
  it('réinitialise la progression du Réseau (dont crypto) et incrémente le compteur', () => {
    const s = mk({
      cycles: prestigeThreshold(1) + 500,
      generators: { scraper: 12, oracle: 1 },
      upgrades: { scraper: 3 },
      data: 800,
      crypto: 120,
      unlockedNodes: ['overclock', 'parallelism', 'breach-market'],
      prestigeCount: 1,
    })
    const next = prestige(s)
    expect(next.cycles).toBe(0)
    expect(next.generators).toEqual({})
    expect(next.upgrades).toEqual({})
    expect(next.data).toBe(0)
    expect(next.crypto).toBe(0)
    expect(next.unlockedNodes).toEqual([])
    expect(next.prestigeCount).toBe(2)
  })
  it('préserve les champs hors PrestigeCore (spread) — ex. accélérateur', () => {
    const s = {
      ...mk({ cycles: prestigeThreshold(0) }),
      acceleratorBoost: { id: 'focus', endsAt: 9999 },
    }
    const next = prestige(s)
    expect(next.acceleratorBoost).toEqual({ id: 'focus', endsAt: 9999 })
  })
})
