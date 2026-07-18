import { describe, expect, it } from 'vitest'
import { DEFAULT_FACTION_KEYS, factionLabel } from './factionLabel'

// `t` factice : renvoie la clé reçue, pour vérifier quelle clé est demandée.
const echo = (key: string) => key

describe('factionLabel', () => {
  it('mappe chaque faction système vers sa clé i18n', () => {
    expect(factionLabel({ name: 'Boulot' }, echo)).toBe('contracts.factions.work')
    expect(factionLabel({ name: 'Sport' }, echo)).toBe(
      'contracts.factions.sport',
    )
    expect(factionLabel({ name: 'Perso' }, echo)).toBe(
      'contracts.factions.personal',
    )
    expect(factionLabel({ name: 'Santé' }, echo)).toBe(
      'contracts.factions.health',
    )
    expect(factionLabel({ name: 'Apprentissage' }, echo)).toBe(
      'contracts.factions.learning',
    )
  })

  it('couvre les 5 factions système', () => {
    expect(Object.keys(DEFAULT_FACTION_KEYS)).toHaveLength(5)
  })

  it('retombe sur le `name` brut pour une faction inconnue (non système)', () => {
    expect(factionLabel({ name: 'Corpo' }, echo)).toBe('Corpo')
  })
})
