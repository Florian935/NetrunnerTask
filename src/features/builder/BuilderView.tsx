import { useTranslation } from 'react-i18next'
import {
  BUILDER_CONFIG,
  GENERATORS,
  nextLockedGenerator,
  productionPerSec,
  unlockedGenerators,
} from '../../game/builder'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { DaemonCard } from './DaemonCard'
import { formatCycles, formatRate } from './format'
import { HackZone } from './HackZone'
import { TeaserCard } from './TeaserCard'
import './builder.css'

/**
 * Écran « Réseau » (US-020, généralisé US-021). Compteur de cycles + débit,
 * HACK manuel, puis la **section daemons** : bandeau « Production réseau », liste
 * des daemons **débloqués** (chaînés) et **teaser** du prochain verrouillé. Toute
 * la logique vit dans `useBuilderStore` / `game/builder.ts`.
 */
export function BuilderView() {
  const { t } = useTranslation()
  const cycles = useBuilderStore((s) => s.cycles)
  const generators = useBuilderStore((s) => s.generators)
  const upgrades = useBuilderStore((s) => s.upgrades)
  const hack = useBuilderStore((s) => s.hack)
  const buyGenerator = useBuilderStore((s) => s.buyGenerator)
  const buyUpgrade = useBuilderStore((s) => s.buyUpgrade)

  const core = { cycles, generators, upgrades }
  const rate = productionPerSec(core)
  const unlocked = unlockedGenerators(core)
  const locked = nextLockedGenerator(core)
  const lockedIdx = locked
    ? GENERATORS.findIndex((d) => d.id === locked.id)
    : -1
  const prevName =
    lockedIdx > 0
      ? t(`builder.generators.${GENERATORS[lockedIdx - 1].id}.name`)
      : ''

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
          <div className="builder__total">
            <span className="builder__total-label">
              <span className="builder__dot" /> {t('builder.total.label')}
            </span>
            <span className="builder__total-value">
              <span className="builder__total-rate">
                {t('builder.perSecond', { value: formatRate(rate) })}
              </span>
              <span className="builder__total-types">
                {' · '}
                {t('builder.total.types', { count: unlocked.length })}
              </span>
            </span>
          </div>

          <div className="builder__daemons-heading">
            <span className="builder__rule" /> {t('builder.daemonsHeading')}{' '}
            <span className="builder__rule" />
          </div>

          <div className="builder__daemon-list">
            {unlocked.map((def) => (
              <DaemonCard
                key={def.id}
                def={def}
                owned={generators[def.id] ?? 0}
                level={upgrades[def.id] ?? 0}
                cycles={cycles}
                onBuy={() => buyGenerator(def.id)}
                onUpgrade={() => buyUpgrade(def.id)}
              />
            ))}
            {locked && <TeaserCard def={locked} prevName={prevName} />}
          </div>
        </div>
      </div>
    </div>
  )
}
