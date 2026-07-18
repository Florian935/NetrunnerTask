import { create } from 'zustand'
import { playerRepo } from '../db'
import type { Player } from '../db'
import { levelForXp } from '../game/progression'
import type { Reward } from '../game/rewards'

/** Issue d'un octroi de récompense côté niveau (US-009). */
export interface LevelUpResult {
  /** Au moins un palier franchi lors de cet octroi ? */
  leveledUp: boolean
  /** Niveau avant l'octroi (redérivé de l'XP, auto-réparateur). */
  previousLevel: number
  /** Niveau après l'octroi. */
  newLevel: number
}

/**
 * Store réactif du joueur (progression persistée). Accumule l'XP et les crédits
 * gagnés en terminant des contrats (US-008) et **dérive/persiste le niveau**
 * depuis l'XP totale (US-009). `xp` reste la source de vérité.
 */
interface PlayerState {
  player: Player | null
  loaded: boolean
  load: () => Promise<void>
  /**
   * Ajoute une récompense au joueur (XP + crédits), recalcule et persiste le
   * niveau, puis renvoie l'issue de palier pour piloter la rétroaction.
   */
  grantReward: (reward: Reward) => Promise<LevelUpResult>
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
    if (!current) return { leveledUp: false, previousLevel: 1, newLevel: 1 }
    // Niveau précédent redérivé de l'XP courante (et non lu dans `player.level`,
    // qui pourrait avoir dérivé) → auto-réparateur.
    const previousLevel = levelForXp(current.xp)
    const nextXp = current.xp + reward.xp
    const newLevel = levelForXp(nextXp)
    const next: Player = {
      ...current,
      xp: nextXp,
      level: newLevel,
      credits: current.credits + reward.credits,
    }
    await playerRepo.update({
      xp: next.xp,
      level: next.level,
      credits: next.credits,
    })
    set({ player: next })
    return { leveledUp: newLevel > previousLevel, previousLevel, newLevel }
  },
}))
