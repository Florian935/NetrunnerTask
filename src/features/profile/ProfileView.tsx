import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button, Icon, StatCard } from '../../components/ui'
import { COSMETICS, COSMETIC_BY_ID } from '../../game/cosmetics'
import { MILESTONE_DEFS } from '../../game/milestones'
import { useBuilderStore } from '../../stores/useBuilderStore'
import { useCosmeticsStore } from '../../stores/useCosmeticsStore'
import { RunnerIdCard } from './RunnerIdCard'

/**
 * Écran Profil / ID runner (US-032) — la vitrine : carte d'ID (cosmétiques
 * équipés + callsign) + 3 stats builder **permanentes** (Génération / Jalons /
 * Cosmétiques). Lecture seule des stores existants, sauf le callsign. **Aucune
 * donnée du module perso** (XP/crédits/réputation).
 */
export function ProfileView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const callsign = useCosmeticsStore((s) => s.callsign)
  const equipped = useCosmeticsStore((s) => s.equipped)
  const owned = useCosmeticsStore((s) => s.owned)
  const setCallsign = useCosmeticsStore((s) => s.setCallsign)

  const prestigeCount = useBuilderStore((s) => s.prestigeCount)
  const achievedMilestones = useBuilderStore((s) => s.achievedMilestones)

  const avatar = COSMETIC_BY_ID[equipped.avatar]
  const banner = COSMETIC_BY_ID[equipped.banner]
  const title = COSMETIC_BY_ID[equipped.title]

  return (
    <div style={{ padding: 'var(--space-6) var(--space-6) var(--space-8)', maxWidth: 1180, margin: '0 auto' }}>
      {/* En-tête HUD + CTA */}
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.34em', color: 'var(--text-muted)', marginBottom: 8 }}>
            {t('profile.kicker')}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '2.1rem',
              letterSpacing: '0.14em',
              color: 'var(--text-primary)',
              textShadow: 'var(--text-glow-cyan)',
              lineHeight: 1,
            }}
          >
            {t('profile.title')}
          </h1>
        </div>
        <Button
          variant="secondary"
          hud
          onClick={() => navigate('/wardrobe')}
          leftIcon={<Icon name="shirt" size={17} />}
        >
          {t('profile.customize')}
        </Button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <RunnerIdCard
          callsign={callsign}
          onSaveCallsign={setCallsign}
          avatar={avatar}
          banner={banner}
          title={title}
        />

        {/* Bloc 3 stats builder permanentes (pas de données perso) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatCard
            icon="orbit"
            accent="violet"
            label={t('profile.stats.generation')}
            value={prestigeCount}
          />
          <StatCard
            icon="milestone"
            accent="cyan"
            label={t('profile.stats.milestones')}
            value={`${achievedMilestones.length} / ${MILESTONE_DEFS.length}`}
          />
          <StatCard
            icon="shirt"
            accent="mint"
            label={t('profile.stats.cosmetics')}
            value={`${owned.length} / ${COSMETICS.length}`}
          />
        </div>
      </div>
    </div>
  )
}
