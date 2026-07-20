import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon, ProgressBar } from '../../components/ui'
import { ACCELERATORS, type AcceleratorDef } from '../../game/accelerators'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useFeedbackStore } from '../../stores/useFeedbackStore'
import { formatCountdown } from './format'

/** 1 seule entrée pour ce lot (US-023) — catalogue extensible comme `GENERATORS`. */
const FOCUS: AcceleratorDef = ACCELERATORS[0]
const BOOST_MULT = 1 + (FOCUS.boostEffect.cycles ?? 0)

/** Horloge locale à la seconde, seulement pendant qu'une session/un boost est actif (compte à rebours). */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])
  return now
}

function PanelHead({ sub }: { sub: string }) {
  const { t } = useTranslation()
  return (
    <div className="builder__acc-head-row">
      <span className="builder__acc-heading">
        <Icon name="gauge" size={15} /> {t('builder.accelerators.heading')}
      </span>
      <span className="builder__acc-sub">{sub}</span>
    </div>
  )
}

/** État repos (AC1, AC2) : principe + engagement (durée/effet/boost) avant de lancer. */
function AccRepos({ onStart }: { onStart: () => void }) {
  const { t } = useTranslation()
  return (
    <Card hud brackets halo="cyan" padding="16px">
      <PanelHead sub={t('builder.accelerators.subOptional')} />
      <div className="builder__acc-head">
        <span className="builder__acc-icon">
          <Icon name={FOCUS.icon} size={22} />
        </span>
        <div className="builder__acc-meta">
          <div className="builder__acc-name">
            {t('builder.accelerators.catalog.focus.name')}
          </div>
          <div className="builder__acc-principle">
            {t('builder.accelerators.catalog.focus.principle')}
          </div>
        </div>
      </div>
      <div className="builder__acc-stats">
        <div className="builder__acc-stat">
          <Icon name="clock" size={14} />
          <div className="builder__acc-stat-value">
            {Math.round(FOCUS.durationMs / 60_000)} min
          </div>
          <div className="builder__acc-stat-cap">{t('builder.accelerators.statDuration')}</div>
        </div>
        <div className="builder__acc-stat">
          <Icon name="zap" size={14} />
          <div className="builder__acc-stat-value">
            {t('builder.accelerators.statEffectValue', { mult: BOOST_MULT })}
          </div>
          <div className="builder__acc-stat-cap">{t('builder.accelerators.statEffect')}</div>
        </div>
        <div className="builder__acc-stat">
          <Icon name="clock" size={14} />
          <div className="builder__acc-stat-value">
            {Math.round(FOCUS.boostDurationMs / 60_000)} min
          </div>
          <div className="builder__acc-stat-cap">{t('builder.accelerators.statBoost')}</div>
        </div>
      </div>
      <Button
        variant="secondary"
        hud
        className="builder__acc-cta"
        onClick={onStart}
        leftIcon={<Icon name="play" size={15} />}
      >
        {t('builder.accelerators.start')}
      </Button>
    </Card>
  )
}

/** État en cours (AC3, AC5) : chrono + abandon toujours accessible, sans urgence anxiogène. */
function AccRunning({
  endsAt,
  now,
  onAbort,
}: {
  endsAt: number
  now: number
  onAbort: () => void
}) {
  const { t } = useTranslation()
  const remaining = Math.max(0, endsAt - now)
  return (
    <Card hud brackets halo="cyan" padding="16px">
      <PanelHead sub={t('builder.accelerators.subRunning')} />
      <div className="builder__acc-run-row">
        <span className="builder__acc-ring-wrap">
          <span className="builder__acc-ring" aria-hidden />
          <span className="builder__acc-ring-core">
            <Icon name="brain" size={18} />
          </span>
        </span>
        <div className="builder__acc-run-body">
          <div className="builder__acc-remaining-label">{t('builder.accelerators.remaining')}</div>
          <div className="builder__acc-remaining-value">{formatCountdown(remaining)}</div>
        </div>
      </div>
      <ProgressBar
        accent="cyan"
        value={FOCUS.durationMs - remaining}
        max={FOCUS.durationMs}
        style={{ marginTop: 13 }}
      />
      <div className="builder__acc-run-caption">
        {t('builder.accelerators.rewardAtEnd', { mult: BOOST_MULT })}
      </div>
      <Button
        variant="ghost"
        hud
        className="builder__acc-cta"
        onClick={onAbort}
        leftIcon={<Icon name="x" size={13} />}
      >
        {t('builder.accelerators.abort')}
      </Button>
    </Card>
  )
}

/** État SURCADENCE active (AC4) : boost temporaire, distinct du nœud permanent OVERCLOCK. */
function AccBoost({ endsAt, now }: { endsAt: number; now: number }) {
  const { t } = useTranslation()
  const remaining = Math.max(0, endsAt - now)
  return (
    <Card hud brackets halo="cyan" className="builder__acc-boost" padding="16px">
      <PanelHead sub={t('builder.accelerators.subBoost')} />
      <div className="builder__acc-boost-row">
        <span className="builder__acc-boost-icon">
          <Icon name="zap" size={22} />
        </span>
        <div className="builder__acc-boost-body">
          <div className="builder__acc-boost-label">{t('builder.accelerators.boostActive')}</div>
          <div className="builder__acc-boost-mult-row">
            <span className="builder__acc-boost-mult">×{BOOST_MULT}</span>
            <span className="builder__acc-boost-prod">{t('builder.accelerators.boostProd')}</span>
          </div>
        </div>
        <div className="builder__acc-boost-remaining">
          <div className="builder__acc-boost-remaining-label">
            {t('builder.accelerators.boostRemaining')}
          </div>
          <div className="builder__acc-boost-remaining-value">{formatCountdown(remaining)}</div>
        </div>
      </div>
      <ProgressBar
        accent="cyan"
        value={remaining}
        max={FOCUS.boostDurationMs}
        style={{ marginTop: 13 }}
      />
      <div className="builder__acc-boost-footnote">{t('builder.accelerators.boostFootnote')}</div>
    </Card>
  )
}

/**
 * Panneau « Accélérateurs réels » (US-023, A4) — 3 états : repos, en cours,
 * SURCADENCE active. Sur le composant DS `<Card hud brackets halo="cyan">`
 * (accent réservé, distinct des daemons/de l'arbre). Placé dans la colonne
 * stage, sous `HackZone` (layout Option A, maquette `network-accelerators`
 * validée PO le 20/07/2026). Toute la logique d'état vit dans
 * `useBuilderStore` / `game/accelerators.ts` ; ce composant ne fait
 * qu'afficher et déclencher les actions.
 */
export function AcceleratorPanel() {
  const { t } = useTranslation()
  const run = useBuilderStore((s) => s.acceleratorRun)
  const boost = useBuilderStore((s) => s.acceleratorBoost)
  const startAccelerator = useBuilderStore((s) => s.startAccelerator)
  const cancelAccelerator = useBuilderStore((s) => s.cancelAccelerator)
  const pushToast = useFeedbackStore((s) => s.pushToast)

  const now = useNow(run !== null || boost !== null)

  const handleAbort = () => {
    cancelAccelerator()
    pushToast(
      'info',
      t('builder.accelerators.toastInterruptTitle'),
      t('builder.accelerators.toastInterruptBody'),
    )
  }

  return (
    <div className="builder__acc-wrap">
      {boost ? (
        <AccBoost endsAt={boost.endsAt} now={now} />
      ) : run ? (
        <AccRunning endsAt={run.endsAt} now={now} onAbort={handleAbort} />
      ) : (
        <AccRepos onStart={() => startAccelerator(FOCUS.id)} />
      )}

      <div className="builder__acc-teaser">
        <Icon name="plus" size={15} />
        <span>{t('builder.accelerators.teaser')}</span>
      </div>
    </div>
  )
}
