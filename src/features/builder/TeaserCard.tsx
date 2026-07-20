import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { GeneratorDef } from '../../game/builder'
import { formatCycles } from './format'

/**
 * Carte d'un daemon **verrouillé** (US-021) — le teaser « il y en a d'autres
 * derrière » : silhouette anonymisée (« ??? »), signature chiffrée, estimation
 * de production, et **condition de déblocage**. Balayage scanline (hors
 * reduced-motion, CSS).
 */
export function TeaserCard({
  def,
  prevName,
}: {
  def: GeneratorDef
  prevName: string
}) {
  const { t } = useTranslation()
  return (
    <div className="builder__teaser">
      <div className="builder__teaser-scan" aria-hidden />
      <div className="builder__daemon-head">
        <span className="builder__teaser-icon">
          <Icon name="lock" size={20} />
        </span>
        <div className="builder__daemon-meta">
          <div className="builder__daemon-title-row">
            <span className="builder__teaser-name">{t('builder.teaser.name')}</span>
            <span className="builder__teaser-locked">
              {t('builder.teaser.locked')}
            </span>
          </div>
          <div className="builder__daemon-role">{t('builder.teaser.signature')}</div>
          <div className="builder__teaser-estimate">
            {t('builder.teaser.estimate', {
              value: formatCycles(def.baseYieldPerSec),
            })}
          </div>
        </div>
      </div>
      <div className="builder__teaser-unlock">
        <Icon name="key-round" size={14} />
        {t('builder.teaser.unlock', { prev: prevName })}
      </div>
    </div>
  )
}
