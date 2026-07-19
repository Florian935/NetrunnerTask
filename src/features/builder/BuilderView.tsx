import { useTranslation } from 'react-i18next'
import {
  BUILDER_CONFIG,
  canBuyGenerator,
  productionPerSec,
} from '../../game/builder'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { DaemonCard } from './DaemonCard'
import { formatCycles, formatRate } from './format'
import { HackZone } from './HackZone'
import './builder.css'

/**
 * Écran « Réseau » (US-020, builder A1). Le noyau incrémental jouable : compteur
 * de cycles + débit, HACK manuel, achat d'un daemon générateur. Toute la logique
 * vit dans `useBuilderStore` / `game/builder.ts` ; cette vue ne fait qu'afficher
 * et déclencher les actions. Le fond immersif est hérité de `.nav-main` (#017).
 */
export function BuilderView() {
  const { t } = useTranslation()
  const cycles = useBuilderStore((s) => s.cycles)
  const generatorCount = useBuilderStore((s) => s.generatorCount)
  const hack = useBuilderStore((s) => s.hack)
  const buyGenerator = useBuilderStore((s) => s.buyGenerator)

  const rate = productionPerSec(generatorCount)
  const affordable = canBuyGenerator({ cycles, generatorCount })

  return (
    <div className="builder">
      <header className="builder__header">
        <div className="builder__title">
          <span className="builder__title-mark">//</span>
          <span className="builder__title-text">{t('builder.title')}</span>
        </div>
        <span className="builder__uplink">
          <span className="builder__dot" /> {t('builder.uplink')}
        </span>
      </header>

      <div className="builder__body">
        <div className="builder__stage">
          <div className="builder__readout">
            <div className="builder__readout-label">
              <span className="builder__readout-pulse" /> {t('builder.cyclesLabel')}
            </div>
            <div className="builder__readout-value">{formatCycles(cycles)}</div>
            <div
              className={`builder__readout-rate${rate > 0 ? ' builder__readout-rate--active' : ''}`}
            >
              {rate > 0 ? '+' : ''}
              {t('builder.perSecond', { value: formatRate(rate) })}
            </div>
          </div>
          <HackZone onHack={hack} gain={BUILDER_CONFIG.manualYield} />
        </div>

        <div className="builder__side">
          <div className="builder__daemons-heading">
            <span className="builder__rule" /> {t('builder.daemonsHeading')}{' '}
            <span className="builder__rule" />
          </div>
          <DaemonCard
            owned={generatorCount}
            affordable={affordable}
            onBuy={buyGenerator}
          />
          <p className="builder__hint">{t('builder.hint')}</p>
        </div>
      </div>
    </div>
  )
}
