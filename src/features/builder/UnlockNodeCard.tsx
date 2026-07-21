import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import type { Currency, NodeState, UnlockNodeDef } from '../../game/unlockTree'
import { formatCycles } from './format'

/** Libellé de condition d'un nœud verrouillé (chaîne d'arbre et/ou daemon). */
function useLockedHint(node: UnlockNodeDef): string {
  const { t } = useTranslation()
  const parts: string[] = []
  if (node.requiresNode) {
    parts.push(
      t('builder.unlockTree.requiresNode', {
        name: t(`builder.unlockTree.nodes.${node.requiresNode}.name`),
      }),
    )
  }
  if (node.requiresGenerator) {
    parts.push(
      t('builder.unlockTree.requiresGenerator', {
        count: node.requiresGenerator.count,
        name: t(`builder.generators.${node.requiresGenerator.id}.name`),
      }),
    )
  }
  return parts.join(' · ')
}

/**
 * Carte d'un nœud de l'arbre de déblocage **non caché** (US-022, généralisée
 * multi-devise US-027) — 3 états : `acquired` / `available` / `locked`.
 * `acquired`/`available` réutilisent le composant DS **`<Card hud brackets>`**
 * (2 repères d'angle diagonaux, collés aux coins — comme `DaemonCard`) ;
 * `locked` reste une carte pointillée sans repères, sur le modèle de
 * `TeaserCard`. Accent : mint si acquis, sinon **magenta** (branche `data`)
 * ou **ambre** (branche `crypto`, US-027) selon `unit`.
 */
export function UnlockNodeCard({
  node,
  state,
  balance,
  unit,
  onBuy,
}: {
  node: UnlockNodeDef
  state: NodeState
  /** Solde disponible dans la devise du nœud (`data` ou `crypto`). */
  balance: number
  unit: Currency
  onBuy: () => void
}) {
  const { t } = useTranslation()
  const lockedHint = useLockedHint(node)
  const affordable = state === 'available' && balance >= node.cost

  const head = (
    <div className="builder__node-head">
      <span className="builder__node-icon">
        <Icon name={state === 'locked' ? 'lock' : node.icon} size={18} />
      </span>
      <div className="builder__node-meta">
        <div className="builder__node-title-row">
          <span className="builder__node-name">
            {t(`builder.unlockTree.nodes.${node.id}.name`)}
          </span>
          <span className="builder__node-state">
            {t(`builder.unlockTree.state.${state}`)}
          </span>
        </div>
        <div className="builder__node-effect">
          {t(`builder.unlockTree.nodes.${node.id}.effect`)}
        </div>
      </div>
    </div>
  )

  if (state === 'locked') {
    return (
      <div className="builder__node--locked">
        {head}
        <div className="builder__node-locked">
          <Icon name="key-round" size={13} />
          {lockedHint}
        </div>
      </div>
    )
  }

  return (
    <Card
      hud
      brackets
      halo={state === 'acquired' ? 'mint' : unit === 'crypto' ? 'amber' : 'magenta'}
      padding="14px"
      className={`builder__node--${state}${unit === 'crypto' ? ' builder__node--crypto' : ''}`}
    >
      {head}

      {state === 'acquired' ? (
        <div className="builder__node-acquired">
          <Icon name="check-circle" size={13} /> {t('builder.unlockTree.acquiredHint')}
        </div>
      ) : (
        <button
          type="button"
          className="builder__node-buy"
          onClick={onBuy}
          disabled={!affordable}
        >
          <span className="builder__node-buy-line">
            <Icon name={affordable ? 'download' : 'lock'} size={13} />{' '}
            {t('builder.unlockTree.buy')}
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
