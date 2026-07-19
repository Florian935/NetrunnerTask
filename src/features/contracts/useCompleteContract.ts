import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  rankForReputation,
  REPUTATION_RANKS,
  reputationGain,
} from '../../game/reputation'
import { useContractsStore } from '../../stores/useContractsStore'
import { useFactionsStore } from '../../stores/useFactionsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { factionLabel } from './factionLabel'

/**
 * Complétion d'un contrat + rétroaction, **partagée** par le HUD et la liste
 * (US-010). Encapsule : `complete` (anti-farm) → `grantReward` (XP/crédits +
 * niveau) → **réputation de faction** (US-012 : gain + toast, passage de rang) →
 * alimentation de `useFeedbackStore` (gains de session, toast de récompense,
 * toast de palier, flash). Rien ne se produit si le contrat était déjà
 * récompensé (`complete` renvoie `null`).
 */
export function useCompleteContract() {
  const { t } = useTranslation()
  const complete = useContractsStore((s) => s.complete)
  const grantReward = usePlayerStore((s) => s.grantReward)
  const grantReputation = useFactionsStore((s) => s.grantReputation)
  const pushToast = useFeedbackStore((s) => s.pushToast)
  const addGains = useFeedbackStore((s) => s.addGains)
  const triggerLevelUp = useFeedbackStore((s) => s.triggerLevelUp)
  const triggerRepGain = useFeedbackStore((s) => s.triggerRepGain)
  const triggerRankUp = useFeedbackStore((s) => s.triggerRankUp)
  const flash = useFeedbackStore((s) => s.flash)

  return useCallback(
    (id: string) => {
      // Faction + difficulté capturées avant complétion (inchangées par elle).
      const contract = useContractsStore
        .getState()
        .contracts.find((c) => c.id === id)
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

        // Réputation (US-012) — uniquement pour un contrat rattaché à une faction.
        if (!contract?.factionId) return
        const faction = useFactionsStore
          .getState()
          .factions.find((f) => f.id === contract.factionId)
        if (!faction) return

        const delta = reputationGain(contract.difficulty)
        const before = faction.reputation
        const after = before + delta
        const name = factionLabel(faction, t)
        void grantReputation(faction.id, delta)
        triggerRepGain({
          factionName: name,
          color: faction.color,
          delta,
          before,
          after,
        })

        const rankBefore = rankForReputation(before)
        const rankAfter = rankForReputation(after)
        if (rankAfter.index > rankBefore.index) {
          triggerRankUp({
            factionName: name,
            color: faction.color,
            fromRankKey: rankBefore.key,
            toRankKey: rankAfter.key,
            threshold: REPUTATION_RANKS[rankAfter.index].min,
          })
        }
      })
    },
    [
      complete,
      grantReward,
      grantReputation,
      pushToast,
      addGains,
      triggerLevelUp,
      triggerRepGain,
      triggerRankUp,
      flash,
      t,
    ],
  )
}
