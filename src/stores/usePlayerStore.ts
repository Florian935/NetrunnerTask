import { create } from 'zustand'
import { playerRepo } from '../db'
import type { Player } from '../db'
import type { Reward } from '../game/rewards'

/**
 * Store réactif du joueur (progression persistée). US-008 : accumule l'XP et les
 * crédits gagnés en terminant des contrats. **Ne dérive pas le niveau** — la
 * montée de niveau relève d'US-009.
 */
interface PlayerState {
  player: Player | null
  loaded: boolean
  load: () => Promise<void>
  /** Ajoute une récompense au joueur (XP + crédits), persistée. */
  grantReward: (reward: Reward) => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  loaded: false,

  load: async () => {
    const player = await playerRepo.get()
    set({ player: player ?? null, loaded: true })
  },

  grantReward: async (reward) => {
    const current = get().player
    if (!current) return
    const next: Player = {
      ...current,
      xp: current.xp + reward.xp,
      credits: current.credits + reward.credits,
    }
    await playerRepo.update({ xp: next.xp, credits: next.credits })
    set({ player: next })
  },
}))
