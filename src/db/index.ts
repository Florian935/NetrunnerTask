// Barrel de la couche de données. Les consommateurs importent depuis `@/db`
// (ou `./db`) — jamais Dexie directement.
export { db, readDemoValue, writeDemoValue } from './db'
export type { DemoKV, NetrunnerDB } from './db'

export type {
  BuilderState,
  Contract,
  ContractStatus,
  Difficulty,
  Faction,
  Player,
  Priority,
  Recurrence,
  StakeOutcome,
  SubTask,
} from './types'

export { DEFAULT_FACTIONS, ensureSeeded } from './seed'

export { factionsRepo } from './repositories/factions'
export type { CreateFactionInput } from './repositories/factions'
export { contractsRepo } from './repositories/contracts'
export type {
  ContractFilter,
  CreateContractInput,
} from './repositories/contracts'
export { playerRepo } from './repositories/player'
export { builderRepo } from './repositories/builder'
