import { db } from '../db'
import type { BuilderState } from '../types'

/** Clé fixe du singleton builder. */
const BUILDER_ID = 'me' as const

/**
 * Accès typé à l'état du builder « Réseau » (singleton, US-020). Seul point
 * d'entrée vers la table `builderState` (aucun Dexie hors de `src/db/`).
 */
export const builderRepo = {
  get(): Promise<BuilderState | undefined> {
    return db.builderState.get(BUILDER_ID)
  },

  async save(state: Omit<BuilderState, 'id'>): Promise<void> {
    await db.builderState.put({ id: BUILDER_ID, ...state })
  },
}
