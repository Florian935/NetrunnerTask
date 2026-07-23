import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import {
  COSMETICS,
  COSMETIC_TYPES,
  cosmeticsByType,
  type CosmeticType,
} from '../../game/cosmetics'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { CosmeticCard } from './CosmeticCard'

/** Icône de section + largeur mini de carte par type. */
const TYPE_META: Record<CosmeticType, { icon: string; min: number }> = {
  theme: { icon: 'palette', min: 232 },
  avatar: { icon: 'user-round', min: 200 },
  banner: { icon: 'flag', min: 244 },
  title: { icon: 'badge-check', min: 220 },
}

function Section({
  type,
  count,
  children,
}: {
  type: CosmeticType
  count: number
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span aria-hidden style={{ width: 20, height: 10, background: 'var(--hatch-cyan)', flexShrink: 0 }} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-md)',
            letterSpacing: '0.24em',
            color: 'var(--text-primary)',
          }}
        >
          <Icon name={TYPE_META[type].icon} size={16} color="var(--accent)" />
          {t(`cosmetics.types.${type}`)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
          {t('cosmetics.sectionCount', { count })}
        </span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border-strong), transparent)' }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${TYPE_META[type].min}px, 1fr))`,
          gap: 16,
        }}
      >
        {children}
      </div>
    </section>
  )
}

/**
 * Écran Garde-robe (US-031) — cosmétiques possédés groupés par type, chacun
 * équipable (un seul par type). Hérite du fond signature via `.nav-main`.
 */
export function WardrobeView() {
  const { t } = useTranslation()
  const owned = useCosmeticsStore((s) => s.owned)
  const equipped = useCosmeticsStore((s) => s.equipped)
  const equip = useCosmeticsStore((s) => s.equip)

  return (
    <div style={{ padding: 'var(--space-6) var(--space-6) var(--space-8)', maxWidth: 1180, margin: '0 auto' }}>
      {/* En-tête HUD (sans pastille crédits — acquisition = US-033/034) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 26,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.34em', color: 'var(--text-muted)', marginBottom: 8 }}>
            {t('cosmetics.kicker')}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '2.4rem',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              textShadow: 'var(--text-glow-cyan)',
              lineHeight: 1,
            }}
          >
            {t('cosmetics.title')}
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginTop: 9 }}>
            {t('cosmetics.subtitle')}
          </div>
        </div>
        {/* Compteur « débloqués » minimal (aperçu de collection complet = US-033). */}
        <div
          style={{
            textAlign: 'right',
            padding: '8px 14px',
            clipPath: 'var(--clip-bevel-sm)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-inset)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
            {owned.length}/{COSMETICS.length}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.18em', color: 'var(--text-muted)', marginTop: 3 }}>
            {t('cosmetics.unlocked')}
          </div>
        </div>
      </header>

      {COSMETIC_TYPES.map((type) => {
        const items = cosmeticsByType(type).filter((c) => owned.includes(c.id))
        if (items.length === 0) return null
        return (
          <Section key={type} type={type} count={items.length}>
            {items.map((item) => (
              <CosmeticCard
                key={item.id}
                item={item}
                equipped={equipped[type] === item.id}
                onEquip={() => equip(item.id)}
              />
            ))}
          </Section>
        )
      })}
    </div>
  )
}
