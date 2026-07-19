import { useEffect } from 'react'
import { useBuilderStore } from '../../stores/useBuilderStore'

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
 */
export function useBuilderTick(): void {
  const loaded = useBuilderStore((s) => s.loaded)
  const applyTick = useBuilderStore((s) => s.applyTick)
  const persist = useBuilderStore((s) => s.persist)

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
