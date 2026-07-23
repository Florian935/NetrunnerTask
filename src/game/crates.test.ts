import { describe, expect, it } from 'vitest'
import {
  CONSOLATION_CREDITS,
  CRATE_ODDS,
  CRATE_QUALITIES,
  openCrate,
  type CrateQuality,
} from './crates'
import type { Cosmetic, Rarity } from './cosmetics'

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
      const sum = Object.values(CRATE_ODDS[q]).reduce((a, w) => a + w, 0)
      expect(sum).toBe(100)
    }
  })

  it('qualité montante = plus de chances de hautes raretés', () => {
    expect(CRATE_ODDS.blackice.legendary).toBeGreaterThan(CRATE_ODDS.secured.legendary)
    expect(CRATE_ODDS.secured.legendary).toBeGreaterThan(CRATE_ODDS.standard.legendary)
    expect(CRATE_ODDS.standard.common).toBeGreaterThan(CRATE_ODDS.blackice.common)
  })
})

describe('openCrate — tirage', () => {
  it('renvoie un cosmétique du pool', () => {
    const draw = openCrate('standard', [], POOL, seq([0, 0]))
    expect(draw.kind).toBe('cosmetic')
    if (draw.kind === 'cosmetic') {
      expect(POOL.some((c) => c.id === draw.id)).toBe(true)
    }
  })

  it('rng bas → rareté la plus basse disponible (commun)', () => {
    // roll = 0 → premier cran ; 2ᵉ rng = 0 → 1ᵉʳ item du cran.
    const draw = openCrate('standard', [], POOL, seq([0, 0]))
    expect(draw).toEqual({ kind: 'cosmetic', id: 'c-common-1' })
  })

  it('rng haut → rareté la plus haute (légendaire)', () => {
    const draw = openCrate('standard', [], POOL, seq([0.999, 0]))
    expect(draw).toEqual({ kind: 'cosmetic', id: 'c-legendary-1' })
  })

  it('respecte la table par qualité (même rng, distribution différente)', () => {
    // roll = 0.15*100 = 15 : standard → commun (0-55) ; blackice → 8-30 = amélioré.
    const r = () => 0.15
    const s = openCrate('standard', [], POOL, seq([0.15, 0]))
    const b = openCrate('blackice', [], POOL, seq([0.15, 0]))
    void r
    expect(s).toEqual({ kind: 'cosmetic', id: 'c-common-1' })
    expect(b).toEqual({ kind: 'cosmetic', id: 'c-enhanced-1' })
  })
})

describe('openCrate — anti-doublon (C6)', () => {
  it('ne renvoie jamais un item déjà possédé tant qu’il reste du neuf', () => {
    // Tout possédé sauf un légendaire : quelle que soit la graine, on l’obtient.
    const owned = POOL.filter((c) => c.id !== 'c-legendary-2').map((c) => c.id)
    for (const v of [0, 0.2, 0.5, 0.8, 0.999]) {
      const draw = openCrate('standard', owned, POOL, seq([v, v]))
      expect(draw).toEqual({ kind: 'cosmetic', id: 'c-legendary-2' })
    }
  })

  it('renormalise sur les raretés encore disponibles', () => {
    // Plus aucun commun/amélioré/rare/épique dispo → seul le légendaire reste.
    const owned = POOL.filter((c) => c.rarity !== 'legendary').map((c) => c.id)
    const draw = openCrate('standard', owned, POOL, seq([0, 0]))
    expect(draw.kind).toBe('cosmetic')
    if (draw.kind === 'cosmetic') expect(draw.id).toBe('c-legendary-1')
  })
})

describe('openCrate — pool épuisé (décision #3)', () => {
  it('renvoie une consolation crédits quand tout est possédé', () => {
    const owned = POOL.map((c) => c.id)
    const draw = openCrate('blackice', owned, POOL, seq([0.5]))
    expect(draw).toEqual({ kind: 'credits', amount: CONSOLATION_CREDITS })
  })
})

describe('openCrate — déterminisme', () => {
  it('même séquence rng → même résultat', () => {
    const a = openCrate('secured', [], POOL, seq([0.4, 0.7]))
    const b = openCrate('secured', [], POOL, seq([0.4, 0.7]))
    expect(a).toEqual(b)
  })

  it('couvre toutes les raretés du pool sur un balayage', () => {
    const seen = new Set<Rarity>()
    const byId = new Map(POOL.map((c) => [c.id, c.rarity]))
    for (let i = 0; i <= 100; i++) {
      const draw = openCrate('blackice', [], POOL, seq([i / 100, 0]))
      if (draw.kind === 'cosmetic') seen.add(byId.get(draw.id)!)
    }
    expect(seen.size).toBe(5)
  })
})

// Garde-fou de typage : la signature accepte bien une qualité littérale.
const _q: CrateQuality = 'standard'
void _q
