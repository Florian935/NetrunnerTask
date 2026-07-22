# US-026 — Approfondissement prestige : seuil de renaissance incrémental + équilibrage

- **MVP :** A2 (Phase A2 — Approfondissement & rétention)
- **Priorité :** basse
- **Statut :** fait
- **Branche :** feature/US-026-prestige-incremental

## 1. Cadrage fonctionnel  _(porte de validation)_

### Quoi

Faire **monter le seuil de renaissance à chaque prestige** au lieu de le laisser
figé, et **rééquilibrer la courbe** pour que les renaissances restent des jalons
rares et significatifs sur toute la durée de vie de la partie.

**Problème résolu (limite connue, recette US-024, 21/07/2026).** Aujourd'hui le
seuil est **flat** à `1 000 000` cycles (`PRESTIGE_CONFIG.threshold`, choix
assumé pour l'embryon A5). Or le bonus permanent de production est **composé**
`×1,5` par renaissance (`1,5^count`). Conséquence : après chaque renaissance la
production redémarre plus vite, mais la cible ne bouge pas → atteindre le même
`1 000 000` devient de plus en plus trivial → **renaissances en boucle** et
bonus qui gonfle sans effort. La progression perd son sens : le prestige doit
être un **engagement à conséquence**, pas un bouton à spammer.

**Idée directrice.** Le seuil doit croître **au moins aussi vite** que la
production ne s'accélère, de sorte que le **temps** (ou l'effort) pour atteindre
la prochaine renaissance **ne diminue jamais** d'une renaissance à l'autre —
idéalement augmente doucement. C'est une US d'**équilibrage** : le *quoi* est
« le seuil monte et la courbe est saine » ; les formules exactes (facteur de
croissance du seuil, valeur de `nextMult`, éventuel plafond) sont un choix
technique tranché à l'étape 2 puis affiné en recette.

**Hors périmètre (non négociable, P-scope) :** pas de nouvelle ressource, pas de
nouveau bonus de prestige (arbre de prestige, monnaie de renaissance…), pas de
refonte de l'UI du panneau. On agit sur **la courbe** (seuil + éventuellement
`nextMult`), pas sur les mécaniques. Toute idée d'extension part au backlog.

### Pour qui

Le joueur solo du Réseau (builder mono-utilisateur, local-first) qui atteint le
end-game et enchaîne les renaissances — cible : que la 2ᵉ, 5ᵉ, 10ᵉ renaissance
gardent du poids au lieu de s'effondrer en boucle triviale.

### Hypothèses explicites (à confirmer / arbitrer à l'étape technique)

- **H1 — Seuil de base inchangé.** La 1ʳᵉ renaissance (`prestigeCount = 0`)
  reste à `1 000 000` cycles pour ne pas dévaluer l'expérience early-game déjà
  recettée.
- **H2 — Croissance géométrique du seuil.** Le seuil est
  `base × facteur^prestigeCount` (facteur > `nextMult` pour que le temps
  d'atteinte croisse). Valeur candidate à trancher en technique/recette
  (p. ex. facteur ≈ `2` à `2,5` face à `nextMult = 1,5`). Alternative possible
  (barème par paliers) évaluée à l'étape 2 si la formule géométrique dérape.
- **H3 — Bonus `nextMult` conservé** (`×1,5` composé) par défaut ; réajustable
  à l'équilibrage si la courbe l'exige, mais on ne le change pas gratuitement.
- **H4 — Compatibilité ascendante.** Les sauvegardes existantes (dont
  `prestigeCount > 0`) restent valides : au chargement, le seuil courant est
  **recalculé** depuis `prestigeCount`, aucune renaissance acquise n'est perdue,
  aucune migration destructrice.
- **H5 — Impact UI mineur.** Le panneau « Renaissance » affiche déjà
  `cycles / seuil` et le palier suivant ; seule la **valeur** du seuil change
  (plus grande après chaque renaissance). Pas de nouvel écran → **pas de
  maquette attendue** (à confirmer avec toi).

### Critères d'acceptation  _(action → résultat attendu, vérifiables)_

1. **Seuil de base préservé.** Partie neuve (`prestigeCount = 0`) → le panneau
   Renaissance affiche une progression vers `1 000 000` cycles (identique à
   aujourd'hui).
2. **Le seuil monte après une renaissance.** Renaître une fois → le seuil
   affiché pour la **prochaine** renaissance est **strictement supérieur** au
   précédent (visible dans `cycles / seuil` du panneau).
3. **Croissance monotone.** Pour tout `n`, `seuil(n+1) > seuil(n)` (fonction
   strictement croissante de `prestigeCount`) — vérifiable par test unitaire sur
   la règle pure.
4. **Anti-boucle (cœur de l'US).** Le rapport `seuil(n) / production_de_base(n)`
   (production immédiatement après la renaissance `n`, bonus `1,5^n` inclus) est
   **non décroissant** en `n` : atteindre la renaissance suivante ne devient
   jamais plus rapide qu'atteindre la précédente. Vérifiable par test unitaire
   comparant les rapports successifs.
5. **Renaissance toujours fonctionnelle.** Cycles ≥ seuil courant → le bouton
   « Renaître » apparaît ; le confirmer réinitialise l'économie (cycles,
   daemons, upgrades, data, crypto, arbre) exactement comme aujourd'hui,
   incrémente `prestigeCount`, et le **nouveau** seuil (plus haut) s'affiche.
6. **Éligibilité recalculée sur le nouveau seuil.** Juste après une renaissance,
   avec un solde de cycles inférieur au nouveau seuil → le joueur **n'est plus
   éligible** (bouton masqué, barre de progression repartie), même si l'ancien
   seuil était atteint.
7. **Bonus permanent intact.** Après renaissance, le bonus permanent affiché
   suit toujours `prestigeMultiplier(prestigeCount)` (par défaut `1,5^count`) et
   reste appliqué à la production, au rattrapage hors-ligne et au débit affiché
   (non-régression US-024).
8. **Compatibilité sauvegarde.** Une sauvegarde avec `prestigeCount > 0` chargée
   après la mise à jour → `prestigeCount` et le bonus permanent sont conservés,
   et le seuil courant affiché correspond au seuil incrémental de ce `count`
   (aucune perte, aucune renaissance « rendue » ni « volée »).
9. **Non-régression.** `npm run typecheck`, `lint`, `build` et la suite de tests
   passent au vert ; les tests existants du prestige restent valides (adaptés
   aux nouvelles valeurs si nécessaire, sans changer les invariants US-024).

## 2. Cadrage technique  _(porte de validation)_

### Principe

Le seuil cesse d'être une **constante** et devient une **fonction pure de
`prestigeCount`**. Comme `prestigeCount` est déjà persisté (Dexie v14, US-024),
le seuil courant se **dérive à chaque lecture** — **aucun nouveau champ, aucune
migration** (H4 satisfaite structurellement : les sauvegardes existantes
recalculent leur seuil au chargement, rien n'est stocké de figé).

Changement minimal, concentré dans la **couche règles pure** `game/prestige.ts` ;
la couche UI ne fait que remplacer la lecture d'une constante par un appel de
fonction. Périmètre volontairement chirurgical (US d'équilibrage).

### Fichiers impactés

- **`src/game/prestige.ts`** _(cœur)_
  - `PRESTIGE_CONFIG` : remplacer la constante `threshold` par
    `base: 1_000_000` (H1) + ajouter `growth: <facteur>` (H2, croissance
    géométrique du seuil). `nextMult: 1.5` inchangé (H3).
  - **Nouvelle fonction pure** `prestigeThreshold(count: number): number`
    = `base × growth ** count` (arrondie si utile à l'affichage). C'est la
    nouvelle source de vérité du seuil.
  - `canPrestige(core)` : comparer `core.cycles >= prestigeThreshold(core.prestigeCount)`
    au lieu de la constante.
  - `prestige()` : **inchangé** (le reset ne dépend pas du seuil ; `canPrestige`
    gère déjà la garde). Après renaissance, `prestigeCount + 1` fait mécaniquement
    monter le seuil suivant (critères 2/5/6).
- **`src/game/prestige.test.ts`**
  - Adapter les tests existants (`canPrestige`, `prestige`) qui référencent
    `PRESTIGE_CONFIG.threshold` → `prestigeThreshold(count)`.
  - **Nouveaux tests** : `prestigeThreshold(0) === base` (C1) ; monotonie stricte
    `prestigeThreshold(n+1) > prestigeThreshold(n)` (C3) ; **invariant anti-boucle**
    (C4) — `prestigeThreshold(n) / prestigeMultiplier(n)` non décroissant en `n`
    (équivaut à `growth ≥ nextMult` ; on vise `growth > nextMult` pour une
    difficulté croissante).
- **`src/features/builder/PrestigePanel.tsx`** _(3 lignes)_
  - L. 30 `eligible` , L. 33 `pct`, L. 116 affichage `… / seuil` : remplacer
    `PRESTIGE_CONFIG.threshold` par `prestigeThreshold(prestigeCount)` (le
    `prestigeCount` est déjà lu dans le composant). Import ajusté.
  - Le reste du panneau (bonus, palier suivant, confirmation) est inchangé — la
    valeur du seuil affichée montera d'elle-même après chaque renaissance (C2).

### Logique — choix de la courbe (à figer ici, affinable en recette)

- **Formule seuil** : `seuil(n) = 1_000_000 × growth ** n` (géométrique).
- **Contrainte dure (C4)** : `growth ≥ nextMult (= 1,5)`. À `growth = 1,5` le
  temps d'atteinte serait *constant* ; on veut qu'il **croisse doucement** →
  `growth > 1,5`.
- **Valeur candidate** : **`growth = 2.5`** (ratio de difficulté
  `(2,5/1,5)^n = 1,67^n` : la renaissance `n+1` demande sensiblement plus
  d'effort relatif que la `n`, sans exploser). Alternatives possibles
  discutées à la recette : `2.0` (plus doux) / `3.0` (plus punitif).
- **Pas de plafond** en v1 : `Number` encaisse `1e6 × 2,5^n` sur toute
  progression réaliste ; `formatCycles` gère déjà les grands nombres (notation
  compacte). Un plafond éventuel → backlog si besoin ressenti à la recette.
- **Bonus `nextMult`** : conservé à `1,5` (H3). On ne le touche que si la
  recette montre que la courbe combinée est malsaine — auquel cas ce sera un
  ajustement de valeur, pas un changement de structure.

### Impacts modèle de données

**Aucun.** Pas de nouveau champ `BuilderState`, **pas de migration Dexie** (on
reste sur la version courante). `prestigeCount` (déjà présent depuis v14) suffit :
le seuil est **dérivé**, jamais stocké. Compatibilité ascendante automatique
(critère 8). Aucun impact sur `builder.ts`, `unlockTree.ts`, `accelerators.ts`,
ni sur le store hors la lecture UI.

### Points de vérification (non-régression)

- Le store (`useBuilderStore`) ne lit **jamais** le seuil directement (il passe
  par `canPrestige`/`prestigePure`) → aucune modification store nécessaire.
- `prestigeMultiplier` (bonus permanent) et son application (tick, hors-ligne,
  débit affiché) **intacts** (critère 7).
- i18n : aucune clé ne code le nombre `1 000 000` en dur (affichage dynamique
  via `formatCycles`) → **pas de changement i18n**.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Étape non requise** — confirmé par le PO (H5). Impact UI limité au changement
de **valeur** d'un seuil déjà affiché par `PrestigePanel` ; aucun nouvel écran,
aucun nouveau composant. Pas de maquette.

## 4. Plan d'implémentation  _(porte de validation)_

**Décision d'équilibrage figée (PO, 22/07/2026) :** `growth = 2,5`.
Seuils : 1M → 2,5M → 6,25M → 15,6M → 39M… (affinable en recette).

1. **`game/prestige.ts` — config.** Dans `PRESTIGE_CONFIG` : remplacer
   `threshold: 1_000_000` par `base: 1_000_000` et ajouter `growth: 2.5`
   (`nextMult: 1.5` inchangé). Mettre à jour le commentaire d'en-tête / JSDoc
   pour décrire le seuil incrémental.
2. **`game/prestige.ts` — fonction pure.** Ajouter
   `export function prestigeThreshold(count: number): number` =
   `PRESTIGE_CONFIG.base * PRESTIGE_CONFIG.growth ** count`, avec JSDoc
   (croissance géométrique, source de vérité du seuil, `count = 0` → base).
3. **`game/prestige.ts` — `canPrestige`.** Comparer
   `core.cycles >= prestigeThreshold(core.prestigeCount)`. `prestige()` reste
   inchangé (garde déjà déléguée à `canPrestige`).
4. **`game/prestige.test.ts` — adapter l'existant.** Remplacer les
   `PRESTIGE_CONFIG.threshold` par `prestigeThreshold(0)` (partie neuve) et
   `prestigeThreshold(count)` là où `prestigeCount` est simulé (le test de
   reset utilise `prestigeCount: 1` → seuil `prestigeThreshold(1)`).
5. **`game/prestige.test.ts` — nouveaux tests.**
   - C1 : `prestigeThreshold(0) === 1_000_000`.
   - C3 : monotonie stricte sur `n = 0..10` (`prestigeThreshold(n+1) > prestigeThreshold(n)`).
   - Valeurs : `prestigeThreshold(1) === 2_500_000`, `prestigeThreshold(2) === 6_250_000`.
   - C4 (anti-boucle) : sur `n = 0..10`, le rapport
     `prestigeThreshold(n) / prestigeMultiplier(n)` est **strictement croissant**
     (donc non décroissant) — garantit que la difficulté relative monte.
   - C6 : `canPrestige` faux juste après une renaissance simulée quand
     `cycles < prestigeThreshold(count+1)` (ré-éligibilité sur le nouveau seuil).
6. **`features/builder/PrestigePanel.tsx`.** Importer `prestigeThreshold` ;
   calculer `const threshold = prestigeThreshold(prestigeCount)` ; remplacer les
   3 usages de `PRESTIGE_CONFIG.threshold` (L. 30 `eligible`, L. 33 `pct`,
   L. 116 affichage) par `threshold`. Retirer l'import `PRESTIGE_CONFIG` s'il
   devient inutile.
7. **Vérifications vertes** : `npm run typecheck`, `npm run lint`,
   `npm run build`, `npm test` — toute la suite au vert (critère 9).
8. **Vérification visuelle** (Playwright, avant recette PO) : ouvrir `/network`,
   contrôler l'affichage du panneau Renaissance (seuil de base 1 000 000 en
   partie neuve) ; simuler une renaissance et vérifier que le seuil affiché
   passe à 2 500 000 et que l'éligibilité repart. Corriger tout écart trouvé.
9. **Recette PO** (skill `recette`) : dérouler les 9 critères d'acceptation,
   consigner dans `project/recettes.md`, ajuster `growth`/`nextMult` si l'équilibrage
   ressenti l'exige.
10. **Commit & merge & push** (skill `commit`).
