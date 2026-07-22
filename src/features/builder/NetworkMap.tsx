import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import { useBuilderStore } from '../../stores/useBuilderStore'
import {
  buildMapNodes,
  CURRENCY_RGB,
  MAP_EDGES,
  MAP_VIEWBOX,
  mapEdgeVisual,
  MINT_RGB,
  STEEL_RGB,
  type MapCurrency,
  type MapEdgeVisual,
  type MapNodeState,
} from './networkMapModel'
import { NetworkMapDetail } from './NetworkMapDetail'
import { NetworkMapNode } from './NetworkMapNode'
import './networkMap.css'

const px = (x: number) => (x / MAP_VIEWBOX.w) * 100
const py = (y: number) => (y / MAP_VIEWBOX.h) * 100

interface EdgeStroke {
  stroke: string
  w: number
  dash?: string
  glow: boolean
  flow: boolean
}

/** Style de trait d'une arête selon son état visuel (couleur suit le nœud aval). */
function edgeStroke(vis: MapEdgeVisual, bCurrency: MapCurrency): EdgeStroke {
  const cur = CURRENCY_RGB[bCurrency]
  switch (vis) {
    case 'both-acquired':
      return { stroke: `rgba(${MINT_RGB},.85)`, w: 2.4, glow: true, flow: false }
    case 'feeds-available':
      return { stroke: `rgba(${cur},.9)`, w: 2, dash: '2 9', glow: true, flow: true }
    case 'toward-available':
      return { stroke: `rgba(${cur},.6)`, w: 1.6, dash: '2 9', glow: false, flow: true }
    case 'cross-live':
      return { stroke: 'rgba(0,240,255,.55)', w: 1.3, dash: '1 8', glow: false, flow: false }
    case 'cross-dim':
      return { stroke: 'rgba(0,240,255,.18)', w: 1.3, dash: '1 8', glow: false, flow: false }
    case 'locked':
      return { stroke: `rgba(${STEEL_RGB},.28)`, w: 1.2, dash: '5 7', glow: false, flow: false }
  }
}

/** Badge « GÉN. 0X » (accent rouge réservé à la renaissance). */
function GenBadge({ gen }: { gen: number }) {
  const { t } = useTranslation()
  const on = gen > 0
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 11px',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${on ? 'rgba(255,46,91,.5)' : 'var(--border)'}`,
        background: on ? 'linear-gradient(120deg, rgba(255,46,91,.14), transparent)' : 'var(--void-800)',
      }}
    >
      <span style={{ display: 'inline-flex', color: on ? 'var(--red-400)' : 'var(--steel-600)' }}>
        <Icon name="orbit" size={13} />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: on ? 'var(--red-400)' : 'var(--steel-600)',
        }}
      >
        {t('builder.map.gen.label')}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '.06em',
          color: on ? 'var(--frost-100)' : 'var(--steel-600)',
          textShadow: on ? '0 0 10px rgba(255,46,91,.5)' : 'none',
        }}
      >
        {String(gen).padStart(2, '0')}
      </span>
    </div>
  )
}

/**
 * Carte du Réseau (US-029) — graphe spatial unique remplaçant la liste des
 * daemons + les 2 arbres en lignes. Lecture pure de l'état du builder (aucune
 * règle ni migration) : `buildMapNodes` compose les sélecteurs existants ; les
 * arêtes SVG et les nœuds sont rendus par-dessus un fond de « cyberspace ».
 * Sélection d'un nœud → popover de détail/achat (`NetworkMapDetail`), fermé au
 * clic sur le fond. Marqueur de renaissance : badge « GÉN. 0X » + aura rouge
 * quand ≥ 1 (accent réservé). Bande pleine largeur (casse la colonne 760),
 * scroll horizontal sous la largeur mini. `prefers-reduced-motion` via CSS.
 */
export function NetworkMap() {
  const { t } = useTranslation()
  const generators = useBuilderStore((s) => s.generators)
  const upgrades = useBuilderStore((s) => s.upgrades)
  const data = useBuilderStore((s) => s.data)
  const crypto = useBuilderStore((s) => s.crypto)
  const unlockedNodes = useBuilderStore((s) => s.unlockedNodes)
  const prestigeCount = useBuilderStore((s) => s.prestigeCount)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const nodes = buildMapNodes({ generators, upgrades, data, crypto, unlockedNodes })
  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const stateById: Record<string, MapNodeState> = Object.fromEntries(
    nodes.map((n) => [n.id, n.state]),
  )
  const activeCount = nodes.filter((n) => n.state === 'acquired').length

  const selected = selectedId ? nodesById[selectedId] : null
  // Un nœud scellé ne s'ouvre jamais (pas de spoiler).
  const openNode = selected && selected.state !== 'sealed' ? selected : null
  const openLeft = openNode ? openNode.x > MAP_VIEWBOX.w / 2 : false

  const reforged = prestigeCount > 0

  return (
    <div className="nw-map-band">
      <div className="nw-map-band__head">
        <span className="nw-map-band__head-label">{t('builder.map.title')}</span>
        <span className="nw-map-band__head-rule" />
        <span className="nw-map-band__head-note">{t('builder.map.fullWidth')}</span>
      </div>

      <div className="nw-map-scroll">
        <div
          className="nw-map"
          onClick={(e) => {
            // Ne referme qu'au clic sur le fond (pas en cliquant un nœud, dont
            // le clic remonte jusqu'ici — sinon la sélection serait annulée
            // aussitôt posée).
            if (e.target === e.currentTarget) setSelectedId(null)
          }}
          style={
            reforged
              ? { boxShadow: 'inset 0 0 60px -20px rgba(255,46,91,.4)' }
              : undefined
          }
        >
          <div className="nw-map__grid" />
          {/* Blooms d'ambiance : `ellipse closest-side … transparent` atteint le
              transparent pile sur chaque bord → aucune arête droite (le
              rectangle du div ne se voit jamais). */}
          <div
            className="nw-map__halo"
            style={{ width: '58%', height: '66%', top: '-14%', left: '-12%', background: 'radial-gradient(ellipse closest-side at center, rgba(255,45,149,.14), transparent)' }}
          />
          <div
            className="nw-map__halo"
            style={{ width: '58%', height: '66%', top: '-14%', right: '-12%', background: 'radial-gradient(ellipse closest-side at center, rgba(255,176,32,.14), transparent)' }}
          />
          <div
            className="nw-map__halo"
            style={{ width: '80%', height: '52%', bottom: '-18%', left: '10%', background: 'radial-gradient(ellipse closest-side at center, rgba(168,85,247,.13), transparent)' }}
          />
          <div className="nw-map__vignette" />

          {/* arêtes */}
          <svg
            className="nw-map__svg"
            viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {MAP_EDGES.map((edge, i) => {
              const vis = mapEdgeVisual(edge, stateById)
              if (!vis) return null
              const b = nodesById[edge.b]
              const a = nodesById[edge.a]
              const s = edgeStroke(vis, b.currency)
              return (
                <line
                  key={i}
                  x1={`${px(a.x)}%`}
                  y1={`${py(a.y)}%`}
                  x2={`${px(b.x)}%`}
                  y2={`${py(b.y)}%`}
                  stroke={s.stroke}
                  strokeWidth={s.w}
                  strokeDasharray={s.dash}
                  strokeLinecap="round"
                  className={s.flow ? 'nw-map-edge-flow' : undefined}
                  style={s.glow ? { filter: `drop-shadow(0 0 4px ${s.stroke})` } : undefined}
                />
              )
            })}
          </svg>

          {/* nœuds */}
          {nodes.map((n) => (
            <NetworkMapNode
              key={n.id}
              node={n}
              selected={selectedId === n.id}
              onSelect={(id) => setSelectedId((s) => (s === id ? null : id))}
            />
          ))}

          {/* popover de détail (ancré au nœud) */}
          {openNode && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: `${px(openNode.x)}%`,
                top: `${py(openNode.y)}%`,
                transform: `translate(${openLeft ? 'calc(-100% - 42px)' : '42px'}, -50%)`,
                zIndex: 5,
              }}
            >
              <NetworkMapDetail
                node={openNode}
                side={openLeft ? 'left' : 'right'}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}

          {/* HUD */}
          <div className="nw-map__hud">
            <span className="nw-map__hud-label">{t('builder.map.kicker')}</span>
            <span className="nw-map__hud-value">
              {activeCount}
              <span className="nw-map__hud-total"> / {nodes.length}</span>
            </span>
          </div>
          <div className="nw-map__gen">
            <GenBadge gen={prestigeCount} />
          </div>
          {!selectedId && (
            <span className="nw-map__hint">
              <Icon name="mouse-pointer-click" size={12} /> {t('builder.map.clickHint')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
