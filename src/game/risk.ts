// Couche « règles de jeu » — logique pure, sans Dexie ni i18n ni React.
// US-013 : contrats à risque — miser des crédits sur un contrat one-shot à
// échéance. Barème de retour indexé sur la difficulté, éligibilité de la mise,
// détection de la perte (échéance dépassée).

import type { Difficulty, Recurrence, StakeOutcome } from '../db'
import { isPastDeadline } from './dueTime'

/**
 * Multiplicateur de **retour** d'une mise réussie, croissant avec la difficulté
 * (miser sur du dur rapporte plus). Le retour crédité = `mise × multiplicateur`
 * (la mise ayant été débitée à la pose, le gain net = retour − mise).
 */
export const STAKE_MULTIPLIERS: Record<Difficulty, number> = {
  trivial: 1.5,
  easy: 2,
  medium: 2.5,
  hard: 3,
  legendary: 4,
}

/** Retour total (entier) d'une mise réussie pour une difficulté donnée. */
export function stakePayout(stake: number, difficulty: Difficulty): number {
  return Math.round(stake * STAKE_MULTIPLIERS[difficulty])
}

/**
 * Un contrat peut-il **recevoir** une mise ? Réservé aux **one-shot** (non
 * récurrents) **ouverts** ayant une **échéance** (sans échéance, la perte n'a pas
 * de déclencheur) — cf. cadrage US-013 (H2/H5).
 */
export function isStakeEligible(contract: {
  recurrence: Recurrence | null
  dueDate: number | null
  status: 'open' | 'done'
}): boolean {
  return (
    contract.recurrence === null &&
    contract.dueDate !== null &&
    contract.status === 'open'
  )
}

/**
 * Une mise **en jeu** est-elle perdue à l'instant `now` ? Vrai si elle est
 * `pending`, le contrat encore `open`, et l'**instant limite** de l'échéance
 * dépassé (`dueTime`, US-014). Au jour = fin de la journée d'échéance (le jour
 * même reste gagnable) ; horodaté = l'instant exact.
 */
export function isStakeLost(
  contract: {
    stakeOutcome: StakeOutcome
    dueDate: number | null
    dueHasTime: boolean
    status: 'open' | 'done'
  },
  now: number,
): boolean {
  if (contract.stakeOutcome !== 'pending') return false
  if (contract.status !== 'open') return false
  if (contract.dueDate === null) return false
  return isPastDeadline(contract.dueDate, contract.dueHasTime, now)
}
