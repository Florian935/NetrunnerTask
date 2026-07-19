import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Contract, Faction, Player } from './types'

/**
 * Table de démonstration héritée d'US-001 (clé/valeur). Conservée uniquement
 * pour la page de démo jetable ; supprimée avec elle en US-010.
 */
export interface DemoKV {
  key: string
  value: string
}

/**
 * Base locale (IndexedDB via Dexie). Point d'accès unique aux données : aucun
 * composant n'interroge Dexie directement, tout passe par les repositories
 * (`src/db/repositories/`).
 */
export class NetrunnerDB extends Dexie {
  contracts!: Table<Contract, string>
  factions!: Table<Faction, string>
  player!: Table<Player, string>
  demoKV!: Table<DemoKV, string>

  constructor() {
    super('netrunner-tasks')
    // v1 (US-001) : table de démonstration seule.
    this.version(1).stores({ demoKV: 'key' })
    // v2 (US-002) : modèle du cœur MVP 1. Index sur les champs interrogés/triés.
    this.version(2).stores({
      contracts: 'id, factionId, status, dueDate, createdAt',
      factions: 'id, name',
      player: 'id',
      demoKV: 'key',
    })
    // v3 (US-008) : marqueur anti-farm `rewardGranted` sur les contrats. Pas
    // d'index nouveau (champ non interrogé) → on recopie le schéma v2 et on
    // rétro-remplit les contrats existants : un contrat déjà `done` est réputé
    // « déjà récompensé » (pas de paiement rétroactif), un `open` reste à payer.
    this.version(3)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table<Contract>('contracts')
          .toCollection()
          .modify((c) => {
            c.rewardGranted = c.status === 'done'
          }),
      )
    // v4 (US-005) : sous-tâches embarquées sur les contrats. Pas d'index nouveau
    // (`subtasks` non interrogé) → schéma v3 recopié + rétro-remplissage à `[]`.
    this.version(4)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table<Contract>('contracts')
          .toCollection()
          .modify((c) => {
            if (!c.subtasks) c.subtasks = []
          }),
      )
    // v5 (US-006) : récurrence embarquée sur les contrats. Pas d'index nouveau
    // (`recurrence` non interrogé) → schéma v4 recopié + rétro-remplissage à
    // `null` (contrats existants = one-shot).
    this.version(5)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table<Contract>('contracts')
          .toCollection()
          .modify((c) => {
            if (c.recurrence === undefined) c.recurrence = null
          }),
      )
    // v6 (US-011) : série (streak) embarquée sur les contrats. Pas d'index
    // nouveau (`currentStreak`/`bestStreak` non interrogés) → schéma v5 recopié
    // + rétro-remplissage à `0` (contrats existants = série vierge).
    this.version(6)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table<Contract>('contracts')
          .toCollection()
          .modify((c) => {
            if (c.currentStreak === undefined) c.currentStreak = 0
            if (c.bestStreak === undefined) c.bestStreak = 0
          }),
      )
  }
}

export const db = new NetrunnerDB()

// --- Helpers de démonstration (jetables, voir DemoKV) ---
export async function readDemoValue(key: string): Promise<string | undefined> {
  const row = await db.demoKV.get(key)
  return row?.value
}

export async function writeDemoValue(
  key: string,
  value: string,
): Promise<void> {
  await db.demoKV.put({ key, value })
}
