import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { BuilderState, Contract, Faction, Player } from './types'

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
  builderState!: Table<BuilderState, string>
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
    // v7 (US-012) : réputation embarquée sur les factions. Pas d'index nouveau
    // (`reputation` non interrogé) → schéma v6 recopié + rétro-remplissage à `0`
    // (factions existantes = réputation vierge).
    this.version(7)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table<Faction>('factions')
          .toCollection()
          .modify((f) => {
            if (f.reputation === undefined) f.reputation = 0
          }),
      )
    // v8 (US-013) : mise à risque embarquée sur les contrats. Pas d'index nouveau
    // (`stake`/`stakeOutcome` non interrogés) → schéma v7 recopié + rétro-
    // remplissage `stake = 0` / `stakeOutcome = 'none'` (contrats existants = pas
    // de mise).
    this.version(8)
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
            if (c.stake === undefined) c.stake = 0
            if (c.stakeOutcome === undefined) c.stakeOutcome = 'none'
          }),
      )
    // v9 (US-014) : échéance horodatée + rappels. Pas d'index nouveau → schéma v8
    // recopié + rétro-remplissage `dueHasTime = false` (échéances existantes = au
    // jour), `reminderLead = null`, `reminderNotifiedFor = null`.
    this.version(9)
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
            if (c.dueHasTime === undefined) c.dueHasTime = false
            if (c.reminderLead === undefined) c.reminderLead = null
            if (c.reminderNotifiedFor === undefined) c.reminderNotifiedFor = null
          }),
      )
    // v10 (US-020) : état du builder « Réseau ». **Nouvelle table** singleton
    // `builderState` (clé `id`) → schéma v9 recopié + ajout du store. Pas de
    // rétro-remplissage de rangée : le singleton est créé (idempotent) par le seed.
    this.version(10).stores({
      contracts: 'id, factionId, status, dueDate, createdAt',
      factions: 'id, name',
      player: 'id',
      builderState: 'id',
      demoKV: 'key',
    })
    // v11 (US-021) : catalogue de daemons + upgrades par type. Le champ scalaire
    // `generatorCount` (le SCRAPER-01 d'A1) devient la map `generators:
    // { scraper: <count> }` + `upgrades: {}`. Table inchangée (même clé `id`) →
    // schéma v10 recopié + conversion de la rangée singleton (SCRAPER-01 + cycles
    // préservés).
    this.version(11)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('builderState')
          .toCollection()
          .modify(
            (b: {
              generatorCount?: number
              generators?: Record<string, number>
              upgrades?: Record<string, number>
            }) => {
              if (b.generators === undefined) {
                const count = b.generatorCount ?? 0
                b.generators = count > 0 ? { scraper: count } : {}
                b.upgrades = {}
                delete b.generatorCount
              }
            },
          ),
      )
    // v12 (US-022) : 2ᵉ ressource `data` + arbre de déblocage. Table inchangée
    // (même clé `id`) → schéma v11 recopié + valeurs par défaut sur la rangée
    // singleton existante (même modèle que la migration v11).
    this.version(12)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('builderState')
          .toCollection()
          .modify((b: { data?: number; unlockedNodes?: string[] }) => {
            if (b.data === undefined) b.data = 0
            if (b.unlockedNodes === undefined) b.unlockedNodes = []
          }),
      )
    // v13 (US-023) : accélérateurs réels au choix. Table inchangée (même clé
    // `id`) → schéma v12 recopié + valeurs par défaut sur la rangée singleton
    // existante (même modèle que les migrations v11/v12).
    this.version(13)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('builderState')
          .toCollection()
          .modify(
            (b: {
              acceleratorRun?: { id: string; endsAt: number } | null
              acceleratorBoost?: { id: string; endsAt: number } | null
            }) => {
              if (b.acceleratorRun === undefined) b.acceleratorRun = null
              if (b.acceleratorBoost === undefined) b.acceleratorBoost = null
            },
          ),
      )
    // v14 (US-024) : renaissance (prestige). Table inchangée (même clé `id`) →
    // schéma v13 recopié + valeur par défaut sur la rangée singleton existante
    // (même modèle que les migrations v11→v13).
    this.version(14)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('builderState')
          .toCollection()
          .modify((b: { prestigeCount?: number }) => {
            if (b.prestigeCount === undefined) b.prestigeCount = 0
          }),
      )
    // v15 (US-027) : marché crypto (3ᵉ ressource). Table inchangée (même clé
    // `id`) → schéma v14 recopié + valeur par défaut sur la rangée singleton
    // existante (même modèle que les migrations v11→v14).
    this.version(15)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('builderState')
          .toCollection()
          .modify((b: { crypto?: number }) => {
            if (b.crypto === undefined) b.crypto = 0
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
