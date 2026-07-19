import { describe, expect, it } from 'vitest'
import {
  applyReputationDelta,
  rankForReputation,
  REPUTATION_RANKS,
  reputationGain,
  reputationProgress,
} from './reputation'

describe('reputationGain — barème par difficulté', () => {
  it('suit le barème 1/2/4/7/12', () => {
    expect(reputationGain('trivial')).toBe(1)
    expect(reputationGain('easy')).toBe(2)
    expect(reputationGain('medium')).toBe(4)
    expect(reputationGain('hard')).toBe(7)
    expect(reputationGain('legendary')).toBe(12)
  })
})

describe('rankForReputation — seuils 0/25/75/200/500', () => {
  it('associe chaque plage au bon rang', () => {
    expect(rankForReputation(0)).toEqual({ key: 'unknown', index: 0 })
    expect(rankForReputation(24)).toEqual({ key: 'unknown', index: 0 })
    expect(rankForReputation(25)).toEqual({ key: 'contact', index: 1 })
    expect(rankForReputation(74)).toEqual({ key: 'contact', index: 1 })
    expect(rankForReputation(75)).toEqual({ key: 'associate', index: 2 })
    expect(rankForReputation(199)).toEqual({ key: 'associate', index: 2 })
    expect(rankForReputation(200)).toEqual({ key: 'fixer', index: 3 })
    expect(rankForReputation(499)).toEqual({ key: 'fixer', index: 3 })
    expect(rankForReputation(500)).toEqual({ key: 'legend', index: 4 })
    expect(rankForReputation(1000)).toEqual({ key: 'legend', index: 4 })
  })

  it('a bien 5 rangs', () => {
    expect(REPUTATION_RANKS).toHaveLength(5)
  })
})

describe('reputationProgress', () => {
  it('rang intermédiaire : barre = courant / seuil suivant (depuis 0)', () => {
    const p = reputationProgress(210)
    expect(p.rankKey).toBe('fixer')
    expect(p.rankIndex).toBe(3)
    expect(p.current).toBe(210)
    expect(p.next).toBe(500)
    expect(p.nextRankKey).toBe('legend')
    expect(p.ratio).toBeCloseTo(210 / 500, 5)
    expect(p.isMax).toBe(false)
  })

  it('zéro : INCONNU, prochain seuil 25, barre vide', () => {
    const p = reputationProgress(0)
    expect(p.rankKey).toBe('unknown')
    expect(p.next).toBe(25)
    expect(p.ratio).toBe(0)
    expect(p.isMax).toBe(false)
  })

  it('rang max : LÉGENDE, pas de seuil suivant, barre pleine', () => {
    const p = reputationProgress(520)
    expect(p.rankKey).toBe('legend')
    expect(p.next).toBeNull()
    expect(p.nextRankKey).toBeNull()
    expect(p.ratio).toBe(1)
    expect(p.isMax).toBe(true)
  })

  it('valeur négative : bornée à 0', () => {
    expect(reputationProgress(-5).current).toBe(0)
  })
})

describe('applyReputationDelta — plancher 0', () => {
  it('gain : addition simple', () => {
    expect(applyReputationDelta(210, 7)).toBe(217)
  })
  it('perte au-dessus du plancher', () => {
    expect(applyReputationDelta(50, -7)).toBe(43)
  })
  it('perte sous 0 : bornée à 0', () => {
    expect(applyReputationDelta(3, -7)).toBe(0)
    expect(applyReputationDelta(50, -100)).toBe(0)
  })
})
