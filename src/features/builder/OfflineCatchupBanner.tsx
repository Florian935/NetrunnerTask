import { useTranslation } from 'react-i18next'
import { Alert, Icon } from '../../components/ui'
import { formatCycles, formatElapsed } from './format'

/**
 * Bandeau de rattrapage hors-ligne (US-024) — habillage d'`<Alert kind="success">`
 * (ton positif : « ton réseau a tourné en ton absence », pas un retard).
 * Affiché par `AppShell` quand `useFeedbackStore.offlineCatchup` est renseigné
 * (gain notable détecté au `load()`). `data` n'est montré que s'il est > 0
 * (mécanique pas forcément débloquée). Fermable, non bloquant.
 */
export function OfflineCatchupBanner({
  cycles,
  data,
  awayMs,
  onClose,
}: {
  cycles: number
  data: number
  awayMs: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Alert kind="success" title={t('builder.offline.title')} onClose={onClose}>
      <div className="builder__offline-row">
        <span className="builder__offline-away">
          {t('builder.offline.away', { duration: formatElapsed(awayMs) })}
        </span>
        <span className="builder__offline-gain">
          <Icon name="zap" size={14} />
          <span className="builder__offline-value">+{formatCycles(cycles)}</span>
          <span className="builder__offline-unit builder__offline-unit--cyan">
            {t('builder.cyclesLabel')}
          </span>
        </span>
        {data > 0 && (
          <span className="builder__offline-gain">
            <Icon name="database" size={14} />
            <span className="builder__offline-value">+{formatCycles(data)}</span>
            <span className="builder__offline-unit builder__offline-unit--magenta">
              {t('builder.data.label')}
            </span>
          </span>
        )}
      </div>
    </Alert>
  )
}
