import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { formatCycles, formatRate } from './format'

/**
 * Lecteur de la **2ᵉ ressource** `data` (US-022) — panneau biseauté teinté
 * magenta, distinct du compteur cycles (fidèle à la maquette `network-datatree`).
 * `unlocked = false` tant que le daemon de déblocage n'est pas possédé (AC1) :
 * seul un indice d'ambiance neutre est affiché, aucune valeur ni débit. Badge
 * « NOUVEAU FLUX » lors du **premier** passage à `unlocked` (état local,
 * transitoire — pas persisté).
 */
export function DataReadout({
  unlocked,
  data,
  rate,
}: {
  unlocked: boolean
  data: number
  rate: number
}) {
  const { t } = useTranslation()
  const wasUnlocked = useRef(unlocked)
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    if (unlocked && !wasUnlocked.current) {
      setFresh(true)
      wasUnlocked.current = true
      const id = window.setTimeout(() => setFresh(false), 2600)
      return () => window.clearTimeout(id)
    }
    wasUnlocked.current = unlocked
  }, [unlocked])

  if (!unlocked) {
    return (
      <div className="builder__data-sealed">{t('builder.data.sealed')}</div>
    )
  }

  return (
    <div className={`builder__data${fresh ? ' builder__data--in' : ''}`}>
      <span className="builder__data-bracket builder__data-bracket--tl" aria-hidden />
      <span className="builder__data-bracket builder__data-bracket--br" aria-hidden />
      <span className="builder__data-icon">
        <Icon name="database" size={22} />
      </span>
      <div className="builder__data-body">
        <div className="builder__data-label">
          {t('builder.data.label')}
          {fresh && <span className="builder__data-badge">{t('builder.data.new')}</span>}
        </div>
        <div className="builder__data-value">{formatCycles(data)}</div>
      </div>
      <div className="builder__data-rate">
        +{t('builder.perSecond', { value: formatRate(rate) })}
      </div>
    </div>
  )
}
