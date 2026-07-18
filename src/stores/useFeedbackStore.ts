import { create } from 'zustand'

/** Toast transitoire (récompense, création, suppression). */
export interface ToastItem {
  id: string
  kind: 'success' | 'danger'
  title: string
  label: string
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
  /** Contrat qui vient d'encaisser sa récompense → flash transitoire. */
  flashingId: string | null

  pushToast: (kind: ToastItem['kind'], title: string, label: string) => void
  dismiss: (id: string) => void
  addGains: (xp: number, credits: number) => void
  triggerLevelUp: (level: number) => void
  flash: (id: string) => void
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  toasts: [],
  sessionGains: { xp: 0, credits: 0 },
  levelUp: null,
  flashingId: null,

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

  flash: (id) => {
    set({ flashingId: id })
    window.setTimeout(
      () => set((s) => (s.flashingId === id ? { flashingId: null } : s)),
      720,
    )
  },
}))
