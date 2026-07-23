import { useTranslation } from 'react-i18next'
import { Card, Icon, ProgressBar } from '../../components/ui'
import { MILESTONE_DEFS, type MilestoneDef } from '../../game/milestones'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { RewardChip } from '../cosmetics/RewardChip'
import './builder.css'

function MilestoneRow({ def, achieved }: { def: MilestoneDef; achieved: boolean }) {
  const { t } = useTranslation()
  const sealed = Boolean(def.hidden) && !achieved
  const name = sealed ? t('builder.milestones.sealedName') : t(`builder.milestones.items.${def.id}.name`)
  const desc = achieved
    ? t(`builder.milestones.items.${def.id}.desc`)
    : sealed
      ? t('builder.milestones.sealedDesc')
      : t('builder.milestones.notAchieved')

  return (
    <div
      className={`builder__milestones-row${achieved ? ' builder__milestones-row--achieved' : ''}`}
    >
      {achieved && <span className="builder__milestones-row-bar" aria-hidden />}
      <span className="builder__milestones-row-icon">
        <Icon name={sealed ? 'lock' : def.icon} size={18} />
      </span>
      <div className="builder__milestones-row-body">
        <div className={`builder__milestones-row-name${sealed ? ' builder__milestones-row-name--sealed' : ''}`}>
          {name}
        </div>
        <div className={`builder__milestones-row-desc${sealed ? ' builder__milestones-row-desc--sealed' : ''}`}>
          {desc}
        </div>
        {/* US-033 : cosmétique récompense (masqué si jalon caché non atteint). */}
        {def.reward !== undefined && (
          <div style={{ marginTop: 9 }}>
            <RewardChip cosmeticId={def.reward} sealed={sealed} />
          </div>
        )}
      </div>
      <span className="builder__milestones-row-status">
        <Icon name={achieved ? 'check-circle' : sealed ? 'help-circle' : 'circle-dashed'} size={15} />
      </span>
    </div>
  )
}

/**
 * Panneau « REGISTRE » (US-028, maquette `network-milestones` validée PO) —
 * consultation **pure** des 11 jalons de progression (aucune interaction).
 * Chrome **neutre frost** sur `<Card hud brackets>` (pas de `halo` — les 6
 * accents du DS sont déjà réservés à des systèmes actifs ; le registre est la
 * carte de tous les systèmes, pas un système de plus). Les 2 jalons cachés
 * (`ghost`/`cartel`) restent masqués tant que non atteints — même vocabulaire
 * « scellé » que les nœuds cachés de l'arbre. Placé en fin de colonne
 * `builder__side`, sous `PrestigePanel`.
 */
export function MilestonesPanel() {
  const { t } = useTranslation()
  const achievedMilestones = useBuilderStore((s) => s.achievedMilestones)
  const achievedSet = new Set(achievedMilestones)
  const count = achievedSet.size
  const total = MILESTONE_DEFS.length

  return (
    <Card hud brackets padding="0" className="builder__milestones">
      <div className="builder__milestones-head">
        <div className="builder__milestones-head-row">
          <span className="builder__milestones-badge">
            <Icon name="scroll-text" size={17} />
          </span>
          <div className="builder__milestones-heading">
            <div className="builder__milestones-kicker">{t('builder.milestones.kicker')}</div>
            <div className="builder__milestones-title">{t('builder.milestones.heading')}</div>
          </div>
          <div className="builder__milestones-count">
            <div className="builder__milestones-count-value">
              {count}
              <span className="builder__milestones-count-total"> / {total}</span>
            </div>
            <div className="builder__milestones-count-label">{t('builder.milestones.countLabel')}</div>
          </div>
        </div>
        <ProgressBar accent="mint" value={count} max={total} height={5} />
      </div>
      <div className="builder__milestones-list">
        {MILESTONE_DEFS.map((def) => (
          <MilestoneRow key={def.id} def={def} achieved={achievedSet.has(def.id)} />
        ))}
      </div>
    </Card>
  )
}
