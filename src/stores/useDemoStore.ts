import { create } from 'zustand'

/**
 * Store de démonstration (jetable — US-001) : prouve la réactivité Zustand.
 * Les vrais stores métier (contrats, joueur, factions) arriveront avec US-002+.
 */
interface DemoState {
  pings: number
  ping: () => void
  reset: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  pings: 0,
  ping: () => set((state) => ({ pings: state.pings + 1 })),
  reset: () => set({ pings: 0 }),
}))
