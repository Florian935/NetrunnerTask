import { create } from 'zustand'
import { builderRepo } from '../db'
import {
  buyGenerator as buyGeneratorPure,
  buyUpgrade as buyUpgradePure,
  hack as hackPure,
  tick as tickPure,
  type BuilderCore,
} from '../game/builder'
import {
  buyNode as buyNodePure,
  cycleMultiplier,
  dataMultiplier,
} from '../game/unlockTree'

/**
 * Store réactif du builder « Réseau » (US-020, généralisé US-021, US-022).
 * État persisté (`builderState`) : `cycles` + maps `generators`/`upgrades`
 * par type de daemon + `data` + `unlockedNodes` (arbre de déblocage).
 * Mutations via la logique pure `game/builder.ts` (daemons/cycles/data) et
 * `game/unlockTree.ts` (arbre) — les deux modules sont **découplés** ; c'est
 * ce store qui compose les multiplicateurs de l'arbre avant `tick()`.
 * Persistance **immédiate** à l'achat (daemon/upgrade/nœud) ; hack/tick
 * throttlés par `useBuilderTick`.
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
  /** Achète le nœud `id` de l'arbre de déblocage (no-op si non éligible) ; persiste aussitôt. */
  buyNode: (id: string) => void
  /** Avance la production automatique de `dtMs` ms (persistance différée). */
  applyTick: (dtMs: number) => void
  /** Écrit l'état courant en base (`updatedAt` = maintenant). */
  persist: () => Promise<void>
}

const core = (s: BuilderCore): BuilderCore => ({
  cycles: s.cycles,
  generators: s.generators,
  upgrades: s.upgrades,
  data: s.data,
  unlockedNodes: s.unlockedNodes,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  unlockedNodes: [],
  loaded: false,

  load: async () => {
    const state = await builderRepo.get()
    set({
      cycles: state?.cycles ?? 0,
      generators: state?.generators ?? {},
      upgrades: state?.upgrades ?? {},
      data: state?.data ?? 0,
      unlockedNodes: state?.unlockedNodes ?? [],
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

  buyNode: (id) => {
    const current = core(get())
    const next = buyNodePure(current, id)
    if (next === current) return // condition non remplie ou solde insuffisant → no-op
    set(next)
    void get().persist()
  },

  applyTick: (dtMs) => {
    const current = core(get())
    const next = tickPure(current, dtMs, {
      cycles: cycleMultiplier(current),
      data: dataMultiplier(current),
    })
    if (next === current) return
    set({ cycles: next.cycles, data: next.data })
  },

  persist: async () => {
    const { cycles, generators, upgrades, data, unlockedNodes } = get()
    await builderRepo.save({
      cycles,
      generators,
      upgrades,
      data,
      unlockedNodes,
      updatedAt: Date.now(),
    })
  },
}))
