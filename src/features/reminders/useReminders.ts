import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { reminderTrigger } from '../../game/dueTime'
import { useContractsStore } from '../../stores/useContractsStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { formatDueShort } from '../contracts/dueDate'
import { notify } from './notifications'

/** Cadence du balayage des rappels (ms). Compromis réactivité / coût (US-014). */
const TICK_MS = 30_000

/**
 * Service de rappels (US-014, périmètre B). Monté une fois dans l'`AppShell` :
 * balaie les contrats **horodatés** à rappel actif et, dès que l'instant de
 * déclenchement est atteint (`reminderTrigger`), émet une **notification système**
 * (si permission) + un **toast in-app**, puis marque le rappel émis (anti-doublon,
 * survit au reload). La **1ʳᵉ passe** (une fois les contrats chargés) fait le
 * **rattrapage** : plusieurs échéances déjà arrivées pendant l'absence → un
 * **bandeau** + une **seule** notification agrégée.
 *
 * Best-effort assumé : rien ne sonne si l'app n'a pas tourné depuis.
 */
export function useReminders() {
  const { t } = useTranslation()
  // Le rattrapage (1ʳᵉ passe) doit voir les contrats **chargés** — sinon le
  // balayage au montage tomberait sur une liste vide (load asynchrone).
  const loaded = useContractsStore((s) => s.loaded)
  // Backstop mémoire : évite qu'un échec d'écriture Dexie de `reminderNotifiedFor`
  // fasse re-sonner un rappel à chaque tick (30 s).
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!loaded) return
    const seen = notifiedRef.current

    const scan = (initial: boolean) => {
      const now = Date.now()
      const { contracts, markReminderNotified } = useContractsStore.getState()
      const { pushToast, setDueCatchup } = useFeedbackStore.getState()

      const due = contracts.filter(
        (c) =>
          c.status === 'open' &&
          c.dueDate !== null &&
          c.dueHasTime &&
          c.reminderLead !== null &&
          now >= reminderTrigger(c.dueDate, c.reminderLead) &&
          c.reminderNotifiedFor !== c.dueDate &&
          !seen.has(`${c.id}:${c.dueDate}`),
      )
      if (due.length === 0) return

      // Marque immédiatement (mémoire + persistance) pour ne jamais re-sonner.
      for (const c of due) {
        seen.add(`${c.id}:${c.dueDate}`)
        void markReminderNotified(c.id, c.dueDate as number).catch(() => {})
      }

      const toast = (title: string, time: string) =>
        pushToast(
          'warning',
          t('contracts.reminder.toastTitle'),
          t('contracts.reminder.toastBody', { title, time }),
        )
      const system = (title: string, time: string) =>
        notify(
          t('contracts.reminder.notifTitle'),
          t('contracts.reminder.notifBody', { title, time }),
        )

      // « Arrivées » (échéance dépassée) vs « imminentes » (rappel en amont).
      const arrived = due.filter((c) => now >= (c.dueDate as number))
      const upcoming = due.filter((c) => now < (c.dueDate as number))

      // Rattrapage : au montage, plusieurs échéances passées → bandeau + une
      // seule notification système agrégée (pas de rafale).
      if (initial && arrived.length >= 2) {
        setDueCatchup(arrived.length)
        notify(
          t('contracts.reminder.catchupTitle', { count: arrived.length }),
          t('contracts.reminder.catchupBody'),
        )
      } else {
        for (const c of arrived) {
          const time = formatDueShort(c.dueDate as number, true)
          system(c.title, time)
          toast(c.title, time)
        }
      }

      // Imminentes : toujours individuelles (notif + toast).
      for (const c of upcoming) {
        const time = formatDueShort(c.dueDate as number, true)
        system(c.title, time)
        toast(c.title, time)
      }
    }

    scan(true)
    const timer = window.setInterval(() => scan(false), TICK_MS)
    return () => window.clearInterval(timer)
  }, [loaded, t])
}
