import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon, Slider } from '../../components/ui'
import { marketRate } from '../../game/crypto'
import { cryptoFloorBonus, type UnlockTreeCore } from '../../game/unlockTree'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { formatCycles } from './format'

/** Cadence de rafraîchissement du ticker (ms) — cohérent avec le ressenti de la maquette. */
const TICK_MS = 1500
/** Seuil de variation pour afficher une tendance (évite un clignotement sur du bruit infime). */
const TREND_EPSILON = 0.01

const dec2 = (n: number) => n.toFixed(2).replace('.', ',')

/** Horloge locale à cadence fixe, tant que le panneau est monté. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])
  return now
}

/**
 * Panneau « Marché crypto » (US-027) — ticker de cours + conversion
 * `data`→`crypto`. Sur `<Card hud brackets halo="amber">` (accent réservé,
 * distinct du magenta `data`/violet daemons/cyan accélérateurs/rouge
 * prestige). Colonne **stage** (layout Option A, maquette validée) : la
 * conversion est un geste actif délibéré, comme HACK/les accélérateurs.
 * Rendu conditionnel (`unlocked` = nœud `breach-market` acheté), même
 * contrat que `DataReadout`/`AcceleratorPanel`.
 */
export function CryptoPanel({ unlocked }: { unlocked: boolean }) {
  const { t } = useTranslation()
  const data = useBuilderStore((s) => s.data)
  const crypto = useBuilderStore((s) => s.crypto)
  const generators = useBuilderStore((s) => s.generators)
  const upgrades = useBuilderStore((s) => s.upgrades)
  const unlockedNodes = useBuilderStore((s) => s.unlockedNodes)
  const convertToCrypto = useBuilderStore((s) => s.convertToCrypto)
  const [pct, setPct] = useState(50)
  const now = useNow()

  const tree: UnlockTreeCore = { data, crypto, generators, upgrades, unlockedNodes }
  const rate = Math.max(marketRate(now), cryptoFloorBonus(tree))

  const prevRateRef = useRef(rate)
  const delta = rate - prevRateRef.current
  const trend = delta > TREND_EPSILON ? 'up' : delta < -TREND_EPSILON ? 'down' : 'flat'
  useEffect(() => {
    prevRateRef.current = rate
  }, [rate])

  if (!unlocked) return null

  const dataToConvert = Math.floor(data * (pct / 100))
  const cryptoPreview = Math.floor((dataToConvert / 1000) * rate)
  const canConvert = dataToConvert >= 1 && cryptoPreview >= 1

  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'
  const trendClass = `builder__crypto-trend builder__crypto-trend--${trend}`

  return (
    <Card hud brackets halo="amber" padding="16px" className="builder__crypto">
      <div className="builder__crypto-head">
        <span className="builder__crypto-icon">
          <Icon name="coins" size={20} />
        </span>
        <div className="builder__crypto-heading">
          <div className="builder__crypto-title">{t('builder.crypto.heading')}</div>
          <div className="builder__crypto-sub">{t('builder.crypto.subheading')}</div>
        </div>
      </div>

      <div className="builder__crypto-rate">
        <div className="builder__crypto-rate-value">
          {dec2(rate)}
          <span className="builder__crypto-rate-unit">{t('builder.crypto.unit')}</span>
        </div>
        <span className={trendClass}>
          <Icon name={trendIcon} size={14} />
          {t(`builder.crypto.trend${trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Flat'}`)}
        </span>
      </div>

      <div className="builder__crypto-balances">
        <div className="builder__crypto-balance builder__crypto-balance--data">
          <span className="builder__crypto-balance-label">
            <Icon name="database" size={11} /> {t('builder.crypto.balanceData')}
          </span>
          <span className="builder__crypto-balance-value">{formatCycles(data)}</span>
        </div>
        <div className="builder__crypto-balance builder__crypto-balance--crypto">
          <span className="builder__crypto-balance-label">
            <Icon name="coins" size={11} /> {t('builder.crypto.balanceCrypto')}
          </span>
          <span className="builder__crypto-balance-value">
            {formatCycles(crypto)} <span className="builder__crypto-balance-unit">CR</span>
          </span>
        </div>
      </div>

      <div className="builder__crypto-convert">
        <div className="builder__crypto-convert-row">
          <span>{t('builder.crypto.convertLabel')}</span>
          <span className="builder__crypto-convert-pct">{pct}%</span>
        </div>
        <Slider value={pct} min={0} max={100} step={1} onChange={setPct} accent="var(--amber-500)" />
        <div className="builder__crypto-preview">
          <span className="builder__crypto-preview-data">{formatCycles(dataToConvert)} DATA</span>
          <Icon name="arrow-right" size={16} />
          <span className="builder__crypto-preview-crypto">{formatCycles(cryptoPreview)} CR</span>
        </div>
      </div>

      <button
        type="button"
        className="builder__crypto-cta"
        onClick={() => convertToCrypto(dataToConvert)}
        disabled={!canConvert}
      >
        <Icon name={canConvert ? 'arrow-left-right' : 'lock'} size={15} />
        {t('builder.crypto.convertButton')}
      </button>
      <div className="builder__crypto-hint">
        {t('builder.crypto.convertHint')}{' '}
        <span className={`builder__crypto-hint-trend builder__crypto-hint-trend--${trend}`}>
          {t('builder.crypto.convertHintTrend')}
        </span>
      </div>
    </Card>
  )
}
