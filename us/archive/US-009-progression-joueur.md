# US-009 — Progression joueur (XP, niveau netrunner, solde crédits)

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-009-progression-joueur

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** transformer l'XP accumulée (déjà versée par US-008 à la complétion)
  en une **progression de niveau** lisible. L'US-008 stocke `xp` et `credits`
  mais laisse `level` figé à 1. US-009 apporte le **moteur de progression** :
  une **courbe XP → niveau**, la **montée de niveau** à la complétion, une
  **rétroaction visible** au passage de palier, et un **indicateur permanent**
  du niveau, de l'avancement dans le niveau et du solde de crédits.
  > Périmètre volontairement limité au *moteur + indicateur minimal*. Le
  > tableau de bord complet (contrats du jour, mise en page HUD) reste **US-010**.

- **Pour qui :** le joueur (utilisateur unique) qui veut **sentir qu'il
  progresse** : voir son niveau de netrunner monter et savoir combien il lui
  reste avant le prochain palier.

- **Courbe proposée (à valider) :** l'XP nécessaire pour passer du niveau `n` au
  niveau `n+1` vaut `100 × n`. Donc :
  | Atteindre le niveau | XP cumulée requise |
  |---|---|
  | 1 (départ) | 0 |
  | 2 | 100 |
  | 3 | 300 |
  | 4 | 600 |
  | 5 | 1 000 |
  Palier croissant → les premiers niveaux tombent vite (quelques contrats),
  puis l'effort augmente. Formule tunable en un seul endroit (couche `game/`).
  _Décision de game design à confirmer : ces chiffres te conviennent ?_

- **Montée de niveau à la complétion :** octroyer un bonus de crédits au passage
  de palier reste **hors périmètre MVP 1** (pas dans la roadmap). Terminer un
  contrat ne rapporte que la récompense d'US-008 ; le niveau est **dérivé** de
  l'XP totale, sans gain additionnel. _À confirmer._

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Départ neutre** — première ouverture (base vierge) → l'indicateur affiche
     niveau **1**, **0 %** d'avancement dans le niveau, **0** crédit.
  2. **Progression intra-niveau** — joueur niveau 1, je termine un contrat
     `medium` (25 XP) → l'indicateur reste au niveau **1** et affiche
     **25 / 100** (25 %) vers le niveau 2 ; solde crédits **+20**.
  3. **Montée d'un niveau** — joueur à 75 XP (niveau 1), je termine un contrat
     `medium` (25 XP → total 100) → le niveau passe à **2**, l'avancement
     retombe à **0 / 200** vers le niveau 3.
  4. **Montée multi-niveaux en une complétion** — joueur à 250 XP (niveau 2), je
     termine un contrat `legendary` (100 XP → total 350) → le niveau passe
     directement à **3** (350 ≥ 300) et l'avancement affiche **50 / 300**.
  5. **Rétroaction de palier** — quand une complétion fait franchir au moins un
     niveau, un **retour visuel explicite « niveau X atteint »** apparaît
     (toast / animation) ; il n'apparaît **pas** si aucun palier n'est franchi.
  6. **Cohérence anti-farm** — rouvrir puis re-terminer un contrat déjà payé
     (US-008 : `rewardGranted`) → **aucune** XP ajoutée, **aucune** montée de
     niveau, **aucune** rétroaction de palier.
  7. **Persistance** — après une montée de niveau, je recharge l'application →
     le niveau, l'avancement dans le niveau et le solde sont **conservés**
     (relecture depuis Dexie, pas de recalcul erroné).
  8. **Indicateur permanent** — le niveau, une barre d'avancement vers le niveau
     suivant et le solde de crédits sont **visibles en permanence** (hors modale
     de détail), et se **mettent à jour immédiatement** à la complétion sans
     rechargement.

- **Impact UI :** **significatif** — introduction d'un indicateur de progression
  permanent + rétroaction de montée de niveau. → je propose de déclencher
  l'**étape design** (maquette) après validation du cadrage technique. À voir
  aussi : articulation avec le futur HUD d'US-010 pour ne pas jeter ce qui est
  fait ici.

## 2. Cadrage technique  _(porte de validation)_

- **Fichiers impactés :**
  - **`src/game/progression.ts` _(nouveau)_** — couche « règles de jeu » pure
    (comme `priority.ts` / `rewards.ts`), sans Dexie ni React ni i18n. Contient
    la courbe et les dérivations. Source de vérité unique de la progression.
  - **`src/stores/usePlayerStore.ts`** — `grantReward` dérive et **persiste
    désormais `level`** (aujourd'hui figé à 1) et **renvoie l'issue de la montée
    de niveau** pour piloter la rétroaction.
  - **`src/features/progression/ProgressionIndicator.tsx` _(nouveau)_** —
    l'indicateur permanent (badge niveau + barre d'avancement vers le niveau
    suivant + solde crédits), abonné à `usePlayerStore`. Conçu **autonome et
    déplaçable** pour être réemployé tel quel dans le HUD d'US-010.
  - **`src/features/contracts/ContractsView.tsx`** — monter l'indicateur dans
    l'en-tête ; à la complétion, après `grantReward`, déclencher le **toast de
    palier** si montée de niveau. `ToastItem['kind']` étendu (variante palier).
  - **`src/i18n/locales/fr.json` + `en.json`** — clés : libellé niveau, gabarit
    « Niveau {{level}} atteint », libellés d'avancement / solde.

- **Logique :**
  - **Courbe** (`progression.ts`, tunable en un point) : XP pour passer du niveau
    `n` au niveau `n+1` = `100 × n`. XP cumulée pour **atteindre** le niveau `L`
    = `50 × L × (L − 1)` (⇒ L2 = 100, L3 = 300, L4 = 600, L5 = 1000).
  - Fonctions pures exportées :
    - `xpToReachLevel(level): number` → `50 * level * (level - 1)`.
    - `levelForXp(xp): number` → plus grand `L` tel que `xpToReachLevel(L) ≤ xp`
      (accumulation par palier, robuste ; `xp = 0` → niveau 1).
    - `progressionFor(xp): { level, xpIntoLevel, xpForNextLevel, pct }` — dérive
      tout ce dont l'indicateur a besoin (`xpForNextLevel = 100 * level`,
      `pct = xpIntoLevel / xpForNextLevel * 100`). Gère la montée **multi-paliers**
      naturellement (on part de l'XP totale, pas d'un décrément).
  - **`grantReward(reward)`** : calcule `nextXp = xp + reward.xp`,
    `nextCredits = credits + reward.credits`, `nextLevel = levelForXp(nextXp)`.
    Le niveau précédent est **redérivé de l'XP courante** (`levelForXp(xp)`) et
    non lu dans `player.level` — auto-réparateur si le champ a dérivé. Persiste
    `{ xp, level, credits }` puis renvoie
    `{ leveledUp: nextLevel > prevLevel, previousLevel, newLevel }`.
  - **`ContractsView.toggle`** : le retour de `grantReward` pilote le toast de
    palier (« Niveau {{newLevel}} atteint ») — affiché **uniquement** si
    `leveledUp`, en plus du toast de récompense XP/crédits existant. Aucun
    palier franchi ⇒ pas de toast de palier (critère 5). L'anti-farm est déjà
    garanti en amont : `complete()` renvoie `null` si `rewardGranted`, donc
    `grantReward` n'est pas appelé (critère 6).
  - **Indicateur permanent** : lit `player` du store (chargé au montage via
    `loadPlayer()` déjà en place) → `progressionFor(player.xp)` pour l'affichage.
    Réactif : `grantReward` fait un `set({ player })`, l'indicateur se rafraîchit
    seul (critère 8). Distinct du bloc **gains de session** d'US-008 (éphémère),
    qui reste tel quel.

- **Impacts modèle de données :**
  - **Aucune migration.** `Player.level` **existe déjà** dans le schéma (US-002,
    Dexie courante). US-009 se contente de **commencer à l'écrire correctement**.
    Pas de bump de version Dexie, pas de changement de type.
  - `Player.xp` reste la **source de vérité** ; `level` est une **dérivation
    persistée** (cache d'affichage), toujours recalculable via `levelForXp(xp)`
    → garantit la persistance sans recalcul erroné au rechargement (critère 7).

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans / états concernés :**
  1. **Indicateur de progression permanent** (dans l'en-tête de `ContractsView`) —
     à concevoir : badge/pastille **niveau netrunner**, **barre d'avancement**
     vers le niveau suivant (avec repère `xpIntoLevel / xpForNextLevel`), et
     **solde de crédits** persistant. À distinguer visuellement du bloc éphémère
     « gains de session » d'US-008 (qui reste). Composant pensé **réutilisable**
     dans le futur HUD (US-010).
  2. **Toast de montée de niveau** — variante visuelle distincte du toast de
     récompense XP/crédits existant : « Niveau {{level}} atteint ». Doit se lire
     comme un **moment de palier** (plus marquant que le toast de gain courant).
  3. **États à couvrir dans la maquette :** niveau 1 à 0 % (départ) ; en cours de
     niveau (barre partielle) ; instant de montée de niveau (toast + état de la
     barre après passage). Rappel contrainte roadmap : rester sobre, respecter
     `prefers-reduced-motion` pour toute animation de palier.

- **Maquette :** fournie (Claude Design), **validée le 18/07/2026**. Écrans `5a`
  (indicateur permanent, 3 états) et `5b` (toasts). Non versionnée dans le dépôt
  (convention : les maquettes ne sont pas commitées).

- **Specs retenues de la maquette :**
  - **Indicateur permanent** = bloc **cadré + biseauté** (`bg-inset`,
    `border-strong`, `clip-bevel-md`, léger glow cyan) — se distingue des gains
    de session (texte nu). Composition : `NIV.` + numéro (néon cyan) │ séparateur
    │ colonne ~210px = libellé « NIV. SUIVANT » + ratio `xpIntoLevel /
    xpForNextLevel` (nombre courant en mint), barre 6px mint (fond `void-800`),
    ligne crédits (icône `coins` + valeur ambre + `¢`). État de montée : bordure
    mint + animation `nw-level-pulse`.
  - **Toast récompense courante** : `Toast` DS existant, inchangé (~2,6 s).
  - **Toast de palier = composant sur-mesure** (pas le `Toast` DS) : ~340px,
    dégradé + bordure mint, biseau, icône `chevrons-up` dans un carré biseauté,
    eyebrow « PALIER ATTEINT » + titre display « NIVEAU {{level}} ATTEINT » +
    sous-ligne « RÉSEAU ÉTENDU · NOUVEAU PALIER {{xpForNextLevel}} XP ». Glow
    pulsé, **~4 s**, `prefers-reduced-motion` respecté.
  - **Décision de périmètre (validée 18/07/2026)** : le compteur « ACTIFS ·
    TOTAL » (barre de complétion, US-004) **quitte l'en-tête** au profit de
    l'indicateur de niveau. Il sera **réintégré dans le HUD d'US-010**.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Couche pure `src/game/progression.ts` (+ tests).** TDD : `xpToReachLevel`,
   `levelForXp`, `progressionFor` selon la courbe `100 × n`. Cas de test dérivés
   des critères 1-4 (0 XP → niv.1 0 % ; 25 → niv.1 25/100 ; 100 → niv.2 ;
   350 → niv.3 50/300). Aucune dépendance React/Dexie/i18n.
2. **`usePlayerStore.grantReward`.** Dérive `nextLevel = levelForXp(nextXp)`,
   `prevLevel = levelForXp(current.xp)` (auto-réparateur), persiste
   `{ xp, level, credits }` via `playerRepo.update`, met à jour l'état, et
   **renvoie `{ leveledUp, previousLevel, newLevel }`**. Adapter la signature
   dans `PlayerState`.
3. **i18n (`fr.json` / `en.json`).** Clés : libellés indicateur (`NIV.`,
   `NIV. SUIVANT`), toast de palier (eyebrow « PALIER ATTEINT », titre
   « NIVEAU {{level}} ATTEINT », sous-ligne « RÉSEAU ÉTENDU · NOUVEAU PALIER
   {{xp}} XP »).
4. **Composant `src/features/progression/ProgressionIndicator.tsx`.** Abonné à
   `usePlayerStore`, dérive l'affichage via `progressionFor(player.xp)`. Rendu
   fidèle à la maquette 5a (bloc biseauté cyan : niveau │ barre + ratio │
   crédits). **Autonome et sans dépendance à `ContractsView`** → réemployable
   dans le HUD US-010.
5. **Composant `src/features/progression/LevelUpToast.tsx` (+ CSS).** Toast
   sur-mesure de la maquette 5b-B (mint, biseau, icône `chevrons-up`, eyebrow +
   titre + sous-ligne). Keyframes `nw-level-in` / `nw-level-pulse` / `nw-spark`
   dans un CSS dédié, avec garde `@media (prefers-reduced-motion:reduce)`.
   Durée d'affichage ~4 s.
6. **`ContractsView`.**
   - En-tête : **retirer** le bloc « ACTIFS · TOTAL », **monter**
     `ProgressionIndicator` à droite ; conserver les gains de session à gauche
     (afficher « — · — » quand nuls, état départ).
   - `toggle()` : après `grantReward`, si `leveledUp` → déclencher un
     `LevelUpToast` géré par un **état dédié** (un palier à la fois, durée ~4 s),
     **en plus** du toast de récompense existant. Pas de palier → pas de toast
     de palier.
7. **Recette + build.** Dérouler les 8 critères (skill `recette`), consigner
   dans `project/recettes.md`, puis `npm run build`. Reste hors périmètre :
   réintégration du compteur actifs/total dans le HUD (US-010).
