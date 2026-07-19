import { create } from 'zustand'
import { contractsRepo } from '../db'
import type { Contract, Difficulty, Priority, Recurrence } from '../db'
import { daysUntilDue } from '../features/contracts/dueDate'
import { firstOccurrence, nextOccurrence } from '../game/recurrence'
import { rewardFor } from '../game/rewards'
import type { Reward } from '../game/rewards'
import { applyCompletion, isOnTime, resetIfMissed } from '../game/streak'

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
    const reactivated = await Promise.all(
      contracts.map(async (c) => {
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
            return { ...c, currentStreak: s.currentStreak }
          }
        }
        return c
      }),
    )
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
    await contractsRepo.setDueDate(id, dueDate)
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, dueDate } : c)),
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
    await contractsRepo.setRecurrence(id, recurrence)
    if (dueDate !== current.dueDate) await contractsRepo.setDueDate(id, dueDate)
    if (resetStreak)
      await contractsRepo.update(id, { currentStreak: 0, bestStreak: 0 })
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id
          ? {
              ...c,
              recurrence,
              dueDate,
              ...(resetStreak ? { currentStreak: 0, bestStreak: 0 } : {}),
            }
          : c,
      ),
    }))
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
    await contractsRepo.remove(id)
    set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) }))
  },
}))
