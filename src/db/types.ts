// Types du domaine — cœur du MVP 1 (contrats, factions, joueur).
// Identifiants et valeurs en anglais (convention) ; commentaires en français.

import type { CosmeticType } from '../game/cosmetics'
import type { CrateQuality } from '../game/crates'

/** Échelle de difficulté d'un contrat (trivial → légendaire) → détermine la récompense (US-008). */
export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary'

/** Priorité fonctionnelle du contrat (indépendante de la difficulté). */
export type Priority = 'low' | 'normal' | 'high'

/** État d'avancement d'un contrat. */
export type ContractStatus = 'open' | 'done'

/**
 * Issue d'une mise à risque (US-013). `none` = pas de mise ; `pending` = crédits
 * en jeu (déjà débités) ; `won` / `lost` = résolue (figée). Voir `game/risk.ts`.
 */
export type StakeOutcome = 'none' | 'pending' | 'won' | 'lost'

/** Étape d'un contrat (checklist). Informative : n'octroie aucune récompense. */
export interface SubTask {
  id: string
  title: string
  done: boolean
}

/**
 * Rythme de récurrence d'un contrat (US-006). Deux modes :
 * - `interval` : tous les `every` jours / semaines / mois.
 * - `weekday` : chaque semaine un jour fixe (ISO `weekday` : 1 = lundi … 7 = dimanche).
 * `Contract.recurrence = null` ⇒ contrat one-shot (défaut).
 */
export type Recurrence =
  | { mode: 'interval'; every: number; unit: 'day' | 'week' | 'month' }
  | { mode: 'weekday'; weekday: number }

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
  /**
   * L'échéance porte-t-elle une **heure** (US-014) ? `false` = « toute la
   * journée » (`dueDate` = minuit local, comportement historique) ; `true` =
   * `dueDate` est l'instant exact. `false` par défaut.
   */
  dueHasTime: boolean
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
  /**
   * Rythme de récurrence (US-006) ; `null` = one-shot. Un contrat récurrent
   * complété est reprogrammé à sa prochaine échéance (il reste sur la même
   * entrée, sans historique des occurrences).
   */
  recurrence: Recurrence | null
  /**
   * Série courante (US-011) : nombre de périodes **consécutives complétées à
   * temps** pour un contrat récurrent. `0` par défaut et pour un one-shot.
   * Remise à `0` dès qu'une période est manquée. Voir `game/streak.ts`.
   */
  currentStreak: number
  /**
   * Meilleure série jamais atteinte (record, US-011). `0` par défaut ; **ne
   * diminue jamais**, même après une remise à zéro de `currentStreak`.
   */
  bestStreak: number
  /**
   * Mise à risque (US-013) : crédits misés, **déjà débités** du solde. `0` = pas
   * de mise. Réservé aux one-shot à échéance (voir `game/risk.ts`).
   */
  stake: number
  /**
   * Issue de la mise (US-013). `'none'` par défaut ; `'pending'` tant qu'elle est
   * en jeu ; `'won'` / `'lost'` une fois résolue (figée). Invariant :
   * `stake > 0 ⇔ stakeOutcome ≠ 'none'`.
   */
  stakeOutcome: StakeOutcome
  /**
   * Rappel (US-014) : minutes **avant** l'échéance pour notifier. `null` = pas de
   * rappel (défaut) ; `0` = à l'échéance ; `10` / `60` = crans. **Exige une
   * heure** (`dueHasTime`) — sans heure, reste `null`.
   */
  reminderLead: number | null
  /**
   * Instant limite (epoch ms) pour lequel le rappel a **déjà été émis** (US-014) —
   * dédoublonne au fil des ticks/rechargements. `null` = jamais notifié ; diffère
   * quand l'échéance change ou qu'un récurrent se reprogramme.
   */
  reminderNotifiedFor: number | null
}

/** Catégorie de vie regroupant des contrats. */
export interface Faction {
  id: string
  name: string
  /** Couleur d'accent (token NIGHTWIRE ou couleur CSS). */
  color: string
  createdAt: number
  /**
   * Réputation de la faction (US-012) : entier **≥ 0** (plancher). Monte à la
   * complétion payante d'un de ses contrats, descend quand un streak d'habitude
   * rattaché casse. Le **rang** en est dérivé par seuils (voir `game/reputation.ts`).
   * `0` par défaut.
   */
  reputation: number
}

/** État de progression global — enregistrement unique (singleton, clé fixe `'me'`). */
export interface Player {
  id: 'me'
  xp: number
  level: number
  credits: number
}

/**
 * État du builder « Réseau » (US-020) — enregistrement unique (singleton, clé
 * fixe `'me'`). Jeu incrémental : `cycles` (ressource) produits à la main (HACK)
 * et automatiquement par les daemons possédés. Voir `game/builder.ts`.
 */
export interface BuilderState {
  id: 'me'
  /** Ressource courante (cycles) ; peut être fractionnaire, plancher 0. */
  cycles: number
  /** Daemons possédés, par type (`id` du catalogue → compte). US-021. */
  generators: Record<string, number>
  /** Niveau d'upgrade, par type (`id` → niveau ; absent = 0). US-021. */
  upgrades: Record<string, number>
  /**
   * 2ᵉ ressource (US-022) : produite en dérivant une part de la production de
   * cycles, une fois le daemon `oracle` possédé. Fractionnaire, plancher 0.
   */
  data: number
  /**
   * 3ᵉ ressource (US-027) : jamais accumulée passivement — créditée
   * uniquement par conversion manuelle de `data` au cours du marché (voir
   * `game/crypto.ts`). Fractionnaire, plancher 0.
   */
  crypto: number
  /**
   * `id` des nœuds de l'arbre de déblocage déjà achetés (US-022). **Tableau
   * partagé** entre la branche `data` et la branche `crypto` (US-027) — les
   * `id` sont uniques dans tout le catalogue. Voir `game/unlockTree.ts`.
   */
  unlockedNodes: string[]
  /**
   * Accélérateur réel en cours d'exécution (US-023) : chrono tenu par l'app,
   * `endsAt` = instant absolu (epoch ms) de fin annoncée. `null` = aucun en
   * cours. Voir `game/accelerators.ts`.
   */
  acceleratorRun: { id: string; endsAt: number } | null
  /**
   * Boost temporaire (« SURCADENCE », US-023) obtenu en menant un
   * accélérateur à son terme : `endsAt` = instant absolu (epoch ms) de fin du
   * boost. `null` = aucun boost actif. Distinct du nœud permanent `overclock`
   * de `game/unlockTree.ts`.
   */
  acceleratorBoost: { id: string; endsAt: number } | null
  /**
   * Nombre de renaissances effectuées (US-024, prestige). `0` par défaut ;
   * ne diminue jamais. Détermine le bonus permanent de production
   * (`prestigeMultiplier`, voir `game/prestige.ts`). Survit aux resets.
   */
  prestigeCount: number
  /**
   * Dernier instant de mise à jour (epoch ms) — base du tick **et** du calcul
   * de production hors-ligne (US-024) : à la réouverture, la production écoulée
   * depuis cet instant est créditée d'un coup (voir `game/builder.ts`
   * `offlineTick` + `useBuilderStore.load()`).
   */
  updatedAt: number
  /**
   * `id` des jalons de progression déjà atteints (US-028). **Append-only** :
   * ne diminue jamais, y compris après une renaissance (survit au reset de
   * `prestige()`, contrairement à `cycles`/`data`/`crypto`/`unlockedNodes`).
   * Voir `game/milestones.ts`.
   */
  achievedMilestones: string[]
}

/**
 * État cosmétique (US-031, Phase A3) — enregistrement unique (singleton, clé
 * fixe `'me'`). **Table dédiée**, séparée de `BuilderState` : les cosmétiques
 * relèvent de l'identité, pas de l'économie du Réseau, et **survivent à la
 * renaissance** par construction (`prestige()` ne touche que `builderState`).
 * Purement esthétique — aucune valeur de jeu (voir `game/cosmetics.ts`).
 */
export interface CosmeticsState {
  id: 'me'
  /** `id` des cosmétiques possédés (catalogue `COSMETICS`). */
  owned: string[]
  /** `id` équipé par type — un seul par type. */
  equipped: Record<CosmeticType, string>
  /**
   * Callsign du runner (US-032) — identité nominale éditable, normalisée par
   * `game/profile.ts` (majuscules, 12 car. max). Rejoint le singleton
   * d'identité `cosmeticsState` (survit à la renaissance). Défaut au seed.
   */
  callsign: string
  /**
   * Caisses **non ouvertes** par qualité (US-034) — stock gagné en jouant, à
   * ouvrir via le rituel. Vit sur le singleton d'identité → **survit à la
   * renaissance** (`prestige()` ne touche que `builderState`). `0` partout au
   * départ (seed) ; rétro-rempli par la migration v20.
   */
  crates: Record<CrateQuality, number>
}
