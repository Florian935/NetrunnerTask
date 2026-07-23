import { describe, expect, it } from 'vitest'
import {
  COSMETICS,
  COSMETIC_BY_ID,
  cosmeticsByType,
  DEFAULT_COSMETICS,
  equip,
  equippedOf,
  isEquipped,
  isOwned,
  rarityRank,
  RARITY_ORDER,
  type CosmeticsCore,
} from './cosmetics'

/** État de test : tout possédé, équipés par défaut. */
const base = (): CosmeticsCore => ({
  owned: [...DEFAULT_COSMETICS.owned],
  equipped: { ...DEFAULT_COSMETICS.equipped },
})

describe('rarityRank', () => {
  it('numérote les crans de 1 (commun) à 5 (légendaire)', () => {
    expect(rarityRank('common')).toBe(1)
    expect(rarityRank('legendary')).toBe(5)
    expect(RARITY_ORDER).toHaveLength(5)
  })
})

describe('catalogue', () => {
  it('a des id uniques', () => {
    const ids = COSMETICS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('couvre les 4 types', () => {
    const types = new Set(COSMETICS.map((c) => c.type))
    expect([...types].sort()).toEqual(['avatar', 'banner', 'theme', 'title'])
  })
})

describe('DEFAULT_COSMETICS', () => {
  it('débloque tout le catalogue au départ (H4)', () => {
    expect(DEFAULT_COSMETICS.owned).toHaveLength(COSMETICS.length)
  })

  it('a un équipé par type, possédé et du bon type (invariant)', () => {
    for (const type of ['theme', 'avatar', 'banner', 'title'] as const) {
      const id = DEFAULT_COSMETICS.equipped[type]
      expect(DEFAULT_COSMETICS.owned).toContain(id)
      expect(COSMETIC_BY_ID[id]?.type).toBe(type)
    }
  })

  it('équipe le thème par défaut nightwire', () => {
    expect(DEFAULT_COSMETICS.equipped.theme).toBe('nightwire')
  })
})

describe('cosmeticsByType', () => {
  it('ne renvoie que le type demandé, trié par rareté croissante', () => {
    const themes = cosmeticsByType('theme')
    expect(themes.every((c) => c.type === 'theme')).toBe(true)
    const ranks = themes.map((c) => rarityRank(c.rarity))
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })
})

describe('equip', () => {
  it('équipe un cosmétique possédé et remplace l’équipé du même type', () => {
    const next = equip(base(), 'cryo')
    expect(next.equipped.theme).toBe('cryo')
    // Les autres types ne bougent pas.
    expect(next.equipped.avatar).toBe(DEFAULT_COSMETICS.equipped.avatar)
  })

  it('un seul cosmétique équipé par type (le précédent est déséquipé)', () => {
    const next = equip(equip(base(), 'cryo'), 'ecarlate')
    expect(next.equipped.theme).toBe('ecarlate')
    expect(isEquipped(next, 'cryo')).toBe(false)
    expect(isEquipped(next, 'ecarlate')).toBe(true)
  })

  it('no-op (même référence) si non possédé', () => {
    const core = { owned: ['nightwire'], equipped: { ...DEFAULT_COSMETICS.equipped } }
    expect(equip(core, 'cryo')).toBe(core)
  })

  it('no-op (même référence) si id inconnu', () => {
    const core = base()
    expect(equip(core, 'inconnu')).toBe(core)
  })

  it('no-op (même référence) si déjà équipé', () => {
    const core = base()
    expect(equip(core, core.equipped.theme)).toBe(core)
  })
})

describe('sélecteurs', () => {
  it('isOwned / equippedOf / isEquipped reflètent l’état', () => {
    const core = base()
    expect(isOwned(core, 'nightwire')).toBe(true)
    expect(isOwned(core, 'inconnu')).toBe(false)
    expect(equippedOf(core, 'theme')).toBe('nightwire')
    expect(isEquipped(core, 'nightwire')).toBe(true)
    expect(isEquipped(core, 'cryo')).toBe(false)
  })
})
