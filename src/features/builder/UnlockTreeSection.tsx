import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import {
  nodeState,
  UNLOCK_NODES,
  visibleNodes,
  type Currency,
  type UnlockTreeCore,
} from '../../game/unlockTree'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { formatCycles } from './format'
import { HiddenNodeCard } from './HiddenNodeCard'
import { UnlockNodeCard } from './UnlockNodeCard'

/** Une ligne de l'épine verticale de l'arbre : marqueur + carte du nœud. */
function TreeRow({
  tone,
  last,
  children,
}: {
  tone: string
  last?: boolean
  children: ReactNode
}) {
  return (
    <div className="builder__tree-row">
      <div className="builder__tree-spine">
        <span className={`builder__tree-dot builder__tree-dot--${tone}`} />
        {!last && <span className="builder__tree-line" />}
      </div>
      <div className="builder__tree-card">{children}</div>
    </div>
  )
}

/**
 * Section « Arbre de déblocage » (US-022, généralisée multi-devise US-027) —
 * épine verticale + cartes des nœuds **de la branche `currency`** (dont, le
 * cas échéant, le nœud caché de cette branche révélé), branchée sur
 * `useBuilderStore`. Rendue uniquement une fois la branche débloquée
 * (`unlocked`) ; `null` sinon — même contrat que `DataReadout`/`CryptoPanel`.
 */
export function UnlockTreeSection({
  currency,
  unlocked,
}: {
  currency: Currency
  unlocked: boolean
}) {
  const { t } = useTranslation()
  const data = useBuilderStore((s) => s.data)
  const crypto = useBuilderStore((s) => s.crypto)
  const generators = useBuilderStore((s) => s.generators)
  const upgrades = useBuilderStore((s) => s.upgrades)
  const unlockedNodes = useBuilderStore((s) => s.unlockedNodes)
  const buyNode = useBuilderStore((s) => s.buyNode)

  if (!unlocked) return null

  const core: UnlockTreeCore = { data, crypto, generators, upgrades, unlockedNodes }
  const balance = currency === 'crypto' ? crypto : data
  const shown = visibleNodes(core, currency)
  const normalNodes = shown.filter((n) => !n.hidden)
  const ghostDef = UNLOCK_NODES.find((n) => n.hidden && n.currency === currency) ?? null
  const ghostVisible = ghostDef ? shown.some((n) => n.id === ghostDef.id) : false
  const ghostState = ghostDef ? nodeState(ghostDef, core) : null

  return (
    <div className="builder__tree">
      <div className="builder__tree-head">
        <span className="builder__tree-title">
          {t(
            currency === 'crypto'
              ? 'builder.unlockTree.headingCrypto'
              : 'builder.unlockTree.heading',
          )}
        </span>
        <span className="builder__tree-balance">
          <Icon name={currency === 'crypto' ? 'coins' : 'database'} size={13} />
          {t('builder.unlockTree.balance', {
            value: formatCycles(balance),
            unit: t(`builder.unlockTree.unit.${currency}`),
          })}
        </span>
      </div>

      {normalNodes.map((node, i) => {
        const state = nodeState(node, core)
        const isLast = !ghostDef && i === normalNodes.length - 1
        return (
          <TreeRow key={node.id} tone={state} last={isLast}>
            <UnlockNodeCard
              node={node}
              state={state}
              balance={balance}
              unit={currency}
              onBuy={() => buyNode(node.id)}
            />
          </TreeRow>
        )
      })}

      {ghostDef && (
        <TreeRow
          tone={!ghostVisible ? 'sealed' : ghostState === 'acquired' ? 'acquired' : 'ghost'}
          last
        >
          <HiddenNodeCard
            node={ghostDef}
            visible={ghostVisible}
            state={ghostState ?? 'locked'}
            balance={balance}
            unit={currency}
            onBuy={() => buyNode(ghostDef.id)}
          />
        </TreeRow>
      )}
    </div>
  )
}
