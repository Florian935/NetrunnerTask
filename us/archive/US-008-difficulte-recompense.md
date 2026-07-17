# US-008 — Difficulté & calcul de récompense (XP + crédits)

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-008-difficulte-recompense

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** donner une **difficulté** à chaque contrat et faire en sorte que
  **terminer un contrat rapporte une récompense** (XP + crédits) proportionnelle
  à cette difficulté. C'est l'étape qui fait enfin « payer » la boucle
  *créer → terminer → **récompense*** : aujourd'hui, cocher un contrat ne produit
  rien. La difficulté existe déjà dans le modèle de données mais n'est ni
  choisissable ni exploitée.

- **Pour qui :** le joueur (utilisateur unique) qui veut ressentir une
  gratification à la complétion et pouvoir pondérer ses tâches (une grosse corvée
  doit rapporter plus qu'un micro-geste).

- **Périmètre / frontières :**
  - **Dans US-008 :** choix de la difficulté (création + édition), barème de
    récompense par difficulté, affichage de la récompense potentielle sur le
    contrat, **octroi** des XP et crédits au joueur à la complétion (incrément
    persisté de `player.xp` et `player.credits`), retour visuel de gain à la
    complétion.
  - **Hors US-008 (reporté) :** la **courbe de niveau** et la montée de niveau
    (dérivation `xp → level`, feedback « niveau supérieur »), ainsi que
    l'affichage permanent du solde et du niveau → **US-009** (progression joueur)
    et **US-010** (HUD). US-008 se contente d'**accumuler** l'XP et les crédits
    sur le joueur ; elle ne touche pas à `player.level`.

- **Barème proposé** _(à valider — croissant, simple, mémorisable)_ :

  | Difficulté | XP | Crédits |
  |-----------|----|---------|
  | trivial   | 5   | 5   |
  | easy      | 10  | 10  |
  | medium    | 25  | 20  |
  | hard      | 50  | 40  |
  | legendary | 100 | 80  |

  Règle : la difficulté par défaut à la création rapide reste **`trivial`** (on
  ne casse pas la règle des 2 s — le choix de difficulté est optionnel et
  n'ajoute pas d'étape obligatoire).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. À la création d'un contrat, un sélecteur de difficulté propose les 5
     niveaux (trivial → légendaire) ; sans choix explicite, le contrat est créé
     en `trivial`. → la création reste possible en un geste (règle des 2 s
     préservée).
  2. À l'édition d'un contrat existant, je peux changer sa difficulté et la
     nouvelle valeur est persistée (visible après rechargement de l'app).
  3. Chaque contrat **ouvert** affiche la récompense qu'il rapportera selon sa
     difficulté (ex. « +25 XP · +20 ¢ » pour un contrat `medium`), conforme au
     barème validé.
  4. Quand je termine un contrat `medium`, le joueur gagne exactement **+25 XP**
     et **+20 crédits** : `player.xp` et `player.credits` augmentent des montants
     du barème, et l'incrément survit à un rechargement de l'app (persistance).
  5. À la complétion, un **retour visuel** indique le gain : le compteur
     **« GAINS · SESSION »** de l'en-tête s'incrémente du montant gagné
     (ex. de « +0 XP · +0 ¢ » à « +25 XP · +20 ¢ »), **et** un toast « hack
     réussi » affiche le gain. _(Compteur = cumul de session en mémoire, remis à
     zéro au rechargement.)_
  6. Terminer plusieurs contrats **cumule** les gains (deux contrats `easy`
     d'affilée → +20 XP et +20 crédits au total).
  7. **Anti-farm — récompense une seule fois par contrat :** un contrat verse sa
     récompense à sa **première** complétion uniquement. Le rouvrir (dé-cocher)
     puis le re-terminer **n'octroie aucun gain supplémentaire** — cocher/décocher
     en boucle ne fait pas monter l'XP ni les crédits. _(Nécessite un marqueur
     « déjà récompensé » sur le contrat → à préciser au cadrage technique, impact
     modèle de données.)_
  8. `player.level` **n'est pas modifié** par US-008 (reste tel quel ; la montée
     de niveau relève d'US-009).
  9. Aucune chaîne d'UI en dur : tous les libellés ajoutés (difficultés,
     mention de récompense, retour de gain) sont dans les catalogues i18n FR/EN.

- **Impact UI :** **significatif** → sélecteur de difficulté (création +
  édition), affichage de la récompense potentielle sur la carte de contrat,
  retour visuel de gain à la complétion. **Étape design à prévoir** (maquette
  Claude Design) avant le plan d'implémentation.

## 2. Cadrage technique  _(porte de validation)_

### Impacts modèle de données (Dexie **v3**)

- **`Contract` + `rewardGranted: boolean`** (marqueur anti-farm, critère 7) :
  `true` = la récompense a déjà été versée pour ce contrat, on ne la reverse
  jamais. `false` à la création.
- **Migration Dexie v3** (`src/db/db.ts`) : nouvelle `version(3)` avec `upgrade`
  qui **rétro-remplit** `rewardGranted` sur les contrats existants :
  - contrat déjà `done` → `rewardGranted = true` (créé avant la récompense : on
    ne paie pas rétroactivement, et le re-cocher ne paiera pas non plus) ;
  - contrat `open` → `rewardGranted = false`.
  - Les index restent inchangés (`rewardGranted` n'est pas interrogé) : la
    `.stores()` de v3 recopie celle de v2, seul l'`upgrade` agit.
- **Pas de changement sur `Player`** : la table et le seed (`{id:'me', xp:0,
  level:1, credits:0}`) existent déjà. US-008 n'incrémente que `xp` et `credits`,
  **jamais `level`**.

### Barème — module de règles de jeu (pur, testable)

- **Nouveau `src/game/rewards.ts`** (nouvelle couche « règles de jeu », pure, sans
  Dexie ni i18n) : `REWARDS: Record<Difficulty, { xp: number; credits: number }>`
  (valeurs du barème validé) + `rewardFor(difficulty): { xp, credits }`.
  Consommé par l'UI (affichage) et par la complétion (octroi). _(La courbe de
  niveau d'US-009 pourra rejoindre cette couche.)_ → **petit ajout structurel à
  valider** (sinon repli : `src/features/contracts/rewards.ts`).

### État applicatif

- **Nouveau `src/stores/usePlayerStore.ts`** (Zustand, au-dessus de `playerRepo`) :
  `player` + `loaded`, `load()` (`playerRepo.get`), `grantReward({xp, credits})`
  (incrémente `xp` et `credits` via `playerRepo.update`, puis met l'état à jour ;
  **ne touche pas `level`**). Chargé au démarrage (dans `App` ou `ContractsView`,
  à côté de `ensureSeeded`/`load` des contrats).
- **`src/stores/useContractsStore.ts`** :
  - `create(title, difficulty)` — passe la difficulté à `contractsRepo.create`.
  - `complete(id)` — devient **orchestrateur d'octroi** : lit le contrat en
    mémoire ; si `!rewardGranted`, calcule `rewardFor(difficulty)`, persiste
    `{ status:'done', completedAt, rewardGranted:true }` et **retourne la
    récompense** ; sinon persiste juste `{ status:'done', completedAt }` et
    retourne `null`. La signature passe à `complete(id) => Promise<Reward | null>`.
    (Le versement au joueur reste hors du store contrats : c'est la vue qui,
    avec la valeur retournée, appelle `playerStore.grantReward` + affiche le
    gain — chaque store reste sur son entité.)
  - `reopen(id)` — remet `open`/`completedAt:null` mais **conserve
    `rewardGranted = true`** (anti-farm : re-terminer ne repaie pas).
  - `rename` → à élargir en édition d'attributs (voir UI) si on édite la
    difficulté via le store (ex. `update(id, { difficulty })`).

### Couche données

- **`src/db/repositories/contracts.ts`** : `create` initialise `rewardGranted:
  false` ; `complete()` (data pure) reste bas niveau (statut/`completedAt`) — le
  set de `rewardGranted` et le calcul se font via `update(id, …)` piloté par le
  store. Retirer le commentaire « logique US-008 ».

### UI (détail arrêté à l'étape design)

- **`QuickAddContract.tsx`** : ajouter un `Select` de difficulté (5 niveaux,
  défaut `trivial`) ; `onCreate` passe `(title, difficulty)`. La règle des 2 s
  est préservée (choix optionnel, valeur par défaut, pas d'étape bloquante).
- **`ContractItem.tsx`** : afficher la **récompense potentielle** des contrats
  ouverts (`+X XP · +Y ¢` via `rewardFor`) + la **difficulté** ; permettre de
  **changer la difficulté** (en mode édition ou via un contrôle dédié →
  maquette). La prop d'édition évolue (`onRename` → édition d'attributs, ou
  ajout d'un `onChangeDifficulty`).
- **`ContractsView.tsx`** : `handleCreate(title, difficulty)` ; au `toggle` →
  `complete` renvoie la récompense → `playerStore.grantReward` (persistance) **+
  incrément du compteur « GAINS · SESSION »** de l'en-tête **+ un toast « hack
  réussi » `+X XP · +Y ¢`** (réutilise `Toast`, ton mint/succès). Le compteur est
  un **cumul de session en mémoire** (état local `{ xp, credits }` dans la vue,
  remis à zéro au rechargement), affiché à côté de `ACTIFS · TOTAL`.
- **`ContractList.tsx`** : répercussion des signatures de props modifiées.

### i18n (FR/EN, aucune chaîne en dur — #010)

- Libellés des 5 difficultés (`trivial…legendary`).
- Libellé du sélecteur de difficulté.
- Gabarit d'affichage de récompense (`+{{xp}} XP · +{{credits}} ¢`).
- Titre/label du retour de gain à la complétion.

### Tests / vérification

- Test unitaire du barème (`rewardFor`) — table de valeurs.
- Vérification manuelle des critères d'acceptation (dont anti-farm : cocher/
  décocher en boucle → `xp`/`credits` inchangés après le 1ᵉʳ versement).

### Décisions à tracer (`docs/decisions.md`)

- Barème de récompense par difficulté (les valeurs).
- Anti-farm : récompense **une seule fois par contrat** (`rewardGranted`).
- Introduction de la couche `src/game/` (si validée).
- Frontière US-008/US-009 : US-008 accumule `xp`/`credits`, ne dérive pas
  `level`.

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans / éléments concernés :**
  1. **Création rapide** (`QuickAddContract`) — intégration d'un **sélecteur de
     difficulté** (5 niveaux) sans casser la règle des 2 s (compact, à côté du
     champ + bouton ; défaut `trivial`).
  2. **Ligne de contrat** (`ContractItem`) — afficher la **difficulté** et la
     **récompense potentielle** (`+X XP · +Y ¢`) sur les contrats ouverts ;
     prévoir le **changement de difficulté** (en mode édition ou contrôle dédié).
  3. **Retour de gain à la complétion** — feedback « hack réussi » indiquant
     `+X XP · +Y ¢` (toast dédié et/ou micro-animation sur la ligne).
- **Palette / cohérence :** design system **NIGHTWIRE V3** (tokens existants) ;
  la difficulté peut s'appuyer sur une échelle d'accent (trivial → légendaire).
- **Maquette :** fournie (Claude Design), 4 états dans
  `docs/maquettes/US-008/screenshots/`. **Non conservée au commit final** (comme
  US-003/US-004) : retirée du dépôt au moment du commit.
- **Parti pris retenu (maquette) :**
  - **Sélecteur de difficulté** = rangée de **5 pastilles biseautées** (échelle
    d'accent croissante) à droite du champ, + libellé sous le champ reflétant le
    choix et sa récompense (« TRIVIAL · +5 XP · +5 ¢ »). Défaut TRIVIAL, optionnel.
  - **Ligne ouverte** : difficulté (pastille + libellé coloré) et récompense
    potentielle affichées sur la ligne mono du code
    (`CTR · 0x8F · ●DIFFICILE +50 XP · +40 ¢`). Ligne terminée : plus de
    récompense potentielle, badge `TERMINÉ`.
  - **Retour de gain** = compteur **« GAINS · SESSION »** dans l'en-tête (centre),
    à côté de `ACTIFS · TOTAL`. S'incrémente à chaque complétion. **Cumul de
    session en mémoire** (remis à zéro au rechargement) → reste dans la frontière
    US-008 (n'affiche ni le solde total ni le niveau : US-009/US-010).
  - **Échelle d'accent difficulté (à confirmer)** : trivial → steel/neutre,
    easy → cyan, medium → violet, hard → amber, legendary → red/magenta.
  - **Libellés FR (maquette)** : TRIVIAL / (FACILE) / MOYEN / DIFFICILE /
    (LÉGENDAIRE).

## 4. Plan d'implémentation  _(porte de validation)_

Ordre : socle données/règles → stores → i18n → UI → intégration → recette.
Chaque étape est autonome et vérifiable.

1. **Modèle & migration Dexie v3**
   - `src/db/types.ts` : ajouter `rewardGranted: boolean` à `Contract`.
   - `src/db/db.ts` : `version(3).stores({…v2…}).upgrade(tx =>` rétro-remplir
     `rewardGranted = (c.status === 'done')` sur les contrats existants `)`.
   - `src/db/repositories/contracts.ts` : `create` initialise
     `rewardGranted: false` ; nettoyer le commentaire « logique US-008 » de
     `complete`.
   - *Vérif :* app se recharge sans perte ; nouveaux contrats à `false`,
     anciens `done` à `true`.

2. **Règles de jeu — barème** (`src/game/rewards.ts`, nouveau)
   - `export interface Reward { xp: number; credits: number }`
   - `REWARDS: Record<Difficulty, Reward>` = barème validé.
   - `rewardFor(difficulty): Reward`.
   - Ordre d'affichage des difficultés + **accent** par difficulté
     (`DIFFICULTY_ACCENTS`: trivial=steel, easy=cyan, medium=violet, hard=amber,
     legendary=red/magenta) pour pastilles et libellés.
   - *Vérif :* test unitaire `rewardFor` (table de valeurs).

3. **Store joueur** (`src/stores/usePlayerStore.ts`, nouveau)
   - `player`, `loaded`, `load()` (`playerRepo.get`), `grantReward(reward)`
     (incrémente `xp`/`credits` via `playerRepo.update`, maj état ; **ne touche
     pas `level`**).
   - *Vérif :* `grantReward` persiste (relecture après reload).

4. **i18n** (`src/i18n/locales/{fr,en}.json`)
   - `contracts.difficulty.{trivial,easy,medium,hard,legendary}` :
     FR = TRIVIAL / FACILE / MOYEN / DIFFICILE / LÉGENDAIRE ; EN équivalents.
   - `contracts.difficultyLabel` (label du sélecteur), `contracts.sessionGains`
     (« GAINS · SESSION »), `contracts.reward` (gabarit `+{{xp}} XP · +{{credits}} ¢`),
     `contracts.toastReward` (titre du toast « HACK RÉUSSI »).

5. **Store contrats** (`src/stores/useContractsStore.ts`)
   - `create(title, difficulty)` → passe la difficulté au repo.
   - `complete(id): Promise<Reward | null>` : lit le contrat ; si
     `!rewardGranted` → `update(id, { status:'done', completedAt, rewardGranted:true })`
     et retourne `rewardFor(difficulty)` ; sinon `complete(id)` bas niveau et
     retourne `null`.
   - `reopen(id)` : conserve `rewardGranted:true`.
   - `setDifficulty(id, difficulty)` (ou via `update`) pour l'édition.
   - *Vérif :* re-compléter un contrat rouvert renvoie `null` (anti-farm).

6. **UI — sélecteur de difficulté** (`QuickAddContract.tsx`)
   - État local `difficulty` (défaut `trivial`) ; rangée de 5 pastilles
     biseautées (accent par difficulté) + libellé « DIFFICULTÉ · +X XP · +Y ¢ »
     sous le champ. `onCreate(title, difficulty)`. Après création, garder ou
     réinitialiser la difficulté (à décider — proposé : **garder** le dernier
     choix pour enchaîner).
   - Répercuter la signature dans `ContractsView.handleCreate`.

7. **UI — ligne de contrat** (`ContractItem.tsx`, `ContractList.tsx`)
   - Contrats ouverts : afficher pastille+libellé de difficulté et récompense
     potentielle sur la ligne mono (`CTR · code · ●DIFFICILE +50 XP · +40 ¢`).
     Terminé : masquer la récompense potentielle (badge `TERMINÉ` déjà présent).
   - Édition : permettre de changer la difficulté (sélecteur compact en mode
     édition) → `setDifficulty`. Ajuster les props (`onRename` → édition
     d'attributs, ou nouvelle prop `onSetDifficulty`) et les répercuter dans
     `ContractList`.

8. **UI — en-tête + gains** (`ContractsView.tsx`)
   - Bloc **« GAINS · SESSION »** au centre de l'en-tête ; état local
     `sessionGains {xp, credits}` (mémoire).
   - `toggle` → si `complete(id)` renvoie une récompense :
     `playerStore.grantReward(reward)`, incrémenter `sessionGains`, **pousser un
     toast** « HACK RÉUSSI · +X XP · +Y ¢ » (mint).
   - Charger le store joueur au montage (`usePlayerStore.load()` dans le
     `useEffect` existant, à côté de `load()` contrats).

9. **Recette & décisions**
   - Dérouler les 9 critères (skill `recette`) → `project/recettes.md`.
   - Tracer dans `docs/decisions.md` : barème, anti-farm `rewardGranted`, couche
     `src/game/`, frontière US-008/US-009, choix compteur+toast.
   - Retirer la maquette du dépôt avant le commit final (comme US-003/US-004).
