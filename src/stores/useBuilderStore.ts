import { create } from 'zustand'
import { builderRepo } from '../db'
import {
  buyGenerator as buyGeneratorPure,
  buyUpgrade as buyUpgradePure,
  hack as hackPure,
  tick as tickPure,
  type BuilderCore,
} from '../game/builder'

/**
 * Store réactif du builder « Réseau » (US-020, généralisé US-021). État persisté
 * (`builderState`) : `cycles` + maps `generators`/`upgrades` par type de daemon.
 * Mutations via la logique pure `game/builder.ts`. Persistance **immédiate** à
 * l'achat (daemon/upgrade) ; hack/tick throttlés par `useBuilderTick`.
 */
interface BuilderStoreState extends BuilderCore {
  loaded: boolean
  load: () => Promise<void>
  /** HACK manuel : ajoute des cycles (persistance différée par le hook). */
  hack: () => void
  /** Achète un exemplaire du daemon `id` (no-op si solde <) ; persiste aussitôt. */
  buyGenerator: (id: string) => void
  /** Achète le prochain niveau d'upgrade du daemon `id` (no-op si solde <). */
  buyUpgrade: (id: string) => void
  /** Avance la production automatique de `dtMs` ms (persistance différée). */
  applyTick: (dtMs: number) => void
  /** Écrit l'état courant en base (`updatedAt` = maintenant). */
  persist: () => Promise<void>
}

const core = (s: BuilderCore): BuilderCore => ({
  cycles: s.cycles,
  generators: s.generators,
  upgrades: s.upgrades,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  loaded: false,

  load: async () => {
    const state = await builderRepo.get()
    set({
      cycles: state?.cycles ?? 0,
      generators: state?.generators ?? {},
      upgrades: state?.upgrades ?? {},
      loaded: true,
    })
  },

  hack: () => {
    set(hackPure(core(get())))
  },

  buyGenerator: (id) => {
    const current = core(get())
    const next = buyGeneratorPure(current, id)
    if (next === current) return // solde insuffisant → no-op
    set(next)
    void get().persist()
  },

  buyUpgrade: (id) => {
    const current = core(get())
    const next = buyUpgradePure(current, id)
    if (next === current) return // solde insuffisant → no-op
    set(next)
    void get().persist()
  },

  applyTick: (dtMs) => {
    const current = core(get())
    const next = tickPure(current, dtMs)
    if (next === current) return
    set({ cycles: next.cycles })
  },

  persist: async () => {
    const { cycles, generators, upgrades } = get()
    await builderRepo.save({ cycles, generators, upgrades, updatedAt: Date.now() })
  },
}))
