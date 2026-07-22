import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { MAP_VIEWBOX, nodeRgb, type MapNodeVM } from './networkMapModel'

/** Chanfrein hexagonal partagé (nœuds + sceau du popover). */
export const HEX_CLIP = 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)'

const px = (x: number) => (x / MAP_VIEWBOX.w) * 100
const py = (y: number) => (y / MAP_VIEWBOX.h) * 100

/** Nom i18n d'un nœud selon son type (daemon ou nœud d'arbre). */
function nodeNameKey(node: MapNodeVM): string {
  return node.kind === 'generator'
    ? `builder.generators.${node.id}.name`
    : `builder.unlockTree.nodes.${node.id}.name`
}

/**
 * Nœud de la carte (US-029) — hexagone positionné en % de l'espace de coord.
 * Halo/anneau piloté par l'état (mint acquis · couleur-devise disponible avec
 * halo pulsé · acier scellé · assombri verrouillé). Le glitch de reveal ne joue
 * qu'à la **transition** `sealed → visible` (jamais au 1ᵉʳ rendu — AC8), même
 * pattern que l'ancien `HiddenNodeCard`. `prefers-reduced-motion` via CSS.
 */
export function NetworkMapNode({
  node,
  size = 60,
  selected,
  onSelect,
}: {
  node: MapNodeVM
  size?: number
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  const { t } = useTranslation()
  const sealed = node.state === 'sealed'
  const acquired = node.state === 'acquired'
  const available = node.state === 'available'
  const locked = node.state === 'locked'
  const rgb = nodeRgb(node.currency, node.state)

  // Reveal : détecte la transition sealed → non-sealed (comme HiddenNodeCard).
  const wasSealed = useRef(sealed)
  const [revealing, setRevealing] = useState(false)
  useEffect(() => {
    if (wasSealed.current && !sealed) {
      setRevealing(true)
      const id = window.setTimeout(() => setRevealing(false), 900)
      wasSealed.current = sealed
      return () => window.clearTimeout(id)
    }
    wasSealed.current = sealed
  }, [sealed])

  const accent = acquired ? 'var(--mint-500)' : sealed ? 'var(--steel-600)' : `rgb(${rgb})`
  const face: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    clipPath: HEX_CLIP,
    cursor: onSelect ? 'pointer' : 'default',
    background: sealed
      ? 'radial-gradient(circle at 50% 40%, rgba(139,155,180,.08), rgba(10,14,23,.96) 72%)'
      : `radial-gradient(circle at 50% 38%, rgba(${rgb},${acquired ? 0.3 : available ? 0.26 : 0.12}), rgba(16,21,31,.97) 72%)`,
    boxShadow: available
      ? `0 0 0 1.5px rgba(${rgb},.95), 0 0 22px -2px rgba(${rgb},.7), inset 0 0 26px -8px rgba(${rgb},.8)`
      : acquired
        ? `0 0 0 1.5px rgba(${rgb},.8), 0 0 16px -4px rgba(${rgb},.5), inset 0 0 22px -10px rgba(${rgb},.7)`
        : `0 0 0 1px rgba(${rgb},${sealed ? 0.3 : 0.45}), inset 0 0 20px -12px rgba(${rgb},.4)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: locked ? 'saturate(.5)' : 'none',
    opacity: sealed ? 0.3 : locked ? 0.42 : 1,
    transition: 'transform var(--dur-fast) var(--ease-out)',
    transform: selected ? 'scale(1.08)' : 'none',
  }

  const label = sealed ? t('builder.map.sealedLabel') : t(nodeNameKey(node))

  return (
    <div
      className={revealing ? 'nw-map-reveal' : undefined}
      style={{
        position: 'absolute',
        left: `${px(node.x)}%`,
        top: `${py(node.y)}%`,
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        width: size + 52,
      }}
    >
      {/* halo pulsé « disponible » (call-to-action) — décoratif, ne bloque pas le clic */}
      {available && (
        <span
          aria-hidden
          className="nw-map-node-pulse"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: size + 16,
            height: size + 16,
            transform: 'translateX(-50%)',
            clipPath: HEX_CLIP,
            border: `1.5px solid rgba(${rgb},.8)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        onClick={onSelect ? () => onSelect(node.id) : undefined}
        role={onSelect ? 'button' : undefined}
        aria-label={onSelect ? label : undefined}
        style={face}
      >
        {/* repères d'angle façon Card (uniquement si identifiable) */}
        {!sealed &&
          ([
            ['top', 'left'],
            ['top', 'right'],
            ['bottom', 'left'],
            ['bottom', 'right'],
          ] as const).map(([v, h], i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                [v]: 7,
                [h]: 9,
                width: 6,
                height: 6,
                pointerEvents: 'none',
                [`border${v[0].toUpperCase() + v.slice(1)}`]: `1.5px solid rgba(${rgb},.7)`,
                [`border${h[0].toUpperCase() + h.slice(1)}`]: `1.5px solid rgba(${rgb},.7)`,
              } as CSSProperties}
            />
          ))}
        <span
          style={{
            display: 'inline-flex',
            color: accent,
            filter: available || acquired ? `drop-shadow(0 0 5px rgba(${rgb},.8))` : 'none',
          }}
        >
          <Icon name={sealed ? 'help-circle' : node.icon} size={Math.round(size * 0.34)} />
        </span>
        {/* compteur d'exemplaires pour un daemon possédé */}
        {node.kind === 'generator' && (node.owned ?? 0) > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: size * 0.12,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--mint-500)',
              textShadow: '0 0 6px var(--mint-500)',
              pointerEvents: 'none',
            }}
          >
            ×{node.owned}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8.5,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          textAlign: 'center',
          lineHeight: 1.15,
          maxWidth: size + 48,
          color: sealed
            ? 'var(--steel-600)'
            : acquired
              ? 'var(--mint-500)'
              : available
                ? 'var(--frost-100)'
                : 'var(--steel-400)',
          textShadow: available ? `0 0 8px rgba(${rgb},.5)` : 'none',
        }}
      >
        {label}
      </span>
    </div>
  )
}
