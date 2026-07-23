import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import type { Cosmetic, Rarity } from '../../game/cosmetics'
import { RARITY_GLOW, rarityColor, rarityRgb } from './rarityStyle'

/**
 * Échantillons de palette pour l'aperçu des thèmes (présentation seule — miroir
 * de `theme/tokens/themes.css`, `nightwire` = valeurs de `colors.css`).
 */
const THEME_SWATCHES: Record<
  string,
  { accent: string; accent2: string; accent3: string; app: string; surface: string; borderStrong: string; textSec: string }
> = {
  nightwire: { accent: '#00f0ff', accent2: '#ff2d95', accent3: '#2effc2', app: '#0a0e17', surface: '#161c2b', borderStrong: '#3a465f', textSec: '#8b9bb4' },
  ecarlate: { accent: '#ff2d95', accent2: '#ff2e5b', accent3: '#ffb020', app: '#120a12', surface: '#271426', borderStrong: '#57344c', textSec: '#c79ab0' },
  cryo: { accent: '#2effc2', accent2: '#a855f7', accent3: '#00f0ff', app: '#080f12', surface: '#122029', borderStrong: '#345058', textSec: '#89b4ad' },
}

const PREVIEW_HEIGHT = 92
const HEX_CLIP = 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)'

const mono = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  ...extra,
})

/** Aperçu d'un thème : bande des rôles sémantiques de la palette. */
function ThemePreview({ themeId }: { themeId: string }) {
  const p = THEME_SWATCHES[themeId] ?? THEME_SWATCHES.nightwire
  const roles = [
    { c: p.accent, k: 'A1', ink: true },
    { c: p.accent2, k: 'A2', ink: true },
    { c: p.accent3, k: 'A3', ink: true },
    { c: p.surface, k: 'SF', ink: false },
    { c: p.borderStrong, k: 'BD', ink: false },
  ]
  return (
    <div
      style={{
        position: 'relative',
        height: PREVIEW_HEIGHT,
        display: 'flex',
        clipPath: 'var(--clip-bevel-sm)',
        border: `1px solid ${p.borderStrong}`,
        background: p.app,
        overflow: 'hidden',
      }}
    >
      {roles.map((x, i) => (
        <div key={i} style={{ flex: 1, background: x.c, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              bottom: 4,
              left: 0,
              right: 0,
              textAlign: 'center',
              ...mono(),
              fontSize: 7.5,
              letterSpacing: '0.1em',
              color: x.ink ? 'rgba(5,6,10,.8)' : p.textSec,
            }}
          >
            {x.k}
          </span>
        </div>
      ))}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 6,
          left: 8,
          ...mono(),
          fontSize: 8,
          letterSpacing: '0.2em',
          color: p.accent,
          textShadow: `0 0 8px ${p.accent}`,
        }}
      >
        ◈ SKIN
      </span>
    </div>
  )
}

/** Aperçu d'un avatar : glyphe dans un cadre hexagonal, halo teinté rareté. */
function AvatarPreview({ glyph, rarity }: { glyph: string; rarity: Rarity }) {
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <div
      style={{
        position: 'relative',
        height: PREVIEW_HEIGHT,
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at 50% 40%, var(--void-500), var(--void-800))',
        clipPath: 'var(--clip-bevel-sm)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'var(--grid-lines)', backgroundSize: '18px 18px', opacity: 0.5 }}
      />
      <span
        style={{
          position: 'relative',
          width: 62,
          height: 62,
          clipPath: HEX_CLIP,
          background: `rgba(${rgb}, 0.16)`,
          display: 'grid',
          placeItems: 'center',
          boxShadow: glow ? `0 0 20px rgba(${rgb}, ${glow * 0.6})` : 'none',
        }}
      >
        <span aria-hidden style={{ position: 'absolute', inset: 2, clipPath: HEX_CLIP, border: `1.5px solid rgba(${rgb}, 0.7)` }} />
        <Icon
          name={glyph}
          size={30}
          strokeWidth={1.75}
          color={rarityColor(rarity)}
          style={{ filter: glow ? `drop-shadow(0 0 6px rgba(${rgb}, ${glow}))` : 'none' }}
        />
      </span>
    </div>
  )
}

/** Aperçu d'une bannière : visuel large, hachures + dégradé + micro-motif. */
function BannerPreview({ motif, rarity }: { motif: string; rarity: Rarity }) {
  const { t } = useTranslation()
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <div
      style={{
        position: 'relative',
        height: PREVIEW_HEIGHT,
        clipPath: 'var(--clip-bevel-sm)',
        border: '1px solid var(--border)',
        background: `linear-gradient(115deg, rgba(${rgb}, 0.30), var(--void-700) 62%), var(--void-800)`,
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(-45deg, rgba(${rgb}, 0.5) 0, rgba(${rgb}, 0.5) 2px, transparent 2px, transparent 9px)`,
          opacity: 0.25,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: -14,
          top: -14,
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: `1px solid rgba(${rgb}, 0.4)`,
          boxShadow: glow ? `0 0 26px rgba(${rgb}, ${glow * 0.5}) inset` : 'none',
        }}
      />
      <Icon
        name={motif}
        size={22}
        color={rarityColor(rarity)}
        style={{ position: 'absolute', left: 12, top: 12, filter: glow ? `drop-shadow(0 0 6px rgba(${rgb}, ${glow}))` : 'none' }}
      />
      <span style={{ position: 'absolute', left: 12, bottom: 10, ...mono(), fontSize: 8.5, letterSpacing: '0.24em', color: 'var(--text-label)' }}>
        {t('cosmetics.preview.bannerRatio')}
      </span>
    </div>
  )
}

/** Aperçu d'un titre : le libellé stylé (texte via i18n). */
function TitlePreview({ id, rarity }: { id: string; rarity: Rarity }) {
  const { t } = useTranslation()
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <div
      className="nw-scanlines"
      style={{
        position: 'relative',
        height: PREVIEW_HEIGHT,
        display: 'grid',
        placeItems: 'center',
        clipPath: 'var(--clip-bevel-sm)',
        border: '1px solid var(--border)',
        background: 'linear-gradient(160deg, var(--void-500), var(--void-800))',
        overflow: 'hidden',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...mono(), fontSize: 7.5, letterSpacing: '0.28em', color: 'var(--text-muted)', marginBottom: 4 }}>
          {t('cosmetics.preview.titleTag')}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '0.1em',
            color: rarityColor(rarity),
            textShadow: glow ? `0 0 12px rgba(${rgb}, ${glow * 0.8}), 0 0 3px rgba(${rgb}, 0.6)` : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t(`cosmetics.items.${id}.text`)}
        </div>
      </div>
    </div>
  )
}

/** Aperçu polymorphe selon le type de cosmétique. */
export function CosmeticPreview({ item }: { item: Cosmetic }) {
  switch (item.type) {
    case 'theme':
      return <ThemePreview themeId={item.id} />
    case 'avatar':
      return <AvatarPreview glyph={item.icon ?? 'user-round'} rarity={item.rarity} />
    case 'banner':
      return <BannerPreview motif={item.icon ?? 'flag'} rarity={item.rarity} />
    case 'title':
      return <TitlePreview id={item.id} rarity={item.rarity} />
  }
}
