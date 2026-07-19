import { create } from 'zustand'
import { factionsRepo } from '../db'
import type { Faction } from '../db'
import { applyReputationDelta } from '../game/reputation'

/**
 * Store réactif des factions (US-007). En MVP 1, les factions se limitent aux
 * 5 semées par défaut (`db/seed.ts`) — pas de CRUD utilisateur (H1). Depuis
 * US-012 elles portent une **réputation** mutée à la complétion des contrats
 * (gain) et à la casse d'un streak (perte). Consommé par le badge de ligne, le
 * sélecteur de la modale, la barre de filtres et le panneau réputation.
 */
interface FactionsState {
  factions: Faction[]
  loaded: boolean
  load: () => Promise<void>
  /**
   * Applique un delta de réputation (gain positif / perte négative) à une
   * faction, avec **plancher 0** (US-012). Sans effet si la faction est inconnue
   * ou si la valeur ne change pas (ex. perte à 0).
   */
  grantReputation: (factionId: string, delta: number) => Promise<void>
}

export const useFactionsStore = create<FactionsState>((set, get) => ({
  factions: [],
  loaded: false,

  load: async () => {
    const factions = await factionsRepo.list()
    set({ factions, loaded: true })
  },

  grantReputation: async (factionId, delta) => {
    const faction = get().factions.find((f) => f.id === factionId)
    if (!faction) return
    const reputation = applyReputationDelta(faction.reputation, delta)
    if (reputation === faction.reputation) return
    await factionsRepo.update(factionId, { reputation })
    set((s) => ({
      factions: s.factions.map((f) =>
        f.id === factionId ? { ...f, reputation } : f,
      ),
    }))
  },
}))
