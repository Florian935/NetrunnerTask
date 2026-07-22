import { useTranslation } from 'react-i18next'
import {
  BUILDER_CONFIG,
  dataPerSec,
  GENERATORS,
  nextLockedGenerator,
  productionPerSec,
  unlockedGenerators,
} from '../../game/builder'
import { prestigeMultiplier } from '../../game/prestige'
import { cycleMultiplier, dataMultiplier } from '../../game/unlockTree'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { AcceleratorPanel } from './AcceleratorPanel'
import { CryptoPanel } from './CryptoPanel'
import { DaemonCard } from './DaemonCard'
import { DataReadout } from './DataReadout'
import { formatCycles, formatRate } from './format'
import { HackZone } from './HackZone'
import { MilestonesPanel } from './MilestonesPanel'
import { PrestigePanel } from './PrestigePanel'
import { TeaserCard } from './TeaserCard'
import { UnlockTreeSection } from './UnlockTreeSection'
import './builder.css'

/**
 * Écran « Réseau » (US-020, généralisé US-021→US-024, US-027). Compteur de
 * cycles + débit, HACK manuel, le panneau **Accélérateurs réels** (US-023) et
 * le **Marché crypto** (US-027 — geste actif du joueur), avant la **section
 * daemons** : bandeau « Production réseau », liste des daemons **débloqués**
 * (chaînés) et **teaser** du prochain verrouillé. Une fois `oracle` possédé :
 * lecteur `data` (US-022) + **arbre de déblocage** (branche `data`, puis
 * branche `crypto` une fois le marché débloqué) + **Renaissance** (US-024).
 * Toute la logique vit dans `useBuilderStore` / `game/builder.ts` /
 * `game/unlockTree.ts` / `game/accelerators.ts` / `game/crypto.ts`.
 */
export function BuilderView() {
  const { t } = useTranslation()
  const cycles = useBuilderStore((s) => s.cycles)
  const generators = useBuilderStore((s) => s.generators)
  const upgrades = useBuilderStore((s) => s.upgrades)
  const data = useBuilderStore((s) => s.data)
  const crypto = useBuilderStore((s) => s.crypto)
  const unlockedNodes = useBuilderStore((s) => s.unlockedNodes)
  const prestigeCount = useBuilderStore((s) => s.prestigeCount)
  const hack = useBuilderStore((s) => s.hack)
  const buyGenerator = useBuilderStore((s) => s.buyGenerator)
  const buyUpgrade = useBuilderStore((s) => s.buyUpgrade)

  const core = { cycles, generators, upgrades, data, unlockedNodes }
  const tree = { data, crypto, generators, upgrades, unlockedNodes }
  const treeMultipliers = { cycles: cycleMultiplier(tree), data: dataMultiplier(tree) }
  // Débit **effectif** affiché : production de base × arbre × bonus de prestige
  // (US-024) — reflète ce que `applyTick` crédite réellement (le boost temporaire
  // SURCADENCE reste hors du débit affiché, comme depuis US-023).
  const pMult = prestigeMultiplier(prestigeCount)
  const rate = productionPerSec(core) * treeMultipliers.cycles * pMult
  const dataUnlocked = (generators[BUILDER_CONFIG.dataUnlockGenerator] ?? 0) >= 1
  const cryptoUnlocked = unlockedNodes.includes('breach-market')
  const dataRate = dataPerSec(core, treeMultipliers.data) * pMult
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
          <DataReadout unlocked={dataUnlocked} data={data} rate={dataRate} />
          <HackZone onHack={hack} gain={BUILDER_CONFIG.manualYield} />
          <AcceleratorPanel />
          <CryptoPanel unlocked={cryptoUnlocked} />
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

          <UnlockTreeSection currency="data" unlocked={dataUnlocked} />
          <UnlockTreeSection currency="crypto" unlocked={cryptoUnlocked} />

          <div className="builder__prestige-heading">
            <span className="builder__prestige-rule" /> {t('builder.prestige.divider')}{' '}
            <span className="builder__prestige-rule" />
          </div>
          <PrestigePanel />
          <MilestonesPanel />
        </div>
      </div>
    </div>
  )
}
