import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon, ProgressBar } from '../../components/ui'
import { PRESTIGE_CONFIG, prestigeMultiplier } from '../../game/prestige'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { formatCycles } from './format'

/** Formate un multiplicateur (×1,5 / ×2,25) avec virgule décimale, sans zéros inutiles. */
function fmtMult(m: number): string {
  return `×${Number(m.toFixed(2)).toString().replace('.', ',')}`
}

/**
 * Panneau « Renaissance » (US-024, prestige) — **unique et permanent** sur le
 * composant DS `<Card hud brackets halo="red">` (accent rouge réservé, action
 * à conséquence irréversible). Affiche **toujours** le bonus permanent acquis,
 * puis l'état vers la prochaine renaissance : verrouillé (progression vers le
 * seuil, pas de bouton) ou éligible (bouton « Renaître » → confirmation).
 * Placé en fin de colonne side (après l'arbre), maquette `network-renaissance`.
 */
export function PrestigePanel() {
  const { t } = useTranslation()
  const cycles = useBuilderStore((s) => s.cycles)
  const prestigeCount = useBuilderStore((s) => s.prestigeCount)
  const doPrestige = useBuilderStore((s) => s.prestige)
  const [confirming, setConfirming] = useState(false)

  // Gate d'affichage ; le store revalide via `canPrestige` (source de vérité).
  const eligible = cycles >= PRESTIGE_CONFIG.threshold
  const currentMult = prestigeMultiplier(prestigeCount)
  const nextMult = prestigeMultiplier(prestigeCount + 1)
  const pct = Math.min(100, (cycles / PRESTIGE_CONFIG.threshold) * 100)

  const confirm = () => {
    doPrestige()
    setConfirming(false)
  }

  const lost = [
    t('builder.prestige.lost.resources'),
    t('builder.prestige.lost.daemons'),
    t('builder.prestige.lost.tree'),
  ]

  return (
    <div className={`builder__prestige${eligible ? ' builder__prestige--ready' : ''}`}>
      <Card hud brackets halo="red" padding="16px">
        <div className="builder__prestige-head">
          <span className="builder__prestige-title">
            <Icon name="flame" size={15} /> {t('builder.prestige.heading')}
          </span>
          <span className="builder__prestige-sub">
            {eligible ? t('builder.prestige.subReady') : t('builder.prestige.subRare')}
          </span>
        </div>

        {/* Bonus permanent — toujours visible */}
        <div className="builder__prestige-bonus">
          <span
            className={`builder__prestige-bonus-icon${prestigeCount > 0 ? ' builder__prestige-bonus-icon--on' : ''}`}
          >
            <Icon name="flame" size={16} />
          </span>
          <div className="builder__prestige-bonus-body">
            <div className="builder__prestige-bonus-label">
              {t('builder.prestige.bonusLabel')}
            </div>
            {prestigeCount > 0 ? (
              <div className="builder__prestige-bonus-value">
                <span className="builder__prestige-bonus-mult">{fmtMult(currentMult)}</span>{' '}
                {t('builder.prestige.bonusValue', { count: prestigeCount })}
              </div>
            ) : (
              <div className="builder__prestige-bonus-none">{t('builder.prestige.bonusNone')}</div>
            )}
          </div>
        </div>

        {/* État vers la prochaine renaissance */}
        <div className="builder__prestige-next">
          {eligible ? (
            <>
              <div className="builder__prestige-tier">
                <span className="builder__prestige-tier-label">
                  {t('builder.prestige.nextTier')}
                </span>
                <span className="builder__prestige-tier-value">
                  {fmtMult(currentMult)} → <strong>{fmtMult(nextMult)}</strong>
                </span>
              </div>
              <ProgressBar accent="var(--red-500)" value={100} max={100} height={8} />
              <Button
                variant="danger"
                hud
                className="builder__prestige-cta"
                onClick={() => setConfirming(true)}
                leftIcon={<Icon name="flame" size={16} />}
              >
                {t('builder.prestige.reborn')}
              </Button>
              <div className="builder__prestige-hint">{t('builder.prestige.rebornHint')}</div>
            </>
          ) : (
            <>
              <ProgressBar
                accent="var(--red-500)"
                value={pct}
                max={100}
                height={8}
                label={t('builder.prestige.progressLabel')}
                showValue
              />
              <div className="builder__prestige-progress-row">
                <span>
                  {formatCycles(cycles)} / {formatCycles(PRESTIGE_CONFIG.threshold)}{' '}
                  {t('builder.cyclesLabel')}
                </span>
                <span className="builder__prestige-progress-next">
                  {fmtMult(nextMult)} {t('builder.prestige.atTier')}
                </span>
              </div>
              <div className="builder__prestige-locked">
                <Icon name="lock" size={13} /> {t('builder.prestige.locked')}
              </div>
            </>
          )}
        </div>
      </Card>

      {confirming && (
        <ConfirmDialog
          title={t('builder.prestige.confirm.title')}
          status="!"
          icon="flame"
          iconColor="var(--red-400)"
          message={t('builder.prestige.confirm.message')}
          cancelLabel={t('builder.prestige.confirm.cancel')}
          confirmLabel={t('builder.prestige.reborn')}
          onCancel={() => setConfirming(false)}
          onConfirm={confirm}
        >
          <div className="builder__prestige-ledger">
            <div className="builder__prestige-col builder__prestige-col--lost">
              <div className="builder__prestige-col-head">
                <Icon name="trash-2" size={11} /> {t('builder.prestige.confirm.lostHead')}
              </div>
              {lost.map((l) => (
                <div key={l} className="builder__prestige-col-item">
                  · {l}
                </div>
              ))}
            </div>
            <div className="builder__prestige-col builder__prestige-col--kept">
              <div className="builder__prestige-col-head">
                <Icon name="check-circle" size={11} /> {t('builder.prestige.confirm.keptHead')}
              </div>
              <div className="builder__prestige-col-item">
                · {t('builder.prestige.confirm.keptBonus', {
                  from: fmtMult(currentMult),
                  to: fmtMult(nextMult),
                })}
              </div>
              <div className="builder__prestige-col-item">
                · {t('builder.prestige.confirm.keptSurvive')}
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </div>
  )
}
