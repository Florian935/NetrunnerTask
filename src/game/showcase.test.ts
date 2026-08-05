import { describe, expect, it } from 'vitest'
import {
  pinSlot,
  reconcileShowcase,
  SHOWCASE_CONFIG,
  slotProgress,
  slotRequirement,
  topExposedRarity,
  totalSlots,
  unlockedSlots,
  unpinSlot,
  type ShowcaseSlot,
} from './showcase'

// Cosmétiques réels du catalogue, choisis pour leurs raretés connues.
const THEME_COMMON = 'nightwire' // theme / common
const AVATAR_COMMON = 'avatar-daemon' // avatar / common
const THEME_RARE = 'cryo' // theme / rare
const AVATAR_EPIC = 'avatar-icebreaker' // avatar / epic
const BANNER_LEGENDARY = 'banner-apex' // banner / legendary
const TITLE_LEGENDARY = 'title-zeroday' // title / legendary

const owned = [
  THEME_COMMON,
  AVATAR_COMMON,
  THEME_RARE,
  AVATAR_EPIC,
  BANNER_LEGENDARY,
  TITLE_LEGENDARY,
]

describe('unlockedSlots', () => {
  it('ouvre la base sans aucun jalon', () => {
    expect(unlockedSlots(0)).toBe(SHOWCASE_CONFIG.baseSlots)
  })

  it('ouvre un emplacement de plus à chaque seuil franchi', () => {
    const [t0, t1, t2] = SHOWCASE_CONFIG.tierThresholds
    expect(unlockedSlots(t0 - 1)).toBe(SHOWCASE_CONFIG.baseSlots)
    expect(unlockedSlots(t0)).toBe(SHOWCASE_CONFIG.baseSlots + 1)
    expect(unlockedSlots(t1)).toBe(SHOWCASE_CONFIG.baseSlots + 2)
    expect(unlockedSlots(t2)).toBe(SHOWCASE_CONFIG.baseSlots + 3)
  })

  it('plafonne au total (jamais plus que tous les emplacements)', () => {
    expect(unlockedSlots(9999)).toBe(totalSlots())
  })

  it('est monotone croissante', () => {
    for (let n = 1; n <= 20; n++) {
      expect(unlockedSlots(n)).toBeGreaterThanOrEqual(unlockedSlots(n - 1))
    }
  })
})

describe('slotRequirement', () => {
  it('renvoie null pour les emplacements de base', () => {
    expect(slotRequirement(0)).toBeNull()
    expect(slotRequirement(SHOWCASE_CONFIG.baseSlots - 1)).toBeNull()
  })

  it('renvoie le seuil de jalons pour un emplacement à palier', () => {
    expect(slotRequirement(SHOWCASE_CONFIG.baseSlots)).toBe(SHOWCASE_CONFIG.tierThresholds[0])
    expect(slotRequirement(SHOWCASE_CONFIG.baseSlots + 1)).toBe(SHOWCASE_CONFIG.tierThresholds[1])
  })

  it('renvoie null au-delà du dernier emplacement', () => {
    expect(slotRequirement(totalSlots())).toBeNull()
  })
})

describe('slotProgress', () => {
  it('donne open/total/nextAt/achieved cohérents', () => {
    const p = slotProgress(0)
    expect(p.open).toBe(SHOWCASE_CONFIG.baseSlots)
    expect(p.total).toBe(totalSlots())
    expect(p.nextAt).toBe(SHOWCASE_CONFIG.tierThresholds[0])
    expect(p.achieved).toBe(0)
  })

  it('nextAt est null quand tous les emplacements sont ouverts', () => {
    expect(slotProgress(9999).nextAt).toBeNull()
  })

  it('nextAt est toujours strictement supérieur aux jalons atteints', () => {
    for (let n = 0; n <= 12; n++) {
      const { nextAt } = slotProgress(n)
      if (nextAt !== null) expect(nextAt).toBeGreaterThan(n)
    }
  })
})

describe('topExposedRarity', () => {
  it('renvoie null pour un présentoir vide', () => {
    expect(topExposedRarity([])).toBeNull()
    expect(topExposedRarity([null, null])).toBeNull()
  })

  it('renvoie la rareté la plus haute épinglée', () => {
    const showcase: ShowcaseSlot[] = [
      { kind: 'cosmetic', ref: THEME_COMMON },
      { kind: 'cosmetic', ref: AVATAR_EPIC },
      { kind: 'cosmetic', ref: THEME_RARE },
    ]
    expect(topExposedRarity(showcase)).toBe('epic')
  })

  it('reconnaît la légendaire au-dessus de tout', () => {
    const showcase: ShowcaseSlot[] = [
      { kind: 'cosmetic', ref: AVATAR_EPIC },
      { kind: 'cosmetic', ref: BANNER_LEGENDARY },
    ]
    expect(topExposedRarity(showcase)).toBe('legendary')
  })

  it('ignore les références inconnues du catalogue', () => {
    const showcase: ShowcaseSlot[] = [
      { kind: 'cosmetic', ref: 'inexistant-xyz' },
      { kind: 'cosmetic', ref: THEME_COMMON },
    ]
    expect(topExposedRarity(showcase)).toBe('common')
  })
})

describe('pinSlot', () => {
  it('épingle un cosmétique possédé dans un emplacement vide', () => {
    const next = pinSlot([], 0, BANNER_LEGENDARY, owned)
    expect(next[0]).toEqual({ kind: 'cosmetic', ref: BANNER_LEGENDARY })
  })

  it('remplace le contenu d\'un emplacement déjà rempli', () => {
    const start: ShowcaseSlot[] = [{ kind: 'cosmetic', ref: THEME_COMMON }]
    const next = pinSlot(start, 0, AVATAR_EPIC, owned)
    expect(next[0]).toEqual({ kind: 'cosmetic', ref: AVATAR_EPIC })
  })

  it('rejette (no-op) un cosmétique non possédé', () => {
    const start: ShowcaseSlot[] = []
    const next = pinSlot(start, 0, 'title-overdrive', owned) // non possédé
    expect(next[0] ?? null).toBeNull()
  })

  it('rejette (no-op) un emplacement hors bornes', () => {
    expect(pinSlot([], -1, BANNER_LEGENDARY, owned)).toEqual([])
    expect(pinSlot([], totalSlots(), BANNER_LEGENDARY, owned)).toEqual([])
  })

  it('empêche d\'épingler deux fois la même pièce (unicité par ref)', () => {
    const start: ShowcaseSlot[] = [{ kind: 'cosmetic', ref: BANNER_LEGENDARY }]
    const next = pinSlot(start, 1, BANNER_LEGENDARY, owned)
    expect(next[1] ?? null).toBeNull()
  })

  it('autorise deux pièces du MÊME type dans des emplacements différents', () => {
    const next1 = pinSlot([], 0, THEME_COMMON, owned) // theme
    const next2 = pinSlot(next1, 1, THEME_RARE, owned) // theme aussi
    expect(next2[0]).toEqual({ kind: 'cosmetic', ref: THEME_COMMON })
    expect(next2[1]).toEqual({ kind: 'cosmetic', ref: THEME_RARE })
  })
})

describe('unpinSlot', () => {
  it('vide un emplacement rempli', () => {
    const start: ShowcaseSlot[] = [{ kind: 'cosmetic', ref: THEME_COMMON }]
    expect(unpinSlot(start, 0)[0]).toBeNull()
  })

  it('est un no-op sur un emplacement déjà vide ou hors bornes', () => {
    expect(unpinSlot([null], 0)).toEqual([null])
    expect(unpinSlot([], 5)).toEqual([])
  })
})

describe('reconcileShowcase', () => {
  it('vide les emplacements dont la pièce n\'est plus possédée', () => {
    const start: ShowcaseSlot[] = [
      { kind: 'cosmetic', ref: BANNER_LEGENDARY },
      { kind: 'cosmetic', ref: 'perdu-xyz' },
    ]
    const next = reconcileShowcase(start, owned)
    expect(next[0]).toEqual({ kind: 'cosmetic', ref: BANNER_LEGENDARY })
    expect(next[1]).toBeNull()
  })

  it('déduplique les références (garde la première)', () => {
    const start: ShowcaseSlot[] = [
      { kind: 'cosmetic', ref: THEME_RARE },
      { kind: 'cosmetic', ref: THEME_RARE },
    ]
    const next = reconcileShowcase(start, owned)
    expect(next[0]).toEqual({ kind: 'cosmetic', ref: THEME_RARE })
    expect(next[1]).toBeNull()
  })

  it('plafonne la longueur au total d\'emplacements', () => {
    const long = Array.from({ length: totalSlots() + 3 }, () => null)
    expect(reconcileShowcase(long, owned)).toHaveLength(totalSlots())
  })
})
