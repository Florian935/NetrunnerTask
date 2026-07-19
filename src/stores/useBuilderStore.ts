import { create } from 'zustand'
import { builderRepo } from '../db'
import {
  buyGenerator as buyGeneratorPure,
  hack as hackPure,
  tick as tickPure,
  type BuilderCore,
} from '../game/builder'

/**
 * Store réactif du builder « Réseau » (US-020). État persisté (`builderState`).
 * Les mutations passent par la logique pure `game/builder.ts`. Persistance :
 * **immédiate à l'achat** (rare, important — on ne perd pas des cycles dépensés)
 * et **throttlée** pour hack/tick (fréquents) — le hook `useBuilderTick` appelle
 * `persist()` périodiquement et au masquage de l'onglet.
 */
interface BuilderStoreState extends BuilderCore {
  loaded: boolean
  load: () => Promise<void>
  /** HACK manuel : ajoute des cycles (persistance différée par le hook). */
  hack: () => void
  /** Achète un daemon si le solde suffit (no-op sinon) ; persiste aussitôt. */
  buyGenerator: () => void
  /** Avance la production automatique de `dtMs` ms (persistance différée). */
  applyTick: (dtMs: number) => void
  /** Écrit l'état courant en base (`updatedAt` = maintenant). */
  persist: () => Promise<void>
}

const core = (s: BuilderCore): BuilderCore => ({
  cycles: s.cycles,
  generatorCount: s.generatorCount,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  cycles: 0,
  generatorCount: 0,
  loaded: false,

  load: async () => {
    const state = await builderRepo.get()
    set({
      cycles: state?.cycles ?? 0,
      generatorCount: state?.generatorCount ?? 0,
      loaded: true,
    })
  },

  hack: () => {
    set(hackPure(core(get())))
  },

  buyGenerator: () => {
    const current = core(get())
    const next = buyGeneratorPure(current)
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
    const { cycles, generatorCount } = get()
    await builderRepo.save({ cycles, generatorCount, updatedAt: Date.now() })
  },
}))
