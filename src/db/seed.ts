import { db } from './db'
import type { Faction } from './types'

/**
 * Factions par défaut semées au premier lancement.
 * Couleurs = accents du design system NIGHTWIRE.
 */
export const DEFAULT_FACTIONS: ReadonlyArray<Pick<Faction, 'name' | 'color'>> = [
  { name: 'Boulot', color: 'var(--cyan-500)' },
  { name: 'Sport', color: 'var(--magenta-500)' },
  { name: 'Perso', color: 'var(--violet-500)' },
  { name: 'Santé', color: 'var(--mint-500)' },
  { name: 'Apprentissage', color: 'var(--amber-500)' },
]

/**
 * Prépare les données initiales, de façon **idempotente** (test d'existence) :
 * - sème les factions par défaut si la table est vide ;
 * - crée le joueur singleton s'il n'existe pas encore.
 *
 * Appelée à chaque démarrage : sans effet aux lancements suivants (pas de
 * re-seed ni de doublon). On n'utilise pas `on('populate')`, qui ne se
 * déclenche qu'à la création de la base et raterait une montée de version.
 */
export async function ensureSeeded(): Promise<void> {
  const factionCount = await db.factions.count()
  if (factionCount === 0) {
    const now = Date.now()
    await db.factions.bulkAdd(
      DEFAULT_FACTIONS.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        color: f.color,
        createdAt: now,
        reputation: 0,
      })),
    )
  }

  const player = await db.player.get('me')
  if (!player) {
    await db.player.add({ id: 'me', xp: 0, level: 1, credits: 0 })
  }

  const builder = await db.builderState.get('me')
  if (!builder) {
    await db.builderState.add({
      id: 'me',
      cycles: 0,
      generators: {},
      upgrades: {},
      data: 0,
      crypto: 0,
      unlockedNodes: [],
      acceleratorRun: null,
      acceleratorBoost: null,
      prestigeCount: 0,
      updatedAt: Date.now(),
      achievedMilestones: [],
    })
  }
}
