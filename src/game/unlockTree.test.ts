import { describe, expect, it } from 'vitest'
import {
  buyNode,
  canBuyNode,
  cryptoFloorBonus,
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
  crypto = 0,
): UnlockTreeCore => ({ data, crypto, generators, upgrades, unlockedNodes })

const overclock = UNLOCK_NODE_BY_ID.overclock
const parallelism = UNLOCK_NODE_BY_ID.parallelism
const cryoCache = UNLOCK_NODE_BY_ID['cryo-cache']
const ghostProtocol = UNLOCK_NODE_BY_ID['ghost-protocol']
const arbitrageAuto = UNLOCK_NODE_BY_ID['arbitrage-auto']
const rateFloor = UNLOCK_NODE_BY_ID['rate-floor']
const darkPool = UNLOCK_NODE_BY_ID['dark-pool']

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

describe('visibleNodes — reveal caché (P6, AC6 US-022) — branche data', () => {
  it('les nœuds data non cachés sont toujours visibles', () => {
    const ids = visibleNodes(mk(0), 'data').map((n) => n.id)
    expect(ids).toEqual(['overclock', 'parallelism', 'cryo-cache', 'breach-market'])
  })
  it('le nœud caché est absent tant que sa condition n’est pas remplie', () => {
    const ids = visibleNodes(mk(0, { wraith: 11 }), 'data').map((n) => n.id)
    expect(ids).not.toContain('ghost-protocol')
  })
  it('le nœud caché apparaît dès que sa condition est remplie', () => {
    const ids = visibleNodes(mk(0, { wraith: 12 }), 'data').map((n) => n.id)
    expect(ids).toContain('ghost-protocol')
  })
  it('un nœud caché déjà acquis reste visible', () => {
    const ids = visibleNodes(mk(0, {}, {}, ['ghost-protocol']), 'data').map((n) => n.id)
    expect(ids).toContain('ghost-protocol')
  })
})

describe('visibleNodes — branche crypto (US-027)', () => {
  it('filtre uniquement les nœuds crypto', () => {
    const ids = visibleNodes(mk(0), 'crypto').map((n) => n.id)
    expect(ids).toEqual(['arbitrage-auto', 'rate-floor', 'ghost-laundry'])
    expect(ids).not.toContain('overclock')
  })
  it('le nœud caché crypto (dark-pool) apparaît selon sa condition (oracle)', () => {
    expect(visibleNodes(mk(0, { oracle: 1 }), 'crypto').map((n) => n.id)).not.toContain(
      'dark-pool',
    )
    expect(visibleNodes(mk(0, { oracle: 2 }), 'crypto').map((n) => n.id)).toContain('dark-pool')
  })
})

describe('canBuyNode / buyNode — branche data', () => {
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

describe('canBuyNode / buyNode — branche crypto (US-027, devise croisée)', () => {
  it('un nœud crypto ne débite jamais `data`, seulement `crypto`', () => {
    const s = mk(9999, {}, {}, ['breach-market'], 50) // arbitrage-auto coûte 30 CR
    expect(canBuyNode(s, 'arbitrage-auto')).toBe(true)
    const next = buyNode(s, 'arbitrage-auto')
    expect(next.crypto).toBe(20)
    expect(next.data).toBe(9999) // inchangé
    expect(next.unlockedNodes).toContain('arbitrage-auto')
  })
  it('solde `data` élevé n’aide pas si `crypto` est insuffisant', () => {
    const s = mk(9999, {}, {}, ['breach-market'], 5)
    expect(canBuyNode(s, 'arbitrage-auto')).toBe(false)
    expect(buyNode(s, 'arbitrage-auto')).toBe(s)
  })
  it('requiresNode inter-branches : arbitrage-auto requiert le nœud data breach-market', () => {
    const s = mk(0, {}, {}, [], 999) // crypto élevé mais breach-market non acquis
    expect(canBuyNode(s, 'arbitrage-auto')).toBe(false)
  })
})

describe('cryptoFloorBonus (US-027)', () => {
  it('0 sans nœud à plancher acquis', () => {
    expect(cryptoFloorBonus(mk(0))).toBe(0)
  })
  it('renvoie le plancher du nœud acquis', () => {
    const s = mk(0, {}, {}, ['breach-market', 'arbitrage-auto', 'rate-floor'])
    expect(cryptoFloorBonus(s)).toBe(rateFloor.effect.cryptoFloor)
  })
  it('prend le maximum si plusieurs planchers sont acquis', () => {
    const s = mk(0, { oracle: 2 }, {}, [
      'breach-market',
      'arbitrage-auto',
      'rate-floor',
      'dark-pool',
    ])
    expect(cryptoFloorBonus(s)).toBe(darkPool.effect.cryptoFloor)
  })
  it('ignore les nœuds acquis sans cryptoFloor', () => {
    const s = mk(0, {}, {}, ['overclock', 'breach-market'])
    expect(cryptoFloorBonus(s)).toBe(0)
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
  it('un nœud crypto acquis (ghost-laundry) apporte aussi un bonus cycles', () => {
    const s = mk(0, {}, {}, ['breach-market', 'arbitrage-auto', 'rate-floor', 'ghost-laundry'])
    expect(cycleMultiplier(s)).toBeCloseTo(
      1 + (arbitrageAuto.effect.cycles ?? 0) + (UNLOCK_NODE_BY_ID['ghost-laundry'].effect.cycles ?? 0),
    )
  })
})
