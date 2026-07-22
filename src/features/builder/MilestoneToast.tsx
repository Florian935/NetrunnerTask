import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { MILESTONE_BY_ID } from '../../game/milestones'
import type { MilestoneItem } from '../../stores/useFeedbackStore'
import './builder.css'

/**
 * Toast « Jalon atteint » (US-028, maquette `network-milestones`) — moment
 * one-shot bespoke, à l'image de `RankUpToast`/`LevelUpToast` (pas le
 * composant DS `Toast` générique, qui ne porte pas ce traitement). Sceau
 * hexagonal (écho du bouton HACK) + double liseré + eyebrow mono + balayage
 * sheen, nettement distinct d'un toast de récompense. **Empilable** :
 * plusieurs jalons peuvent tomber au même instant (`AppShell` en rend une
 * pile, coin haut-droit).
 */
export function MilestoneToast({
  item,
  onClose,
}: {
  item: MilestoneItem
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const def = MILESTONE_BY_ID[item.milestoneId]
  if (!def) return null
  const name = t(`builder.milestones.items.${def.id}.name`)

  return (
    <div className="builder__milestone-toast nw-toast-in" onClick={onClose}>
      <span className="builder__milestone-toast-line1" aria-hidden />
      <span className="builder__milestone-toast-line2" aria-hidden />
      <span className="builder__milestone-toast-corner builder__milestone-toast-corner--tl" aria-hidden />
      <span className="builder__milestone-toast-corner builder__milestone-toast-corner--tr" aria-hidden />
      <span className="builder__milestone-toast-corner builder__milestone-toast-corner--bl" aria-hidden />
      <span className="builder__milestone-toast-corner builder__milestone-toast-corner--br" aria-hidden />
      <span className="builder__milestone-toast-sheen" aria-hidden />
      <div className="builder__milestone-toast-body">
        <span className="builder__milestone-toast-seal">
          <Icon name={def.hidden ? 'sparkles' : def.icon} size={20} />
        </span>
        <div className="builder__milestone-toast-text">
          <div className="builder__milestone-toast-eyebrow">
            <Icon name="flag-triangle-right" size={11} /> {t('builder.milestones.toastEyebrow')}
          </div>
          <div className="builder__milestone-toast-name">{name}</div>
        </div>
      </div>
    </div>
  )
}
