import { describe, expect, it } from 'vitest'
import { GENERATORS } from '../../game/builder'
import { UNLOCK_NODES } from '../../game/unlockTree'
import {
  buildMapNodes,
  MAP_EDGES,
  MAP_LAYOUT,
  mapEdgeVisual,
  type MapCore,
  type MapNodeState,
} from './networkMapModel'

const ALL_IDS = [...GENERATORS.map((d) => d.id), ...UNLOCK_NODES.map((n) => n.id)]

const empty: MapCore = {
  generators: {},
  upgrades: {},
  data: 0,
  crypto: 0,
  unlockedNodes: [],
}

describe('intégrité du layout', () => {
  it('chaque daemon et chaque nœud d’arbre a une position', () => {
    for (const id of ALL_IDS) {
      expect(MAP_LAYOUT[id], `position manquante pour ${id}`).toBeDefined()
    }
  })

  it('aucune position n’est en double (pas de nœuds superposés)', () => {
    const keys = ALL_IDS.map((id) => `${MAP_LAYOUT[id].x},${MAP_LAYOUT[id].y}`)
    expect(new Set(keys).size).toBe(ALL_IDS.length)
  })

  it('le layout ne référence pas d’id inconnu', () => {
    for (const id of Object.keys(MAP_LAYOUT)) {
      expect(ALL_IDS, `id inconnu dans le layout : ${id}`).toContain(id)
    }
  })
})

describe('intégrité des arêtes', () => {
  it('chaque arête référence deux id valides', () => {
    for (const e of MAP_EDGES) {
      expect(ALL_IDS, `arête source inconnue : ${e.a}`).toContain(e.a)
      expect(ALL_IDS, `arête cible inconnue : ${e.b}`).toContain(e.b)
    }
  })

  it('les arêtes de branche/cross correspondent bien aux dépendances réelles', () => {
    // chaque requiresNode/requiresGenerator du catalogue doit avoir son arête
    for (const n of UNLOCK_NODES) {
      if (n.requiresNode) {
        expect(MAP_EDGES).toContainEqual({ a: n.requiresNode, b: n.id, kind: 'branch' })
      }
      if (n.requiresGenerator) {
        expect(MAP_EDGES).toContainEqual({ a: n.requiresGenerator.id, b: n.id, kind: 'cross' })
      }
    }
  })
})

describe('buildMapNodes — états dérivés', () => {
  it('partie vierge : scraper disponible, reste verrouillé, cachés scellés', () => {
    const byId = Object.fromEntries(buildMapNodes(empty).map((n) => [n.id, n]))
    expect(byId.scraper.state).toBe('available')
    expect(byId.sifter.state).toBe('locked')
    expect(byId['ghost-protocol'].state).toBe('sealed')
    expect(byId['dark-pool'].state).toBe('sealed')
  })

  it('un daemon possédé est acquired et porte owned/level', () => {
    const core: MapCore = { ...empty, generators: { scraper: 3 }, upgrades: { scraper: 2 } }
    const scraper = buildMapNodes(core).find((n) => n.id === 'scraper')!
    expect(scraper.state).toBe('acquired')
    expect(scraper.owned).toBe(3)
    expect(scraper.level).toBe(2)
  })

  it('un nœud caché dont la condition est remplie n’est plus scellé', () => {
    // ghost-protocol exige 12× wraith
    const core: MapCore = { ...empty, generators: { scraper: 1, sifter: 1, wraith: 12 } }
    const ghost = buildMapNodes(core).find((n) => n.id === 'ghost-protocol')!
    expect(ghost.state).not.toBe('sealed')
  })

  it('les 13 nœuds sont produits', () => {
    expect(buildMapNodes(empty)).toHaveLength(ALL_IDS.length)
  })
})

describe('mapEdgeVisual', () => {
  const st = (o: Record<string, MapNodeState>): Record<string, MapNodeState> => o

  it('masque une arête touchant un nœud scellé (pas de spoiler)', () => {
    const v = mapEdgeVisual(
      { a: 'wraith', b: 'ghost-protocol', kind: 'cross' },
      st({ wraith: 'acquired', 'ghost-protocol': 'sealed' }),
    )
    expect(v).toBeNull()
  })

  it('acquis → acquis', () => {
    const v = mapEdgeVisual(
      { a: 'scraper', b: 'sifter', kind: 'branch' },
      st({ scraper: 'acquired', sifter: 'acquired' }),
    )
    expect(v).toBe('both-acquired')
  })

  it('alimente un nœud disponible', () => {
    const v = mapEdgeVisual(
      { a: 'scraper', b: 'sifter', kind: 'branch' },
      st({ scraper: 'acquired', sifter: 'available' }),
    )
    expect(v).toBe('feeds-available')
  })

  it('lien transverse actif vs éteint', () => {
    expect(
      mapEdgeVisual({ a: 'wraith', b: 'cryo-cache', kind: 'cross' }, st({ wraith: 'acquired', 'cryo-cache': 'available' })),
    ).toBe('cross-live')
    expect(
      mapEdgeVisual({ a: 'wraith', b: 'cryo-cache', kind: 'cross' }, st({ wraith: 'locked', 'cryo-cache': 'locked' })),
    ).toBe('cross-dim')
  })
})
