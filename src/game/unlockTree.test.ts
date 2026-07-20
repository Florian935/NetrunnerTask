import { describe, expect, it } from 'vitest'
import {
  buyNode,
  canBuyNode,
  cycleMultiplier,
  dataMultiplier,
  isConditionMet,
  nodeState,
  UNLOCK_NODE_BY_ID,
  type UnlockTreeCore,
  visibleNodes,
} from './unlockTree'

const mk = (
  data: number,
  generators: Record<string, number> = {},
  upgrades: Record<string, number> = {},
  unlockedNodes: string[] = [],
): UnlockTreeCore => ({ data, generators, upgrades, unlockedNodes })

const overclock = UNLOCK_NODE_BY_ID.overclock
const parallelism = UNLOCK_NODE_BY_ID.parallelism
const cryoCache = UNLOCK_NODE_BY_ID['cryo-cache']
const ghostProtocol = UNLOCK_NODE_BY_ID['ghost-protocol']

describe('isConditionMet — chaîne de nœuds + condition daemon', () => {
  it('aucune condition → toujours remplie', () => {
    expect(isConditionMet(overclock, mk(0))).toBe(true)
  })
  it('requiresNode : remplie seulement si le nœud requis est acquis', () => {
    expect(isConditionMet(parallelism, mk(0))).toBe(false)
    expect(isConditionMet(parallelism, mk(0, {}, {}, ['overclock']))).toBe(true)
  })
  it('requiresGenerator : condition sur le compte du daemon', () => {
    expect(isConditionMet(cryoCache, mk(0))).toBe(false)
    expect(isConditionMet(cryoCache, mk(0, { wraith: 1 }))).toBe(true)
  })
  it('requiresGenerator : upgradeLevel (si défini) doit aussi être atteint', () => {
    const node = {
      ...overclock,
      requiresGenerator: { id: 'wraith', count: 1, upgradeLevel: 1 },
    }
    expect(isConditionMet(node, mk(0, { wraith: 1 }))).toBe(false) // pas upgradé
    expect(isConditionMet(node, mk(0, { wraith: 1 }, { wraith: 1 }))).toBe(true)
  })
  it('ghost-protocol : condition sur le compte de wraith uniquement', () => {
    expect(isConditionMet(ghostProtocol, mk(0, { wraith: 11 }))).toBe(false)
    expect(isConditionMet(ghostProtocol, mk(0, { wraith: 12 }))).toBe(true)
  })
})

describe('nodeState', () => {
  it('acquis si déjà dans unlockedNodes', () => {
    expect(nodeState(overclock, mk(0, {}, {}, ['overclock']))).toBe('acquired')
  })
  it('disponible si condition remplie et pas encore acquis', () => {
    expect(nodeState(overclock, mk(0))).toBe('available')
  })
  it('verrouillé si condition non remplie', () => {
    expect(nodeState(parallelism, mk(0))).toBe('locked')
  })
})

describe('visibleNodes — reveal caché (P6, AC6 US-022)', () => {
  it('les nœuds non cachés sont toujours visibles', () => {
    const ids = visibleNodes(mk(0)).map((n) => n.id)
    expect(ids).toEqual(['overclock', 'parallelism', 'cryo-cache'])
  })
  it('le nœud caché est absent tant que sa condition n’est pas remplie', () => {
    const ids = visibleNodes(mk(0, { wraith: 11 })).map((n) => n.id)
    expect(ids).not.toContain('ghost-protocol')
  })
  it('le nœud caché apparaît dès que sa condition est remplie', () => {
    const ids = visibleNodes(mk(0, { wraith: 12 })).map((n) => n.id)
    expect(ids).toContain('ghost-protocol')
  })
  it('un nœud caché déjà acquis reste visible', () => {
    const ids = visibleNodes(mk(0, {}, {}, ['ghost-protocol'])).map((n) => n.id)
    expect(ids).toContain('ghost-protocol')
  })
})

describe('canBuyNode / buyNode', () => {
  it('impossible si solde insuffisant → no-op', () => {
    const s = mk(10) // overclock coûte 40
    expect(canBuyNode(s, 'overclock')).toBe(false)
    expect(buyNode(s, 'overclock')).toBe(s)
  })
  it('impossible si condition non remplie (même avec assez de data) → no-op', () => {
    const s = mk(999) // parallelism requiert overclock, pas encore acquis
    expect(canBuyNode(s, 'parallelism')).toBe(false)
    expect(buyNode(s, 'parallelism')).toBe(s)
  })
  it('achat : débite `data` et ajoute l’id à unlockedNodes', () => {
    const s = mk(50)
    expect(canBuyNode(s, 'overclock')).toBe(true)
    const next = buyNode(s, 'overclock')
    expect(next.data).toBe(10)
    expect(next.unlockedNodes).toEqual(['overclock'])
  })
  it('achat du nœud caché une fois révélé', () => {
    const s = mk(500, { wraith: 12 })
    expect(canBuyNode(s, 'ghost-protocol')).toBe(true)
    const next = buyNode(s, 'ghost-protocol')
    expect(next.data).toBe(0)
    expect(next.unlockedNodes).toEqual(['ghost-protocol'])
  })
})

describe('cycleMultiplier / dataMultiplier', () => {
  it('neutre (1) sans nœud acquis', () => {
    expect(cycleMultiplier(mk(0))).toBe(1)
    expect(dataMultiplier(mk(0))).toBe(1)
  })
  it('somme les effets des nœuds acquis uniquement', () => {
    const s = mk(0, {}, {}, ['overclock']) // +25% cycles, pas de data
    expect(cycleMultiplier(s)).toBeCloseTo(1.25)
    expect(dataMultiplier(s)).toBe(1)
  })
  it('ghost-protocol acquis → ×3 sur data (effet +2)', () => {
    const s = mk(0, {}, {}, ['ghost-protocol'])
    expect(dataMultiplier(s)).toBe(3)
  })
})
