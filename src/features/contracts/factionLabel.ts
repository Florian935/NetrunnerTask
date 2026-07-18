import type { Faction } from '../../db'

/**
 * Correspondance entre le `name` **stocké** des factions système (semées par
 * défaut, cf. `db/seed.ts`) et une clé i18n stable. Le `name` en base sert
 * d'identifiant interne ; l'affichage passe toujours par la traduction (US-007,
 * H3). Toute faction hors de cette table (cas inexistant en MVP 1 — pas de CRUD
 * utilisateur) retombe sur son `name` brut.
 */
export const DEFAULT_FACTION_KEYS: Record<string, string> = {
  Boulot: 'work',
  Sport: 'sport',
  Perso: 'personal',
  Santé: 'health',
  Apprentissage: 'learning',
}

/**
 * Libellé affichable d'une faction : clé i18n `contracts.factions.<key>` pour une
 * faction système, sinon repli sur le `name` stocké. `t` est la fonction de
 * traduction (react-i18next) ; typée a minima pour rester testable sans i18n.
 */
export function factionLabel(
  faction: Pick<Faction, 'name'>,
  t: (key: string) => string,
): string {
  const key = DEFAULT_FACTION_KEYS[faction.name]
  return key ? t(`contracts.factions.${key}`) : faction.name
}
