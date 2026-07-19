# US-012 — Réputation par faction (paliers, gain/perte)

- **MVP :** 2
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-012-reputation-factions

## 1. Cadrage fonctionnel  _(porte de validation)_

> **Validé PO le 19/07/2026**, barèmes retenus tels quels (gain `1/2/4/7/12`,
> malus = gain, rangs `INCONNU/CONTACT/ASSOCIÉ/FIXER/LÉGENDE` aux seuils
> `0/25/75/200/500`). **H6 = panneau dédié + maquette** (Claude Design fournie
> par le PO à l'étape design).

- **Quoi :** donner à chaque **faction** une **réputation** qui monte quand on
  honore ses contrats et **descend quand on casse un streak** d'habitude qui lui
  est rattaché. La réputation débloque des **paliers (rangs nommés)** — un statut
  par faction. C'est la couche « conséquence » des streaks (US-011) : tenir ses
  habitudes fait grimper la réputation ; les lâcher la fait chuter.

- **Pour qui :** l'utilisateur unique, pour qui la réputation matérialise
  l'investissement dans chaque domaine de vie (faction) et récompense la
  régularité par un rang qui progresse.

- **Périmètre / hypothèses (à valider) :**
  - **H1 — Réputation = champ par faction.** `Faction.reputation` (entier,
    **plancher 0**). Le **palier/rang** en est **dérivé par seuils** (règle pure,
    comme le niveau depuis l'XP en US-009). Pas de stockage du rang (dérivé).
  - **H2 — Gain à la complétion payante.** Compléter un contrat **rattaché à une
    faction** octroie de la réputation à cette faction, **au même instant** que
    l'XP/crédits (donc une fois par one-shot ; une fois **par occurrence** d'un
    récurrent). Barème **par difficulté** — proposition : `trivial 1 · easy 2 ·
    medium 4 · hard 7 · legendary 12`. Un contrat **sans faction** → aucun gain.
  - **H3 — Perte sur streak cassé.** Quand le streak d'un **récurrent rattaché à
    une faction** retombe à 0 (période manquée, détectée au `load()` d'US-011),
    la faction **perd** de la réputation. Proposition : malus = **le gain d'un
    contrat de cette difficulté** (barème H2). Plancher 0.
  - **H4 — Paliers (rangs nommés).** Échelle croissante de rangs, **purement
    statut/identité** (aucun avantage fonctionnel — contrainte roadmap).
    Proposition d'échelle : `INCONNU (0) · CONTACT · ASSOCIÉ · FIXER · LÉGENDE`
    avec seuils croissants (à caler, ex. 0 / 25 / 75 / 200 / 500).
  - **H5 — Rétroaction.** **Gain** visible au moment de la complétion (indicateur/
    toast « +N RÉPUTATION <faction> », dans la lignée des gains de session).
    **Perte** silencieuse ou récapitulée discrètement (elle survient au
    chargement) — forme exacte à préciser au cadrage technique/design.
  - **H6 — Affichage.** **Impact UI significatif** : il faut un endroit pour voir
    la réputation + le palier **par faction**. Pistes : enrichir la
    `FactionFilterBar`, un **panneau réputation** dédié, ou une section du tableau
    de bord. À trancher (et décider si une **maquette** est nécessaire).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Compléter un contrat **rattaché à une faction** → la réputation de cette
     faction **augmente** du montant du barème (selon la difficulté).
  2. Compléter un contrat **sans faction** → **aucune** réputation ne change.
  3. Compléter un **récurrent** rattaché à une faction (à temps) → réputation
     **+montant** à **chaque occurrence** (comme un one-shot payant).
  4. Casser le streak d'un **récurrent rattaché à une faction** (période manquée
     + reload) → la réputation de cette faction **diminue** du malus prévu.
  5. Franchir un **seuil** → le **palier/rang** affiché de la faction **change**.
  6. La réputation ne descend **jamais sous 0**.
  7. Réputation **et** palier **persistent** (Dexie) : identiques après reload.
  8. La réputation et le palier sont **visibles par faction** (selon l'emplacement
     retenu en H6).
  9. i18n **FR/EN** (noms de rangs, libellés) ; **aucune** chaîne d'UI en dur.

- **Dépendances :** factions (US-007), streaks (US-011, pour la perte),
  progression/paliers (modèle analogue à US-009), flux de complétion payante
  (`useCompleteContract`).

- **Impact UI :** **significatif** (nouvel affichage réputation + rang par
  faction + rétroaction de gain) → **étape design à prévoir** (emplacement H6 ;
  maquette éventuelle à décider avec le PO).

## 2. Cadrage technique  _(porte de validation)_

- **Impacts modèle de données :**
  - Champ **`Faction.reputation: number`** (défaut `0`, plancher `0`).
  - **Migration Dexie v6 → v7** (`db.ts`) : schéma v6 recopié (réputation non
    interrogée → **pas d'index nouveau**, patron v3→v6) + rétro-remplissage
    `reputation = 0` sur les factions existantes.
  - `db/seed.ts` : ajouter `reputation: 0` aux factions semées ;
    `db/repositories/factions.ts` : défaut `0` à la création.

- **Logique pure `src/game/reputation.ts` (+ `reputation.test.ts`, TDD) :**
  - `REPUTATION_GAIN: Record<Difficulty, number>` = `{ trivial:1, easy:2,
    medium:4, hard:7, legendary:12 }` ; `reputationGain(difficulty)`.
  - `REPUTATION_RANKS` (ordonné) : `unknown 0 · contact 25 · associate 75 ·
    fixer 200 · legend 500`. `rankForReputation(rep)` → rang courant.
  - `reputationProgress(rep)` → `{ rankKey, rankIndex, current, floor, next,
    ratio }` pour la barre (façon `progressionFor` d'US-009).
  - `applyReputationDelta(rep, delta)` = `max(0, rep + delta)` (plancher 0),
    utilisé pour le **gain** (+) comme la **perte** (−).

- **Logique (branchements) :**
  - **Store factions** (`useFactionsStore`) : action `grantReputation(factionId,
    delta)` (lit → `applyReputationDelta` → `factionsRepo.update` → état).
  - **Gain** — `useCompleteContract` : capturer `factionId`+`difficulty` du
    contrat **avant** `complete()` ; si `complete()` renvoie une récompense
    (**payée**) **et** `factionId != null` → `grantReputation(factionId,
    reputationGain(difficulty))` + rétroaction « +N RÉPUTATION <faction> ».
  - **Perte** — `useContractsStore.load()` : quand `resetIfMissed` ramène un
    streak `N>0 → 0` pour un récurrent **avec** `factionId`, accumuler une
    pénalité `reputationGain(difficulty)` par faction, puis l'appliquer via
    `factionsRepo` (décrément, plancher 0). **Silencieuse** par défaut (H5).
  - **Ordonnancement** (`AppShell`) : aujourd'hui les 3 `load` partent en
    parallèle → il faut **charger les contrats avant les factions** (les
    pénalités doivent être écrites avant la lecture de la réputation), ou faire
    que `contracts.load()` déclenche un refresh des factions. À câbler au plan.

- **UI (dépend de la maquette — voir §3) :**
  - **Panneau réputation dédié** par faction : couleur/nom, **rang**, réputation,
    **barre de progression** vers le prochain seuil. Emplacement + look = maquette.
  - Rétroaction de gain (toast/indicateur) — via `useFeedbackStore`.
  - i18n `reputation.*` (noms de rangs `unknown…legend`, libellés, toast) FR/EN.

- **Fichiers impactés :**
  - `db/types.ts`, `db/db.ts` (**v7**), `db/seed.ts`, `db/repositories/factions.ts`.
  - `game/reputation.ts` **(nouveau)** + `game/reputation.test.ts` **(nouveau)**.
  - `stores/useFactionsStore.ts` (`grantReputation`), `stores/useContractsStore.ts`
    (pénalités au `load()`), `features/contracts/useCompleteContract.ts` (gain).
  - `src/app/AppShell.tsx` (séquencement contrats → factions).
  - `stores/useFeedbackStore.ts` (rétroaction de gain) — selon design.
  - `features/…/ReputationPanel.tsx` **(nouveau, selon maquette)** + intégration.
  - `i18n/locales/{fr,en}.json` (`reputation.*`).

- **Hors périmètre :** les paliers ne débloquent **rien de fonctionnel** (statut/
  identité uniquement) ; aucune interaction avec caisses/cosmétiques (US-016+).

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Maquette reçue & validée PO le 19/07/2026** — `docs/maquettes/US-012/`
  (Claude Design, non versionnée par convention). Scène 8 :
  - **8a — Panneau « RÉPUTATION DES FACTIONS »** = `HudPanel` (accent cyan), en
    **section du tableau de bord** (desktop). Une ligne par faction :
    - pastille couleur + **nom** (display, majuscules) ;
    - **insigne 5 crans** (rang atteint = `rankIndex + 1` crans remplis, teintés
      faction ; reste gris) ;
    - **rang** (mono, majuscules, teinté faction + lueur ; **INCONNU** en gris) ;
    - **barre** fine teintée faction (remplie au ratio vers le prochain seuil) +
      « **courant / seuil** » + « **→ RANG SUIVANT** » ;
    - **LÉGENDE** (rang max) : icône **couronne** + barre pleine hachurée + badge
      **RANG MAX** (au lieu du « / seuil → suivant »).
  - **8b — Échelle des rangs** (INCONNU ≥0 · CONTACT ≥25 · ASSOCIÉ ≥75 · FIXER
    ≥200 · LÉGENDE ≥500 ; mention « STATUT · SANS BONUS »).
  - **8c — Variante étroite PWA/mobile** (mêmes infos empilées, en-tête « RÉPUTATION »).
  - **8d — Rétroactions** :
    - **(A) Toast de gain** « +N RÉPUTATION <FACTION> » : biseauté, teinté de la
      couleur faction, liseré néon à gauche, affiche `avant→après`, auto-disparition
      ~2,6 s.
    - **(B) Toast de passage de rang** « NOUVEAU RANG · <FACTION> » + nom du rang :
      biseauté, icône `shield-check`, glow pulsé (respecte `prefers-reduced-motion`),
      ~4 s. Même famille que le `LevelUpToast` existant (US-009).
- **Enrichissements vs cadrage** (intégrés) : le **toast de passage de rang** (8d-B)
  et deux icônes à enregistrer — `crown` (LÉGENDE) et `shield-check` (passage de rang).

## 4. Plan d'implémentation  _(porte de validation)_

Ordre : socle pur & testé → persistance → affichage (maquette) → branchements
gain/perte & rétroactions. Chaque étape laisse l'app compilable.

1. **Modèle & migration Dexie v7** — `Faction.reputation: number` (`db/types.ts`) ;
   `version(7)` + backfill `reputation = 0` (`db/db.ts`) ; défauts `0` au `seed.ts`
   et `factionsRepo.create`.
2. **Logique pure `game/reputation.ts` (TDD — tests d'abord)** :
   - `REPUTATION_GAIN` = `{trivial:1, easy:2, medium:4, hard:7, legendary:12}` ;
     `reputationGain(difficulty)`.
   - `REPUTATION_RANKS` (ordonné) : `unknown 0 · contact 25 · associate 75 ·
     fixer 200 · legend 500`. `rankForReputation(rep)` → `{ key, index }`.
   - `reputationProgress(rep)` → `{ rankKey, rankIndex, current, floor, next,
     ratio, isMax }` (barre + libellés).
   - `applyReputationDelta(rep, delta)` = `max(0, rep + delta)` (gain **et** perte).
   - `reputation.test.ts` : bornes de seuils, plancher 0, progression, barème.
3. **Store factions** — `useFactionsStore.grantReputation(factionId, delta)`
   (`applyReputationDelta` → `factionsRepo.update` → état).
4. **Icônes** — enregistrer `crown` (`Crown`) et `shield-check` (`ShieldCheck`)
   dans `Icon.tsx`.
5. **i18n `reputation.*` FR/EN** — noms de rangs (`unknown…legend`), libellés
   (rang, échelle, « STATUT · SANS BONUS », « → suivant », « RANG MAX »), toast de
   gain (`+{{n}} RÉPUTATION {{faction}}`), toast de passage de rang
   (`NOUVEAU RANG · {{faction}}`, `{{from}} → {{to}} · {{threshold}} RÉP`).
6. **UI — panneau (maquette 8a/8b/8c)** :
   - `RankInsignia` (5 crans, `rankIndex + 1` remplis, teinte faction).
   - `ReputationPanel` = `HudPanel` cyan « RÉPUTATION DES FACTIONS » : une ligne
     par faction (pastille + nom + insigne + rang ; barre teintée + valeur/seuil +
     « → suivant »), état **LÉGENDE** (couronne + barre hachurée + badge RANG MAX),
     alimenté par `useFactionsStore` + `reputationProgress`. Variante **étroite**
     responsive (8c). *(L'« échelle des rangs » 8b : incluse en repli/légende ou
     tooltip — à garder sobre.)*
7. **Intégration tableau de bord** — insérer `ReputationPanel` dans
   `features/dashboard/DashboardView.tsx` (responsive PWA).
8. **Gain à la complétion + rétroactions (maquette 8d)** —
   `useCompleteContract` : capturer `factionId`+`difficulty` **avant** `complete()` ;
   si récompense **payée** et `factionId != null` → `grantReputation(factionId,
   reputationGain(difficulty))`, détecter le **passage de rang** (`rankForReputation`
   avant/après), puis pousser un **toast de gain** (8d-A) et, si rang franchi, un
   **toast de passage de rang** (8d-B). Extension `useFeedbackStore` (événements
   réputation) + composants `ReputationGainToast` / `RankUpToast` (miroir
   `LevelUpToast`) hébergés dans `AppShell`.
9. **Perte au streak cassé** — `useContractsStore.load()` : accumuler les
   pénalités (récurrent `open` échu **avec** faction, streak `>0 → 0`) et les
   appliquer via `factionsRepo` (plancher 0). **Silencieux** (H5).
10. **Séquencement `AppShell`** — charger **contrats avant factions** (pénalités
    écrites avant lecture de la réputation).
11. **Vérifs finales** — `typecheck` + `lint` + `build` + `test` verts ; contrôle
    manuel (gain, franchissement de seuil, plancher, panneau desktop + étroit).
12. **Recette** (skill `recette`) contre les 9 critères → `recettes.md`.
13. **Commit & merge** (skill `commit`) : revue, suivi, archivage US, commit, push,
    merge `develop`.

## 4. Plan d'implémentation  _(porte de validation)_

_À compléter après validation des cadrages._
