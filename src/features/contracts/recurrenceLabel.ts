import type { TFunction } from 'i18next'
import type { Recurrence } from '../../db'

const UNIT_KEY = {
  day: 'unitDay',
  week: 'unitWeek',
  month: 'unitMonth',
} as const

/**
 * Libellé i18n d'une récurrence pour la puce « ⟳ … » (US-006). Hors couche pure
 * (dépend de `t`). Ex. « ⟳ CHAQUE JOUR », « ⟳ TOUS LES 3 JOURS », « ⟳ CHAQUE LUNDI ».
 */
export function recurrenceLabel(recurrence: Recurrence, t: TFunction): string {
  if (recurrence.mode === 'weekday') {
    return t('contracts.recurrence.chipWeekday', {
      day: t(`contracts.recurrence.weekdayLong${recurrence.weekday}`),
    })
  }
  const unit = t(`contracts.recurrence.${UNIT_KEY[recurrence.unit]}`, {
    count: recurrence.every,
  })
  return recurrence.every === 1
    ? t('contracts.recurrence.chipEveryOne', { unit })
    : t('contracts.recurrence.chipEveryN', { count: recurrence.every, unit })
}
