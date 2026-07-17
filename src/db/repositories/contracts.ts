import { db } from '../db'
import type { Contract, ContractStatus, Difficulty, Priority } from '../types'

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
    }
    await db.contracts.add(contract)
    return contract
  },

  async update(id: string, patch: Partial<Omit<Contract, 'id'>>): Promise<void> {
    await db.contracts.update(id, patch)
  },

  /**
   * Marque un contrat comme terminé. Ne calcule **aucune** récompense
   * (XP/crédits) : cette logique arrive en US-008. Couche « données pures ».
   */
  async complete(id: string): Promise<void> {
    await db.contracts.update(id, { status: 'done', completedAt: Date.now() })
  },

  async remove(id: string): Promise<void> {
    await db.contracts.delete(id)
  },
}
