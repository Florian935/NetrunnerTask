import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Icon } from '../../components/ui'
import type { Cosmetic } from '../../game/cosmetics'
import { CosmeticPreview } from './previews'
import { CRATE_ACCENT, CRATE_ACCENT_RGB } from './crateStyle'
import { COR_COLOR, COR_RGB } from '../corruption/corruptionStyle'
import { FRAGMENT_COLOR, FRAGMENT_RGB, FragmentAmount } from './Fragment'
import { RarityBadge } from './RarityBadge'
import { RARITY_FILL, rarityColor, rarityGlow, rarityRgb } from './rarityStyle'
import './cosmetics.css'

/**
 * État d'une carte : verrouillé (à débloquer) / possédé non équipé / équipé /
 * **forge** (US-035 : cosmétique non possédé, affiché en couleur, à forger
 * contre des fragments).
 */
export type CosmeticCardState = 'locked' | 'unequipped' | 'equipped' | 'forge'

export interface CosmeticCardProps {
  item: Cosmetic
  state: CosmeticCardState
  /**
   * Indice de déblocage (libellé i18n du jalon source) — pour un cosmétique
   * verrouillé de la voie **déterministe**. Ignoré pour un cosmétique exclusif
   * caisse (`item.source === 'crate'`), qui affiche « Trouvé en caisse ».
   */
  hint?: string
  /** Appelé pour équiper ce cosmétique (ignoré si verrouillé/déjà équipé). */
  onEquip?: () => void
  /** Coût de forge en fragments (US-035) — requis si `state === 'forge'`. */
  forgeCost?: number
  /** Solde de fragments courant — détermine si la forge est abordable (`state === 'forge'`). */
  fragments?: number
  /** Appelé pour forger ce cosmétique (`state === 'forge'`, ignoré si solde insuffisant). */
  onForge?: () => void
  /**
   * Progression vers le déblocage (US-037) — cosmétique de la **voie corrompue**
   * verrouillé : `current`/`target` de voltage sécurisé. Affiche une mini-barre à
   * la place de l'indice statique. Ignoré hors `state === 'locked'` + `source:
   * 'corruption'`.
   */
  progress?: { current: number; target: number }
}

/**
 * Carte d'un cosmétique (US-031 + état verrouillé US-033 + source caisse
 * US-034) — sur `<Card hud brackets>` + action `<Button>`. Le cadre est teinté
 * par la rareté ; l'état **verrouillé** grise l'aperçu (cadenas + hachures) et
 * remplace l'action par un indice : « Débloqué par ‹ jalon › » (voie
 * déterministe) ou « Trouvé en caisse » (`source: 'crate'`). Le cran
 * `legendary` respire quand la carte est active (jamais verrouillée).
 */
export function CosmeticCard({ item, state, hint, onEquip, forgeCost, fragments, onForge, progress }: CosmeticCardProps) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(false)
  const locked = state === 'locked'
  const equipped = state === 'equipped'
  const forge = state === 'forge'
  const legend = item.rarity === 'legendary'
  const active = !locked && (equipped || hover)
  const rgb = rarityRgb(item.rarity)
  // Source spéciale (US-034 caisse / US-036 corruption) : accent + indice dédiés.
  const fromCrate = item.source === 'crate'
  const fromCorruption = item.source === 'corruption'
  const hasSource = fromCrate || fromCorruption
  const srcColor = fromCorruption ? COR_COLOR : CRATE_ACCENT
  const srcRgb = fromCorruption ? COR_RGB : CRATE_ACCENT_RGB
  const srcIcon = fromCorruption ? 'skull' : 'package'
  const afford = (fragments ?? 0) >= (forgeCost ?? Number.POSITIVE_INFINITY)
  const missing = Math.max(0, (forgeCost ?? 0) - (fragments ?? 0))

  return (
    <Card
      hud
      brackets
      className={legend && active ? 'nw-legend' : undefined}
      padding="var(--space-4)"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${locked ? 'var(--border)' : `rgba(${rgb}, ${equipped ? 0.7 : active ? 0.6 : 0.4})`}`,
        boxShadow: locked ? 'none' : legend ? undefined : rarityGlow(item.rarity, active),
        background: locked
          ? 'var(--bg-inset)'
          : `linear-gradient(160deg, rgba(${rgb}, ${RARITY_FILL[item.rarity]}), transparent 55%), var(--bg-panel)`,
        transition: 'box-shadow var(--dur-med) var(--ease-out), border-color var(--dur-med) var(--ease-out)',
      }}
    >
      {/* En-tête : rareté (toujours visible) + état */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <RarityBadge rarity={item.rarity} />
        {equipped && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: rarityColor(item.rarity) }}>
            <Icon name="check" size={12} /> {t('cosmetics.equippedShort')}
          </span>
        )}
        {locked && (
          <span style={{ display: 'inline-flex', color: hasSource ? srcColor : 'var(--steel-400)' }}>
            <Icon name="lock" size={15} />
          </span>
        )}
      </div>

      {/* Aperçu (grisé + cadenas si verrouillé) */}
      <div style={{ position: 'relative' }}>
        <div style={{ filter: locked ? 'grayscale(1) brightness(0.7)' : 'none' }}>
          <CosmeticPreview item={item} />
        </div>
        {locked && (
          <>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, var(--bg-app) 50%, transparent)',
                clipPath: 'var(--clip-bevel-sm)',
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeItems: 'center',
                  clipPath: 'var(--clip-bevel-sm)',
                  border: `1px solid ${hasSource ? `rgba(${srcRgb}, 0.6)` : 'var(--border-strong)'}`,
                  background: 'color-mix(in srgb, var(--bg-app) 70%, transparent)',
                  color: hasSource ? srcColor : 'var(--text-label)',
                  boxShadow: hasSource ? `0 0 16px -4px rgba(${srcRgb}, 0.9)` : 'none',
                }}
              >
                <Icon name={hasSource ? srcIcon : 'lock'} size={20} />
              </span>
            </span>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'var(--clip-bevel-sm)',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(139,155,180,.08) 0, rgba(139,155,180,.08) 1px, transparent 1px, transparent 7px)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>

      {/* Nom + sous-titre */}
      <div style={{ marginTop: 11, marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)', letterSpacing: '0.05em', color: locked ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.15 }}>
          {t(`cosmetics.items.${item.id}.name`)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
          {t(`cosmetics.items.${item.id}.sub`)}
        </div>
      </div>

      {/* Action selon l'état */}
      {locked && fromCorruption && progress ? (
        /* US-037 : cosmétique de voie verrouillé — indice de palier + mini-barre. */
        <div style={{ padding: '8px 10px', clipPath: 'var(--clip-bevel-sm)', border: `1px dashed rgba(${srcRgb}, 0.5)`, background: `rgba(${srcRgb}, 0.05)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: srcColor }}>
              <Icon name={srcIcon} size={11} /> {t('corruption.path.lockedLabel')}
            </span>
            <span>{`${Math.round(progress.current).toLocaleString('fr-FR')} / ${progress.target.toLocaleString('fr-FR')} V`}</span>
          </div>
          <div style={{ height: 5, background: 'var(--void-900)', clipPath: 'var(--clip-bevel-sm)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (progress.current / progress.target) * 100))}%`, background: srcColor, boxShadow: `0 0 8px ${srcColor}`, transition: 'width var(--dur-med) var(--ease-out)' }} />
          </div>
        </div>
      ) : locked ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            minHeight: 'var(--control-h-md)',
            padding: '7px 10px',
            clipPath: 'var(--clip-bevel-sm)',
            border: `1px dashed ${hasSource ? `rgba(${srcRgb}, 0.55)` : 'var(--border-strong)'}`,
            background: hasSource ? `rgba(${srcRgb}, 0.06)` : 'var(--bg-inset)',
          }}
        >
          <span style={{ color: hasSource ? srcColor : 'var(--amber-500)', display: 'inline-flex', flexShrink: 0 }}>
            <Icon name={hasSource ? srcIcon : 'key-round'} size={14} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {fromCrate ? t('cosmetics.foundInCrate') : fromCorruption ? t('corruption.foundLabel') : t('cosmetics.unlockedBy')}
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em', color: hasSource ? srcColor : 'var(--text-label)', marginTop: 2, lineHeight: 1.25 }}>
              {fromCrate ? t('cosmetics.foundInCrateValue') : fromCorruption ? t('corruption.foundValue') : hint}
            </span>
          </span>
        </div>
      ) : forge ? (
        <div>
          {/* Ligne coût */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9, padding: '7px 10px', clipPath: 'var(--clip-bevel-sm)', border: `1px solid ${afford ? `rgba(${FRAGMENT_RGB}, 0.4)` : 'var(--border)'}`, background: 'var(--bg-inset)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>{t('cosmetics.forge.cost')}</span>
            <FragmentAmount value={forgeCost ?? 0} strong size={14} />
          </div>
          {afford ? (
            <button
              type="button"
              onClick={onForge}
              style={{
                width: '100%', height: 'var(--control-h-md)', cursor: 'pointer', clipPath: 'var(--clip-bevel-sm)',
                border: `1px solid ${FRAGMENT_COLOR}`,
                background: hover ? `rgba(${FRAGMENT_RGB}, 0.2)` : `rgba(${FRAGMENT_RGB}, 0.1)`, color: FRAGMENT_COLOR,
                boxShadow: hover ? `0 0 0 1px rgba(${FRAGMENT_RGB}, 0.6), 0 0 16px rgba(${FRAGMENT_RGB}, 0.4)` : `0 0 12px -4px rgba(${FRAGMENT_RGB}, 0.7)`,
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.18em',
                transition: 'all var(--dur-fast) var(--ease-out)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}
            >
              <Icon name="hammer" size={14} /> {t('cosmetics.forge.forge')}
            </button>
          ) : (
            <div style={{ width: '100%', minHeight: 'var(--control-h-md)', cursor: 'not-allowed', clipPath: 'var(--clip-bevel-sm)', border: '1px dashed var(--border-strong)', background: 'var(--bg-inset)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textAlign: 'center', padding: '6px 8px' }}>
              <Icon name="lock" size={13} /> {t('cosmetics.forge.insufficient')} <FragmentAmount value={missing} size={11} />
            </div>
          )}
        </div>
      ) : equipped ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 'var(--control-h-md)', clipPath: 'var(--clip-bevel-sm)', border: `1px solid rgba(${rgb}, 0.6)`, background: `rgba(${rgb}, 0.12)`, color: rarityColor(item.rarity), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-sm)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          <Icon name="check-check" size={14} /> {t('cosmetics.equipped')}
        </div>
      ) : (
        <Button variant="secondary" hud onClick={onEquip} leftIcon={<Icon name="plus" size={13} />} style={{ width: '100%' }}>
          {t('cosmetics.equip')}
        </Button>
      )}
    </Card>
  )
}
