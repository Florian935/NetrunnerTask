import { create } from 'zustand'
import { contractsRepo, factionsRepo } from '../db'
import type { Contract, Difficulty, Priority, Recurrence } from '../db'
import { daysUntilDue } from '../features/contracts/dueDate'
import { firstOccurrence, nextOccurrence } from '../game/recurrence'
import { applyReputationDelta, reputationGain } from '../game/reputation'
import { isStakeEligible, isStakeLost, stakePayout } from '../game/risk'
import { rewardFor } from '../game/rewards'
import type { Reward } from '../game/rewards'
import { applyCompletion, isOnTime, resetIfMissed } from '../game/streak'
import { useFeedbackStore } from './useFeedbackStore'
import { usePlayerStore } from './usePlayerStore'

/**
 * Store réactif des contrats (source de vérité de la liste en mémoire).
 * Chaque action applique la mutation dans Dexie via `contractsRepo`, puis met
 * l'état à jour — les composants abonnés se rafraîchissent seuls.
 */
interface ContractsState {
  contracts: Contract[]
  loaded: boolean
  load: () => Promise<void>
  create: (title: string, difficulty?: Difficulty) => Promise<Contract>
  /**
   * Termine un contrat. Renvoie la récompense **si elle est versée** (sinon
   * `null`). Anti-farm : un one-shot ne paie qu'une fois ; un **récurrent** ne
   * paie que lorsqu'il est **dû** (sinon `null`) et se **reprogramme** à sa
   * prochaine échéance (US-006). L'octroi au joueur et le retour visuel sont
   * pilotés par la vue.
   */
  complete: (id: string) => Promise<Reward | null>
  reopen: (id: string) => Promise<void>
  rename: (id: string, title: string) => Promise<void>
  setDifficulty: (id: string, difficulty: Difficulty) => Promise<void>
  setFaction: (id: string, factionId: string | null) => Promise<void>
  setPriority: (id: string, priority: Priority) => Promise<void>
  setDueDate: (id: string, dueDate: number | null) => Promise<void>
  setRecurrence: (id: string, recurrence: Recurrence | null) => Promise<void>
  /**
   * Pose, modifie ou retire une mise à risque (US-013). `amount` en crédits
   * entiers : `> 0` pose/ajuste la mise, `0` la retire. Rembourse l'ancienne mise
   * puis débite la nouvelle (plancher 0). Rejet sans effet si le contrat n'est
   * pas éligible, si la mise est déjà résolue (`won`/`lost`), ou si `amount`
   * dépasse le solde disponible (solde + mise actuelle). Renvoie `true` si la
   * mise a été appliquée.
   */
  setStake: (id: string, amount: number) => Promise<boolean>
  /**
   * Résout la mise d'un contrat qu'on vient de terminer (US-013). Si la mise est
   * en jeu (`pending`) : complété **à temps** → gain (`won`), le retour
   * `stakePayout` est crédité ; complété **en retard** → perte (`lost`), aucun
   * crédit (déjà débité à la pose). Renvoie l'issue pour piloter le toast.
   */
  settleStakeOnComplete: (
    id: string,
  ) => Promise<{ result: 'won' | 'lost' | 'none'; stake: number; payout: number }>
  addSubtask: (id: string, title: string) => Promise<void>
  toggleSubtask: (id: string, subtaskId: string) => Promise<void>
  removeSubtask: (id: string, subtaskId: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: [],
  loaded: false,

  load: async () => {
    const contracts = await contractsRepo.list()
    const now = Date.now()
    // US-012 : pénalités de réputation dues aux streaks cassés ce chargement.
    const penalties: { factionId: string; amount: number }[] = []
    // US-013 : mises en jeu perdues ce chargement (→ toasts danger via AppShell).
    const stakeLosses: { title: string; amount: number }[] = []
    const reactivated = await Promise.all(
      contracts.map(async (c) => {
        // US-013 : mise en jeu dont l'échéance est dépassée → perdue (figée).
        // One-shot uniquement ; aucun mouvement de crédit (débit fait à la pose).
        if (isStakeLost(c, now)) {
          await contractsRepo.update(c.id, { stakeOutcome: 'lost' })
          stakeLosses.push({ title: c.title, amount: c.stake })
          return { ...c, stakeOutcome: 'lost' as const }
        }
        if (!c.recurrence) return c
        // Réactivation (US-006) : un récurrent **validé** dont la prochaine
        // échéance est atteinte redevient « à faire ».
        if (
          c.status === 'done' &&
          c.dueDate !== null &&
          daysUntilDue(c.dueDate, now) <= 0
        ) {
          const patch = {
            status: 'open' as const,
            completedAt: null,
            rewardGranted: false,
          }
          await contractsRepo.update(c.id, patch)
          return { ...c, ...patch }
        }
        // Période manquée (US-011) : un récurrent **ouvert** dont l'échéance est
        // dépassée voit sa série retomber à 0 (record préservé). Écriture
        // seulement si la valeur change (idempotent au fil des chargements).
        if (c.status === 'open') {
          const s = resetIfMissed(
            { currentStreak: c.currentStreak, bestStreak: c.bestStreak },
            c.dueDate,
            now,
          )
          if (s.currentStreak !== c.currentStreak) {
            await contractsRepo.update(c.id, { currentStreak: s.currentStreak })
            // US-012 : casser un streak rattaché à une faction lui coûte de la
            // réputation (malus = gain d'un contrat de cette difficulté).
            if (c.factionId) {
              penalties.push({
                factionId: c.factionId,
                amount: reputationGain(c.difficulty),
              })
            }
            return { ...c, currentStreak: s.currentStreak }
          }
        }
        return c
      }),
    )
    // Applique les pénalités (agrégées par faction, plancher 0). Écrites AVANT
    // que l'app-shell ne (re)charge les factions → réputation à jour à l'affichage.
    if (penalties.length > 0) {
      const byFaction = new Map<string, number>()
      for (const p of penalties) {
        byFaction.set(p.factionId, (byFaction.get(p.factionId) ?? 0) + p.amount)
      }
      await Promise.all(
        [...byFaction].map(async ([factionId, amount]) => {
          const faction = await factionsRepo.get(factionId)
          if (!faction) return
          const reputation = applyReputationDelta(faction.reputation, -amount)
          if (reputation !== faction.reputation) {
            await factionsRepo.update(factionId, { reputation })
          }
        }),
      )
    }
    // US-013 : remonte les mises perdues à la rétroaction (AppShell → toasts).
    if (stakeLosses.length > 0) {
      useFeedbackStore.getState().pushStakeLosses(stakeLosses)
    }
    set({ contracts: reactivated, loaded: true })
  },

  create: async (title, difficulty) => {
    const contract = await contractsRepo.create({ title, difficulty })
    set((s) => ({ contracts: [contract, ...s.contracts] }))
    return contract
  },

  complete: async (id) => {
    const current = get().contracts.find((c) => c.id === id)
    if (!current) return null

    // --- Contrat récurrent (US-006) : validé pour ce cycle, échéance avancée ---
    // Il passe `done` (case cochée, verrouillé) et sa prochaine échéance est
    // posée ; la **réactivation** au chargement le rouvrira le jour venu.
    // Anti-farm : un récurrent déjà `done` ne repasse jamais ici (verrouillé).
    if (current.recurrence) {
      const now = Date.now()
      const firstTime = !current.rewardGranted
      // Série (US-011) : « à temps » évalué sur l'échéance **courante**, avant de
      // l'avancer. À temps → +1 ; en retard → repart à 1. Une seule fois par
      // cycle (le verrou « récurrent validé » empêche une seconde complétion).
      const onTime = isOnTime(current.dueDate, now)
      const streak = applyCompletion(
        { currentStreak: current.currentStreak, bestStreak: current.bestStreak },
        onTime,
      )
      const patch = {
        status: 'done' as const,
        completedAt: now,
        rewardGranted: true,
        dueDate: nextOccurrence(current.recurrence, current.dueDate, now),
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
      }
      await contractsRepo.update(id, patch)
      set((s) => ({
        contracts: s.contracts.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      }))
      return firstTime ? rewardFor(current.difficulty) : null
    }

    // --- Contrat one-shot (comportement historique US-008) ---
    const completedAt = Date.now()
    // Première complétion → on verse la récompense et on pose le marqueur
    // anti-farm. Contrat déjà récompensé (rouvert puis re-terminé) → aucun gain.
    const firstTime = !current.rewardGranted
    if (firstTime) {
      await contractsRepo.update(id, {
        status: 'done',
        completedAt,
        rewardGranted: true,
      })
    } else {
      await contractsRepo.complete(id)
    }
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'done',
              completedAt,
              rewardGranted: c.rewardGranted || firstTime,
            }
          : c,
      ),
    }))
    return firstTime ? rewardFor(current.difficulty) : null
  },

  reopen: async (id) => {
    // On conserve `rewardGranted` : re-terminer un contrat rouvert ne repaie pas.
    await contractsRepo.update(id, { status: 'open', completedAt: null })
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, status: 'open', completedAt: null } : c,
      ),
    }))
  },

  rename: async (id, title) => {
    await contractsRepo.update(id, { title })
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, title } : c)),
    }))
  },

  setDifficulty: async (id, difficulty) => {
    await contractsRepo.update(id, { difficulty })
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, difficulty } : c,
      ),
    }))
  },

  setFaction: async (id, factionId) => {
    await contractsRepo.setFaction(id, factionId)
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, factionId } : c)),
    }))
  },

  setPriority: async (id, priority) => {
    await contractsRepo.setPriority(id, priority)
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, priority } : c)),
    }))
  },

  setDueDate: async (id, dueDate) => {
    // US-013 : retirer l'échéance d'un contrat dont la mise est en jeu la rend
    // inéligible (plus de déclencheur de perte) → on rembourse et annule la mise
    // pour ne pas laisser une mise « prisonnière » sans issue possible.
    const current = get().contracts.find((c) => c.id === id)
    const clearsStake =
      dueDate === null &&
      current?.stakeOutcome === 'pending' &&
      current.stake > 0
    await contractsRepo.setDueDate(id, dueDate)
    if (clearsStake) {
      await usePlayerStore.getState().adjustCredits(current.stake)
      await contractsRepo.update(id, { stake: 0, stakeOutcome: 'none' })
    }
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? {
              ...c,
              dueDate,
              ...(clearsStake
                ? { stake: 0, stakeOutcome: 'none' as const }
                : {}),
            }
          : c,
      ),
    }))
  },

  setRecurrence: async (id, recurrence) => {
    const current = get().contracts.find((c) => c.id === id)
    if (!current) return
    // Échéance auto (US-006) : une récurrence implique toujours une prochaine
    // date. On (re)pose la première occurrence quand il n'y a pas d'échéance,
    // **ou** quand on bascule d'une récurrence à une autre (l'échéance
    // auto-posée doit coller au nouveau choix — évite un résidu de l'ancien).
    // Une échéance saisie à la main avant toute récurrence est respectée.
    let dueDate = current.dueDate
    if (recurrence !== null) {
      const changed =
        JSON.stringify(recurrence) !== JSON.stringify(current.recurrence)
      const switching = current.recurrence !== null && changed
      if (current.dueDate === null || switching) {
        dueDate = firstOccurrence(recurrence, Date.now())
      }
    }
    // Retrait de la récurrence → la série n'a plus de sens : on remet à 0
    // (évite un résidu qui réapparaîtrait à une future re-récurrence) — US-011.
    const resetStreak =
      recurrence === null &&
      (current.currentStreak !== 0 || current.bestStreak !== 0)
    // Ajout d'une récurrence → le contrat devient inéligible à la mise (réservée
    // aux one-shot). On rembourse et annule la mise en jeu (symétrique de
    // `setDueDate(null)`) pour ne pas laisser une mise « prisonnière » qui serait
    // confisquée entre deux occurrences — US-013.
    const clearsStake =
      recurrence !== null &&
      current.stakeOutcome === 'pending' &&
      current.stake > 0
    await contractsRepo.setRecurrence(id, recurrence)
    if (dueDate !== current.dueDate) await contractsRepo.setDueDate(id, dueDate)
    if (resetStreak)
      await contractsRepo.update(id, { currentStreak: 0, bestStreak: 0 })
    if (clearsStake) {
      await usePlayerStore.getState().adjustCredits(current.stake)
      await contractsRepo.update(id, { stake: 0, stakeOutcome: 'none' })
    }
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? {
              ...c,
              recurrence,
              dueDate,
              ...(resetStreak ? { currentStreak: 0, bestStreak: 0 } : {}),
              ...(clearsStake
                ? { stake: 0, stakeOutcome: 'none' as const }
                : {}),
            }
          : c,
      ),
    }))
  },

  setStake: async (id, amount) => {
    const current = get().contracts.find((c) => c.id === id)
    if (!current) return false
    // Une mise résolue est figée : on n'y touche plus (US-013).
    if (current.stakeOutcome === 'won' || current.stakeOutcome === 'lost') {
      return false
    }
    // Montant entier ≥ 0. Poser (> 0) exige un contrat éligible.
    const next = Math.floor(amount)
    if (!Number.isFinite(next) || next < 0) return false
    if (next > 0 && !isStakeEligible(current)) return false

    const oldStake = current.stake
    // Après remboursement de l'ancienne mise, le maximum misable = solde + ancienne.
    const credits = usePlayerStore.getState().player?.credits ?? 0
    if (next > credits + oldStake) return false
    if (next === oldStake) return true // aucun changement

    // Rembourse l'ancienne mise, débite la nouvelle (delta net ; plancher 0 géré
    // par `adjustCredits`).
    await usePlayerStore.getState().adjustCredits(oldStake - next)

    const stakeOutcome = next > 0 ? 'pending' : 'none'
    await contractsRepo.update(id, { stake: next, stakeOutcome })
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, stake: next, stakeOutcome } : c,
      ),
    }))
    return true
  },

  settleStakeOnComplete: async (id) => {
    const current = get().contracts.find((c) => c.id === id)
    if (!current || current.stakeOutcome !== 'pending') {
      return { result: 'none', stake: 0, payout: 0 }
    }
    const stake = current.stake
    // À temps → gain crédité ; en retard → perte (aucun mouvement, déjà débité).
    if (isOnTime(current.dueDate, Date.now())) {
      const payout = stakePayout(stake, current.difficulty)
      await usePlayerStore.getState().adjustCredits(payout)
      await contractsRepo.update(id, { stakeOutcome: 'won' })
      set((s) => ({
        contracts: s.contracts.map((c) =>
          c.id === id ? { ...c, stakeOutcome: 'won' } : c,
        ),
      }))
      return { result: 'won', stake, payout }
    }
    await contractsRepo.update(id, { stakeOutcome: 'lost' })
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, stakeOutcome: 'lost' } : c,
      ),
    }))
    return { result: 'lost', stake, payout: 0 }
  },

  addSubtask: async (id, title) => {
    await contractsRepo.addSubtask(id, title)
    // Relit le contrat pour récupérer la sous-tâche (id généré côté repo).
    const updated = await contractsRepo.get(id)
    if (!updated) return
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, subtasks: updated.subtasks } : c,
      ),
    }))
  },

  toggleSubtask: async (id, subtaskId) => {
    await contractsRepo.toggleSubtask(id, subtaskId)
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? {
              ...c,
              subtasks: c.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, done: !sub.done } : sub,
              ),
            }
          : c,
      ),
    }))
  },

  removeSubtask: async (id, subtaskId) => {
    await contractsRepo.removeSubtask(id, subtaskId)
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? { ...c, subtasks: c.subtasks.filter((sub) => sub.id !== subtaskId) }
          : c,
      ),
    }))
  },

  remove: async (id) => {
    // US-013 : supprimer un contrat dont la mise est en jeu rembourse la mise
    // (l'argent débité à la pose ne doit pas disparaître avec le contrat).
    const current = get().contracts.find((c) => c.id === id)
    if (current?.stakeOutcome === 'pending' && current.stake > 0) {
      await usePlayerStore.getState().adjustCredits(current.stake)
    }
    await contractsRepo.remove(id)
    set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) }))
  },
}))
