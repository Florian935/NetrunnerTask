import Dexie from 'dexie'
import type { Table } from 'dexie'
import { DEFAULT_COSMETICS, STARTER_COSMETICS } from '../game/cosmetics'
import { rewardsFor } from '../game/milestones'
import { DEFAULT_CALLSIGN } from '../game/profile'

/** Types (`CosmeticType`) équipables, pour la réconciliation de la migration v19. */
const COSMETIC_TYPES_MIG = ['theme', 'avatar', 'banner', 'title'] as const
import type {
  BuilderState,
  Contract,
  CosmeticsState,
  Faction,
  Player,
} from './types'

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
  cosmeticsState!: Table<CosmeticsState, string>
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
    // v16 (US-028) : jalons de progression. Table inchangée (même clé `id`) →
    // schéma v15 recopié + valeur par défaut sur la rangée singleton existante
    // (même modèle que les migrations v11→v15).
    this.version(16)
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
          .modify((b: { achievedMilestones?: string[] }) => {
            if (b.achievedMilestones === undefined) b.achievedMilestones = []
          }),
      )
    // v17 (US-031) : socle cosmétique. **Nouvelle table** singleton
    // `cosmeticsState` (clé `id`) → schéma v16 recopié + ajout de la table.
    // Pas de rétro-remplissage de rangée : le singleton est créé (idempotent)
    // par le seed (même modèle que l'ajout de `builderState` en v10).
    this.version(17).stores({
      contracts: 'id, factionId, status, dueDate, createdAt',
      factions: 'id, name',
      player: 'id',
      builderState: 'id',
      cosmeticsState: 'id',
      demoKV: 'key',
    })
    // v18 (US-032) : callsign du runner sur le singleton cosmétique. Pas d'index
    // nouveau → schéma v17 recopié + rétro-remplissage `callsign` par défaut
    // (patron des migrations de champ v11→v16).
    this.version(18)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { callsign?: string }) => {
            if (c.callsign === undefined) c.callsign = DEFAULT_CALLSIGN
          }),
      )
    // v19 (US-033) : l'acquisition devient déterministe — une partie ne possède
    // plus que les cosmétiques de départ + ceux gagnés via des accomplissements.
    // Reconciliation de la sauvegarde existante (qui possédait tout depuis
    // US-031) : `owned = STARTER ∪ récompenses des jalons déjà atteints`, et
    // repli des slots équipés devenus verrouillés sur le défaut de leur type.
    // Pas de champ nouveau (bump de version pour rejouer l'`upgrade`).
    this.version(19)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade(async (tx) => {
        const builder = await tx
          .table<{ achievedMilestones?: string[] }>('builderState')
          .get('me')
        const achieved = builder?.achievedMilestones ?? []
        const owned = Array.from(
          new Set([...STARTER_COSMETICS, ...rewardsFor(achieved)]),
        )
        const ownedSet = new Set(owned)
        await tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { owned?: string[]; equipped?: Record<string, string> }) => {
            c.owned = owned
            const eq = c.equipped ?? { ...DEFAULT_COSMETICS.equipped }
            for (const type of COSMETIC_TYPES_MIG) {
              if (!ownedSet.has(eq[type])) eq[type] = DEFAULT_COSMETICS.equipped[type]
            }
            c.equipped = eq
          })
      })
    // v20 (US-034) : stock de caisses non ouvertes par qualité sur le singleton
    // cosmétique. Pas d'index nouveau (`crates` non interrogé) → schéma v19
    // recopié + rétro-remplissage à zéro (patron des migrations de champ
    // v11→v18). Aucune reconciliation de `owned` : le pool exclusif est du
    // contenu neuf qu'aucune sauvegarde ne possède.
    this.version(20)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { crates?: Record<string, number> }) => {
            if (c.crates === undefined) {
              c.crates = { standard: 0, secured: 0, blackice: 0 }
            }
          }),
      )
    // v21 (US-035) : pity + fragments. Deux champs scalaires sur le singleton
    // cosmétique → schéma v20 recopié + rétro-remplissage à 0 (patron des
    // migrations de champ v11→v20). Aucune reconciliation (contenu neuf).
    this.version(21)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { fragments?: number; pity?: number }) => {
            if (c.fragments === undefined) c.fragments = 0
            if (c.pity === undefined) c.pity = 0
          }),
      )
    // v22 (US-036) : moteur de reveals + pacte de corruption. Trois champs sur le
    // singleton cosmétique → schéma v21 recopié + rétro-remplissage (patron des
    // migrations de champ v11→v21). Aucune reconciliation de `owned` (le titre
    // glitch est du contenu neuf qu'aucune save ne possède). Une sauvegarde déjà
    // à `prestigeCount ≥ 3` verra la corruption s'armer au 1ᵉʳ `load()` (rattrapage
    // voulu — le joueur avancé découvre la corruption à la mise à jour).
    this.version(22)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('cosmeticsState')
          .toCollection()
          .modify(
            (c: {
              discoveredReveals?: string[]
              corruption?: string
              corruptionArmedAt?: number | null
            }) => {
              if (c.discoveredReveals === undefined) c.discoveredReveals = []
              if (c.corruption === undefined) c.corruption = 'dormant'
              if (c.corruptionArmedAt === undefined) c.corruptionArmedAt = null
            },
          ),
      )
    // v23 (US-037) : la voie corrompue. **Deux** champs sur **deux** singletons →
    // schéma v22 recopié + rétro-remplissage (patron des migrations de champ
    // v11→v22) : `surcharge: 0` sur `builderState` (jauge live, reset renaissance)
    // et `securedVoltage: 0` sur `cosmeticsState` (voltage cumulé, survit).
    // Aucune reconciliation d'`owned` : les cosmétiques de voie sont du contenu
    // neuf qu'aucune sauvegarde ne possède.
    this.version(23)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade(async (tx) => {
        await tx
          .table('builderState')
          .toCollection()
          .modify((b: { surcharge?: number }) => {
            if (b.surcharge === undefined) b.surcharge = 0
          })
        await tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { securedVoltage?: number }) => {
            if (c.securedVoltage === undefined) c.securedVoltage = 0
          })
      })
    // v24 (US-038) : présentoir de la Salle des trophées. Un champ sur le
    // singleton cosmétique → schéma v23 recopié + rétro-remplissage `showcase: []`
    // (patron des migrations de champ v11→v23). Aucune reconciliation : le
    // présentoir est vide au départ (le joueur le compose). Le nombre
    // d'emplacements ouverts se dérive des jalons — rien à persister ici.
    this.version(24)
      .stores({
        contracts: 'id, factionId, status, dueDate, createdAt',
        factions: 'id, name',
        player: 'id',
        builderState: 'id',
        cosmeticsState: 'id',
        demoKV: 'key',
      })
      .upgrade((tx) =>
        tx
          .table('cosmeticsState')
          .toCollection()
          .modify((c: { showcase?: unknown[] }) => {
            if (c.showcase === undefined) c.showcase = []
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
