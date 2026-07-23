import { useTranslation } from 'react-i18next'
import { Card, Icon } from '../../components/ui'
import type { Cosmetic } from '../../game/cosmetics'
import { RarityBadge } from '../cosmetics/RarityBadge'
import { RARITY_GLOW, rarityColor, rarityRgb } from '../cosmetics/rarityStyle'
import { CallsignEditor } from './CallsignEditor'
import './profile.css'

const HEX_CLIP = 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)'

/** Portrait d'avatar hexagonal grand format, halo teinté par la rareté. */
function AvatarHex({ glyph, rarity, size = 148 }: { glyph: string; rarity: Cosmetic['rarity']; size?: number }) {
  const rgb = rarityRgb(rarity)
  const glow = RARITY_GLOW[rarity]
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -10,
          clipPath: HEX_CLIP,
          background: `radial-gradient(circle, rgba(${rgb}, ${0.3 + glow * 0.25}), transparent 70%)`,
          filter: 'blur(2px)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: HEX_CLIP,
          background: `linear-gradient(155deg, rgba(${rgb}, 0.22), var(--void-700))`,
          boxShadow: glow ? `0 0 26px rgba(${rgb}, ${glow * 0.6})` : `0 0 0 1px rgba(${rgb}, 0.4)`,
        }}
      />
      <span aria-hidden style={{ position: 'absolute', inset: 4, clipPath: HEX_CLIP, border: `2px solid rgba(${rgb}, 0.8)` }} />
      <span aria-hidden style={{ position: 'absolute', inset: 4, clipPath: HEX_CLIP, background: 'var(--grid-lines)', backgroundSize: '14px 14px', opacity: 0.35 }} />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: rarityColor(rarity),
          filter: glow ? `drop-shadow(0 0 8px rgba(${rgb}, ${glow}))` : 'none',
        }}
      >
        <Icon name={glyph} size={Math.round(size * 0.42)} strokeWidth={1.6} />
      </span>
    </div>
  )
}

export interface RunnerIdCardProps {
  callsign: string
  onSaveCallsign: (raw: string) => void
  avatar: Cosmetic
  banner: Cosmetic
  title: Cosmetic
}

/**
 * Carte d'ID runner (US-032) — sur le composant DS `<Card hud brackets>` : la
 * bannière équipée en fond héros 21:9, l'avatar hexagonal chevauchant, le
 * callsign éditable et le titre équipé. Réutilise `RarityBadge` + `rarityStyle`
 * (US-031).
 */
export function RunnerIdCard({ callsign, onSaveCallsign, avatar, banner, title }: RunnerIdCardProps) {
  const { t } = useTranslation()
  const bRgb = rarityRgb(banner.rarity)
  const bGlow = RARITY_GLOW[banner.rarity]
  const titleColor = rarityColor(title.rarity)
  const tRgb = rarityRgb(title.rarity)
  const tGlow = RARITY_GLOW[title.rarity]

  return (
    <Card hud brackets padding="0" style={{ background: 'var(--bg-panel)' }}>
      {/* Bannière en arrière-plan héroïque 21:9 */}
      <div
        style={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
          background: `linear-gradient(110deg, rgba(${bRgb}, 0.42), var(--void-700) 58%), var(--void-800)`,
        }}
      >
        <span aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(-45deg, rgba(${bRgb}, 0.5) 0, rgba(${bRgb}, 0.5) 2px, transparent 2px, transparent 11px)`, opacity: 0.22 }} />
        <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'var(--grid-lines)', backgroundSize: '26px 26px', opacity: 0.3 }} />
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: -50,
            top: -100,
            width: 250,
            height: 250,
            borderRadius: '50%',
            border: `1px solid rgba(${bRgb}, 0.4)`,
            boxShadow: `0 0 60px rgba(${bRgb}, ${bGlow * 0.4}) inset`,
          }}
        />
        <Icon
          name={banner.icon ?? 'flag'}
          size={62}
          strokeWidth={1.25}
          color={rarityColor(banner.rarity)}
          style={{ position: 'absolute', right: 26, top: 26, opacity: 0.5, filter: `drop-shadow(0 0 10px rgba(${bRgb}, ${bGlow}))` }}
        />
        <span
          aria-hidden
          className="nw-sweep"
          style={{ position: 'absolute', top: 0, bottom: 0, width: 90, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)' }}
        />
        <span className="nw-scanlines" aria-hidden style={{ position: 'absolute', inset: 0 }} />
        {/* Étiquette bannière équipée */}
        <span
          style={{
            position: 'absolute',
            left: 20,
            top: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: '0.22em',
            color: 'var(--text-label)',
            padding: '5px 10px',
            background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)',
            border: '1px solid var(--border)',
            clipPath: 'var(--clip-bevel-sm)',
          }}
        >
          <Icon name="flag" size={12} /> {t('profile.bannerLabel', { name: t(`cosmetics.items.${banner.id}.name`) })}
        </span>
        {/* Dégradé vers le corps pour ancrer l'avatar */}
        <span aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: 'linear-gradient(to top, var(--bg-panel), transparent)' }} />
      </div>

      {/* Corps : avatar chevauchant + identité */}
      <div style={{ position: 'relative', padding: '0 30px 28px', display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ marginTop: -74, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <AvatarHex glyph={avatar.icon ?? 'user-round'} rarity={avatar.rarity} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
            {t(`cosmetics.items.${avatar.id}.name`)}
          </span>
          <RarityBadge rarity={avatar.rarity} />
        </div>

        <div style={{ flex: 1, minWidth: 240, paddingTop: 22 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="nw-blink" aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--mint-500)', boxShadow: '0 0 8px var(--mint-500)' }} />
            {t('profile.connected')}
          </div>

          <div style={{ minHeight: 52, marginBottom: 6 }}>
            <CallsignEditor value={callsign} onSave={onSaveCallsign} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.16em', color: 'var(--text-muted)', marginBottom: 18 }}>
            {t('profile.callsign.hint')}
          </div>

          {/* Titre équipé */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.24em', color: 'var(--text-muted)', marginBottom: 5 }}>
                {t('profile.titleLabel')}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.9rem',
                  letterSpacing: '0.12em',
                  color: titleColor,
                  textShadow: tGlow ? `0 0 16px rgba(${tRgb}, ${tGlow * 0.8}), 0 0 4px rgba(${tRgb}, 0.6)` : 'none',
                  lineHeight: 1,
                }}
              >
                « {t(`cosmetics.items.${title.id}.text`)} »
              </div>
            </div>
            <RarityBadge rarity={title.rarity} />
          </div>
        </div>
      </div>
    </Card>
  )
}
