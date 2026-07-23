import { describe, expect, it } from 'vitest'
import {
  collectionByRarity,
  collectionTotals,
  remainingOfRarity,
} from './collection'
import { COSMETICS, STARTER_COSMETICS } from './cosmetics'

describe('collectionByRarity', () => {
  it('couvre les 5 crans dans l’ordre', () => {
    const p = collectionByRarity([])
    expect(p.map((x) => x.rarity)).toEqual([
      'common',
      'enhanced',
      'rare',
      'epic',
      'legendary',
    ])
  })

  it('somme des totaux = taille du catalogue', () => {
    const total = collectionByRarity([]).reduce((a, x) => a + x.total, 0)
    expect(total).toBe(COSMETICS.length)
  })

  it('à vide : 0 possédé partout', () => {
    expect(collectionByRarity([]).every((x) => x.owned === 0)).toBe(true)
  })

  it('tout possédé : owned = total sur chaque cran', () => {
    const all = COSMETICS.map((c) => c.id)
    expect(collectionByRarity(all).every((x) => x.owned === x.total)).toBe(true)
  })

  it('ignore les id inconnus', () => {
    const p = collectionByRarity(['inconnu-x'])
    expect(p.reduce((a, x) => a + x.owned, 0)).toBe(0)
  })
})

describe('collectionTotals', () => {
  it('compte les possédés présents au catalogue', () => {
    expect(collectionTotals([...STARTER_COSMETICS]).owned).toBe(
      STARTER_COSMETICS.length,
    )
    expect(collectionTotals([]).total).toBe(COSMETICS.length)
  })
})

describe('remainingOfRarity', () => {
  it('renvoie le total du cran quand rien n’est possédé', () => {
    const legTotal = collectionByRarity([]).find((x) => x.rarity === 'legendary')!.total
    expect(remainingOfRarity([], 'legendary')).toBe(legTotal)
  })
})
