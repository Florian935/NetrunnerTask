import { describe, expect, it } from 'vitest'
import {
  CORRUPTION_PRESTIGE_THRESHOLD,
  newlyTriggeredReveals,
  REVEALS,
  type RevealContext,
} from './reveals'

const ctx = (prestigeCount: number): RevealContext => ({ prestigeCount })

describe('registre', () => {
  it('contient la corruption, ids uniques', () => {
    const ids = REVEALS.map((r) => r.id)
    expect(ids).toContain('corruption')
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('déclenchement de la corruption', () => {
  it('sous le seuil → aucun reveal', () => {
    expect(newlyTriggeredReveals([], ctx(CORRUPTION_PRESTIGE_THRESHOLD - 1))).toEqual([])
    expect(newlyTriggeredReveals([], ctx(0))).toEqual([])
  })

  it('au seuil → corruption', () => {
    expect(newlyTriggeredReveals([], ctx(CORRUPTION_PRESTIGE_THRESHOLD))).toEqual(['corruption'])
  })

  it('au-delà du seuil → corruption', () => {
    expect(newlyTriggeredReveals([], ctx(CORRUPTION_PRESTIGE_THRESHOLD + 5))).toEqual([
      'corruption',
    ])
  })

  it('déjà découvert → aucun re-déclenchement (append-only)', () => {
    expect(newlyTriggeredReveals(['corruption'], ctx(CORRUPTION_PRESTIGE_THRESHOLD + 2))).toEqual(
      [],
    )
  })

  it('déterministe : même entrée → même sortie', () => {
    const a = newlyTriggeredReveals([], ctx(CORRUPTION_PRESTIGE_THRESHOLD))
    const b = newlyTriggeredReveals([], ctx(CORRUPTION_PRESTIGE_THRESHOLD))
    expect(a).toEqual(b)
  })
})
