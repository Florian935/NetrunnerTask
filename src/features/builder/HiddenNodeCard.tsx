import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import type { Currency, NodeState, UnlockNodeDef } from '../../game/unlockTree'
import { formatCycles } from './format'

/**
 * Carte d'un nœud **caché** (US-022 « reveal » P6, généralisée multi-nœud et
 * multi-devise US-027 — `ghost-protocol` sur la branche `data`, `dark-pool`
 * sur la branche `crypto`). Absente tant que `visible` est faux (placeholder
 * d'ambiance neutre, ne révèle rien du nœud — AC6). Au passage à `visible`,
 * joue une **irruption** transitoire (glitch), puis se stabilise en carte
 * « anomalie » sur le composant DS **`<Card hud brackets>`** — accent mint si
 * acquis, sinon magenta (`data`) ou ambre (`crypto`, US-027, glitch
 * amber/cyan distinct du glitch magenta de la branche data).
 */
export function HiddenNodeCard({
  node,
  visible,
  state,
  balance,
  unit,
  onBuy,
}: {
  node: UnlockNodeDef
  visible: boolean
  state: NodeState
  /** Solde disponible dans la devise du nœud (`data` ou `crypto`). */
  balance: number
  unit: Currency
  onBuy: () => void
}) {
  const { t } = useTranslation()
  const wasVisible = useRef(visible)
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setRevealing(true)
      wasVisible.current = true
      const id = window.setTimeout(() => setRevealing(false), 1400)
      return () => window.clearTimeout(id)
    }
    wasVisible.current = visible
  }, [visible])

  if (!visible) {
    return (
      <div className="builder__node--sealed">
        <Icon name="minus" size={16} />
        {t('builder.unlockTree.reveal.sealedHint')}
      </div>
    )
  }

  const affordable = state === 'available' && balance >= node.cost
  const cryptoGlitch = unit === 'crypto'

  return (
    <Card
      hud
      brackets
      halo={state === 'acquired' ? 'mint' : cryptoGlitch ? 'amber' : 'magenta'}
      padding="14px"
      className={`builder__node--ghost${cryptoGlitch ? ' builder__node--ghost-crypto' : ''}${revealing ? ' builder__node--revealing' : ''}`}
    >
      <div className="builder__node-ghost-banner">
        <Icon name="triangle-alert" size={11} /> {t('builder.unlockTree.reveal.banner')}
      </div>
      <div className="builder__node-head">
        <span className="builder__node-icon builder__node-icon--ghost">
          <Icon name={node.icon} size={20} />
        </span>
        <div className="builder__node-meta">
          <span className="builder__node-name builder__node-name--ghost">
            {t(`builder.unlockTree.nodes.${node.id}.name`)}
          </span>
          <div className="builder__node-effect">
            {t(`builder.unlockTree.nodes.${node.id}.effect`)}
          </div>
        </div>
      </div>

      {state === 'acquired' ? (
        <div className="builder__node-acquired">
          <Icon name="check-circle" size={13} /> {t('builder.unlockTree.acquiredHint')}
        </div>
      ) : (
        <button
          type="button"
          className="builder__node-buy builder__node-buy--ghost"
          onClick={onBuy}
          disabled={!affordable}
        >
          <span className="builder__node-buy-line">
            <Icon name={affordable ? 'unlock' : 'lock'} size={14} />{' '}
            {t('builder.unlockTree.reveal.buy')}
          </span>
          <span className="builder__node-buy-cost">
            {t('builder.unlockTree.buyCost', {
              cost: formatCycles(node.cost),
              unit: t(`builder.unlockTree.unit.${unit}`),
            })}
          </span>
        </button>
      )}
    </Card>
  )
}
