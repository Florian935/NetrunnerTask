import { db } from '../db'
import type {
  Contract,
  ContractStatus,
  Difficulty,
  Priority,
  Recurrence,
  SubTask,
} from '../types'

export interface CreateContractInput {
  title: string
  factionId?: string | null
  difficulty?: Difficulty
  priority?: Priority
  dueDate?: number | null
}

export interface ContractFilter {
  status?: ContractStatus
  factionId?: string
}

/** Accès typé aux contrats. Seul point d'entrée vers la table `contracts`. */
export const contractsRepo = {
  /**
   * Liste les contrats, du plus récent au plus ancien, filtrés éventuellement
   * par statut et/ou faction. Filtrage en mémoire : dataset local, volumes
   * faibles, combinaisons de critères simples.
   */
  async list(filter: ContractFilter = {}): Promise<Contract[]> {
    const all = await db.contracts.orderBy('createdAt').reverse().toArray()
    return all.filter(
      (c) =>
        (filter.status === undefined || c.status === filter.status) &&
        (filter.factionId === undefined || c.factionId === filter.factionId),
    )
  },

  get(id: string): Promise<Contract | undefined> {
    return db.contracts.get(id)
  },

  async create(input: CreateContractInput): Promise<Contract> {
    const contract: Contract = {
      id: crypto.randomUUID(),
      title: input.title,
      factionId: input.factionId ?? null,
      difficulty: input.difficulty ?? 'trivial',
      priority: input.priority ?? 'normal',
      dueDate: input.dueDate ?? null,
      status: 'open',
      createdAt: Date.now(),
      completedAt: null,
      rewardGranted: false,
      subtasks: [],
      recurrence: null,
    }
    await db.contracts.add(contract)
    return contract
  },

  async update(
    id: string,
    patch: Partial<Omit<Contract, 'id'>>,
  ): Promise<void> {
    await db.contracts.update(id, patch)
  },

  // --- Attributs (US-005) ---

  setPriority(id: string, priority: Priority): Promise<void> {
    return this.update(id, { priority })
  },

  /** Rattache le contrat à une faction, ou l'en détache (`null`) — US-007. */
  setFaction(id: string, factionId: string | null): Promise<void> {
    return this.update(id, { factionId })
  },

  /** Définit ou efface (`null`) l'échéance (epoch ms). */
  setDueDate(id: string, dueDate: number | null): Promise<void> {
    return this.update(id, { dueDate })
  },

  /** Définit ou efface (`null`) la récurrence (US-006). */
  setRecurrence(id: string, recurrence: Recurrence | null): Promise<void> {
    return this.update(id, { recurrence })
  },

  /** Ajoute une sous-tâche (titre déjà trimmé) en fin de liste. */
  async addSubtask(id: string, title: string): Promise<void> {
    const contract = await db.contracts.get(id)
    if (!contract) return
    const subtask: SubTask = { id: crypto.randomUUID(), title, done: false }
    await this.update(id, { subtasks: [...contract.subtasks, subtask] })
  },

  async toggleSubtask(id: string, subtaskId: string): Promise<void> {
    const contract = await db.contracts.get(id)
    if (!contract) return
    const subtasks = contract.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, done: !s.done } : s,
    )
    await this.update(id, { subtasks })
  },

  async removeSubtask(id: string, subtaskId: string): Promise<void> {
    const contract = await db.contracts.get(id)
    if (!contract) return
    await this.update(id, {
      subtasks: contract.subtasks.filter((s) => s.id !== subtaskId),
    })
  },

  /**
   * Marque un contrat comme terminé (statut + date). Couche « données pures » :
   * l'octroi de la récompense (XP/crédits) et le marqueur anti-farm
   * `rewardGranted` sont pilotés par le store contrats (US-008).
   */
  async complete(id: string): Promise<void> {
    await db.contracts.update(id, { status: 'done', completedAt: Date.now() })
  },

  async remove(id: string): Promise<void> {
    await db.contracts.delete(id)
  },
}
