import { create } from 'zustand'
import { builderRepo } from '../db'
import {
  boostMultiplier,
  cancel as cancelAcceleratorPure,
  resolve as resolveAcceleratorPure,
  start as startAcceleratorPure,
  type AcceleratorCore,
} from '../game/accelerators'
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
 * Store réactif du builder « Réseau » (US-020, généralisé US-021, US-022,
 * US-023). État persisté (`builderState`) : `cycles` + maps `generators`/
 * `upgrades` par type de daemon + `data` + `unlockedNodes` (arbre de
 * déblocage) + `acceleratorRun`/`acceleratorBoost` (accélérateurs réels).
 * Mutations via la logique pure `game/builder.ts` (daemons/cycles/data),
 * `game/unlockTree.ts` (arbre) et `game/accelerators.ts` (accélérateurs) —
 * les trois modules sont **découplés** ; c'est ce store qui compose les
 * multiplicateurs (arbre × boost) avant `tick()`. Persistance **immédiate** à
 * l'achat (daemon/upgrade/nœud) et aux transitions d'accélérateur
 * (lancement/abandon/résolution) ; hack/tick throttlés par `useBuilderTick`.
 */
interface BuilderStoreState extends BuilderCore, AcceleratorCore {
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
  /** Lance l'accélérateur `id` (no-op si une session/boost est déjà en cours) ; persiste aussitôt. */
  startAccelerator: (id: string) => void
  /** Abandonne la session en cours (no-op sinon), aucune pénalité ; persiste aussitôt. */
  cancelAccelerator: () => void
  /** Avance la production automatique de `dtMs` ms (persistance différée) ; résout aussi les transitions d'accélérateur. */
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

const accelerators = (s: AcceleratorCore): AcceleratorCore => ({
  acceleratorRun: s.acceleratorRun,
  acceleratorBoost: s.acceleratorBoost,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  unlockedNodes: [],
  acceleratorRun: null,
  acceleratorBoost: null,
  loaded: false,

  load: async () => {
    const state = await builderRepo.get()
    const current: AcceleratorCore = {
      acceleratorRun: state?.acceleratorRun ?? null,
      acceleratorBoost: state?.acceleratorBoost ?? null,
    }
    // Rattrapage : si l'app était fermée quand une session/un boost a expiré.
    const resolved = resolveAcceleratorPure(current, Date.now())
    set({
      cycles: state?.cycles ?? 0,
      generators: state?.generators ?? {},
      upgrades: state?.upgrades ?? {},
      data: state?.data ?? 0,
      unlockedNodes: state?.unlockedNodes ?? [],
      acceleratorRun: resolved.acceleratorRun,
      acceleratorBoost: resolved.acceleratorBoost,
      loaded: true,
    })
    if (resolved !== current) void get().persist()
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

  startAccelerator: (id) => {
    const current = accelerators(get())
    const next = startAcceleratorPure(current, id, Date.now())
    if (next === current) return // session/boost déjà en cours → no-op
    set(next)
    void get().persist()
  },

  cancelAccelerator: () => {
    const current = accelerators(get())
    const next = cancelAcceleratorPure(current)
    if (next === current) return // aucune session en cours → no-op
    set(next)
    void get().persist()
  },

  applyTick: (dtMs) => {
    const now = Date.now()
    const state = get()
    const accCurrent = accelerators(state)
    const accNext = resolveAcceleratorPure(accCurrent, now)
    if (accNext !== accCurrent) set(accNext)

    const current = core(state) // champs builder non affectés par la résolution accélérateur
    const boost = boostMultiplier(accNext, now)
    const next = tickPure(current, dtMs, {
      cycles: cycleMultiplier(current) * boost.cycles,
      data: dataMultiplier(current) * boost.data,
    })
    if (next !== current) set({ cycles: next.cycles, data: next.data })

    if (accNext !== accCurrent) void get().persist()
  },

  persist: async () => {
    const {
      cycles,
      generators,
      upgrades,
      data,
      unlockedNodes,
      acceleratorRun,
      acceleratorBoost,
    } = get()
    await builderRepo.save({
      cycles,
      generators,
      upgrades,
      data,
      unlockedNodes,
      acceleratorRun,
      acceleratorBoost,
      updatedAt: Date.now(),
    })
  },
}))
