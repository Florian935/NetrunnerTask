import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import type { NodeState, UnlockNodeDef } from '../../game/unlockTree'
import { formatCycles } from './format'

/**
 * Carte du nœud **caché** (`ghost-protocol`, US-022 — 1ᵉʳ reveal P6). Absente
 * tant que `visible` est faux (placeholder d'ambiance neutre, ne révèle rien
 * du nœud — AC6). Au passage à `visible`, joue une **irruption** transitoire
 * (glitch), puis se stabilise en carte « anomalie » sur le composant DS
 * **`<Card hud brackets halo="magenta">`** (2 repères d'angle, comme les
 * autres cartes du builder) — traitement visuel réservé (bandeau + animations
 * dédiées), distinct des nœuds normaux (y compris une fois acquis).
 */
export function HiddenNodeCard({
  node,
  visible,
  state,
  data,
  onBuy,
}: {
  node: UnlockNodeDef
  visible: boolean
  state: NodeState
  data: number
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
        {t('builder.unlockTree.ghost.sealedHint')}
      </div>
    )
  }

  const affordable = state === 'available' && data >= node.cost

  return (
    <Card
      hud
      brackets
      halo="magenta"
      padding="14px"
      className={`builder__node--ghost${revealing ? ' builder__node--revealing' : ''}`}
    >
      <div className="builder__node-ghost-banner">
        <Icon name="triangle-alert" size={11} /> {t('builder.unlockTree.ghost.banner')}
      </div>
      <div className="builder__node-head">
        <span className="builder__node-icon builder__node-icon--ghost">
          <Icon name="skull" size={20} />
        </span>
        <div className="builder__node-meta">
          <span className="builder__node-name builder__node-name--ghost">
            {t('builder.unlockTree.ghost.name')}
          </span>
          <div className="builder__node-effect">
            {t('builder.unlockTree.ghost.description')}
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
            {t('builder.unlockTree.ghost.buy')}
          </span>
          <span className="builder__node-buy-cost">
            {t('builder.unlockTree.buyCost', { cost: formatCycles(node.cost) })}
          </span>
        </button>
      )}
    </Card>
  )
}
