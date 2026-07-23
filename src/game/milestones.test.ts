import { describe, expect, it } from 'vitest'
import { COSMETICS, isStarter } from './cosmetics'
import {
  checkHackMilestone,
  checkMilestones,
  HACK_MILESTONE_ID,
  MILESTONE_BY_ID,
  MILESTONE_DEFS,
  milestoneForCosmetic,
  rewardsFor,
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

describe('récompenses (US-033)', () => {
  const rewards = MILESTONE_DEFS.map((m) => m.reward).filter(
    (r): r is string => r !== undefined,
  )

  it('chaque récompense existe dans le catalogue cosmétique', () => {
    for (const id of rewards) {
      expect(COSMETICS.some((c) => c.id === id)).toBe(true)
    }
  })

  it('aucune récompense en double (un cosmétique = un seul jalon)', () => {
    expect(new Set(rewards).size).toBe(rewards.length)
  })

  it('aucun cosmétique de départ n’est une récompense', () => {
    for (const id of rewards) expect(isStarter(id)).toBe(false)
  })

  it('couvre tous les cosmétiques non-starter (tout est gagnable)', () => {
    const earnable = COSMETICS.filter((c) => !isStarter(c.id)).map((c) => c.id)
    expect(new Set(rewards)).toEqual(new Set(earnable))
  })

  it('les jalons cachés récompensés portent une rareté haute (épique+)', () => {
    for (const m of MILESTONE_DEFS) {
      if (m.hidden && m.reward) {
        const c = COSMETICS.find((x) => x.id === m.reward)!
        expect(['epic', 'legendary']).toContain(c.rarity)
      }
    }
  })

  it('rewardsFor ne renvoie que les récompenses des jalons donnés, dans l’ordre', () => {
    expect(rewardsFor(['hack'])).toEqual(['avatar-raven'])
    expect(rewardsFor([])).toEqual([])
    // ordre du catalogue, pas de l’argument
    expect(rewardsFor(['reborn', 'hack'])).toEqual(['avatar-raven', 'banner-apex'])
  })

  it('milestoneForCosmetic remonte le bon jalon (ou undefined pour un starter)', () => {
    expect(milestoneForCosmetic('avatar-raven')).toBe(MILESTONE_BY_ID.hack)
    expect(milestoneForCosmetic('nightwire')).toBeUndefined()
  })
})
