import { create } from 'zustand'
import type { CrateQuality } from '../game/crates'

/** Toast transitoire (récompense, création, suppression, rappel). */
export interface ToastItem {
  id: string
  kind: 'success' | 'warning' | 'danger' | 'info'
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

/**
 * Jalon de progression franchi (US-028) — feedback one-shot dédié, distinct
 * des toasts génériques. `milestoneId` = `id` du catalogue `game/milestones.ts`
 * (résout icône + libellés i18n `builder.milestones.items.<id>.*`).
 */
export interface MilestoneItem {
  id: string
  milestoneId: string
}

/**
 * Cosmétique débloqué par un accomplissement (US-033) — reveal dédié.
 * `cosmeticId` = `id` du catalogue `game/cosmetics.ts` (résout aperçu, nom,
 * rareté, et le jalon source via `milestoneForCosmetic`).
 */
export interface CosmeticUnlockItem {
  id: string
  cosmeticId: string
}

/**
 * Caisse gagnée en jouant (US-034) — feedback one-shot dédié : le joueur voit
 * qu'une caisse est tombée (renaissance / jalon). `quality` résout couleur,
 * icône et libellé i18n de la qualité.
 */
export interface CrateEarnedItem {
  id: string
  quality: CrateQuality
}

/**
 * Encaissement de surcharge en voltage (US-037, « Sécuriser ») — feedback dédié.
 * `gain` = voltage encaissé, `at` = surcharge (%) au moment de sécuriser, `mult`
 * = dopage capté, `voltageAfter` = voltage cumulé après (pour la progression de
 * voie). Résout le prochain palier via `game/corruption.ts`.
 */
export interface SecureFeedbackItem {
  id: string
  gain: number
  at: number
  mult: number
  voltageAfter: number
}

/**
 * Nouvel emplacement de la Salle des trophées débloqué (US-038) — feedback dédié.
 * `threshold` = nombre de jalons du palier franchi (libellé « palier de N jalons »).
 */
export interface ShowcaseSlotItem {
  id: string
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
  /**
   * File des jalons franchis à afficher (US-028) — **file**, pas un
   * singleton comme `levelUp`/`rankUp` : plusieurs jalons peuvent tomber au
   * même tick (ex. une renaissance en débloque plusieurs d'un coup).
   */
  milestones: MilestoneItem[]
  /**
   * File des cosmétiques débloqués à afficher (US-033) — reveal dédié, comme
   * `milestones` : plusieurs peuvent tomber au même instant (ex. renaissance).
   */
  cosmeticUnlocks: CosmeticUnlockItem[]
  /**
   * File des caisses gagnées à annoncer (US-034) — file comme `milestones` :
   * une renaissance peut en octroyer une pendant que des jalons tombent.
   */
  crateEarned: CrateEarnedItem[]
  /**
   * Krach de surcharge (US-037) — événement one-shot qui déclenche la secousse
   * glitch du panneau Surcharge. Singleton (comme `levelUp`) ; `null` = aucun.
   */
  corruptionKrach: { id: string } | null
  /**
   * Dernier encaissement « Sécuriser » (US-037) — feedback transitoire (montant
   * + progression de voie). Singleton ; `null` = aucun.
   */
  secure: SecureFeedbackItem | null
  /**
   * File des emplacements de vitrine débloqués (US-038) — **file** comme
   * `milestones` : un même tick de jalons peut ouvrir plusieurs emplacements
   * (ex. renaissance qui fait franchir plusieurs paliers d'un coup).
   */
  showcaseSlots: ShowcaseSlotItem[]
  /** Contrat qui vient d'encaisser sa récompense → flash transitoire. */
  flashingId: string | null
  /** Mises perdues au chargement (US-013), à transformer en toasts (AppShell). */
  stakeLosses: StakeLossItem[]
  /** Rattrapage US-014 : nb d'échéances arrivées pendant l'absence (bandeau). */
  dueCatchup: number | null
  /**
   * Rattrapage US-024 : production créditée pendant l'absence (bandeau
   * hors-ligne). `null` = rien à signaler. `awayMs` = durée d'absence.
   */
  offlineCatchup: { cycles: number; data: number; awayMs: number } | null

  pushToast: (kind: ToastItem['kind'], title: string, label: string) => void
  dismiss: (id: string) => void
  addGains: (xp: number, credits: number) => void
  triggerLevelUp: (level: number) => void
  triggerRepGain: (item: Omit<RepGainItem, 'id'>) => void
  triggerRankUp: (item: Omit<RankUpItem, 'id'>) => void
  /** Empile un jalon franchi (US-028) ; auto-effacement individuel (~4 s). */
  triggerMilestone: (milestoneId: string) => void
  /** Ferme un jalon affiché avant son auto-effacement (clic). */
  dismissMilestone: (id: string) => void
  /** Empile un cosmétique débloqué (US-033) ; auto-effacement (~6 s). */
  triggerCosmeticUnlock: (cosmeticId: string) => void
  /** Ferme un reveal de déblocage avant son auto-effacement (clic). */
  dismissCosmeticUnlock: (id: string) => void
  /** Empile une caisse gagnée (US-034) ; auto-effacement (~5 s). */
  triggerCrateEarned: (quality: CrateQuality) => void
  /** Ferme un feedback de caisse gagnée avant son auto-effacement (clic). */
  dismissCrateEarned: (id: string) => void
  /** Déclenche la secousse de krach (US-037) ; auto-effacement (~0,7 s). */
  triggerCorruptionKrach: () => void
  /** Signale un encaissement « Sécuriser » (US-037) ; auto-effacement (~6 s). */
  triggerSecure: (item: Omit<SecureFeedbackItem, 'id'>) => void
  /** Ferme le feedback de sécurisation avant son auto-effacement (clic). */
  dismissSecure: () => void
  /** Empile un emplacement de vitrine débloqué (US-038) ; auto-effacement (~8 s). */
  triggerShowcaseSlot: (threshold: number) => void
  /** Ferme un feedback d'emplacement débloqué avant son auto-effacement (clic). */
  dismissShowcaseSlot: (id: string) => void
  flash: (id: string) => void
  /** File des mises perdues au chargement (déduplique par appel). */
  pushStakeLosses: (items: Omit<StakeLossItem, 'id'>[]) => void
  /** Vide la file une fois les toasts émis (AppShell). */
  clearStakeLosses: () => void
  /** Signale un rattrapage d'échéances (US-014) — bandeau `Alert`. */
  setDueCatchup: (count: number) => void
  /** Ferme le bandeau de rattrapage. */
  clearDueCatchup: () => void
  /** Signale un rattrapage de production hors-ligne (US-024) — bandeau `Alert`. */
  setOfflineCatchup: (gain: { cycles: number; data: number; awayMs: number }) => void
  /** Ferme le bandeau de rattrapage hors-ligne. */
  clearOfflineCatchup: () => void
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  sessionGains: { xp: 0, credits: 0 },
  levelUp: null,
  repGain: null,
  rankUp: null,
  milestones: [],
  cosmeticUnlocks: [],
  crateEarned: [],
  corruptionKrach: null,
  secure: null,
  showcaseSlots: [],
  flashingId: null,
  stakeLosses: [],
  dueCatchup: null,
  offlineCatchup: null,

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

  triggerMilestone: (milestoneId) => {
    const item: MilestoneItem = { id: crypto.randomUUID(), milestoneId }
    set((s) => ({ milestones: [...s.milestones, item] }))
    window.setTimeout(
      () => set((s) => ({ milestones: s.milestones.filter((m) => m.id !== item.id) })),
      4000,
    )
  },

  dismissMilestone: (id) =>
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

  triggerCosmeticUnlock: (cosmeticId) => {
    const item: CosmeticUnlockItem = { id: crypto.randomUUID(), cosmeticId }
    set((s) => ({ cosmeticUnlocks: [...s.cosmeticUnlocks, item] }))
    window.setTimeout(
      () =>
        set((s) => ({
          cosmeticUnlocks: s.cosmeticUnlocks.filter((u) => u.id !== item.id),
        })),
      6000,
    )
  },

  dismissCosmeticUnlock: (id) =>
    set((s) => ({ cosmeticUnlocks: s.cosmeticUnlocks.filter((u) => u.id !== id) })),

  triggerCrateEarned: (quality) => {
    const item: CrateEarnedItem = { id: crypto.randomUUID(), quality }
    set((s) => ({ crateEarned: [...s.crateEarned, item] }))
    window.setTimeout(
      () => set((s) => ({ crateEarned: s.crateEarned.filter((c) => c.id !== item.id) })),
      5000,
    )
  },

  dismissCrateEarned: (id) =>
    set((s) => ({ crateEarned: s.crateEarned.filter((c) => c.id !== id) })),

  triggerCorruptionKrach: () => {
    const item = { id: crypto.randomUUID() }
    set({ corruptionKrach: item })
    window.setTimeout(
      () => set((s) => (s.corruptionKrach?.id === item.id ? { corruptionKrach: null } : s)),
      700,
    )
  },

  triggerSecure: (item) => {
    const secure = { id: crypto.randomUUID(), ...item }
    set({ secure })
    window.setTimeout(
      () => set((s) => (s.secure?.id === secure.id ? { secure: null } : s)),
      2600,
    )
  },

  dismissSecure: () => set({ secure: null }),

  triggerShowcaseSlot: (threshold) => {
    const item: ShowcaseSlotItem = { id: crypto.randomUUID(), threshold }
    set((s) => ({ showcaseSlots: [...s.showcaseSlots, item] }))
    window.setTimeout(
      () => set((s) => ({ showcaseSlots: s.showcaseSlots.filter((x) => x.id !== item.id) })),
      8000,
    )
  },

  dismissShowcaseSlot: (id) =>
    set((s) => ({ showcaseSlots: s.showcaseSlots.filter((x) => x.id !== id) })),

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

  setDueCatchup: (count) => set({ dueCatchup: count }),
  clearDueCatchup: () => set({ dueCatchup: null }),

  setOfflineCatchup: (gain) => set({ offlineCatchup: gain }),
  clearOfflineCatchup: () => set({ offlineCatchup: null }),
}))
