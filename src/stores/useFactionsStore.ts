import { create } from 'zustand'
import { factionsRepo } from '../db'
import type { Faction } from '../db'

/**
 * Store réactif des factions (US-007). En MVP 1, les factions se limitent aux
 * 5 semées par défaut (`db/seed.ts`) — pas de CRUD utilisateur (H1) — donc elles
 * sont **chargées une fois** au démarrage et restent stables. Consommé par le
 * badge de ligne, le sélecteur de la modale et la barre de filtres.
 */
interface FactionsState {
  factions: Faction[]
  loaded: boolean
  load: () => Promise<void>
}

export const useFactionsStore = create<FactionsState>((set) => ({
  factions: [],
  loaded: false,

  load: async () => {
    const factions = await factionsRepo.list()
    set({ factions, loaded: true })
  },
}))
