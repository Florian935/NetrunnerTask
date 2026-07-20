import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import {
  type GeneratorDef,
  generatorCost,
  generatorProduction,
  upgradeCost,
  upgradeMultiplier,
} from '../../game/builder'
import { formatCycles, formatRate } from './format'

/**
 * Carte d'un daemon **débloqué** (US-021). Sur le composant DS `<Card>` (coins HUD
 * biseautés + repères d'angle + halo violet). Deux gestes distincts : **Compiler**
 * (achète une unité) et **Améliorer** (upgrade par type, ×mult la production).
 * Chacun se désactive (cadenas + coût rouge) si le solde est insuffisant.
 */
export function DaemonCard({
  def,
  owned,
  level,
  cycles,
  onBuy,
  onUpgrade,
}: {
  def: GeneratorDef
  owned: number
  level: number
  cycles: number
  onBuy: () => void
  onUpgrade: () => void
}) {
  const { t } = useTranslation()
  const cost = generatorCost(def, owned)
  const affordable = cycles >= cost
  const upCost = upgradeCost(def, level)
  const canUpgrade = cycles >= upCost
  const perUnit = def.baseYieldPerSec * upgradeMultiplier(def, level)
  const perUnitNext = def.baseYieldPerSec * upgradeMultiplier(def, level + 1)
  const totalProd = generatorProduction(def, owned, level)
  const effect = t('builder.upgrade.effect', {
    mult: def.upgrade.multiplier,
    from: perUnit,
    to: perUnitNext,
  })

  // Flash de l'icône au passage de niveau (upgrade), hors reduced-motion (CSS).
  const prevLevel = useRef(level)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (level > prevLevel.current) {
      setFlash(true)
      const id = window.setTimeout(() => setFlash(false), 400)
      prevLevel.current = level
      return () => window.clearTimeout(id)
    }
    prevLevel.current = level
  }, [level])

  return (
    <Card hud brackets halo="violet" padding="16px">
      <div className="builder__daemon-head">
        <span
          className={`builder__daemon-icon${flash ? ' builder__daemon-icon--flash' : ''}`}
        >
          <Icon name={def.icon} size={22} />
        </span>
        <div className="builder__daemon-meta">
          <div className="builder__daemon-title-row">
            <span className="builder__daemon-name">
              {t(`builder.generators.${def.id}.name`)}
            </span>
            <span className="builder__daemon-count">
              {t('builder.daemonCount', { count: owned })}
            </span>
          </div>
          <div className="builder__daemon-role">
            {t(`builder.generators.${def.id}.role`)}
          </div>
          <div className="builder__daemon-yield">
            {level > 0 && (
              <span className="builder__daemon-boost">
                {t('builder.upgrade.boost', {
                  level,
                  mult: upgradeMultiplier(def, level),
                })}
                {' · '}
              </span>
            )}
            {t('builder.daemonYield', { n: perUnit })}
            <span className="builder__daemon-owned">
              {' · '}
              {t('builder.daemonOwned', { value: formatRate(totalProd) })}
            </span>
          </div>
        </div>
      </div>

      <div className="builder__actions">
        <button
          type="button"
          className="builder__buy"
          onClick={onBuy}
          disabled={!affordable}
        >
          <span className="builder__btn-line">
            <Icon name={affordable ? 'plus' : 'lock'} size={13} /> {t('builder.buy')}
          </span>
          <span className="builder__buy-cost">
            {t('builder.buyCost', { cost: formatCycles(cost) })}
          </span>
        </button>
        <button
          type="button"
          className="builder__upgrade"
          onClick={onUpgrade}
          disabled={!canUpgrade}
          title={effect}
        >
          <span className="builder__btn-line">
            <Icon name={canUpgrade ? 'chevrons-up' : 'lock'} size={13} />{' '}
            {t('builder.upgrade.level', { level: level + 1 })}
          </span>
          <span className="builder__upgrade-cost">
            {t('builder.buyCost', { cost: formatCycles(upCost) })}
          </span>
        </button>
      </div>

      <div className="builder__effect">
        <Icon name="chevrons-up" size={11} /> {effect}
      </div>
    </Card>
  )
}
