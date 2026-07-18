import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { Toast } from '../components/ui'
import { NavRail } from '../components/layout/NavRail'
import { StatusBar } from '../components/layout/StatusBar'
import { LevelUpToast } from '../features/progression/LevelUpToast'
import { useContractsStore } from '../stores/useContractsStore'
import { useFactionsStore } from '../stores/useFactionsStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import '../components/layout/appShell.css'

/**
 * Chrome permanent de l'app (US-010) : rail de navigation + barre de statut +
 * vue active (`<Outlet/>`), et **hôte global de la rétroaction** (toasts +
 * toast de palier), visible quelle que soit la vue. Charge les données au
 * montage (contrats + joueur).
 */
export function AppShell() {
  const loadContracts = useContractsStore((s) => s.load)
  const loadFactions = useFactionsStore((s) => s.load)
  const loadPlayer = usePlayerStore((s) => s.load)
  const toasts = useFeedbackStore((s) => s.toasts)
  const dismiss = useFeedbackStore((s) => s.dismiss)
  const levelUp = useFeedbackStore((s) => s.levelUp)
  const clearLevelUp = () => useFeedbackStore.setState({ levelUp: null })

  useEffect(() => {
    void loadContracts()
    void loadFactions()
    void loadPlayer()
  }, [loadContracts, loadFactions, loadPlayer])

  return (
    <div className="app-shell">
      <NavRail />
      <div className="nav-main">
        <StatusBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Toast de montée de niveau (haut-centre) — un palier à la fois */}
      {levelUp !== null && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
          }}
        >
          <LevelUpToast level={levelUp} onClose={clearLevelUp} />
        </div>
      )}

      {/* Pile de toasts (bas-droite) */}
      <div
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className="nw-toast-in"
            style={{ pointerEvents: 'auto' }}
          >
            <Toast
              kind={item.kind}
              title={item.title}
              onClose={() => dismiss(item.id)}
            >
              {item.label}
            </Toast>
          </div>
        ))}
      </div>
    </div>
  )
}
