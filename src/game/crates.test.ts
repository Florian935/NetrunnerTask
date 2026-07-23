import { describe, expect, it } from 'vitest'
import {
  canForge,
  CRATE_ODDS,
  CRATE_QUALITIES,
  FORGE_COST,
  FRAGMENT_VALUE,
  openCrate,
  PITY_CONFIG,
} from './crates'
import { RARITY_ORDER, type Cosmetic } from './cosmetics'

/** Petit pool synthétique : 2 items par cran (ids stables pour les assertions). */
const POOL: Cosmetic[] = [
  { id: 'c-common-1', type: 'avatar', rarity: 'common' },
  { id: 'c-common-2', type: 'title', rarity: 'common' },
  { id: 'c-enhanced-1', type: 'banner', rarity: 'enhanced' },
  { id: 'c-enhanced-2', type: 'avatar', rarity: 'enhanced' },
  { id: 'c-rare-1', type: 'title', rarity: 'rare' },
  { id: 'c-rare-2', type: 'banner', rarity: 'rare' },
  { id: 'c-epic-1', type: 'avatar', rarity: 'epic' },
  { id: 'c-epic-2', type: 'title', rarity: 'epic' },
  { id: 'c-legendary-1', type: 'theme', rarity: 'legendary' },
  { id: 'c-legendary-2', type: 'banner', rarity: 'legendary' },
]

/** RNG déterministe rejouant une séquence (boucle si épuisée). */
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

describe('CRATE_ODDS', () => {
  it('couvre les 3 qualités', () => {
    expect(CRATE_QUALITIES).toEqual(['standard', 'secured', 'blackice'])
  })

  it('chaque qualité somme à 100 (C3)', () => {
    for (const q of CRATE_QUALITIES) {
      expect(Object.values(CRATE_ODDS[q]).reduce((a, w) => a + w, 0)).toBe(100)
    }
  })

  it('qualité montante = plus de chances de hautes raretés', () => {
    expect(CRATE_ODDS.blackice.legendary).toBeGreaterThan(CRATE_ODDS.standard.legendary)
    expect(CRATE_ODDS.standard.common).toBeGreaterThan(CRATE_ODDS.blackice.common)
  })
})

describe('barème fragments / forge', () => {
  it('valeur de doublon croissante avec la rareté', () => {
    const vals = RARITY_ORDER.map((r) => FRAGMENT_VALUE[r])
    expect(vals).toEqual([...vals].sort((a, b) => a - b))
  })

  it('coût de forge croissant avec la rareté', () => {
    const vals = RARITY_ORDER.map((r) => FORGE_COST[r])
    expect(vals).toEqual([...vals].sort((a, b) => a - b))
  })

  it('forger coûte plus qu’un doublon du même cran (filet, pas raccourci)', () => {
    for (const r of RARITY_ORDER) expect(FORGE_COST[r]).toBeGreaterThan(FRAGMENT_VALUE[r])
  })

  it('canForge compare au coût du cran', () => {
    expect(canForge(FORGE_COST.rare, 'rare')).toBe(true)
    expect(canForge(FORGE_COST.rare - 1, 'rare')).toBe(false)
  })
})

describe('openCrate — nouveau vs doublon', () => {
  it('rng bas → cran le plus bas, item neuf (cosmétique)', () => {
    const { draw, pity } = openCrate('standard', [], POOL, 0, seq([0, 0]))
    expect(draw).toEqual({ kind: 'cosmetic', id: 'c-common-1' })
    expect(pity).toBe(1) // commun ≠ légendaire → +1
  })

  it('rng haut → légendaire (et réinitialise le pity)', () => {
    const { draw, pity } = openCrate('standard', [], POOL, 7, seq([0.999, 0]))
    expect(draw).toEqual({ kind: 'cosmetic', id: 'c-legendary-1' })
    expect(pity).toBe(0)
  })

  it('item déjà possédé → doublon converti en fragments (dupId + montant)', () => {
    const { draw } = openCrate('standard', ['c-common-1'], POOL, 0, seq([0, 0]))
    expect(draw).toEqual({ kind: 'fragments', amount: FRAGMENT_VALUE.common, dupId: 'c-common-1' })
  })

  it('respecte la table par qualité (même rng, cran différent)', () => {
    // roll = 0.15 : standard → commun (0-55) ; blackice → amélioré (8-30).
    const s = openCrate('standard', [], POOL, 0, seq([0.15, 0]))
    const b = openCrate('blackice', [], POOL, 0, seq([0.15, 0]))
    expect(s.draw).toEqual({ kind: 'cosmetic', id: 'c-common-1' })
    expect(b.draw).toEqual({ kind: 'cosmetic', id: 'c-enhanced-1' })
  })
})

describe('openCrate — pity (filet anti-malchance)', () => {
  it('incrémente tant qu’aucun légendaire', () => {
    const { pity } = openCrate('standard', [], POOL, 3, seq([0, 0])) // commun
    expect(pity).toBe(4)
  })

  it('force le légendaire au seuil, quel que soit le rng', () => {
    // pity = threshold - 1 → forcé ; rng bas viserait commun, mais légendaire imposé.
    const { draw, pity } = openCrate('standard', [], POOL, PITY_CONFIG.threshold - 1, seq([0, 0]))
    expect(draw).toEqual({ kind: 'cosmetic', id: 'c-legendary-1' })
    expect(pity).toBe(0) // réinitialisé
  })

  it('un légendaire forcé mais déjà possédé retombe en fragments', () => {
    const owned = ['c-legendary-1', 'c-legendary-2']
    const { draw, pity } = openCrate('standard', owned, POOL, PITY_CONFIG.threshold - 1, seq([0]))
    expect(draw.kind).toBe('fragments')
    if (draw.kind === 'fragments') expect(draw.amount).toBe(FRAGMENT_VALUE.legendary)
    expect(pity).toBe(0)
  })
})

describe('openCrate — déterminisme', () => {
  it('même séquence rng + même pity → même résultat', () => {
    const a = openCrate('secured', [], POOL, 5, seq([0.4, 0.7]))
    const b = openCrate('secured', [], POOL, 5, seq([0.4, 0.7]))
    expect(a).toEqual(b)
  })
})
