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
import { convert as convertPure, marketRate, type CryptoCore } from '../game/crypto'
import {
  checkHackMilestone,
  checkMilestones,
  MILESTONE_BY_ID,
  rewardsFor,
  type MilestoneCore,
} from '../game/milestones'
import {
  prestige as prestigePure,
  prestigeMultiplier,
  type PrestigeCore,
} from '../game/prestige'
import {
  buyNode as buyNodePure,
  cryptoFloorBonus,
  cycleMultiplier,
  dataMultiplier,
  type UnlockTreeCore,
} from '../game/unlockTree'
import { useCosmeticsStore } from './useCosmeticsStore'
import { useFeedbackStore } from './useFeedbackStore'

/** Seuil d'affichage du bandeau de rattrapage hors-ligne (US-024) : gain notable. */
const OFFLINE_NOTABLE = 1

/**
 * Store réactif du builder « Réseau » (US-020, généralisé US-021→US-024,
 * US-027). État persisté (`builderState`) : `cycles` + maps `generators`/
 * `upgrades` par type de daemon + `data` + `crypto` (US-027) +
 * `unlockedNodes` (arbre de déblocage, **partagé** entre branches data/crypto)
 * + `acceleratorRun`/`acceleratorBoost` (accélérateurs réels).
 * Mutations via la logique pure `game/builder.ts` (daemons/cycles/data),
 * `game/unlockTree.ts` (arbre multi-devise), `game/accelerators.ts`
 * (accélérateurs) et `game/crypto.ts` (marché) — modules **découplés** ;
 * c'est ce store qui compose les multiplicateurs (arbre × boost × prestige)
 * avant `tick()`. Persistance **immédiate** à l'achat (daemon/upgrade/nœud),
 * à la conversion crypto et aux transitions d'accélérateur ; hack/tick
 * throttlés par `useBuilderTick`.
 */
interface BuilderStoreState extends BuilderCore, AcceleratorCore {
  /** 3ᵉ ressource (US-027) — jamais accumulée passivement, voir `convertToCrypto`. */
  crypto: number
  /** Nombre de renaissances (US-024) — bonus permanent `prestigeMultiplier`. */
  prestigeCount: number
  /** `id` des jalons de progression déjà atteints (US-028), append-only. */
  achievedMilestones: string[]
  loaded: boolean
  load: () => Promise<void>
  /** HACK manuel : ajoute des cycles (persistance différée par le hook). */
  hack: () => void
  /** Achète un exemplaire du daemon `id` (no-op si solde <) ; persiste aussitôt. */
  buyGenerator: (id: string) => void
  /** Achète le prochain niveau d'upgrade du daemon `id` (no-op si solde <). */
  buyUpgrade: (id: string) => void
  /** Achète le nœud `id` de l'arbre (devise selon le nœud, no-op si non éligible) ; persiste aussitôt. */
  buyNode: (id: string) => void
  /** Convertit `dataAmount` de `data` en crypto au cours effectif du moment (no-op si invalide) ; persiste aussitôt. */
  convertToCrypto: (dataAmount: number) => void
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

/** Vue `UnlockTreeCore` (US-027 : gagne `crypto`) pour les appels à `unlockTree.ts`. */
const treeCore = (s: BuilderStoreState): UnlockTreeCore => ({
  data: s.data,
  crypto: s.crypto,
  generators: s.generators,
  upgrades: s.upgrades,
  unlockedNodes: s.unlockedNodes,
})

/** Vue `CryptoCore` pour les appels à `game/crypto.ts`. */
const cryptoCore = (s: BuilderStoreState): CryptoCore => ({
  data: s.data,
  crypto: s.crypto,
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
  crypto: s.crypto,
  unlockedNodes: s.unlockedNodes,
  prestigeCount: s.prestigeCount,
})

/** Vue `MilestoneCore` (US-028) pour les appels à `game/milestones.ts`. */
const milestoneCore = (s: BuilderStoreState): MilestoneCore => ({
  generators: s.generators,
  upgrades: s.upgrades,
  unlockedNodes: s.unlockedNodes,
  crypto: s.crypto,
  acceleratorBoost: s.acceleratorBoost,
  prestigeCount: s.prestigeCount,
})

export const useBuilderStore = create<BuilderStoreState>((set, get) => {
  /**
   * US-028 : évalue les jalons à prédicat d'état, empile les nouveaux (état +
   * toast dédié) et persiste **immédiatement** s'il y en a — écriture rare
   * (au plus une fois par jalon sur toute la partie), contrairement à
   * `cycles`/`data` throttlés par `useBuilderTick`. À appeler après toute
   * action pouvant faire basculer un prédicat (achat, conversion,
   * renaissance, résolution d'accélérateur) — **pas** au `load()`, qui
   * effectue son propre merge silencieux (voir plus bas : pas de toast pour
   * un jalon déjà acquis avant l'ouverture de l'app, ni pour un jalon
   * survenu hors-ligne — l'app en informe déjà via le bandeau de rattrapage).
   */
  function checkAndApplyMilestones(): void {
    const s = get()
    const newIds = checkMilestones(milestoneCore(s), s.achievedMilestones)
    if (newIds.length === 0) return
    set({ achievedMilestones: [...s.achievedMilestones, ...newIds] })
    for (const id of newIds) useFeedbackStore.getState().triggerMilestone(id)
    // US-033 : les jalons à récompense débloquent leur cosmétique + reveal dédié.
    grantMilestoneRewards(newIds, false)
    // US-034 : chaque jalon franchi octroie aussi une caisse (voie aléatoire).
    grantMilestoneCrates(newIds, false)
    void get().persist()
  }

  /**
   * US-033 : débloque les cosmétiques récompensant `milestoneIds` (idempotent
   * via `grant`). `silent` = pas de reveal (merge de `load()` : un déblocage
   * hors-ligne reste discret, le bandeau de rattrapage suffit).
   */
  function grantMilestoneRewards(milestoneIds: readonly string[], silent: boolean): void {
    const rewards = rewardsFor(milestoneIds)
    if (rewards.length === 0) return
    const granted = useCosmeticsStore.getState().grant(rewards)
    if (silent) return
    for (const cid of granted) useFeedbackStore.getState().triggerCosmeticUnlock(cid)
  }

  /**
   * US-034 : chaque jalon franchi octroie **en plus** une caisse (voie
   * aléatoire) — qualité indexée sur l'effort : jalon **caché**
   * (`ghost`/`cartel`) → `blackice`, jalon normal → `standard` (décision #2).
   * `silent` = pas de feedback (merge de `load()`, comme les récompenses).
   */
  function grantMilestoneCrates(milestoneIds: readonly string[], silent: boolean): void {
    for (const id of milestoneIds) {
      const def = MILESTONE_BY_ID[id]
      if (def === undefined) continue
      const quality = def.hidden ? 'blackice' : 'standard'
      useCosmeticsStore.getState().grantCrate(quality)
      if (!silent) useFeedbackStore.getState().triggerCrateEarned(quality)
    }
  }

  return {
  cycles: 0,
  generators: {},
  upgrades: {},
  data: 0,
  crypto: 0,
  unlockedNodes: [],
  acceleratorRun: null,
  acceleratorBoost: null,
  prestigeCount: 0,
  achievedMilestones: [],
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
    const crypto = state?.crypto ?? 0
    const accAtClose: AcceleratorCore = {
      acceleratorRun: state?.acceleratorRun ?? null,
      acceleratorBoost: state?.acceleratorBoost ?? null,
    }
    const prestigeCount = state?.prestigeCount ?? 0
    const achievedAtClose = state?.achievedMilestones ?? []
    const fromMs = state?.updatedAt ?? now

    // --- Rattrapage hors-ligne (US-024) ---
    // Calendrier de multiplicateurs : arbre (constant) × prestige (constant) ×
    // fenêtres de boost (variables — un `run` en cours peut devenir SURCADENCE
    // puis expirer pendant l'absence). Composé ici ; `offlineTick` rejoue.
    // `crypto` n'entre jamais dans ce calcul : il ne s'accumule jamais
    // passivement (seule une conversion active le fait varier, US-027).
    const treeC = cycleMultiplier({ ...loadedCore, crypto })
    const treeD = dataMultiplier({ ...loadedCore, crypto })
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

    // Jalons (US-028) : merge **silencieux** (état seul, aucun toast) — un
    // jalon déjà mérité avant l'ouverture (backfill après déploiement de la
    // fonctionnalité) ou survenu hors-ligne (ex. accélérateur résolu pendant
    // l'absence) n'a pas besoin d'un toast, le bandeau de rattrapage suffit.
    const newMilestoneIds = checkMilestones(
      {
        generators: caught.generators,
        upgrades: caught.upgrades,
        unlockedNodes: caught.unlockedNodes,
        crypto,
        acceleratorBoost: resolvedAcc.acceleratorBoost,
        prestigeCount,
      },
      achievedAtClose,
    )
    const achievedMilestones = [...achievedAtClose, ...newMilestoneIds]

    set({
      cycles: caught.cycles,
      generators: caught.generators,
      upgrades: caught.upgrades,
      data: caught.data,
      crypto,
      unlockedNodes: caught.unlockedNodes,
      acceleratorRun: resolvedAcc.acceleratorRun,
      acceleratorBoost: resolvedAcc.acceleratorBoost,
      prestigeCount,
      achievedMilestones,
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

    // US-033 : les jalons franchis hors-ligne débloquent aussi leur cosmétique,
    // mais **en silence** (pas de reveal — cohérent avec le merge silencieux des
    // jalons ; le bandeau de rattrapage suffit). `grant` est idempotent, et le
    // store cosmétique est chargé avant le builder (séquencement `AppShell`).
    grantMilestoneRewards(newMilestoneIds, true)
    // US-034 : idem pour les caisses des jalons rattrapés — en silence.
    grantMilestoneCrates(newMilestoneIds, true)

    // Persiste si le rattrapage, la résolution ou un jalon a changé quelque chose.
    if (gainCycles > 0 || gainData > 0 || resolvedAcc !== accAtClose || newMilestoneIds.length > 0) {
      void get().persist()
    }
  },

  hack: () => {
    set(hackPure(core(get())))
    // US-028 : jalon événementiel (pas de prédicat d'état, voir milestones.ts)
    // — persisté immédiatement, contrairement au reste de hack() (throttlé).
    const s = get()
    const hackIds = checkHackMilestone(s.achievedMilestones)
    if (hackIds.length > 0) {
      set({ achievedMilestones: [...s.achievedMilestones, ...hackIds] })
      for (const id of hackIds) useFeedbackStore.getState().triggerMilestone(id)
      grantMilestoneRewards(hackIds, false) // US-033
      grantMilestoneCrates(hackIds, false) // US-034
      void get().persist()
    }
  },

  buyGenerator: (id) => {
    const current = core(get())
    const next = buyGeneratorPure(current, id)
    if (next === current) return // solde insuffisant → no-op
    set(next)
    checkAndApplyMilestones()
    void get().persist()
  },

  buyUpgrade: (id) => {
    const current = core(get())
    const next = buyUpgradePure(current, id)
    if (next === current) return // solde insuffisant → no-op
    set(next)
    checkAndApplyMilestones()
    void get().persist()
  },

  buyNode: (id) => {
    const current = treeCore(get())
    const next = buyNodePure(current, id)
    if (next === current) return // condition non remplie ou solde insuffisant → no-op
    set({ data: next.data, crypto: next.crypto, unlockedNodes: next.unlockedNodes })
    checkAndApplyMilestones()
    void get().persist()
  },

  convertToCrypto: (dataAmount) => {
    const state = get()
    const now = Date.now()
    const effectiveRate = Math.max(marketRate(now), cryptoFloorBonus(treeCore(state)))
    const current = cryptoCore(state)
    const next = convertPure(current, dataAmount, effectiveRate)
    if (next === current) return // montant invalide ou solde insuffisant → no-op
    set({ data: next.data, crypto: next.crypto })
    checkAndApplyMilestones()
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
      crypto: next.crypto,
      unlockedNodes: next.unlockedNodes,
      prestigeCount: next.prestigeCount,
      // acceleratorRun/acceleratorBoost intacts (engagement réel du joueur).
    })
    // US-034 : une renaissance (effort réel, seuil incrémental US-026) octroie
    // une caisse de qualité supérieure (décision #2).
    useCosmeticsStore.getState().grantCrate('secured')
    useFeedbackStore.getState().triggerCrateEarned('secured')
    checkAndApplyMilestones()
    void get().persist()
  },

  applyTick: (dtMs) => {
    const now = Date.now()
    const state = get()
    const accCurrent = accelerators(state)
    const accNext = resolveAcceleratorPure(accCurrent, now)
    if (accNext !== accCurrent) set(accNext)

    const current = core(state) // champs builder non affectés par la résolution accélérateur
    const tree = treeCore(state)
    const boost = boostMultiplier(accNext, now)
    const pMult = prestigeMultiplier(state.prestigeCount)
    const next = tickPure(current, dtMs, {
      cycles: cycleMultiplier(tree) * boost.cycles * pMult,
      data: dataMultiplier(tree) * boost.data * pMult,
    })
    if (next !== current) set({ cycles: next.cycles, data: next.data })

    if (accNext !== accCurrent) {
      // Seul `accel` peut basculer ici (résolution d'un boost SURCADENCE) —
      // le seul cas de jalon pendant un tick « app ouverte ».
      checkAndApplyMilestones()
      void get().persist()
    }
  },

  persist: async () => {
    const {
      cycles,
      generators,
      upgrades,
      data,
      crypto,
      unlockedNodes,
      acceleratorRun,
      acceleratorBoost,
      prestigeCount,
      achievedMilestones,
    } = get()
    await builderRepo.save({
      cycles,
      generators,
      upgrades,
      data,
      crypto,
      unlockedNodes,
      acceleratorRun,
      acceleratorBoost,
      prestigeCount,
      achievedMilestones,
      updatedAt: Date.now(),
    })
  },
  }
})
