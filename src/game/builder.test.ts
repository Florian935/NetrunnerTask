import { describe, expect, it } from 'vitest'
import {
  BUILDER_CONFIG,
  type BuilderCore,
  buyGenerator,
  buyUpgrade,
  canBuyGenerator,
  canBuyUpgrade,
  dataPerSec,
  GENERATOR_BY_ID,
  generatorCost,
  generatorProduction,
  hack,
  isUnlocked,
  nextLockedGenerator,
  offlineTick,
  type ProductionSegment,
  productionPerSec,
  tick,
  unlockedGenerators,
  upgradeCost,
  upgradeMultiplier,
} from './builder'

const mk = (
  cycles: number,
  generators: Record<string, number> = {},
  upgrades: Record<string, number> = {},
  data = 0,
  unlockedNodes: string[] = [],
): BuilderCore => ({ cycles, generators, upgrades, data, unlockedNodes })

const scraper = GENERATOR_BY_ID.scraper
const sifter = GENERATOR_BY_ID.sifter
const oracle = GENERATOR_BY_ID.oracle

describe('generatorCost — escalade par type', () => {
  it('1ᵉʳ exemplaire = coût de base ; monte géométriquement', () => {
    expect(generatorCost(scraper, 0)).toBe(15)
    expect(generatorCost(scraper, 1)).toBe(18) // 15 × 1,15 = 17,25 → 18
    expect(generatorCost(scraper, 2)).toBe(20) // 15 × 1,15² = 19,84 → 20
  })
  it('coûts indépendants par type', () => {
    expect(generatorCost(sifter, 0)).toBe(180)
  })
})

describe('upgrades — coût, multiplicateur, production', () => {
  it('coût d’upgrade escaladé par niveau', () => {
    expect(upgradeCost(scraper, 0)).toBe(120)
    expect(upgradeCost(scraper, 1)).toBe(384) // 120 × 3,2
  })
  it('multiplicateur = mult^niveau', () => {
    expect(upgradeMultiplier(scraper, 0)).toBe(1)
    expect(upgradeMultiplier(scraper, 1)).toBe(2)
    expect(upgradeMultiplier(scraper, 2)).toBe(4)
  })
  it('production d’un type = possédés × base × multiplicateur', () => {
    expect(generatorProduction(scraper, 5, 0)).toBe(5) // 5 × 1 × 1
    expect(generatorProduction(scraper, 5, 2)).toBe(20) // 5 × 1 × 4
    expect(generatorProduction(sifter, 2, 1)).toBe(32) // 2 × 8 × 2
  })
})

describe('productionPerSec — somme de tous les types', () => {
  it('additionne les productions par type (avec upgrades)', () => {
    // scraper ×3 (lvl0) = 3 ; sifter ×1 (lvl1 → ×2) = 16 → total 19
    expect(
      productionPerSec(mk(0, { scraper: 3, sifter: 1 }, { sifter: 1 })),
    ).toBe(19)
  })
  it('état vierge → 0', () => {
    expect(productionPerSec(mk(0))).toBe(0)
  })
})

describe('déblocage chaîné', () => {
  it('le 1ᵉʳ type est toujours débloqué', () => {
    expect(isUnlocked(scraper, mk(0))).toBe(true)
  })
  it('un type se débloque en possédant ≥ 1 du précédent', () => {
    expect(isUnlocked(sifter, mk(0))).toBe(false)
    expect(isUnlocked(sifter, mk(0, { scraper: 1 }))).toBe(true)
  })
  it('unlockedGenerators / nextLockedGenerator suivent la chaîne', () => {
    expect(unlockedGenerators(mk(0)).map((d) => d.id)).toEqual(['scraper'])
    expect(nextLockedGenerator(mk(0))?.id).toBe('sifter')
    expect(unlockedGenerators(mk(0, { scraper: 1 })).map((d) => d.id)).toEqual([
      'scraper',
      'sifter',
    ])
    expect(nextLockedGenerator(mk(0, { scraper: 1 }))?.id).toBe('wraith')
  })
})

describe('hack', () => {
  it('ajoute manualYield cycle(s), maps inchangées', () => {
    const s = mk(41, { scraper: 2 })
    expect(hack(s).cycles).toBe(42)
    expect(hack(s).generators).toEqual({ scraper: 2 })
  })
})

describe('buyGenerator', () => {
  it('achat impossible si solde < coût → no-op', () => {
    const s = mk(10) // scraper coûte 15
    expect(canBuyGenerator(s, 'scraper')).toBe(false)
    expect(buyGenerator(s, 'scraper')).toBe(s)
  })
  it('achat : débite le coût et incrémente le type', () => {
    const s = mk(20)
    expect(canBuyGenerator(s, 'scraper')).toBe(true)
    const next = buyGenerator(s, 'scraper')
    expect(next.cycles).toBe(5)
    expect(next.generators.scraper).toBe(1)
  })
})

describe('buyUpgrade', () => {
  it('achat impossible si solde < coût → no-op', () => {
    const s = mk(50, { scraper: 3 }) // upgrade scraper lvl0 coûte 120
    expect(canBuyUpgrade(s, 'scraper')).toBe(false)
    expect(buyUpgrade(s, 'scraper')).toBe(s)
  })
  it('achat : débite le coût et incrémente le niveau du type', () => {
    const s = mk(200, { scraper: 3 })
    expect(canBuyUpgrade(s, 'scraper')).toBe(true)
    const next = buyUpgrade(s, 'scraper')
    expect(next.cycles).toBe(80) // 200 − 120
    expect(next.upgrades.scraper).toBe(1)
  })
})

describe('tick — production automatique', () => {
  it('sans production → no-op', () => {
    const s = mk(100)
    expect(tick(s, 1000)).toBe(s)
  })
  it('crédite production/s × dt', () => {
    // scraper ×3 (lvl0) = 3/s × 2 s = 6
    expect(tick(mk(0, { scraper: 3 }), 2000).cycles).toBeCloseTo(6)
  })
  it('dt ≤ 0 → no-op', () => {
    const s = mk(10, { scraper: 5 })
    expect(tick(s, 0)).toBe(s)
    expect(tick(s, -500)).toBe(s)
  })
})

describe('dataPerSec — US-022 (2ᵉ ressource)', () => {
  it('nul tant que le daemon de déblocage (oracle) n’est pas possédé', () => {
    expect(dataPerSec(mk(0, { scraper: 5 }))).toBe(0)
  })
  it('proportionnel à productionPerSec × dataRate une fois oracle possédé', () => {
    const s = mk(0, { scraper: 3, oracle: 1 }) // 3/s scraper + 260/s oracle = 263/s
    expect(dataPerSec(s)).toBeCloseTo(263 * BUILDER_CONFIG.dataRate)
  })
  it('accepte un multiplicateur (composé par l’arbre de déblocage)', () => {
    const s = mk(0, { oracle: 1 })
    expect(dataPerSec(s, 2)).toBeCloseTo(oracle.baseYieldPerSec * BUILDER_CONFIG.dataRate * 2)
  })
})

describe('tick — US-022 (data + multiplicateurs)', () => {
  it('accrue aussi `data` une fois oracle possédé', () => {
    const s = mk(0, { oracle: 1 })
    const next = tick(s, 1000)
    expect(next.data).toBeCloseTo(oracle.baseYieldPerSec * BUILDER_CONFIG.dataRate)
  })
  it('sans oracle, `data` reste à 0 (non-régression A1/A2)', () => {
    expect(tick(mk(0, { scraper: 3 }), 1000).data).toBe(0)
  })
  it('applique les multiplicateurs cycles/data fournis', () => {
    const s = mk(0, { scraper: 3, oracle: 1 })
    const withoutMult = tick(s, 1000)
    const withMult = tick(s, 1000, { cycles: 2, data: 3 })
    expect(withMult.cycles).toBeCloseTo((withoutMult.cycles - s.cycles) * 2 + s.cycles)
    expect(withMult.data).toBeCloseTo((withoutMult.data - s.data) * 3 + s.data)
  })
  it('défaut (pas de multiplicateur passé) = comportement inchangé', () => {
    const s = mk(0, { scraper: 3 })
    expect(tick(s, 2000).cycles).toBeCloseTo(6)
  })
})

describe('offlineTick — rattrapage hors-ligne US-024', () => {
  const neutral: ProductionSegment[] = [{ untilMs: Infinity, cycles: 1, data: 1 }]

  it('toMs ≤ fromMs → no-op (même référence)', () => {
    const s = mk(0, { scraper: 3 })
    expect(offlineTick(s, 1000, 1000, neutral)).toBe(s)
    expect(offlineTick(s, 2000, 1000, neutral)).toBe(s)
  })

  it('segment unique neutre = équivalent à un tick sur toute la durée', () => {
    const s = mk(0, { scraper: 3 }) // 3/s
    const next = offlineTick(s, 0, 10_000, neutral) // 10 s
    expect(next.cycles).toBeCloseTo(30)
  })

  it('2 segments : boost puis neutre (borne intermédiaire respectée)', () => {
    const s = mk(0, { scraper: 3 }) // 3/s
    // de 0 à 10 s : 0→4 s ×2 (24) + 4→10 s ×1 (18) = 42
    const schedule: ProductionSegment[] = [
      { untilMs: 4000, cycles: 2, data: 1 },
      { untilMs: Infinity, cycles: 1, data: 1 },
    ]
    expect(offlineTick(s, 0, 10_000, schedule).cycles).toBeCloseTo(42)
  })

  it('3 segments : neutre → boosté → neutre (run devenu SURCADENCE hors-ligne)', () => {
    const s = mk(0, { scraper: 10 }) // 10/s
    // 0→2 s ×1 (20) + 2→5 s ×2 (60) + 5→8 s ×1 (30) = 110
    const schedule: ProductionSegment[] = [
      { untilMs: 2000, cycles: 1, data: 1 },
      { untilMs: 5000, cycles: 2, data: 1 },
      { untilMs: Infinity, cycles: 1, data: 1 },
    ]
    expect(offlineTick(s, 0, 8000, schedule).cycles).toBeCloseTo(110)
  })

  it('crédite aussi `data` selon les multiplicateurs par segment', () => {
    const s = mk(0, { oracle: 1 }) // data active
    const base = oracle.baseYieldPerSec * BUILDER_CONFIG.dataRate // data/s à ×1
    // 0→10 s ×3 data
    const schedule: ProductionSegment[] = [{ untilMs: Infinity, cycles: 1, data: 3 }]
    expect(offlineTick(s, 0, 10_000, schedule).data).toBeCloseTo(base * 3 * 10)
  })

  it('un segment entièrement avant fromMs est ignoré', () => {
    const s = mk(0, { scraper: 3 })
    // 1er segment se termine à 500 (< fromMs 1000) → ignoré ; on tick 1000→3000 ×1
    const schedule: ProductionSegment[] = [
      { untilMs: 500, cycles: 99, data: 1 },
      { untilMs: Infinity, cycles: 1, data: 1 },
    ]
    expect(offlineTick(s, 1000, 3000, schedule).cycles).toBeCloseTo(6) // 3/s × 2 s
  })
})
