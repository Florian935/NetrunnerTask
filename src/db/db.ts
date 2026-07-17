import Dexie from 'dexie'
import type { Table } from 'dexie'

/**
 * Base locale (IndexedDB via Dexie).
 *
 * ⚠️ US-001 : table de démonstration `demoKV` uniquement, destinée à prouver la
 * persistance. Le vrai modèle de données (contrats, factions, joueur) sera
 * défini en US-002 — cette table sera alors remplacée.
 */
export interface DemoKV {
  key: string
  value: string
}

export class NetrunnerDB extends Dexie {
  demoKV!: Table<DemoKV, string>

  constructor() {
    super('netrunner-tasks')
    this.version(1).stores({
      demoKV: 'key',
    })
  }
}

export const db = new NetrunnerDB()

export async function readDemoValue(
  key: string,
): Promise<string | undefined> {
  const row = await db.demoKV.get(key)
  return row?.value
}

export async function writeDemoValue(
  key: string,
  value: string,
): Promise<void> {
  await db.demoKV.put({ key, value })
}
