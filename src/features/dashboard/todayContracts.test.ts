import { describe, expect, it } from 'vitest'
import type { Contract } from '../../db'
import { todayContracts } from './todayContracts'

/** Fabrique un contrat minimal pour les tests (défauts surchargés au besoin). */
function makeContract(over: Partial<Contract>): Contract {
  return {
    id: over.id ?? crypto.randomUUID(),
    title: over.title ?? 'Contrat',
    factionId: null,
    difficulty: 'trivial',
    priority: 'normal',
    dueDate: over.dueDate ?? null,
    dueHasTime: false,
    status: over.status ?? 'open',
    createdAt: 0,
    completedAt: null,
    rewardGranted: false,
    subtasks: [],
    recurrence: null,
    currentStreak: 0,
    bestStreak: 0,
    stake: 0,
    stakeOutcome: 'none',
    reminderLead: null,
    reminderNotifiedFor: null,
    ...over,
  }
}

/** Minuit local pour un jour donné de juillet 2026. */
function july(day: number): number {
  return new Date(2026, 6, day).getTime()
}

// « Maintenant » de référence : 18/07/2026, midi local.
const NOW = new Date(2026, 6, 18, 12, 0, 0).getTime()

describe('todayContracts', () => {
  it('classe les échéances dépassées en overdue et celles du jour en today', () => {
    const c16 = makeContract({ id: 'c16', dueDate: july(16) })
    const c18 = makeContract({ id: 'c18', dueDate: july(18) })
    const { overdue, today } = todayContracts([c16, c18], NOW)
    expect(overdue.map((c) => c.id)).toEqual(['c16'])
    expect(today.map((c) => c.id)).toEqual(['c18'])
  })

  it('exclut demain et au-delà', () => {
    const c19 = makeContract({ id: 'c19', dueDate: july(19) })
    const c25 = makeContract({ id: 'c25', dueDate: july(25) })
    const { overdue, today } = todayContracts([c19, c25], NOW)
    expect(overdue).toEqual([])
    expect(today).toEqual([])
  })

  it('exclut les contrats sans échéance', () => {
    const cNone = makeContract({ id: 'none', dueDate: null })
    expect(todayContracts([cNone], NOW)).toEqual({ overdue: [], today: [] })
  })

  it('exclut les contrats terminés, même en retard', () => {
    const done = makeContract({ id: 'done', dueDate: july(16), status: 'done' })
    expect(todayContracts([done], NOW)).toEqual({ overdue: [], today: [] })
  })

  it('trie chaque groupe par échéance croissante (le plus en retard d’abord)', () => {
    const c17 = makeContract({ id: 'c17', dueDate: july(17) })
    const c15 = makeContract({ id: 'c15', dueDate: july(15) })
    const c16 = makeContract({ id: 'c16', dueDate: july(16) })
    const { overdue } = todayContracts([c17, c15, c16], NOW)
    expect(overdue.map((c) => c.id)).toEqual(['c15', 'c16', 'c17'])
  })
})
