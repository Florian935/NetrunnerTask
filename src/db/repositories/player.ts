import { db } from '../db'
import type { Player } from '../types'

/** Clé fixe du singleton joueur. */
const PLAYER_ID = 'me' as const

/** Accès typé au joueur (singleton). Seul point d'entrée vers la table `player`. */
export const playerRepo = {
  get(): Promise<Player | undefined> {
    return db.player.get(PLAYER_ID)
  },

  async update(patch: Partial<Omit<Player, 'id'>>): Promise<void> {
    await db.player.update(PLAYER_ID, patch)
  },
}
