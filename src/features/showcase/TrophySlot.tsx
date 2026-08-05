import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { Cosmetic } from '../../game/cosmetics'
import { CosmeticPreview } from '../cosmetics/previews'
import { RarityBadge } from '../cosmetics/RarityBadge'
import { RARITY_FILL, rarityColor, rarityGlow, rarityRgb } from '../cosmetics/rarityStyle'
import './showcase.css'

/** État d'un emplacement du présentoir. */
export type TrophySlotState = 'empty' | 'filled' | 'locked'

export interface TrophySlotProps {
  /** Index 0-based (l'étiquette affiche le n° 1-based). */
  index: number
  state: TrophySlotState
  /** Emplacement à l'honneur (pièce maîtresse) — rendu en double largeur. */
  featured?: boolean
  /** Cosmétique épinglé (`state === 'filled'`). */
  cosmetic?: Cosmetic
  /** Jalons requis (`state === 'locked'`) pour le libellé de déblocage. */
  requirement?: number | null
  /** Ouvre le sélecteur (emplacement vide, ou « Remplacer » d'un rempli). */
  onPin?: () => void
  /** Retire le trophée (emplacement rempli). */
  onUnpin?: () => void
}

const mono = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  ...extra,
})
const disp = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: 'var(--font-display)',
  ...extra,
})

/**
 * Un emplacement de la Salle des trophées (US-038), dans ses 3 états. Réutilise
 * le langage de rareté du DS (`CosmeticPreview`/`RarityBadge`/`rarityStyle`) —
 * la couleur appartient à la rareté, jamais aux accents de gameplay. Les actions
 * de l'état rempli sont atteignables au **survol et au focus clavier**
 * (`.nw-slot-filled` / `.nw-slot-actions`, voir `showcase.css`).
 */
export function TrophySlot({
  index,
  state,
  featured,
  cosmetic,
  requirement,
  onPin,
  onUnpin,
}: TrophySlotProps) {
  const { t } = useTranslation()
  const tag = t('showcase.slotTag', { n: String(index + 1).padStart(2, '0') })

  // --- VERROUILLÉ ---
  if (state === 'locked') {
    return (
      <div
        style={{
          position: 'relative',
          clipPath: 'var(--clip-bevel-md)',
          border: '1px solid var(--border)',
          background: 'var(--bg-inset)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 200,
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(-45deg, rgba(86,96,121,.12) 0, rgba(86,96,121,.12) 1px, transparent 1px, transparent 10px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ ...mono({ fontSize: 9, letterSpacing: '0.24em', color: 'var(--text-muted)' }) }}>
          {tag}
        </div>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 12, padding: '18px 0' }}>
          <span
            style={{
              width: 46,
              height: 46,
              display: 'grid',
              placeItems: 'center',
              clipPath: 'var(--clip-bevel-sm)',
              border: '1px solid var(--border-strong)',
              background: 'var(--void-900)',
              color: 'var(--steel-600)',
            }}
          >
            <Icon name="lock" size={20} strokeWidth={1.6} />
          </span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...disp({ fontWeight: 700, fontSize: 12, letterSpacing: '0.22em', color: 'var(--steel-400)' }) }}>
              {t('showcase.locked.label')}
            </div>
            <div style={{ ...mono({ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)', marginTop: 6 }) }}>
              {requirement != null
                ? t('showcase.locked.req', { n: requirement })
                : t('showcase.locked.reqUnknown')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- VIDE ---
  if (state === 'empty') {
    return (
      <button
        type="button"
        onClick={onPin}
        className="nw-slot-empty"
        aria-label={t('showcase.empty.action')}
        style={{
          position: 'relative',
          clipPath: 'var(--clip-bevel-md)',
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          border: '1px dashed var(--border-strong)',
          background: 'transparent',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 200,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ ...mono({ fontSize: 9, letterSpacing: '0.24em', color: 'var(--text-muted)' }) }}>{tag}</div>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 13, padding: '18px 0' }}>
          <span
            style={{
              width: 48,
              height: 48,
              display: 'grid',
              placeItems: 'center',
              clipPath: 'var(--clip-bevel-sm)',
              border: '1px solid var(--border-strong)',
              background: 'var(--void-900)',
              color: 'var(--steel-400)',
            }}
          >
            <Icon name="plus" size={22} strokeWidth={1.6} />
          </span>
          <div style={{ ...disp({ fontWeight: 600, fontSize: 12.5, letterSpacing: '0.2em', color: 'var(--text-label)', textTransform: 'uppercase' }) }}>
            {t('showcase.empty.action')}
          </div>
        </div>
      </button>
    )
  }

  // --- REMPLI ---
  if (cosmetic === undefined) return null
  const rgb = rarityRgb(cosmetic.rarity)
  const legend = cosmetic.rarity === 'legendary'
  return (
    <div
      className={`nw-slot-filled${legend ? ' nw-legend' : ''}`}
      style={{
        position: 'relative',
        clipPath: 'var(--clip-bevel-md)',
        border: `1px solid rgba(${rgb}, 0.55)`,
        background: `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[cosmetic.rarity]}), transparent 58%), var(--bg-panel)`,
        boxShadow: legend ? undefined : rarityGlow(cosmetic.rarity),
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 11 }}>
        <span style={{ ...mono({ fontSize: 9, letterSpacing: '0.24em', color: 'var(--text-muted)' }) }}>{tag}</span>
        <RarityBadge rarity={cosmetic.rarity} pips={featured} />
      </div>

      <CosmeticPreview item={cosmetic} />

      <div style={{ marginTop: 11, flex: 1 }}>
        <div style={{ ...disp({ fontWeight: 600, fontSize: featured ? 19 : 15, letterSpacing: '0.05em', color: 'var(--text-primary)', lineHeight: 1.15 }) }}>
          {t(`cosmetics.items.${cosmetic.id}.name`)}
        </div>
        <div style={{ ...mono({ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 5 }) }}>
          {t(`cosmetics.items.${cosmetic.id}.sub`)}
        </div>
      </div>

      <div className="nw-slot-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <SlotAction icon="repeat" label={t('showcase.slot.replace')} onClick={onPin} tintRgb={rgb} tintColor={rarityColor(cosmetic.rarity)} />
        <SlotAction icon="x" label={t('showcase.slot.remove')} onClick={onUnpin} />
      </div>
    </div>
  )
}

function SlotAction({
  icon,
  label,
  onClick,
  tintRgb,
  tintColor,
}: {
  icon: string
  label: string
  onClick?: () => void
  tintRgb?: string
  tintColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 'var(--control-h-md)',
        cursor: 'pointer',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${tintRgb ? `rgba(${tintRgb}, 0.5)` : 'var(--border-strong)'}`,
        background: 'var(--void-900)',
        color: tintColor ?? 'var(--text-label)',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 10.5,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Icon name={icon} size={12} /> {label}
    </button>
  )
}
