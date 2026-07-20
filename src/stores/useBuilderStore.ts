import { create } from 'zustand'
import { builderRepo } from '../db'
import {
  boostMultiplier,
  boostWindows,
  cancel as cancelAcceleratorPure,
  resolve as resolveAcceleratorPure,
  start as startAcceleratorPure,
  type AcceleratorCore,
} from '../game/accelerators'
import {
  buyGenerator as buyGeneratorPure,
  buyUpgrade as buyUpgradePure,
  hack as hackPure,
  offlineTick as offlineTickPure,
  type ProductionSegment,
  tick as tickPure,
  type BuilderCore,
} from '../game/builder'
import {
  prestige as prestigePure,
  prestigeMultiplier,
  type PrestigeCore,
} from '../game/prestige'
import {
  buyNode as buyNodePure,
  cycleMultiplier,
  dataMultiplier,
} from '../game/unlockTree'
import { useFeedbackStore } from './useFeedbackStore'

/** Seuil d'affichage du bandeau de rattrapage hors-ligne (US-024) : gain notable. */
const OFFLINE_NOTABLE = 1

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
  /** Nombre de renaissances (US-024) — bonus permanent `prestigeMultiplier`. */
  prestigeCount: number
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
  /** Renaissance (US-024) : reset du Réseau + bonus permanent (no-op si seuil <) ; persiste aussitôt. */
  prestige: () => void
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

const prestigeCore = (s: BuilderStoreState): PrestigeCore => ({
  cycles: s.cycles,
  generators: s.generators,
  upgrades: s.upgrades,
  data: s.data,
  unlockedNodes: s.unlockedNodes,
  prestigeCount: s.prestigeCount,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  unlockedNodes: [],
  acceleratorRun: null,
  acceleratorBoost: null,
  prestigeCount: 0,
  loaded: false,

  load: async () => {
    const state = await builderRepo.get()
    const now = Date.now()

    const loadedCore: BuilderCore = {
      cycles: state?.cycles ?? 0,
      generators: state?.generators ?? {},
      upgrades: state?.upgrades ?? {},
      data: state?.data ?? 0,
      unlockedNodes: state?.unlockedNodes ?? [],
    }
    const accAtClose: AcceleratorCore = {
      acceleratorRun: state?.acceleratorRun ?? null,
      acceleratorBoost: state?.acceleratorBoost ?? null,
    }
    const prestigeCount = state?.prestigeCount ?? 0
    const fromMs = state?.updatedAt ?? now

    // --- Rattrapage hors-ligne (US-024) ---
    // Calendrier de multiplicateurs : arbre (constant) × prestige (constant) ×
    // fenêtres de boost (variables — un `run` en cours peut devenir SURCADENCE
    // puis expirer pendant l'absence). Composé ici ; `offlineTick` rejoue.
    const treeC = cycleMultiplier(loadedCore)
    const treeD = dataMultiplier(loadedCore)
    const pMult = prestigeMultiplier(prestigeCount)
    const schedule: ProductionSegment[] = boostWindows(accAtClose, fromMs).map((w) => ({
      untilMs: w.untilMs,
      cycles: treeC * pMult * w.cycles,
      data: treeD * pMult * w.data,
    }))
    const caught = offlineTickPure(loadedCore, fromMs, now, schedule)
    const gainCycles = caught.cycles - loadedCore.cycles
    const gainData = caught.data - loadedCore.data

    // État de l'accélérateur au retour (résolution des transitions échues).
    const resolvedAcc = resolveAcceleratorPure(accAtClose, now)

    set({
      cycles: caught.cycles,
      generators: caught.generators,
      upgrades: caught.upgrades,
      data: caught.data,
      unlockedNodes: caught.unlockedNodes,
      acceleratorRun: resolvedAcc.acceleratorRun,
      acceleratorBoost: resolvedAcc.acceleratorBoost,
      prestigeCount,
      loaded: true,
    })

    // Bandeau de rattrapage seulement si le gain est notable (AC3/AC4).
    if (gainCycles >= OFFLINE_NOTABLE || gainData >= OFFLINE_NOTABLE) {
      useFeedbackStore.getState().setOfflineCatchup({
        cycles: gainCycles,
        data: gainData,
        awayMs: now - fromMs,
      })
    }

    // Persiste si le rattrapage ou la résolution a changé quelque chose.
    if (gainCycles > 0 || gainData > 0 || resolvedAcc !== accAtClose) {
      void get().persist()
    }
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

  prestige: () => {
    const current = prestigeCore(get())
    const next = prestigePure(current)
    if (next === current) return // seuil non atteint → no-op
    set({
      cycles: next.cycles,
      generators: next.generators,
      upgrades: next.upgrades,
      data: next.data,
      unlockedNodes: next.unlockedNodes,
      prestigeCount: next.prestigeCount,
      // acceleratorRun/acceleratorBoost intacts (engagement réel du joueur).
    })
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
    const pMult = prestigeMultiplier(state.prestigeCount)
    const next = tickPure(current, dtMs, {
      cycles: cycleMultiplier(current) * boost.cycles * pMult,
      data: dataMultiplier(current) * boost.data * pMult,
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
      prestigeCount,
    } = get()
    await builderRepo.save({
      cycles,
      generators,
      upgrades,
      data,
      unlockedNodes,
      acceleratorRun,
      acceleratorBoost,
      prestigeCount,
      updatedAt: Date.now(),
    })
  },
}))
