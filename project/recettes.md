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
