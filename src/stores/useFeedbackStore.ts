import { create } from 'zustand'

/** Toast transitoire (récompense, création, suppression). */
export interface ToastItem {
  id: string
  kind: 'success' | 'danger'
  title: string
  label: string
}

/** Gain de réputation transitoire (US-012) — micro-toast teinté faction. */
export interface RepGainItem {
  id: string
  factionName: string
  color: string
  delta: number
  before: number
  after: number
}

/** Passage de rang d'une faction (US-012) — moment de palier. */
export interface RankUpItem {
  id: string
  factionName: string
  color: string
  /** Clés i18n des rangs (`reputation.rank.*`). */
  toRankKey: string
  fromRankKey: string
  /** Seuil franchi (réputation du nouveau rang). */
  threshold: number
}

/** Mise perdue détectée au chargement (US-013) — remontée en toast danger. */
export interface StakeLossItem {
  id: string
  /** Intitulé du contrat concerné. */
  title: string
  /** Montant de la mise confisquée (déjà débité à la pose). */
  amount: number
}

/**
 * État de rétroaction **partagé** entre les écrans (US-010). Hébergé par
 * l'app-shell : les toasts, les gains de session, le toast de palier et le
 * flash « hack réussi » s'affichent quelle que soit la vue active. Les
 * minuteries d'auto-effacement sont gérées ici (les vues n'ont qu'à déclencher).
 */
interface FeedbackState {
  toasts: ToastItem[]
  /** Cumul des gains de la session (en mémoire, remis à zéro au rechargement). */
  sessionGains: { xp: number; credits: number }
  /** Niveau atteint à afficher (toast de palier) ; `null` si aucun. */
  levelUp: number | null
  /** Gain de réputation à afficher (US-012) ; `null` si aucun. */
  repGain: RepGainItem | null
  /** Passage de rang à afficher (US-012) ; `null` si aucun. */
  rankUp: RankUpItem | null
  /** Contrat qui vient d'encaisser sa récompense → flash transitoire. */
  flashingId: string | null
  /** Mises perdues au chargement (US-013), à transformer en toasts (AppShell). */
  stakeLosses: StakeLossItem[]

  pushToast: (kind: ToastItem['kind'], title: string, label: string) => void
  dismiss: (id: string) => void
  addGains: (xp: number, credits: number) => void
  triggerLevelUp: (level: number) => void
  triggerRepGain: (item: Omit<RepGainItem, 'id'>) => void
  triggerRankUp: (item: Omit<RankUpItem, 'id'>) => void
  flash: (id: string) => void
  /** File des mises perdues au chargement (déduplique par appel). */
  pushStakeLosses: (items: Omit<StakeLossItem, 'id'>[]) => void
  /** Vide la file une fois les toasts émis (AppShell). */
  clearStakeLosses: () => void
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  sessionGains: { xp: 0, credits: 0 },
  levelUp: null,
  repGain: null,
  rankUp: null,
  flashingId: null,
  stakeLosses: [],

  pushToast: (kind, title, label) => {
    const id = crypto.randomUUID()
    const clipped = label.length > 42 ? `${label.slice(0, 42)}…` : label
    set((s) => ({
      toasts: [...s.toasts, { id, kind, title, label: clipped }].slice(-3),
    }))
    window.setTimeout(() => get().dismiss(id), 2600)
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addGains: (xp, credits) =>
    set((s) => ({
      sessionGains: {
        xp: s.sessionGains.xp + xp,
        credits: s.sessionGains.credits + credits,
      },
    })),

  triggerLevelUp: (level) => {
    set({ levelUp: level })
    window.setTimeout(
      () => set((s) => (s.levelUp === level ? { levelUp: null } : s)),
      4000,
    )
  },

  triggerRepGain: (item) => {
    const repGain = { id: crypto.randomUUID(), ...item }
    set({ repGain })
    window.setTimeout(
      () => set((s) => (s.repGain?.id === repGain.id ? { repGain: null } : s)),
      2600,
    )
  },

  triggerRankUp: (item) => {
    const rankUp = { id: crypto.randomUUID(), ...item }
    set({ rankUp })
    window.setTimeout(
      () => set((s) => (s.rankUp?.id === rankUp.id ? { rankUp: null } : s)),
      4000,
    )
  },

  flash: (id) => {
    set({ flashingId: id })
    window.setTimeout(
      () => set((s) => (s.flashingId === id ? { flashingId: null } : s)),
      720,
    )
  },

  pushStakeLosses: (items) => {
    if (items.length === 0) return
    set((s) => ({
      stakeLosses: [
        ...s.stakeLosses,
        ...items.map((it) => ({ id: crypto.randomUUID(), ...it })),
      ],
    }))
  },

  clearStakeLosses: () => set({ stakeLosses: [] }),
}))
