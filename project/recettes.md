# Recettes — Netrunner Tasks

> Tests de recette par US. Chaque test reprend un critère d'acceptation de l'US.
> Statuts : `à faire` / `validé` / `échoué`.

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
