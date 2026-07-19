import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import {
  BUILDER_CONFIG,
  nextGeneratorCost,
  productionPerSec,
} from '../../game/builder'
import { formatCycles, formatRate } from './format'

/**
 * Carte d'achat du daemon (US-020). S'appuie sur le composant `<Card>` du design
 * system (coins HUD biseautés + repères d'angle collés aux coins, comme les
 * contrats). Bouton **Compiler** désactivé (cadenas + message) si solde insuffisant.
 */
export function DaemonCard({
  owned,
  affordable,
  onBuy,
}: {
  owned: number
  affordable: boolean
  onBuy: () => void
}) {
  const { t } = useTranslation()
  const cost = nextGeneratorCost(owned)
  const per = BUILDER_CONFIG.generator.yieldPerSec
  const rate = productionPerSec(owned)

  return (
    <Card hud brackets halo="violet" padding="16px">
      <div className="builder__daemon-head">
        <span className="builder__daemon-icon">
          <Icon name="cpu" size={22} />
        </span>
        <div className="builder__daemon-meta">
          <div className="builder__daemon-title-row">
            <span className="builder__daemon-name">{t('builder.daemonName')}</span>
            <span className="builder__daemon-count">
              {t('builder.daemonCount', { count: owned })}
            </span>
          </div>
          <div className="builder__daemon-role">{t('builder.daemonRole')}</div>
          <div className="builder__daemon-yield">
            {t('builder.daemonYield', { n: per })}
            <span className="builder__daemon-owned">
              {' · '}
              {t('builder.daemonOwned', { value: formatRate(rate) })}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="builder__buy"
        onClick={onBuy}
        disabled={!affordable}
      >
        <Icon name={affordable ? 'plus' : 'lock'} size={15} />
        {t('builder.buy')}
        <span className="builder__buy-cost">
          {t('builder.buyCost', { cost: formatCycles(cost) })}
        </span>
      </button>

      {!affordable && (
        <div className="builder__insufficient">
          <Icon name="alert-triangle" size={12} />
          {t('builder.insufficient')} ·{' '}
          {t('builder.insufficientHint', { n: per })}
        </div>
      )}
    </Card>
  )
}
