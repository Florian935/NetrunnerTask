import { db } from '../db'
import type { Faction } from '../types'

export interface CreateFactionInput {
  name: string
  color: string
}

/** Accès typé aux factions. Seul point d'entrée vers la table `factions`. */
export const factionsRepo = {
  /** Toutes les factions, triées par nom. */
  list(): Promise<Faction[]> {
    return db.factions.orderBy('name').toArray()
  },

  get(id: string): Promise<Faction | undefined> {
    return db.factions.get(id)
  },

  async create(input: CreateFactionInput): Promise<Faction> {
    const faction: Faction = {
      id: crypto.randomUUID(),
      name: input.name,
      color: input.color,
      createdAt: Date.now(),
      reputation: 0,
    }
    await db.factions.add(faction)
    return faction
  },

  async update(id: string, patch: Partial<Omit<Faction, 'id'>>): Promise<void> {
    await db.factions.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await db.factions.delete(id)
  },
}
