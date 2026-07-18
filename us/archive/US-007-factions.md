# US-007 — Factions (catégories) & filtrage

- **MVP :** 1
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-007-factions

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** exposer dans l'interface les **factions** (= catégories de vie :
  boulot, sport, perso, santé, apprentissage) qui existent déjà dans le modèle
  mais ne sont **jamais utilisées** côté UI (`Contract.factionId` reste toujours
  `null` aujourd'hui). Trois usages : **rattacher** un contrat à une faction,
  **voir** la faction d'un contrat (badge coloré), et **filtrer** la liste des
  contrats par faction. Solde au passage le report **i18n des noms de factions**
  (les 5 factions par défaut sont en dur, non traduites).

- **Pour qui :** l'utilisateur qui veut organiser ses contrats par domaine de vie
  et se concentrer sur un domaine à la fois (« montre-moi uniquement le Sport »).

- **Périmètre / frontières :**
  - **Dans US-007 :** choisir/changer/retirer la faction d'un contrat ; afficher
    un **badge de faction** (nom + couleur) sur la ligne de contrat ; **filtrer**
    la liste par faction ; **traduire** les noms des factions par défaut (FR/EN).
  - **Hors US-007 :** la **réputation par faction** (jauges, gains/pertes,
    paliers) → MVP 2 ; toute **gestion CRUD des factions par l'utilisateur**
    (créer / renommer / recolorer / supprimer ses propres factions) → **hors
    MVP 1** (voir H1) ; l'impact d'une faction sur la **récompense** (inchangée,
    fonction de la seule difficulté — US-008).

- **Décisions produit (validées PO le 18/07/2026) :**
  - **H1 — Pas d'écran de gestion des factions en MVP 1.** On s'appuie sur les
    **5 factions par défaut** semées (le CRUD existe déjà dans le repository mais
    n'est pas exposé). L'utilisateur affecte une faction existante, il n'en crée
    pas de nouvelle.
  - **H2 — Faction réglée dans la surface de détail du contrat**, comme la
    priorité et l'échéance (US-005), et **non** dans la barre de création rapide
    (règle des 2 s préservée). La faction est **optionnelle** : « aucune » est un
    état valide et par défaut.
  - **H3 — i18n des noms par défaut :** les 5 factions semées sont traitées comme
    **factions « système »** ; leur libellé affiché vient d'une **clé i18n**
    (FR/EN), le `name` stocké servant de clé de correspondance / repli. Aucun nom
    de faction en dur dans les composants.
  - **H4 — Filtrage mono-sélection :** une barre de filtres au-dessus de la liste
    propose **« Toutes »** + une entrée par faction + **« Sans faction »**
    (retenu). Un seul filtre actif à la fois ; il **restreint l'affichage** sans
    rien supprimer et n'altère pas le tri existant (US-005). Multi-sélection et
    persistance du filtre entre sessions : **hors périmètre**.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Affecter une faction :** dans la surface de détail d'un contrat, choisir
     une faction parmi la liste ; la valeur est persistée (visible après F5).
  2. **Retirer une faction :** repasser un contrat à « aucune faction » ; l'état
     est persisté (F5) et le contrat n'affiche plus de badge.
  3. **Badge sur la ligne :** un contrat rattaché à une faction affiche sur sa
     ligne un **badge** portant le **nom** de la faction et sa **couleur**
     d'accent ; un contrat sans faction n'affiche aucun badge.
  4. **Filtre — par faction :** sélectionner une faction dans la barre de filtres
     n'affiche plus que les contrats de cette faction (ouverts et terminés selon
     l'affichage courant).
  5. **Filtre — Toutes :** l'option « Toutes » (état par défaut) affiche
     l'intégralité des contrats ; revenir dessus après un filtre restaure la liste
     complète.
  6. **Filtre — Sans faction :** (si retenu en H4) l'option « Sans faction »
     n'affiche que les contrats non rattachés.
  7. **Filtre non destructif :** filtrer puis dé-filtrer ne modifie ni ne supprime
     aucun contrat ; le tri (priorité, récence — US-005) est conservé à l'intérieur
     du filtre.
  8. **i18n FR/EN :** les 5 factions par défaut s'affichent avec un libellé
     traduit selon la langue ; tous les libellés ajoutés (bouton/label de faction,
     « Toutes », « Sans faction », « Aucune ») sont dans les deux catalogues ;
     **aucune chaîne en dur**.
  9. **Création rapide inchangée :** créer un contrat au clavier reste un geste de
     2 s ; la faction se règle après création.

- **Impact UI :** **significatif** → (a) **badge de faction** sur la ligne de
  contrat — composant `FactionBadge` **à reconstruire sur NIGHTWIRE** (retiré à la
  migration DS, cf. décision #008 / backlog) ; (b) **sélecteur de faction** dans
  la surface de détail ; (c) **barre de filtres** au-dessus de la liste.
  **Étape design à prévoir** (je te la proposerai après validation du cadrage
  technique).

## 2. Cadrage technique  _(porte de validation)_

### Impacts modèle de données — **AUCUN** (Dexie **reste v5**)

Tout le socle existe déjà et est inexploité côté UI :
- `Contract.factionId: string | null` (`db/types.ts`) — **présent**.
- **Index Dexie sur `factionId`** (table `contracts`, depuis **v2**) — présent.
- `factionsRepo` (`db/repositories/factions.ts`) — **CRUD complet** (`list`, `get`,
  `create`, `update`, `remove`).
- `CreateContractInput.factionId` et `ContractFilter.factionId`
  (`db/repositories/contracts.ts`) — **présents**.
- 5 factions semées (`db/seed.ts`, `DEFAULT_FACTIONS`) avec `name` (FR) + `color`
  (token NIGHTWIRE).

→ **Pas de nouvelle version Dexie, pas de migration, pas de re-seed.** US-007
= couche UI + un petit store + i18n. C'est une US essentiellement **front**.

### Chargement des factions — nouveau store

- **`src/stores/useFactionsStore.ts`** (nouveau) : `{ factions: Faction[];
  loaded: boolean; load() }`, calqué sur `usePlayerStore` / `useContractsStore`.
  `load()` = `factionsRepo.list()`. Factions quasi-statiques (pas de CRUD
  utilisateur — H1) → chargées **une fois**.
- **`src/app/AppShell.tsx`** : ajouter `loadFactions()` au `useEffect` de montage,
  à côté de `loadContracts()` / `loadPlayer()`.

### Résolution du libellé i18n (H3) — helper pur

- **`src/features/contracts/factionLabel.ts`** (nouveau, testé) :
  - Table `DEFAULT_FACTION_KEYS: Record<string, string>` mappant le **`name`
    stocké** des factions système → une clé i18n stable :
    `Boulot→work`, `Sport→sport`, `Perso→personal`, `Santé→health`,
    `Apprentissage→learning`.
  - `factionLabel(faction, t)` : si `faction.name` ∈ table →
    `t('contracts.factions.<key>')` ; **sinon repli sur `faction.name`** (cas d'une
    faction non-système, inexistante en MVP 1 mais garantit l'absence de casse).
  - Choix assumé : le `name` FR en base est un **identifiant interne** (jamais
    affiché tel quel pour une faction système) ; zéro changement de modèle, zéro
    migration. Fragile uniquement si on renommait une faction système — hors
    périmètre (H1).

### Store des contrats — action `setFaction`

- **`src/stores/useContractsStore.ts`** : nouvelle action
  `setFaction(id, factionId: string | null)` (mutation repo + maj optimiste),
  miroir de `setPriority` / `setDueDate`.
- **`src/db/repositories/contracts.ts`** : `setFaction(id, factionId)` =
  `this.update(id, { factionId })` (par cohérence avec `setPriority`/`setDueDate`).

### UI — badge, sélecteur, filtre

1. **`FactionBadge`** (nouveau — `src/features/contracts/FactionBadge.tsx`) :
   **à reconstruire sur NIGHTWIRE** (retiré à la migration DS, #008). Petit badge
   = pastille couleur (`faction.color`) + libellé (`factionLabel`). Forme figée au
   **design**. Utilisé sur la ligne de contrat.
2. **Ligne de contrat** (`ContractItem.tsx`) : afficher `<FactionBadge>` dans la
   rangée méta (avec code/difficulté/échéance…) **quand `factionId != null`** ;
   rien sinon. Le badge lit la faction par `id` (passée en prop ou résolue depuis
   le store des factions — voir ci-dessous).
3. **Sélecteur de faction** dans la surface de détail (`ContractDetail.tsx`) :
   nouveau bloc « FACTION » — options **Aucune** + une par faction. Forme (segments
   type priorité, `Select` du DS, ou liste de puces colorées) **à figer au design**.
   Appelle `onSetFaction(contract.id, factionId | null)`.
   - `ContractDetailProps` : ajouter `factions: Faction[]` + `onSetFaction`.
   - **`ContractDetailConnected.tsx`** : lit `useFactionsStore` + `setFaction`,
     les passe à `ContractDetail`.
4. **Barre de filtres** (nouveau — `src/features/contracts/FactionFilterBar.tsx`) :
   chips **« Toutes »** (défaut) · une par faction (avec sa couleur) · **« Sans
   faction »**. Mono-sélection. Forme **à figer au design**.
   - **`ContractsView.tsx`** : état local `factionFilter: string | 'all' | 'none'`
     (défaut `'all'`, **non persisté** — H4). Le filtre s'applique **en mémoire**,
     **avant** le tri existant (`sortedContracts`) : `'all'` → tout ; `'none'` →
     `factionId == null` ; sinon `factionId === factionFilter`. Le tri (US-005) et
     le store restent inchangés (filtrage dérivé, non destructif).
   - Câble `FactionFilterBar` entre le compteur d'en-tête et la liste ; lit
     `useFactionsStore`.

### Écran HUD (US-010)

- Filtrage : **sur l'écran Contrats uniquement** (le HUD n'a pas de filtre).
- Badge de faction sur `TodayContractRow` : **optionnel, à trancher au design**
  (faible enjeu ; par défaut, on n'y touche pas pour rester dans le périmètre).

### i18n (FR/EN, aucune chaîne en dur — #010)

- `contracts.factions.{work,sport,personal,health,learning}` — libellés des
  5 factions système (FR/EN).
- `contracts.faction.label` (« Faction »), `contracts.faction.none` (« Aucune »).
- `contracts.filter.all` (« Toutes »), `contracts.filter.none` (« Sans faction »),
  éventuel `contracts.filter.label`.

### Tests (Vitest, cf. US-009)

- `factionLabel` : mappe les 5 `name` système → bonne clé ; repli sur `name` pour
  un nom inconnu.
- Filtrage : helper pur de filtrage par faction si extrait (sinon couvert en
  recette manuelle).

### Périmètre / non-régression

- Création rapide (2 s) inchangée ; faction réglée après création (H2).
- US-008 intacte (récompense = difficulté seule ; la faction n'influe pas).
- `typecheck` + `lint` + `build` verts ; tests verts.

### Décisions à tracer (`docs/decisions.md`)

- US-007 **sans migration Dexie** (socle faction déjà en place depuis v2).
- Libellés de factions système via clé i18n mappée sur le `name` stocké
  (`name` = identifiant interne, jamais affiché tel quel).
- Filtre faction mono-sélection, en mémoire, non persisté ; badge `FactionBadge`
  reconstruit sur NIGHTWIRE.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Impact UI significatif confirmé** → maquette attendue (Claude Design), design
system **NIGHTWIRE V3**, palette existante (accents `--cyan-500`, `--magenta-500`,
`--violet-500`, `--mint-500`, `--amber-500` = couleurs des 5 factions semées).

- **Éléments à maquetter :**
  1. **`FactionBadge`** (brique à reconstruire) — badge compact sur la **ligne de
     contrat** : pastille/accent couleur (`faction.color`) + libellé court.
     Affiché seulement si le contrat a une faction. Doit cohabiter avec les
     éléments méta déjà denses de la ligne (code CTR, difficulté, récompense,
     puce échéance, ⟳ récurrence, progression sous-tâches) sans surcharger.
  2. **Sélecteur de faction** dans la **modale de détail** (`HudPanel` cyan,
     à côté des blocs Priorité / Échéance / Récurrence / Sous-tâches) : options
     **Aucune** + les 5 factions (avec leur couleur). Forme à choisir (segments
     type priorité, liste de puces colorées, ou `Select`).
  3. **`FactionFilterBar`** au-dessus de la liste (écran Contrats, entre le
     compteur et la file) : chips **Toutes** (défaut) · une par faction (couleur) ·
     **Sans faction**. Mono-sélection, état actif visible.

- **Contraintes :** ne pas alourdir la ligne de contrat ni la création rapide ;
  cohérence avec les puces/segments NIGHTWIRE existants (échéance, priorité).
- **Maquette : reçue & validée** (`docs/maquettes/US-007/Contrats.dc.html`, écran
  « 7 », options 7a/7b/7c). **Partis pris retenus :**
  - **7a — `FactionBadge` (ligne) :** pastille couleur (6px, `border-radius:999px`
    + glow) + **nom court en mono MAJUSCULES** (couleur = couleur faction,
    `letter-spacing:.14em`), sur un **fond biseauté teinté** discret
    (`clip-path:var(--clip-bevel-sm)` ; fond `color-mix(in srgb, <couleur> 12%,
    var(--bg-inset))` ; bordure `color-mix(in srgb, <couleur> 45%, transparent)`).
    **Placé en tête de la rangée méta** (avant le code `CTR`) = ancrage stable.
    Sans faction → **aucun badge**. Même construction visuelle que la puce
    d'échéance (cohérence).
  - **7b — Sélecteur (modale) = puces colorées sélectionnables** (pas de segments :
    6 options passent mal). Options : **AUCUNE** + 5 factions ; chaque puce =
    pastille couleur (7px) + nom, `clip-path:var(--clip-bevel-sm)`.
    - Non sélectionnée : fond `--bg-inset`, bordure `--border`, texte `--steel-400`.
    - Faction **sélectionnée** : **remplissage plein de la couleur** + glow
      (`0 0 12px -2px <couleur>`), texte `--void-900`, pastille `--void-900`.
    - **AUCUNE sélectionnée** : remplissage `--steel-600`, bordure `--steel-400`,
      texte `--frost-100` (neutre). Bloc « FACTION » ajouté dans la modale entre
      INTITULÉ et les autres attributs.
  - **7c — `FactionFilterBar` :** chips sous le titre de l'écran, séparées de la
    liste par une bordure basse. `TOUTES` (défaut, neutre, sans pastille) · une
    par faction (pastille couleur) · `SANS FACTION` (**bordure `dashed`
    `--border-strong`** pour la distinguer). **Mono-sélection** : chip active =
    fond néon plein de sa couleur + glow + texte `--void-900` (pour « Toutes » /
    « Sans faction » actives : accent cyan neutre) ; inactives = fond `--void-700`
    + hairline. Padding chip `6px 13px`.
  - **Pistes écartées** (proposées par la maquette, hors périmètre US-007) :
    filtre multi-sélection ; couleur de faction en fond de la case à cocher.
- **Non versionnée au commit final** (comme US-003/004/005/008).

## 4. Plan d'implémentation  _(porte de validation)_

Ordre : i18n → règle pure → stores/repo → UI (badge, ligne, sélecteur, filtre) →
recette. Aucune migration Dexie (socle faction déjà en place). Chaque étape
autonome et vérifiable.

1. **i18n FR/EN** (`src/i18n/locales/{fr,en}.json`) — sous `contracts` :
   - `factions.{work,sport,personal,health,learning}` — libellés des 5 factions
     système (FR : Boulot/Sport/Perso/Santé/Apprentissage ; EN : Work/Sport/
     Personal/Health/Learning).
   - `faction.label` (« Faction »), `faction.none` (« Aucune »).
   - `filter.all` (« Toutes »), `filter.none` (« Sans faction »).
   - *Vérif :* bascule FR/EN sans chaîne en dur.

2. **Règle pure `factionLabel`** (`src/features/contracts/factionLabel.ts` + test
   Vitest)
   - `DEFAULT_FACTION_KEYS: Record<string, string>` = `{ Boulot:'work',
     Sport:'sport', Perso:'personal', Santé:'health', Apprentissage:'learning' }`.
   - `factionLabel(faction, t)` : clé connue → `t('contracts.factions.<key>')` ;
     sinon `faction.name` (repli).
   - *Test :* 5 noms système → bonne clé ; nom inconnu → repli sur `name`.

3. **Store factions** (`src/stores/useFactionsStore.ts`, nouveau) — `{ factions,
   loaded, load() }` (`factionsRepo.list()`), calqué sur `usePlayerStore`.
   - `src/app/AppShell.tsx` : `loadFactions()` dans le `useEffect` de montage.
   - *Vérif :* 5 factions en mémoire au démarrage.

4. **`setFaction`** — données + état
   - `src/db/repositories/contracts.ts` : `setFaction(id, factionId: string|null)`
     = `this.update(id, { factionId })`.
   - `src/stores/useContractsStore.ts` : action `setFaction(id, factionId)` (repo
     + maj optimiste), miroir de `setPriority`.

5. **`FactionBadge`** (`src/features/contracts/FactionBadge.tsx`, nouveau —
   reconstruit NIGHTWIRE)
   - Prop `factionId: string | null`. **Résout la faction via `useFactionsStore`** ;
     rend **`null`** si `factionId == null` ou faction introuvable.
   - Rendu = maquette 7a (pastille couleur + `factionLabel` en mono MAJUSCULES,
     fond biseauté teinté `color-mix`). Couleur = `faction.color`.

6. **Ligne de contrat** (`src/features/contracts/ContractItem.tsx`)
   - Insérer `<FactionBadge factionId={contract.factionId} />` **en tête** de la
     rangée méta (avant le `CTR · code`). Aucun autre changement.

7. **Sélecteur de faction dans la modale** (`ContractDetail.tsx` +
   `ContractDetailConnected.tsx`)
   - `ContractDetailProps` : `factions: Faction[]` + `onSetFaction(id, factionId|
     null)`. `ContractDetailConnected` lit `useFactionsStore` + l'action
     `setFaction` et les passe.
   - Bloc « FACTION » (puces : AUCUNE + 5 factions) selon maquette 7b (états
     sélectionné plein+glow / non-sélectionné / AUCUNE neutre). Placé après
     INTITULÉ.

8. **Barre de filtres** (`FactionFilterBar.tsx`, nouveau + `ContractsView.tsx`)
   - `FactionFilterBar` : lit `useFactionsStore` ; props `value: 'all'|'none'|
     string` + `onChange`. Rendu = maquette 7c (chips Toutes/factions/Sans
     faction, mono-sélection, actif = fond néon + glow).
   - `ContractsView` : état local `factionFilter` (défaut `'all'`, **non
     persisté**). Filtre **en mémoire avant** `sortedContracts` : `'all'` → tout ;
     `'none'` → `factionId == null` ; sinon `factionId === factionFilter`. Insérer
     `<FactionFilterBar>` entre l'en-tête et la liste. Tri (US-005) inchangé.

9. **Recette & décisions**
   - Dérouler les 9 critères (skill `recette`) → `project/recettes.md`.
   - `docs/decisions.md` : US-007 sans migration Dexie ; libellés factions système
     via clé i18n mappée sur `name` ; filtre mono-sélection en mémoire non
     persisté ; `FactionBadge` reconstruit NIGHTWIRE.
   - `typecheck` + `lint` + `build` + tests verts ; retrait de la maquette
     (`docs/maquettes/US-007/`) au commit final.

*Micro-choix (sinon je pars là-dessus) :* `FactionBadge` autonome (résout la
faction lui-même via le store) plutôt que recevoir l'objet `Faction` en prop —
usage `<FactionBadge factionId={…} />` réutilisable tel quel (ligne, et HUD plus
tard si besoin). Puces de la modale et chips du filtre : **deux composants
distincts** (états et contextes différents) plutôt qu'un composant partagé forcé.
