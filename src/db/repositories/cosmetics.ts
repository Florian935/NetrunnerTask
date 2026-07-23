import { db } from '../db'
import type { CosmeticsState } from '../types'

/** Clé fixe du singleton cosmétique. */
const COSMETICS_ID = 'me' as const

/**
 * Accès typé à l'état cosmétique (singleton, US-031). Seul point d'entrée vers
 * la table `cosmeticsState` (aucun Dexie hors de `src/db/`). Patron `builderRepo`.
 */
export const cosmeticsRepo = {
  get(): Promise<CosmeticsState | undefined> {
    return db.cosmeticsState.get(COSMETICS_ID)
  },

  async save(state: Omit<CosmeticsState, 'id'>): Promise<void> {
    await db.cosmeticsState.put({ id: COSMETICS_ID, ...state })
  },
}
