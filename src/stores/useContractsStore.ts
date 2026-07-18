import { create } from 'zustand'
import { contractsRepo } from '../db'
import type { Contract, Difficulty, Priority } from '../db'
import { rewardFor } from '../game/rewards'
import type { Reward } from '../game/rewards'

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
   * Termine un contrat. Renvoie la récompense **si elle est versée pour la
   * première fois** (anti-farm : un contrat ne paie qu'une fois), sinon `null`.
   * L'octroi au joueur et le retour visuel sont pilotés par la vue.
   */
  complete: (id: string) => Promise<Reward | null>
  reopen: (id: string) => Promise<void>
  rename: (id: string, title: string) => Promise<void>
  setDifficulty: (id: string, difficulty: Difficulty) => Promise<void>
  setPriority: (id: string, priority: Priority) => Promise<void>
  setDueDate: (id: string, dueDate: number | null) => Promise<void>
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
    set({ contracts, loaded: true })
  },

  create: async (title, difficulty) => {
    const contract = await contractsRepo.create({ title, difficulty })
    set((s) => ({ contracts: [contract, ...s.contracts] }))
    return contract
  },

  complete: async (id) => {
    const current = get().contracts.find((c) => c.id === id)
    if (!current) return null
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
          ? { ...c, status: 'done', completedAt, rewardGranted: c.rewardGranted || firstTime }
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
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, difficulty } : c)),
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
