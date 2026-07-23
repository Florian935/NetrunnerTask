import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/ui'
import {
  COSMETIC_TYPES,
  cosmeticsByType,
  type CosmeticType,
} from '../../game/cosmetics'
import type { CrateDraw, CrateQuality } from '../../game/crates'
import { milestoneForCosmetic } from '../../game/milestones'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { CollectionPreview } from './CollectionPreview'
import { CosmeticCard, type CosmeticCardState } from './CosmeticCard'
import { CratesPanel } from './CratesPanel'
import { CrateOpeningModal } from './CrateOpeningModal'

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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-md)', letterSpacing: '0.24em', color: 'var(--text-primary)' }}>
          <Icon name={TYPE_META[type].icon} size={16} color="var(--accent)" />
          {t(`cosmetics.types.${type}`)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.14em', color: 'var(--text-muted)' }}>
          {t('cosmetics.sectionCount', { count })}
        </span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border-strong), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${TYPE_META[type].min}px, 1fr))`, gap: 16 }}>
        {children}
      </div>
    </section>
  )
}

interface VisibleCosmetic {
  id: string
  state: CosmeticCardState
  hint?: string
}

/**
 * Écran Garde-robe (US-031 + déblocage US-033). Affiche **tout le catalogue**
 * groupé par type : possédés (équipables) et **verrouillés** (indice de
 * déblocage). Les cosmétiques d'un accomplissement **caché non atteint** sont
 * masqués. Aperçu de collection en tête.
 */
export function WardrobeView() {
  const { t } = useTranslation()
  const owned = useCosmeticsStore((s) => s.owned)
  const equipped = useCosmeticsStore((s) => s.equipped)
  const equip = useCosmeticsStore((s) => s.equip)
  const crates = useCosmeticsStore((s) => s.crates)
  const openCrateAction = useCosmeticsStore((s) => s.openCrate)
  const achievedMilestones = useBuilderStore((s) => s.achievedMilestones)

  /** Rituel d'ouverture en cours (US-034) ; `null` = aucun. */
  const [ritual, setRitual] = useState<{ quality: CrateQuality; draw: CrateDraw } | null>(null)

  const handleOpen = (quality: CrateQuality) => {
    const draw = openCrateAction(quality)
    if (draw) setRitual({ quality, draw })
  }

  const ownedSet = new Set(owned)
  const achievedSet = new Set(achievedMilestones)

  /** Cosmétiques visibles d'un type (masque les récompenses de jalons cachés non atteints). */
  const visibleOf = (type: CosmeticType): VisibleCosmetic[] => {
    const out: VisibleCosmetic[] = []
    for (const c of cosmeticsByType(type)) {
      const isOwned = ownedSet.has(c.id)
      const source = milestoneForCosmetic(c.id)
      if (!isOwned && source?.hidden && !achievedSet.has(source.id)) continue // scellé → masqué
      const state: CosmeticCardState = isOwned
        ? equipped[type] === c.id
          ? 'equipped'
          : 'unequipped'
        : 'locked'
      const hint =
        state === 'locked' && source ? t(`builder.milestones.items.${source.id}.name`) : undefined
      out.push({ id: c.id, state, hint })
    }
    return out
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-6) var(--space-8)', maxWidth: 1180, margin: '0 auto' }}>
      {/* En-tête HUD */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.34em', color: 'var(--text-muted)', marginBottom: 8 }}>
          {t('cosmetics.kicker')}
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.4rem', letterSpacing: '0.1em', color: 'var(--text-primary)', textShadow: 'var(--text-glow-cyan)', lineHeight: 1 }}>
          {t('cosmetics.title')}
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', color: 'var(--text-secondary)', marginTop: 9 }}>
          {t('cosmetics.subtitle')}
        </div>
      </header>

      {/* Aperçu de collection (US-033) */}
      <CollectionPreview owned={owned} />

      {/* Inventaire de caisses (US-034) */}
      <CratesPanel crates={crates} onOpen={handleOpen} />

      {COSMETIC_TYPES.map((type) => {
        const items = visibleOf(type)
        if (items.length === 0) return null
        return (
          <Section key={type} type={type} count={items.length}>
            {items.map(({ id, state, hint }) => {
              const cosmetic = cosmeticsByType(type).find((c) => c.id === id)!
              return (
                <CosmeticCard
                  key={id}
                  item={cosmetic}
                  state={state}
                  hint={hint}
                  onEquip={() => equip(id)}
                />
              )
            })}
          </Section>
        )
      })}

      {/* Rituel d'ouverture (US-034) */}
      {ritual && (
        <CrateOpeningModal
          quality={ritual.quality}
          draw={ritual.draw}
          onEquip={(id) => {
            equip(id)
            setRitual(null)
          }}
          onClose={() => setRitual(null)}
        />
      )}
    </div>
  )
}
