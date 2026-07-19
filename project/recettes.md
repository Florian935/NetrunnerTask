# Recettes — Netrunner Tasks

> Tests de recette par US. Chaque test reprend un critère d'acceptation de l'US.
> Statuts : `à faire` / `validé` / `échoué`.

## US-007 — Factions (catégories) & filtrage

Recette du 18/07/2026. Vérifs automatiques (typecheck / lint / build / tests
Vitest 30/30, dont `factionLabel` 3/3) + recette visuelle & comportementale
navigateur (`npm run dev`, port 5180) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Affecter une faction dans le détail → persistée après F5 | validé | 18/07/2026 |
| C2 | Repasser à « Aucune » → persisté (F5), plus de badge sur la ligne | validé | 18/07/2026 |
| C3 | Ligne avec faction → badge (point coloré + nom) en tête de méta ; sans faction → aucun badge | validé | 18/07/2026 |
| C4 | Filtre par faction → seuls les contrats de cette faction affichés | validé | 18/07/2026 |
| C5 | Filtre « Toutes » (défaut) → liste complète restaurée | validé | 18/07/2026 |
| C6 | Filtre « Sans faction » → seuls les contrats non rattachés | validé | 18/07/2026 |
| C7 | Filtrer/dé-filtrer → aucun contrat modifié/supprimé, tri (priorité/récence) conservé | validé | 18/07/2026 |
| C8 | Bascule FR/EN → factions, « Aucune/Toutes/Sans faction » traduits ; aucune chaîne en dur | validé | 18/07/2026 |
| C9 | Création rapide au clavier → toujours ~2 s ; faction réglée après, dans le détail | validé | 18/07/2026 |

**Verdict : recette US-007 validée (9/9 critères).** Aucune migration Dexie
(socle faction déjà en place depuis v2). Amélioration renvoyée au backlog (MVP 2) :
état vide dédié « aucun contrat pour ce filtre ».

## US-001 — Initialisation technique + design system

Recette du 17/07/2026. Vérifs automatiques (dev/build/tsc/lint/PWA) + recette
visuelle navigateur confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | `npm run dev` → l'app démarre et affiche la page de démo | validé | 17/07/2026 |
| C2 | Thème du DS appliqué (néons, polices Chakra/Space/JetBrains, dark par défaut) + bascule thème clair | validé | 17/07/2026 |
| C3 | Composants DS en React/TS au rendu conforme (verre translucide, halo néon, focus teal) | validé | 17/07/2026 |
| C4 | Interaction Zustand → la valeur d'état se met à jour à l'écran | validé | 17/07/2026 |
| C5 | Valeur écrite dans Dexie → présente après rechargement (F5) | validé | 17/07/2026 |
| C6 | PWA installable (manifest valide + service worker) et consultable hors-ligne | validé | 17/07/2026 |
| C7 | `npm run build` réussit | validé | 17/07/2026 |
| C8 | TypeScript strict + lint passent sans erreur | validé | 17/07/2026 |

### Ajustements visuels issus de la recette (résolus dans l'US)

- **Cartes en verre trop opaques** → fill rendu très translucide (`0.28 → 0.10`),
  blur renforcé (`24px`), halo repensé en **liseré néon net** (le glow diffus
  coloriait l'intérieur), sheen + scanlines internes. Validé PO.
- **Badges & chips (StatChip)** → ajout d'un **halo néon fort** coloré selon le
  ton/kind. Validé PO. Tags `#` de catégorie laissés sobres (néon = signal).
- Ajustements portés dans le thème live (`src/theme/`) **et** synchronisés dans
  la référence `design-system/`.

**Verdict : recette US-001 validée (8/8 critères).**

## US-002 — Modèle de données & persistance locale (Dexie)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette
comportementale en console navigateur (repositories exposés en dev), confirmée
par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Base `netrunner-tasks` expose les tables `contracts` / `factions` / `player` (DevTools → IndexedDB) | validé | 17/07/2026 |
| C2 | Contrat créé via la couche d'accès → toujours présent après F5, champs inchangés | validé | 17/07/2026 |
| C3 | Modèle Contrat complet (id, title, factionId, difficulty, priority, dueDate, status, createdAt, completedAt) | validé | 17/07/2026 |
| C4 | Factions par défaut semées (5), aucun re-seed ni doublon après relances | validé | 17/07/2026 |
| C5 | Joueur singleton créé (`id:'me'`, xp 0 / level 1 / credits 0), lisible & modifiable | validé | 17/07/2026 |
| C6 | Couche d'accès typée (CRUD contrats/factions + get/update player) ; aucun Dexie hors de `src/db/` | validé | 17/07/2026 |
| C7 | Schéma versionné (`db.version(2)`), extensible sans perte | validé | 17/07/2026 |
| C8 | Pas de régression : `build` + `lint` OK, l'app démarre (démo fonctionnelle) | validé | 17/07/2026 |

**Verdict : recette US-002 validée (8/8 critères).**

## US-003 — Création rapide de contrat (règle des 2 s)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(interaction clavier/souris + persistance) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Barre de saisie visible et **focalisée au chargement** (saisie directe au clavier) | validé | 17/07/2026 |
| C2 | Titre + Entrée → contrat `open` créé et **persistant** (présent après F5 via `contractsRepo`/IndexedDB) | validé | 17/07/2026 |
| C3 | Après validation, champ **vidé + focus conservé** → 2ᵉ création au clavier sans souris | validé | 17/07/2026 |
| C4 | Titre vide/espaces → **flash rouge**, aucun contrat créé (compteur inchangé) | validé | 17/07/2026 |
| C5 | Création avec **valeurs par défaut** (difficulté trivial, sans faction/échéance) ; bouton « ⏎ AJOUTER » opérationnel | validé | 17/07/2026 |
| C6 | **Feedback immédiat** : compteur « CRÉÉS · SESSION » +1 (pop) + toast « CONTRAT CRÉÉ » ; état vide → buffer | validé | 17/07/2026 |
| C7 | `npm run build` réussit | validé | 17/07/2026 |
| C8 | TypeScript strict + lint passent sans erreur | validé | 17/07/2026 |

**Verdict : recette US-003 validée (8/8 critères).**

## Chantier — Internationalisation FR/EN

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(bascule FR↔EN, persistance, pluriels) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Sélecteur FR/EN visible ; le changer bascule **toute** l'UI Contrats à chaud | validé | 17/07/2026 |
| C2 | Choix de langue **persistant** après F5 | validé | 17/07/2026 |
| C3 | **Pluriels** corrects (1 CONTRAT/2 CONTRATS ↔ 1 CONTRACT/2 CONTRACTS) | validé | 17/07/2026 |
| C4 | **Aucune chaîne d'UI en dur** dans ContractsView / QuickAddContract | validé | 17/07/2026 |
| C5 | Catalogues **FR et EN complets** pour l'existant (EN in-world, pas mot-à-mot) | validé | 17/07/2026 |
| C6 | Langue initiale détectée (navigateur) sinon **repli FR** | validé | 17/07/2026 |
| C7 | `typecheck` + `lint` + `build` passent | validé | 17/07/2026 |

**Verdict : recette chantier i18n validée (7/7 critères).**

## US-004 — Liste des contrats & complétion

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
confirmée par le PO (dont pluriel des compteurs et animations).

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Liste des contrats (ouverts d'abord, récent en haut) + en-tête ACTIFS/TOTAL + barre de progression ; persistante après F5 | validé | 17/07/2026 |
| C2 | Réactivité : créer via la barre ajoute le contrat immédiatement à la liste | validé | 17/07/2026 |
| C3 | Terminer → `done` (barré + badge, descend en bas) ; ré-ouvrir → remonte ; persiste | validé | 17/07/2026 |
| C4 | Éditer le titre en place (Entrée = enregistrer, Échap = annuler) ; persiste | validé | 17/07/2026 |
| C5 | Supprimer → popup de confirmation HUD ; annuler ne fait rien, confirmer retire (liste + base) + toast | validé | 17/07/2026 |
| C6 | État vide « GRID VIDE » quand aucun contrat | validé | 17/07/2026 |
| C7 | i18n FR/EN sur tout l'écran (dont pluriel « ACTIF(S) / TERMINÉ(S) ») | validé | 17/07/2026 |
| C8 | Réordonnancement animé (Framer Motion : déplacement / ajout / suppression), respecte reduced-motion | validé | 17/07/2026 |
| C9 | `build` + `lint` + typecheck passent | validé | 17/07/2026 |

**Verdict : recette US-004 validée (9/9 critères).**

## US-008 — Difficulté & calcul de récompense (XP + crédits)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(sélecteur, octroi, persistance, anti-farm, migration, i18n) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Sélecteur de difficulté (5 niveaux) ; création sans choix → contrat `trivial` ; règle des 2 s préservée | validé | 17/07/2026 |
| C2 | Édition de la difficulté d'un contrat → nouvelle valeur persistée après F5 | validé | 17/07/2026 |
| C3 | Contrat ouvert affiche sa récompense potentielle (`+X XP · +Y ¢`) conforme au barème | validé | 17/07/2026 |
| C4 | Terminer un `medium` → `player.xp` +25 & `player.credits` +20, persistés après F5 | validé | 17/07/2026 |
| C5 | Retour de gain : compteur « GAINS · SESSION » +gain **+** toast « HACK RÉUSSI » **+** flash mint transitoire | validé | 17/07/2026 |
| C6 | Cumul : deux `easy` d'affilée → +20 XP / +20 ¢ au total | validé | 17/07/2026 |
| C7 | Anti-farm : décocher/re-terminer n'octroie plus rien (marqueur `rewardGranted`) | validé | 17/07/2026 |
| C8 | `player.level` inchangé par les gains (montée de niveau = US-009) | validé | 17/07/2026 |
| C9 | i18n FR/EN : difficultés, « GAINS · SESSION », récompenses, toast ; aucune chaîne en dur | validé | 17/07/2026 |

### Ajustement issu de la recette (résolu dans l'US)

- **Halos figés sur la ligne de contrat** : le halo d'édition (cyan) et le flash
  « hack réussi » (mint) restaient affichés indéfiniment. Cause : `motion.div`
  (Framer Motion) applique les styles de façon impérative et **ne retire pas** une
  clé `boxShadow` disparue du style inline entre deux rendus. Correctif : halo
  déplacé du style inline vers des **classes CSS** (`ctr-row--editing` /
  `ctr-row--flashing`), déclarées après `:hover` ; le liseré au survol est
  préservé au repos. Validé PO.

**Verdict : recette US-008 validée (9/9 critères).**

## US-005 — Attributs de contrat (priorité, échéance, sous-tâches)

Recette du 18/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
confirmée par le PO (édition, tri, alertes d'échéance, sous-tâches animées, i18n).

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| E1 | Ligne = **un seul bouton « modifier »** + corbeille ; le crayon ouvre la modale de détail | validé | 18/07/2026 |
| E2 | Titre éditable dans la modale (persiste F5) ; saisie vide → dernier titre non vide conservé | validé | 18/07/2026 |
| E3 | Difficulté éditable dans la modale (pastilles) → récompense potentielle mise à jour ; persiste | validé | 18/07/2026 |
| C1 | Priorité (basse/normale/haute) réglée dans la modale, persistée après F5 | validé | 18/07/2026 |
| C2 | Priorité visible sur la ligne via **barres de signal** (1/2/3, haute = cyan + glow) | validé | 18/07/2026 |
| C3 | Tri : ouverts par priorité (haute→basse) puis récence ; terminés en bas | validé | 18/07/2026 |
| C4 | Échéance définie / modifiée / effacée dans la modale ; chaque état persiste (F5) | validé | 18/07/2026 |
| C5 | Puce d'échéance : rouge « EN RETARD » (dépassée), amber « BIENTÔT » (≤ 1 j), neutre sinon | validé | 18/07/2026 |
| C6 | Sous-tâches : ajout (Entrée), coche/décoche, suppression ; persistées après F5 | validé | 18/07/2026 |
| C7 | Progression « n/m » sur la ligne (icône check-list) ; passe au mint quand tout est coché | validé | 18/07/2026 |
| C8 | Cocher une sous-tâche n'octroie aucun XP/crédit ; ne termine pas le contrat | validé | 18/07/2026 |
| C9 | Création rapide inchangée (geste de 2 s) | validé | 18/07/2026 |
| C10 | i18n FR/EN complet (priorité, échéance, détail, sous-tâches) ; aucune chaîne en dur | validé | 18/07/2026 |
| C11 | Cocher une sous-tâche la fait glisser en bas (animé Framer Motion) ; décocher la remonte | validé | 18/07/2026 |
| C12 | Non-régression US-008 : récompense à la complétion (compteur + toast + flash) + anti-farm | validé | 18/07/2026 |
| — | Migration Dexie v4 : contrats existants ouverts sans perte (`subtasks: []`) | validé | 18/07/2026 |

### Ajustements issus de la recette (résolus dans l'US)

- **Deux boutons d'édition trop lourds** → **surface d'édition unique** : un seul
  bouton « modifier » ouvre la modale qui édite tout (titre, difficulté, priorité,
  échéance, sous-tâches) ; édition inline d'US-008 supprimée. Validé PO.
- **Réordonnancement des sous-tâches cochées** (glissement en bas) ajouté, puis
  **animé** (Framer Motion, `layout` + `AnimatePresence`). Validé PO.

**Verdict : recette US-005 validée (15/15 points).**

## US-009 — Progression joueur (XP, niveau netrunner, solde crédits)

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires de la courbe
(`src/game/progression.test.ts`, **10/10**), `typecheck`, `lint`, `build` — tous
OK. **Recette visuelle navigateur (fidélité maquette 5a/5b + F5) confirmée par le
PO : 100 % conforme à l'attendu.** Colonne « Méthode » = comment le critère a été
vérifié.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Base vierge → indicateur niveau **1**, **0 %** (`0/100`), **0 ¢** | test `progressionFor(0)` + code indicateur | validé | 18/07/2026 |
| C2 | Terminer un `medium` (niv.1) → reste niv.1, **25/100** (25 %), solde **+20 ¢** | test `progressionFor(25)` + `rewardFor(medium)` + `grantReward` | validé | 18/07/2026 |
| C3 | Joueur à 75 XP + `medium` (→100) → niveau **2**, **0/200** | test `progressionFor(100)` + `levelForXp(75→100)` | validé | 18/07/2026 |
| C4 | Joueur à 250 XP (niv.2) + `legendary` (→350) → niveau **3**, **50/300** | test `progressionFor(350)` + `levelForXp(250→350)` | validé | 18/07/2026 |
| C5 | Palier franchi → retour visuel « NIVEAU X ATTEINT » ; **absent** si aucun palier | traçage + recette navigateur PO | validé | 18/07/2026 |
| C6 | Rouvrir + re-terminer un contrat déjà payé → **aucun** XP, **aucune** montée, **aucun** toast | traçage : `complete()` → `null` (rewardGranted) → `grantReward` non appelé | validé | 18/07/2026 |
| C7 | Après montée, **F5** → niveau, avancement et solde conservés | traçage `playerRepo.update` + recette navigateur PO | validé | 18/07/2026 |
| C8 | Indicateur permanent (niveau + barre + solde) visible hors modale, **maj immédiate** sans F5 | traçage abonnement store + recette navigateur PO | validé | 18/07/2026 |
| C9 | Fidélité visuelle maquette 5a (bloc biseauté cyan) & 5b (toast palier mint) | recette navigateur PO | validé | 18/07/2026 |
| C10 | Non-régression US-008 : récompense à la complétion (gains session + toast « HACK RÉUSSI » + flash) + anti-farm | traçage + recette navigateur PO | validé | 18/07/2026 |
| C11 | Périmètre : compteur « ACTIFS · TOTAL » retiré de l'en-tête (→ HUD US-010) | code en-tête | validé | 18/07/2026 |
| C12 | `typecheck` + `lint` + `build` + tests unitaires passent | exécution | validé | 18/07/2026 |

**Verdict : recette US-009 validée (12/12 critères).**

## US-010 — Tableau de bord / HUD

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires
`todayContracts` (`src/features/dashboard/todayContracts.test.ts`, **5/5** ;
total suite **15/15**), `typecheck`, `lint`, `build` OK ; **smoke test dev**
(Vite sert `/` et le lien profond `/contracts`, tous les modules se transforment
sans erreur). **Recette visuelle/interactive navigateur confirmée par le PO :
100 % conforme à l'attendu.**

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Navigation : basculer Tableau de bord ↔ Contrats ; vue active indiquée | `NavRail`/`NavLink` + recette navigateur PO | validé | 18/07/2026 |
| C2 | Au démarrage, la vue affichée est le **Tableau de bord** (`/`) | routeur (`index` → `DashboardView`) + PO | validé | 18/07/2026 |
| C3 | Barre de statut permanente (niveau + solde) sur les 2 vues, maj immédiate à la complétion | `StatusBar` + `ProgressionIndicator` + `useFeedbackStore` + PO | validé | 18/07/2026 |
| C4 | Contrats du jour : ouverts, échéance aujourd'hui/dépassée, **en retard d'abord** | test `todayContracts` (**5/5**) + PO | validé | 18/07/2026 |
| C5 | HUD vide → message dédié (« GRID CALME »), pas de liste vide | `DashboardView` + PO | validé | 18/07/2026 |
| C6 | Depuis une ligne du HUD, ouvrir le détail (`ContractDetail`) | `TodayContractRow` → `ContractDetailConnected` + PO | validé | 18/07/2026 |
| C7 | Terminer un contrat du jour depuis le HUD → récompense + progression, il quitte la liste | `useCompleteContract` + `todayContracts` + PO | validé | 18/07/2026 |
| C8 | Écran Contrats : compteur **ACTIFS · TOTAL** + barre réaffichés | `ContractsView` (en-tête) + PO | validé | 18/07/2026 |
| C9 | i18n FR/EN sur nav + HUD ; aucune chaîne en dur | clés `nav.*` / `dashboard.*` FR+EN + PO | validé | 18/07/2026 |
| C10 | Non-régression écran Contrats (création 2 s, liste, complétion, détail, toasts, palier) | refactor via hook/store partagés + PO | validé | 18/07/2026 |
| C11 | PWA : lien profond `/contracts` servi (hors-ligne) | `navigateFallback` + smoke test + PO | validé | 18/07/2026 |
| C12 | `typecheck` + `lint` + `test` (15/15) + `build` | exécution | validé | 18/07/2026 |
| — | Responsive : rail latéral (desktop) ↔ barre inférieure (mobile PWA) | media query + PO | validé | 18/07/2026 |

**Verdict : recette US-010 validée (12/12 critères + responsive).**

## US-006 — Récurrence des contrats

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires
`recurrence.ts` (`nextOccurrence` + `firstOccurrence`, **12/12** ; total suite
**27/27**), `typecheck`, `lint`, `build` OK. **Recette navigateur confirmée par
le PO : 100 %** (après boucle d'ajustements ci-dessous ; pas de maquette).

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Définir récurrence **intervalle** (N + unité), persistée F5 | `RecurrenceControl` + store/Dexie v5 + PO | validé | 18/07/2026 |
| C2 | Définir récurrence **jour fixe** (ex. dimanche), persistée F5 | `RecurrenceControl` (mode weekday) + PO | validé | 18/07/2026 |
| C3 | Retirer la récurrence (« aucune ») → one-shot ; persisté | `setRecurrence(null)` + PO | validé | 18/07/2026 |
| C4 | Puce « ⟳ … » visible sur la ligne (liste & HUD) | `RecurrenceChip` + PO | validé | 18/07/2026 |
| C5 | Compléter un récurrent → **VALIDÉ** (case cochée, « ⟳ revient le … ») + XP/crédits | `complete()` modèle validé + PO | validé | 18/07/2026 |
| C6 | Avance par intervalle (+N j / +N sem. / +N mois, clamp) | test `nextOccurrence` (**12/12**) | validé | 18/07/2026 |
| C7 | Avance par jour fixe (prochaine occurrence de ce jour) | test `nextOccurrence` + PO | validé | 18/07/2026 |
| C8 | Jamais d'échéance passée (roll-forward si en retard) | test `nextOccurrence` | validé | 18/07/2026 |
| C9 | Récompense **à chaque occurrence** (réactivation → repaie) | `load()` réactivation + `complete()` + PO | validé | 18/07/2026 |
| C10 | Anti-farm : récurrent validé **verrouillé** (case inactive + info-bulle) jusqu'à réactivation | `complete()` (done) + `toggle` garde + `Checkbox disabled/title` + PO | validé | 18/07/2026 |
| C11 | Synergie HUD : récurrent dû du jour y figure, le quitte après complétion | `todayContracts` + PO | validé | 18/07/2026 |
| C12 | Non-récurrent inchangé (une complétion, reste `done`) | branche one-shot de `complete()` + PO | validé | 18/07/2026 |
| C13 | i18n FR/EN (unités, jours, puce, info-bulle) ; aucune chaîne en dur | clés `contracts.recurrence.*` FR+EN + PO | validé | 18/07/2026 |
| — | Échéance auto-posée à la définition, recalculée au changement de récurrence | `firstOccurrence` + `setRecurrence` + PO | validé | 18/07/2026 |
| — | Réactivation « au chargement » (validé → à faire quand l'échéance est atteinte) | `load()` + PO (test échéance→aujourd'hui + F5) | validé | 18/07/2026 |
| — | Migration Dexie v5 : contrats existants ouverts (`recurrence: null`) | upgrade v5 + PO | validé | 18/07/2026 |
| C14 | `typecheck` + `lint` + `test` (27/27) + `build` | exécution | validé | 18/07/2026 |

### Évolution du modèle en cours de recette (validée PO)

- **Complétion d'un récurrent** : au lieu de « redevient *open* immédiatement »
  (impression de non-validé + case grise ambiguë), le contrat passe **VALIDÉ**
  (case cochée, « ⟳ revient le JJ.MM ») et **reste verrouillé** jusqu'à sa
  prochaine échéance, où il est **réactivé au chargement** de l'app. Meilleur
  ressenti + anti-farm plus clair.
- **Échéance auto** : poser (ou changer) une récurrence pose/recalcule la
  première échéance (`firstOccurrence`) — plus de résidu de l'ancien choix.
- **Report backlog** : échéances horodatées (heure/minute) + rappels/notifications
  PWA — hors périmètre, tracé au backlog MVP 2.

**Verdict : recette US-006 validée (13/13 critères + ajustements).**

## US-011 — Contrats permanents (habitudes) & streaks

Recette du 19/07/2026. Critères d'acceptation de `us/US-011-permanents-streaks.md`.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Rendre un contrat récurrent → puce **🔥 0** sur la ligne ; un one-shot n'affiche aucune série | `StreakChip` (gate `recurrence != null`) + PO live | validé | 19/07/2026 |
| C2 | Compléter un récurrent **à temps** → série N→**N+1**, record MAJ si dépassé | `applyCompletion(onTime)` + `complete()` + PO live | validé | 19/07/2026 |
| C3 | Rouvrir/re-compléter dans la **même période** → série **inchangée** (pas de double) | verrou « récurrent validé » (`toggle` garde + `complete()` 1×/cycle) — anti-double par construction | validé | 19/07/2026 |
| C4 | Échéance manquée sans complétion + **reload** → réactivation (US-006) **et** série **à 0** | `resetIfMissed` (**test unit.**) + câblage `load()` (récurrent `open` échu) — *dépend d'un changement de jour, non observé en live* | validé | 19/07/2026 |
| C5 | Le **record** ne diminue **jamais**, même après remise à zéro | `Math.max` dans `applyCompletion` + `resetIfMissed` préserve `bestStreak` (**tests unit.**) | validé | 19/07/2026 |
| C6 | Série & record **persistent** (Dexie) après rechargement | champs inclus dans les patchs `contractsRepo.update` (`complete`/`load`) + migration v6 ; relus au `load()` | validé | 19/07/2026 |
| C7 | Détail d'un récurrent affiche **série + record** ; un one-shot ne les affiche pas | bloc « Série / Record » (gate `recurrence != null`) dans `ContractDetail` + PO live | validé | 19/07/2026 |
| C8 | `game/streak.ts` couvert par tests (à temps/retard, record, bornes d'échéance, reset) | `streak.test.ts` (**11/11**) | validé | 19/07/2026 |
| C9 | `typecheck` + `lint` + `build` + `test` (**41/41**) | exécution | validé | 19/07/2026 |
| — | i18n FR/EN (`contracts.streak.*`), aucune chaîne en dur | clés FR+EN + `StreakChip`/détail via `t()` | validé | 19/07/2026 |
| — | Migration Dexie **v6** : contrats existants rétro-remplis `currentStreak/bestStreak = 0` | upgrade v6 (backfill) | validé | 19/07/2026 |
| — | Récompenses **inchangées** (H5) — aucune touche XP/crédits | hors périmètre `complete()` one-shot / rewards | validé | 19/07/2026 |

> **Note de méthode** : C1/C2/C7 vérifiés en live par le PO (19/07/2026). C4 et
> la préservation du record après reset (C5) **dépendent d'un changement de jour**
> et ne sont pas observés « à la volée » : ils sont couverts par les tests
> unitaires de `game/streak.ts` (`resetIfMissed`, `applyCompletion`) et la revue
> du câblage `load()`. C3 est garanti **par construction** (le récurrent validé
> est verrouillé jusqu'à réactivation, US-006).

**Verdict : recette US-011 validée (7/7 critères + vérifs annexes).**

## US-012 — Réputation par faction (paliers, gain/perte)

Recette du 19/07/2026. Critères d'acceptation de `us/US-012-reputation-factions.md`.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Compléter un contrat **rattaché à une faction** → réputation **+barème** (selon difficulté) | `useCompleteContract` + `grantReputation` + PO live | validé | 19/07/2026 |
| C2 | Compléter un contrat **sans faction** → **aucune** réputation modifiée | garde `if (!contract.factionId) return` + PO live | validé | 19/07/2026 |
| C3 | Récurrent rattaché complété à temps → **+montant à chaque occurrence** | même chemin de gain (réputation indépendante de l'anti-farm XP) + PO | validé | 19/07/2026 |
| C4 | Casser le streak d'un récurrent rattaché (période manquée + **reload**) → réputation **−malus** | pénalités agrégées dans `load()` + `applyReputationDelta` (**tests**) — *dépend d'un changement de jour, non observé en live* | validé | 19/07/2026 |
| C5 | Franchir un **seuil** → **rang** affiché change (+ toast de passage de rang) | `rankForReputation` avant/après + `triggerRankUp` + panneau ; **tests** des seuils | validé | 19/07/2026 |
| C6 | La réputation ne descend **jamais sous 0** | `applyReputationDelta = max(0, …)` (**test unit.**) | validé | 19/07/2026 |
| C7 | Réputation **et** palier **persistent** (Dexie) après reload | `factionsRepo.update` (gain + pénalités) + migration v7 ; relus au `load()` | validé | 19/07/2026 |
| C8 | Réputation + palier **visibles par faction** (panneau) | `ReputationPanel` (HudPanel) sur le tableau de bord + PO live | validé | 19/07/2026 |
| C9 | i18n **FR/EN** (`reputation.*` : rangs, libellés, toasts) ; aucune chaîne en dur | clés FR+EN + composants via `t()` | validé | 19/07/2026 |
| C10 | `game/reputation.ts` couvert (barème, seuils, progression, plancher) | `reputation.test.ts` (**10/10**) | validé | 19/07/2026 |
| C11 | `typecheck` + `lint` + `build` + `test` (**51/51**) | exécution | validé | 19/07/2026 |
| — | Séquencement `AppShell` : contrats **avant** factions (pénalités écrites avant lecture) | `loadContracts().then(loadFactions)` | validé | 19/07/2026 |
| — | Migration Dexie **v7** : factions existantes rétro-remplies `reputation = 0` | upgrade v7 (backfill) | validé | 19/07/2026 |
| — | Rétroactions maquette 8d : **toast de gain** teinté faction + **toast de passage de rang** | `ReputationGainToast` / `RankUpToast` (hébergés `AppShell`) + PO | validé | 19/07/2026 |

### Ajustement en cours de recette (validé PO)

- **Barres de progression du panneau** : passées d'une couleur pleine à un
  **dégradé de teinte** (couleur voisine → couleur de la faction, façon barre du
  design system), pour les rangs **en cours** ; l'état **LÉGENDE** reste plein +
  hachuré. Appliqué **localement** au panneau réputation (le composant partagé
  `ProgressBar` n'est **pas** modifié — hors périmètre US-012).

> **Note de méthode** : C1/C2/C3/C5/C8 vérifiés en live par le PO (19/07/2026).
> C4 (perte au streak cassé) et le franchissement effectif de seuil (C5) dépendent
> d'un changement de jour / de plusieurs complétions : couverts par les tests
> unitaires de `game/reputation.ts` (`applyReputationDelta`, `rankForReputation`)
> et la revue du câblage `load()` / `useCompleteContract`.

**Verdict : recette US-012 validée (9/9 critères + vérifs annexes).**
