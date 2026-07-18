import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractsStore } from '../../stores/useContractsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'

/**
 * Complétion d'un contrat + rétroaction, **partagée** par le HUD et la liste
 * (US-010). Encapsule : `complete` (anti-farm) → `grantReward` (XP/crédits +
 * niveau) → alimentation de `useFeedbackStore` (gains de session, toast de
 * récompense, toast de palier si montée, flash). Rien ne se produit si le
 * contrat était déjà récompensé (`complete` renvoie `null`).
 */
export function useCompleteContract() {
  const { t } = useTranslation()
  const complete = useContractsStore((s) => s.complete)
  const grantReward = usePlayerStore((s) => s.grantReward)
  const pushToast = useFeedbackStore((s) => s.pushToast)
  const addGains = useFeedbackStore((s) => s.addGains)
  const triggerLevelUp = useFeedbackStore((s) => s.triggerLevelUp)
  const flash = useFeedbackStore((s) => s.flash)

  return useCallback(
    (id: string) => {
      void complete(id).then((reward) => {
        if (!reward) return
        void grantReward(reward).then((res) => {
          if (res.leveledUp) triggerLevelUp(res.newLevel)
        })
        addGains(reward.xp, reward.credits)
        pushToast(
          'success',
          t('contracts.toastReward'),
          t('contracts.reward', { xp: reward.xp, credits: reward.credits }),
        )
        flash(id)
      })
    },
    [complete, grantReward, pushToast, addGains, triggerLevelUp, flash, t],
  )
}
