// Types du domaine — cœur du MVP 1 (contrats, factions, joueur).
// Identifiants et valeurs en anglais (convention) ; commentaires en français.

/** Échelle de difficulté d'un contrat (trivial → légendaire) → détermine la récompense (US-008). */
export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary'

/** Priorité fonctionnelle du contrat (indépendante de la difficulté). */
export type Priority = 'low' | 'normal' | 'high'

/** État d'avancement d'un contrat. */
export type ContractStatus = 'open' | 'done'

/** Étape d'un contrat (checklist). Informative : n'octroie aucune récompense. */
export interface SubTask {
  id: string
  title: string
  done: boolean
}

/** La tâche gamifiée : l'objet central du to-do. */
export interface Contract {
  id: string
  title: string
  /** Faction de rattachement ; `null` = aucune. */
  factionId: string | null
  difficulty: Difficulty
  priority: Priority
  /** Échéance en epoch ms ; `null` = pas d'échéance. */
  dueDate: number | null
  status: ContractStatus
  /** Date de création (epoch ms). */
  createdAt: number
  /** Date de complétion (epoch ms) ; `null` tant qu'ouvert. */
  completedAt: number | null
  /**
   * Récompense (XP + crédits) déjà versée pour ce contrat ? Anti-farm (US-008) :
   * un contrat ne paie qu'à sa **première** complétion ; rouvrir puis re-terminer
   * ne reverse rien. `false` à la création.
   */
  rewardGranted: boolean
  /**
   * Sous-tâches (checklist, US-005). Informatives : n'influencent ni la
   * récompense ni la complétion du contrat. `[]` par défaut.
   */
  subtasks: SubTask[]
}

/** Catégorie de vie regroupant des contrats. */
export interface Faction {
  id: string
  name: string
  /** Couleur d'accent (token NIGHTWIRE ou couleur CSS). */
  color: string
  createdAt: number
}

/** État de progression global — enregistrement unique (singleton, clé fixe `'me'`). */
export interface Player {
  id: 'me'
  xp: number
  level: number
  credits: number
}
