import { useTranslation } from 'react-i18next'
import {
  BUILDER_CONFIG,
  dataPerSec,
  productionPerSec,
  unlockedGenerators,
} from '../../game/builder'
import { dopageMultiplier } from '../../game/corruption'
import { prestigeMultiplier } from '../../game/prestige'
import { cycleMultiplier, dataMultiplier } from '../../game/unlockTree'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { OverloadPanel, SecureFeedback } from '../corruption'
import { AcceleratorPanel } from './AcceleratorPanel'
import { CryptoPanel } from './CryptoPanel'
import { DataReadout } from './DataReadout'
import { formatCycles, formatRate } from './format'
import { HackZone } from './HackZone'
import { MilestonesPanel } from './MilestonesPanel'
import { NetworkMap } from './NetworkMap'
import { PrestigePanel } from './PrestigePanel'
import './builder.css'

/**
 * Écran « Réseau » (US-020→US-029). Colonne centrée : compteur de cycles +
 * débit, HACK manuel, **Accélérateurs réels** (US-023), **Marché crypto**
 * (US-027), bandeau « Production réseau ». Puis, en **bande pleine largeur**,
 * la **Carte du Réseau** (US-029) — graphe spatial des daemons + arbre de
 * déblocage (remplace l'ancienne liste de daemons + les 2 arbres en lignes),
 * où se font désormais tous les achats (daemons, upgrades, nœuds). Enfin
 * **Renaissance** (US-024) et le **Registre des jalons** (US-028). Toute la
 * logique vit dans `useBuilderStore` / `game/*`.
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
  const surcharge = useBuilderStore((s) => s.surcharge)
  const hack = useBuilderStore((s) => s.hack)
  const corruption = useCosmeticsStore((s) => s.corruption)

  const core = { cycles, generators, upgrades, data, unlockedNodes }
  const tree = { data, crypto, generators, upgrades, unlockedNodes }
  const treeMultipliers = { cycles: cycleMultiplier(tree), data: dataMultiplier(tree) }
  // Débit **effectif** affiché : production de base × arbre × bonus de prestige
  // (US-024) × **dopage de la voie corrompue** (US-037, si embrassée) — reflète ce
  // que `applyTick` crédite réellement (le boost SURCADENCE reste hors débit).
  const embraced = corruption === 'embraced'
  const dopage = embraced ? dopageMultiplier(surcharge) : 1
  const pMult = prestigeMultiplier(prestigeCount)
  const rate = productionPerSec(core) * treeMultipliers.cycles * pMult * dopage
  const dataUnlocked = (generators[BUILDER_CONFIG.dataUnlockGenerator] ?? 0) >= 1
  const cryptoUnlocked = unlockedNodes.includes('breach-market')
  const dataRate = dataPerSec(core, treeMultipliers.data) * pMult * dopage
  const unlockedCount = unlockedGenerators(core).length

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
          {/* US-037 : la voie corrompue — panneau Surcharge + retour de sécurisation,
              dockés en colonne stage (visibles seulement si la corruption est embrassée). */}
          <OverloadPanel />
          <SecureFeedback />
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
                {t('builder.total.types', { count: unlockedCount })}
              </span>
            </span>
          </div>
        </div>

        {/* Carte du Réseau (US-029) — bande pleine largeur, casse la colonne 760.
            C'est ici que se font désormais tous les achats. */}
        <NetworkMap />

        <div className="builder__side">
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
