import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCELERATOR_BY_ID } from '../../game/accelerators'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

/** Cadence de la production automatique (ms). */
const TICK_MS = 250
/** Période de sauvegarde throttlée en base (ms). */
const PERSIST_MS = 4000

/**
 * Fait tourner la production automatique du builder tant que l'app est **ouverte
 * et visible** (US-020). Monté une fois (app-shell) → la production continue quel
 * que soit l'écran affiché.
 *
 * - **Pause quand l'onglet est masqué** ; à la reprise, on **réamorce l'horloge**
 *   sans créditer le temps masqué (le rattrapage hors-ligne est reporté à A5).
 * - **Persistance throttlée** : périodique + au masquage / `pagehide` / démontage
 *   (couvre le rechargement → l'état est conservé, critère d'acceptation 7).
 * - **Accélérateurs (US-023)** : `applyTick` résout aussi les transitions de
 *   session/boost (`game/accelerators.ts`) ; un effet séparé détecte
 *   l'apparition d'un boost (repos/en cours → SURCADENCE) pour le toast de
 *   succès, **quel que soit l'écran affiché** (comme la production).
 *   L'abandon (toast neutre) est déclenché directement par `AcceleratorPanel`
 *   (action utilisateur immédiate, pas besoin d'être détecté ici).
 */
export function useBuilderTick(): void {
  const { t } = useTranslation()
  const loaded = useBuilderStore((s) => s.loaded)
  const applyTick = useBuilderStore((s) => s.applyTick)
  const persist = useBuilderStore((s) => s.persist)
  const acceleratorBoost = useBuilderStore((s) => s.acceleratorBoost)
  const pushToast = useFeedbackStore((s) => s.pushToast)
  const prevBoostId = useRef<string | null>(null)

  useEffect(() => {
    if (acceleratorBoost && !prevBoostId.current) {
      const def = ACCELERATOR_BY_ID[acceleratorBoost.id]
      pushToast(
        'success',
        t('builder.accelerators.toastBoostTitle'),
        t('builder.accelerators.toastBoostBody', {
          mult: 1 + (def?.boostEffect.cycles ?? 0),
          minutes: Math.round((def?.boostDurationMs ?? 0) / 60_000),
        }),
      )
    }
    prevBoostId.current = acceleratorBoost?.id ?? null
  }, [acceleratorBoost, pushToast, t])

  useEffect(() => {
    if (!loaded) return

    let last = Date.now()
    let sinceSave = 0

    const interval = window.setInterval(() => {
      if (document.hidden) return
      const now = Date.now()
      const dt = now - last
      last = now
      applyTick(dt)
      sinceSave += dt
      if (sinceSave >= PERSIST_MS) {
        sinceSave = 0
        void persist()
      }
    }, TICK_MS)

    const onVisibility = () => {
      if (document.hidden) void persist()
      else last = Date.now() // reprise : pas de rattrapage hors-ligne (A5)
    }
    const onPageHide = () => void persist()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      void persist()
    }
  }, [loaded, applyTick, persist])
}
