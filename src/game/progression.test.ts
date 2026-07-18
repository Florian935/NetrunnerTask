import { describe, expect, it } from 'vitest'
import { levelForXp, progressionFor, xpToReachLevel } from './progression'

describe('xpToReachLevel — courbe 100 × n (US-009)', () => {
  it('donne 0 XP pour atteindre le niveau 1 (départ)', () => {
    expect(xpToReachLevel(1)).toBe(0)
  })

  it('suit la courbe cumulée 50 × L × (L − 1)', () => {
    expect(xpToReachLevel(2)).toBe(100)
    expect(xpToReachLevel(3)).toBe(300)
    expect(xpToReachLevel(4)).toBe(600)
    expect(xpToReachLevel(5)).toBe(1000)
  })
})

describe('levelForXp', () => {
  it('0 XP → niveau 1', () => {
    expect(levelForXp(0)).toBe(1)
  })

  it('reste au niveau 1 juste avant le palier', () => {
    expect(levelForXp(99)).toBe(1)
  })

  it('passe au niveau supérieur pile sur le seuil', () => {
    expect(levelForXp(100)).toBe(2)
    expect(levelForXp(300)).toBe(3)
    expect(levelForXp(600)).toBe(4)
  })

  it('gère une XP largement au-dessus d’un seuil (montée multi-paliers)', () => {
    expect(levelForXp(350)).toBe(3)
    expect(levelForXp(999)).toBe(4)
  })
})

describe('progressionFor', () => {
  it('critère 1 — départ neutre : niveau 1, 0 %', () => {
    expect(progressionFor(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 100,
      pct: 0,
    })
  })

  it('critère 2 — progression intra-niveau : 25 XP → 25 / 100 (25 %)', () => {
    expect(progressionFor(25)).toEqual({
      level: 1,
      xpIntoLevel: 25,
      xpForNextLevel: 100,
      pct: 25,
    })
  })

  it('critère 3 — montée d’un niveau : 100 XP → niveau 2, 0 / 200', () => {
    expect(progressionFor(100)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 200,
      pct: 0,
    })
  })

  it('critère 4 — montée multi-niveaux : 350 XP → niveau 3, 50 / 300', () => {
    expect(progressionFor(350)).toEqual({
      level: 3,
      xpIntoLevel: 50,
      xpForNextLevel: 300,
      pct: (50 / 300) * 100,
    })
  })
})
