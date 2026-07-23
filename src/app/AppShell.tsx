import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { Alert, Toast } from '../components/ui'
import { NavRail } from '../components/layout/NavRail'
import { StatusBar } from '../components/layout/StatusBar'
import { MilestoneToast, OfflineCatchupBanner, useBuilderTick } from '../features/builder'
import { CosmeticUnlockToast, CrateEarnedToast } from '../features/cosmetics'
import { LevelUpToast } from '../features/progression/LevelUpToast'
import { useReminders } from '../features/reminders/useReminders'
import { RankUpToast } from '../features/reputation/RankUpToast'
import { ReputationGainToast } from '../features/reputation/ReputationGainToast'
import { useBuilderStore } from '../stores/useBuilderStore'
import { useCosmeticsStore } from '../stores/useCosmeticsStore'
import { useContractsStore } from '../stores/useContractsStore'
import { useFactionsStore } from '../stores/useFactionsStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import '../components/layout/appShell.css'

/**
 * Chrome permanent de l'app (US-010) : rail de navigation + barre de statut +
 * vue active (`<Outlet/>`), et **hôte global de la rétroaction** (toasts, toast
 * de palier, gain de réputation & passage de rang), visible quelle que soit la
 * vue. Charge les données au montage : **contrats d'abord** (US-012 — la casse
 * d'un streak y applique les pénalités de réputation en base), **puis factions**
 * (qui lisent la réputation à jour), et le joueur en parallèle.
 */
export function AppShell() {
  const { t } = useTranslation()
  const loadContracts = useContractsStore((s) => s.load)
  const loadFactions = useFactionsStore((s) => s.load)
  const loadPlayer = usePlayerStore((s) => s.load)
  const loadBuilder = useBuilderStore((s) => s.load)
  const loadCosmetics = useCosmeticsStore((s) => s.load)
  const toasts = useFeedbackStore((s) => s.toasts)
  const dismiss = useFeedbackStore((s) => s.dismiss)
  const pushToast = useFeedbackStore((s) => s.pushToast)
  const stakeLosses = useFeedbackStore((s) => s.stakeLosses)
  const clearStakeLosses = useFeedbackStore((s) => s.clearStakeLosses)
  const dueCatchup = useFeedbackStore((s) => s.dueCatchup)
  const clearDueCatchup = useFeedbackStore((s) => s.clearDueCatchup)
  const offlineCatchup = useFeedbackStore((s) => s.offlineCatchup)
  const clearOfflineCatchup = useFeedbackStore((s) => s.clearOfflineCatchup)

  // US-014 : service de rappels (tick + rattrapage), best-effort local.
  useReminders()
  // US-020 : production automatique du builder (tant que l'app est ouverte/visible).
  useBuilderTick()
  const levelUp = useFeedbackStore((s) => s.levelUp)
  const clearLevelUp = () => useFeedbackStore.setState({ levelUp: null })
  const repGain = useFeedbackStore((s) => s.repGain)
  const rankUp = useFeedbackStore((s) => s.rankUp)
  const clearRankUp = () => useFeedbackStore.setState({ rankUp: null })
  const milestones = useFeedbackStore((s) => s.milestones)
  const dismissMilestone = useFeedbackStore((s) => s.dismissMilestone)
  const cosmeticUnlocks = useFeedbackStore((s) => s.cosmeticUnlocks)
  const dismissCosmeticUnlock = useFeedbackStore((s) => s.dismissCosmeticUnlock)
  const crateEarned = useFeedbackStore((s) => s.crateEarned)
  const dismissCrateEarned = useFeedbackStore((s) => s.dismissCrateEarned)

  useEffect(() => {
    // Séquencement : contrats → factions (les pénalités de réputation dues aux
    // streaks cassés sont écrites pendant `loadContracts`, avant leur lecture).
    void loadContracts().then(() => loadFactions())
    void loadPlayer()
    // US-031/033 : cosmétiques chargés **avant** le builder — au chargement, le
    // rattrapage hors-ligne peut débloquer un cosmétique (grant), qui serait
    // écrasé si `loadCosmetics` écrivait `owned` après. Applique aussi le thème.
    void loadCosmetics().then(() => loadBuilder())
  }, [loadContracts, loadFactions, loadPlayer, loadBuilder, loadCosmetics])

  // US-013 : mises perdues détectées au chargement → toasts danger (une fois).
  useEffect(() => {
    if (stakeLosses.length === 0) return
    for (const loss of stakeLosses) {
      pushToast(
        'danger',
        t('contracts.stake.toastLost'),
        t('contracts.stake.toastLostBody', {
          amount: loss.amount,
          title: loss.title,
        }),
      )
    }
    clearStakeLosses()
  }, [stakeLosses, pushToast, clearStakeLosses, t])

  return (
    <div className="app-shell">
      <NavRail />
      <div className="nav-main">
        <StatusBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Rattrapage de production hors-ligne (US-024) : bandeau au montage si le
          Réseau a produit pendant l'absence (gain notable). */}
      {offlineCatchup !== null && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(560px, calc(100vw - 36px))',
            zIndex: 1200,
          }}
        >
          <OfflineCatchupBanner
            cycles={offlineCatchup.cycles}
            data={offlineCatchup.data}
            awayMs={offlineCatchup.awayMs}
            onClose={clearOfflineCatchup}
          />
        </div>
      )}

      {/* Rattrapage d'échéances (US-014) : bandeau au montage si l'app a été
          fermée pendant que des échéances horodatées passaient. */}
      {dueCatchup !== null && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(520px, calc(100vw - 36px))',
            zIndex: 1200,
          }}
        >
          <Alert
            kind="warning"
            title={t('contracts.reminder.catchupTitle', { count: dueCatchup })}
            onClose={clearDueCatchup}
          >
            {t('contracts.reminder.catchupBody')}
          </Alert>
        </div>
      )}

      {/* Moments de palier (haut-centre) : montée de niveau + passage de rang */}
      {(levelUp !== null || rankUp !== null) && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 1100,
          }}
        >
          {levelUp !== null && (
            <LevelUpToast level={levelUp} onClose={clearLevelUp} />
          )}
          {rankUp !== null && (
            <RankUpToast item={rankUp} onClose={clearRankUp} />
          )}
        </div>
      )}

      {/* Jalons franchis (US-028, coin haut-droit) : file empilable, distincte
          des moments de palier (haut-centre, singletons) et des toasts
          génériques (bas-droite). */}
      {milestones.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 74, // sous la StatusBar (56px) + même marge que les autres zones fixes
            right: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 1100,
          }}
        >
          {milestones.map((item) => (
            <MilestoneToast key={item.id} item={item} onClose={() => dismissMilestone(item.id)} />
          ))}
        </div>
      )}

      {/* Déblocages de cosmétiques (US-033) : reveal empilable, bas-centre —
          distinct des jalons (haut-droit) et des toasts génériques (bas-droit). */}
      {cosmeticUnlocks.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 1100,
          }}
        >
          {cosmeticUnlocks.map((item) => (
            <CosmeticUnlockToast
              key={item.id}
              item={item}
              onClose={() => dismissCosmeticUnlock(item.id)}
            />
          ))}
        </div>
      )}

      {/* Caisses gagnées (US-034) : feedback empilable, haut-gauche — distinct
          des jalons (haut-droit) et des déblocages cosmétiques (bas-centre). */}
      {crateEarned.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 18,
            left: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 1100,
          }}
        >
          {crateEarned.map((item) => (
            <CrateEarnedToast key={item.id} item={item} onClose={() => dismissCrateEarned(item.id)} />
          ))}
        </div>
      )}

      {/* Pile de toasts (bas-droite) : gain de réputation au-dessus des toasts */}
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
        {repGain !== null && (
          <div style={{ pointerEvents: 'auto' }}>
            <ReputationGainToast item={repGain} />
          </div>
        )}
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
