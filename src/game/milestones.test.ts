import { describe, expect, it } from 'vitest'
import {
  checkHackMilestone,
  checkMilestones,
  HACK_MILESTONE_ID,
  MILESTONE_DEFS,
  type MilestoneCore,
} from './milestones'

const mk = (over: Partial<MilestoneCore> = {}): MilestoneCore => ({
  generators: {},
  upgrades: {},
  unlockedNodes: [],
  crypto: 0,
  acceleratorBoost: null,
  prestigeCount: 0,
  ...over,
})

describe('catalogue', () => {
  it('11 jalons, ids uniques', () => {
    expect(MILESTONE_DEFS).toHaveLength(11)
    expect(new Set(MILESTONE_DEFS.map((m) => m.id)).size).toBe(11)
  })
})

describe('checkMilestones — un jalon par prédicat', () => {
  it('daemon : ≥ 1 type de daemon possédé', () => {
    expect(checkMilestones(mk(), [])).not.toContain('daemon')
    expect(checkMilestones(mk({ generators: { scraper: 1 } }), [])).toContain('daemon')
  })

  it('roster : ≥ 2 types distincts, pas 1 seul', () => {
    expect(checkMilestones(mk({ generators: { scraper: 5 } }), [])).not.toContain('roster')
    expect(
      checkMilestones(mk({ generators: { scraper: 1, sifter: 1 } }), []),
    ).toContain('roster')
  })

  it('upgrade : ≥ 1 amélioration achetée', () => {
    expect(checkMilestones(mk(), [])).not.toContain('upgrade')
    expect(checkMilestones(mk({ upgrades: { scraper: 1 } }), [])).toContain('upgrade')
  })

  it('data : daemon qui débloque `data` (oracle) possédé', () => {
    expect(checkMilestones(mk({ generators: { scraper: 99 } }), [])).not.toContain('data')
    expect(checkMilestones(mk({ generators: { oracle: 1 } }), [])).toContain('data')
  })

  it('tree : ≥ 1 nœud débloqué', () => {
    expect(checkMilestones(mk(), [])).not.toContain('tree')
    expect(checkMilestones(mk({ unlockedNodes: ['overclock'] }), [])).toContain('tree')
  })

  it('accel : boost SURCADENCE actif', () => {
    expect(checkMilestones(mk(), [])).not.toContain('accel')
    expect(
      checkMilestones(mk({ acceleratorBoost: { id: 'focus', endsAt: 9999 } }), []),
    ).toContain('accel')
  })

  it('crypto : solde crypto > 0', () => {
    expect(checkMilestones(mk({ crypto: 0 }), [])).not.toContain('crypto')
    expect(checkMilestones(mk({ crypto: 12 }), [])).toContain('crypto')
  })

  it('reborn : ≥ 1 renaissance', () => {
    expect(checkMilestones(mk(), [])).not.toContain('reborn')
    expect(checkMilestones(mk({ prestigeCount: 1 }), [])).toContain('reborn')
  })

  it('ghost / cartel : reveal du nœud caché correspondant', () => {
    const core = mk({ unlockedNodes: ['ghost-protocol'] })
    expect(checkMilestones(core, [])).toContain('ghost')
    expect(checkMilestones(core, [])).not.toContain('cartel')
    expect(checkMilestones(mk({ unlockedNodes: ['dark-pool'] }), [])).toContain('cartel')
  })
})

describe('checkMilestones — garde anti-doublon', () => {
  it("un jalon déjà atteint n'est jamais re-retourné, même si son prédicat reste vrai", () => {
    const core = mk({ unlockedNodes: ['overclock'] })
    expect(checkMilestones(core, ['tree'])).not.toContain('tree')
  })

  it('après renaissance (état revenu à neutre), les jalons déjà atteints ne redisparaissent pas de la liste "déjà acquis" — checkMilestones ne fait que proposer les NOUVEAUX', () => {
    const resetCore = mk() // generators/unlockedNodes/crypto remis à zéro par prestige()
    expect(checkMilestones(resetCore, ['daemon', 'tree', 'crypto'])).toEqual([])
  })

  it('jamais de jalon `hack` proposé par checkMilestones (condition: null)', () => {
    expect(checkMilestones(mk(), [])).not.toContain(HACK_MILESTONE_ID)
  })
})

describe('checkHackMilestone', () => {
  it('retourne [hack] la première fois', () => {
    expect(checkHackMilestone([])).toEqual(['hack'])
  })
  it('retourne [] si déjà atteint', () => {
    expect(checkHackMilestone(['hack'])).toEqual([])
  })
})
