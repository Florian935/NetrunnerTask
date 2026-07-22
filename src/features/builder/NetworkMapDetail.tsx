import { type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon } from '../../components/ui'
import {
  GENERATOR_BY_ID,
  generatorCost,
  generatorProduction,
  upgradeCost,
  upgradeMultiplier,
} from '../../game/builder'
import { UNLOCK_NODE_BY_ID } from '../../game/unlockTree'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { formatCycles, formatRate } from './format'
import { HEX_CLIP } from './NetworkMapNode'
import { CURRENCY_RGB, MINT_RGB, nodeRgb, type MapCurrency, type MapNodeVM } from './networkMapModel'

/** Halo `<Card>` selon l'état/devise (réutilise les accents DS). */
function haloAccent(node: MapNodeVM): 'mint' | 'violet' | 'magenta' | 'amber' {
  if (node.state === 'acquired') return 'mint'
  return node.currency === 'crypto' ? 'amber' : node.currency === 'data' ? 'magenta' : 'violet'
}

/** Libellé de condition d'un nœud verrouillé (chaîne d'arbre / daemon requis). */
function useRequirement(node: MapNodeVM): string {
  const { t } = useTranslation()
  if (node.kind === 'generator') {
    const def = GENERATOR_BY_ID[node.id]
    if (!def?.unlockAfter) return ''
    return t('builder.unlockTree.requiresGenerator', {
      count: 1,
      name: t(`builder.generators.${def.unlockAfter}.name`),
    })
  }
  const def = UNLOCK_NODE_BY_ID[node.id]
  const parts: string[] = []
  if (def?.requiresNode) {
    parts.push(t('builder.unlockTree.requiresNode', { name: t(`builder.unlockTree.nodes.${def.requiresNode}.name`) }))
  }
  if (def?.requiresGenerator) {
    parts.push(
      t('builder.unlockTree.requiresGenerator', {
        count: def.requiresGenerator.count,
        name: t(`builder.generators.${def.requiresGenerator.id}.name`),
      }),
    )
  }
  return parts.join(' · ')
}

/** Ligne d'action (label à gauche, coût à droite) sur le `<Button>` DS. */
function actionRowStyle(): CSSProperties {
  return { width: '100%', justifyContent: 'space-between' }
}

/**
 * Popover de détail/achat d'un nœud sélectionné (US-029). Bâti sur le composant
 * DS **`<Card hud brackets halo>`** + **`<Button>`**. Deux formes selon le
 * `kind` : un nœud d'arbre a une seule action « Débloquer » ; un **daemon** a
 * deux gestes (Compiler + Améliorer) et un compte possédé — aucune
 * fonctionnalité perdue vs les anciennes cartes (AC6). Toutes les actions
 * appellent les actions **existantes** du store.
 */
export function NetworkMapDetail({
  node,
  side,
  onClose,
}: {
  node: MapNodeVM
  /** Côté d'ouverture du popover (flip selon la position du nœud). */
  side: 'left' | 'right'
  onClose: () => void
}) {
  const { t } = useTranslation()
  const cycles = useBuilderStore((s) => s.cycles)
  const data = useBuilderStore((s) => s.data)
  const crypto = useBuilderStore((s) => s.crypto)
  const buyGenerator = useBuilderStore((s) => s.buyGenerator)
  const buyUpgrade = useBuilderStore((s) => s.buyUpgrade)
  const buyNode = useBuilderStore((s) => s.buyNode)
  const requirement = useRequirement(node)

  const acquired = node.state === 'acquired'
  const available = node.state === 'available'
  const locked = node.state === 'locked'
  const rgb = nodeRgb(node.currency, node.state)
  const accentColor = acquired ? `rgb(${MINT_RGB})` : `rgb(${CURRENCY_RGB[node.currency]})`

  const eyebrow = `${t(`builder.map.detail.state.${node.state}`)} · ${t('builder.map.detail.flow', {
    cur: t(`builder.map.detail.cur.${node.currency}`),
  })}`

  // Effet + actions selon le type.
  let effect: string
  let actions: React.ReactNode

  if (node.kind === 'generator') {
    const def = GENERATOR_BY_ID[node.id]
    const owned = node.owned ?? 0
    const level = node.level ?? 0
    effect = t(`builder.generators.${node.id}.role`)
    const unitCost = generatorCost(def, owned)
    const upCost = upgradeCost(def, level)
    const canBuy = available || acquired ? cycles >= unitCost : false
    const canUpgrade = acquired && cycles >= upCost
    actions = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {owned > 0 && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '.04em',
              color: 'var(--text-secondary)',
            }}
          >
            {t('builder.map.detail.owned', { count: owned })}
            {' · '}
            {formatRate(generatorProduction(def, owned, level))}/s
            {level > 0 && ` · ${t('builder.upgrade.boost', { level, mult: upgradeMultiplier(def, level) })}`}
          </div>
        )}
        {locked ? (
          <Button variant="ghost" hud disabled style={actionRowStyle()} leftIcon={<Icon name="lock" size={14} />}>
            <span>{t('builder.map.detail.lockedCta')}</span>
            <span style={{ color: 'var(--red-400)' }}>{t('builder.buyCost', { cost: formatCycles(unitCost) })}</span>
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              hud
              disabled={!canBuy}
              onClick={() => buyGenerator(node.id)}
              style={actionRowStyle()}
              leftIcon={<Icon name={canBuy ? 'plus' : 'lock'} size={14} />}
            >
              <span>{t('builder.buy')}</span>
              <span style={{ color: canBuy ? accentColor : 'var(--red-400)' }}>
                {t('builder.buyCost', { cost: formatCycles(unitCost) })}
              </span>
            </Button>
            {acquired && (
              <Button
                variant="secondary"
                hud
                disabled={!canUpgrade}
                onClick={() => buyUpgrade(node.id)}
                style={actionRowStyle()}
                leftIcon={<Icon name={canUpgrade ? 'chevrons-up' : 'lock'} size={14} />}
              >
                <span>{t('builder.upgrade.level', { level: level + 1 })}</span>
                <span style={{ color: canUpgrade ? accentColor : 'var(--red-400)' }}>
                  {t('builder.buyCost', { cost: formatCycles(upCost) })}
                </span>
              </Button>
            )}
          </>
        )}
      </div>
    )
  } else {
    const def = UNLOCK_NODE_BY_ID[node.id]
    effect = t(`builder.unlockTree.nodes.${node.id}.effect`)
    const balance = node.currency === 'crypto' ? crypto : data
    const affordable = available && balance >= def.cost
    const costLabel = t('builder.unlockTree.buyCost', {
      cost: formatCycles(def.cost),
      unit: t(`builder.unlockTree.unit.${node.currency as MapCurrency}`),
    })
    actions = acquired ? (
      <div
        style={{
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          border: `1px solid rgba(${MINT_RGB},.4)`,
          clipPath: 'var(--clip-bevel-sm)',
          background: `rgba(${MINT_RGB},.08)`,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--mint-500)',
        }}
      >
        <Icon name="check-circle" size={14} /> {t('builder.map.detail.unlocked')}
      </div>
    ) : (
      <Button
        variant="secondary"
        hud
        disabled={!affordable}
        onClick={() => buyNode(node.id)}
        style={actionRowStyle()}
        leftIcon={<Icon name={affordable ? 'unlock' : 'lock'} size={14} />}
      >
        <span>{available ? t('builder.map.detail.unlock') : t('builder.map.detail.lockedCta')}</span>
        <span style={{ color: affordable ? accentColor : 'var(--red-400)' }}>{costLabel}</span>
      </Button>
    )
  }

  return (
    <div style={{ position: 'relative', width: 296 }}>
      {/* pointe d'ancrage vers le nœud (le popover s'ouvre du côté opposé) */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          [side === 'left' ? 'right' : 'left']: -6,
          top: 30,
          width: 12,
          height: 12,
          background: 'var(--bg-panel)',
          borderLeft: `1px solid color-mix(in srgb, ${accentColor} 55%, var(--border))`,
          borderBottom: `1px solid color-mix(in srgb, ${accentColor} 55%, var(--border))`,
          transform: 'rotate(45deg)',
          zIndex: 1,
        }}
      />
      <Card hud brackets halo={haloAccent(node)} padding="16px">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span
            style={{
              flexShrink: 0,
              width: 42,
              height: 42,
              clipPath: HEX_CLIP,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
              background: `rgba(${rgb},.14)`,
              boxShadow: `inset 0 0 18px -8px rgba(${rgb},.8)`,
            }}
          >
            <Icon name={node.icon} size={20} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '.04em',
                color: 'var(--frost-100)',
                lineHeight: 1.1,
              }}
            >
              {t(
                node.kind === 'generator'
                  ? `builder.generators.${node.id}.name`
                  : `builder.unlockTree.nodes.${node.id}.name`,
              )}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8.5,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                marginTop: 4,
                color: accentColor,
              }}
            >
              {eyebrow}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('builder.map.detail.close')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              padding: 2,
            }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '.02em',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            margin: '13px 0 0',
          }}
        >
          {effect}
        </p>

        {requirement && !acquired && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '.03em',
              color: locked ? 'var(--red-400)' : 'var(--text-muted)',
              marginTop: 9,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name={locked ? 'lock' : 'check'} size={12} /> {requirement}
          </div>
        )}

        <div style={{ marginTop: 14 }}>{actions}</div>
      </Card>
    </div>
  )
}
