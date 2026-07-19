# US-013 — Contrats à risque (mise de crédits)

- **MVP :** 2
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-013-contrats-a-risque

## 1. Cadrage fonctionnel  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

> Décisions PO : **H4 = bonus indexé sur la difficulté** ; **H2 = mise réservée
> aux one-shot**. Autres hypothèses (H1, H3, H5, H6) validées telles quelles.


- **Quoi :** permettre de **miser des crédits** sur un contrat pour se
  responsabiliser sur une tâche qu'on repousse. Réussir le contrat **avant son
  échéance** rend la mise **majorée d'un bonus** ; laisser l'échéance passer sans
  le terminer fait **perdre la mise**. La mise s'ajoute à la récompense normale
  (XP + crédits) — elle ne la remplace pas.

- **Pour qui :** le joueur (mono-utilisateur) qui veut mettre un enjeu réel sur
  une tâche importante ou chroniquement repoussée, au-delà de la récompense
  habituelle.

- **Hypothèses fonctionnelles à valider** _(ce sont les arbitrages de gameplay ;
  dis-moi ce que tu ajustes)_ :
  - **H1 — Débit immédiat.** Poser une mise **débite tout de suite** les crédits
    du solde (l'argent est réellement « en jeu »). Réussite = on récupère la mise
    + bonus ; échec = rien ne revient. _(Alternative : ne rien débiter et ne
    régler qu'à l'issue — mais on pourrait alors miser des crédits déjà dépensés.)_
  - **H2 — Contrats éligibles.** Mise réservée aux contrats **one-shot** (non
    récurrents, non permanents) **ayant une échéance** (`dueDate`). Sans échéance,
    « perdre la mise » n'a pas de déclencheur. _(Récurrents/permanents exclus au
    MVP : le re-jeu à chaque occurrence est une autre histoire.)_
  - **H3 — Déclencheur d'échec.** L'échec = **échéance dépassée alors que le
    contrat est encore ouvert**. Il est constaté **au chargement** (`load()`),
    comme les pénalités de réputation d'US-012 — pas besoin que l'app soit ouverte
    à l'instant T.
  - **H4 — Barème du bonus (VALIDÉ : indexé sur la difficulté).** Réussite → le
    solde est crédité de **multiplicateur × la mise**, le multiplicateur croissant
    avec la difficulté (mise plus rentable sur les tâches dures, cf. CDC « tâche
    difficile »). **Barème proposé (multiplicateur total du retour)** :
    `trivial ×1,5 · easy ×2 · medium ×2,5 · hard ×3 · legendary ×4`
    (retour arrondi à l'entier ; gain net = retour − mise). _À affiner au cadrage
    technique dans un module pur `game/risk.ts`._
  - **H5 — Montant.** Mise entière, **1 ≤ mise ≤ solde disponible** au moment où
    on la pose. Pas d'autre plafond au MVP.
  - **H6 — Modifiable tant qu'ouvert.** Tant que le contrat est ouvert **et non
    expiré**, on peut **changer ou retirer** la mise (l'ancienne mise est
    re-créditée, la nouvelle débitée). Une fois gagné ou perdu, l'issue est figée.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Sur un contrat **one-shot avec échéance**, saisir une mise M valide
     (1 ≤ M ≤ solde) → **M est débité immédiatement** du solde ; le contrat
     affiche une marque « à risque » avec le montant misé (ligne + détail).
  2. Tenter de miser **plus que le solde** disponible → saisie **refusée**
     (message), **aucun débit**, aucune mise posée.
  3. Sur un contrat **sans échéance**, **récurrent** ou **permanent** → l'option
     de mise **n'est pas proposée** (ou est refusée avec explication).
  4. **Compléter** un contrat à risque **avant son échéance** → le solde est
     crédité de **(multiplicateur de difficulté) × M** (H4), **en plus** de la
     récompense normale XP/crédits ; un **toast « mise réussie »** distinct
     indique le gain de la mise ; le contrat passe en « mise remportée ».
  5. **Échéance dépassée** sur un contrat à risque encore ouvert → au **prochain
     chargement**, la mise est **définitivement perdue** (déjà débitée, aucun
     re-crédit), le contrat est marqué « mise perdue », un **retour** signale la
     perte **une seule fois** (pas à chaque chargement suivant).
  6. **Modifier** la mise d'un contrat ouvert non expiré (M → M') → l'ancienne
     mise M est **re-créditée**, M' est débité ; **retirer** la mise → M
     entièrement re-crédité et la marque « à risque » disparaît.
  7. Le **solde ne peut jamais devenir négatif** du fait d'une mise, à aucune
     étape (pose, modification, issue).
  8. La **mise et son issue** (à risque / remportée / perdue, montant) sont
     **lisibles** sur la ligne de contrat et dans le détail.

> **Impact UI significatif — étape design à prévoir** (avant implémentation) :
> champ de mise dans le formulaire de contrat, marque « à risque » + montant sur
> la ligne et le détail, toasts « mise réussie » / « mise perdue », état visuel
> « remportée » / « perdue ». Je te le signalerai formellement après validation
> des cadrages fonctionnel puis technique.

## 2. Cadrage technique  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

> Points confirmés PO : (1) **perte = aucun mouvement de crédit** (débité à la
> pose, la perte ne fait que figer + notifier) ; (2) **résolu = figé** (rouvrir un
> `won`/`lost` ne relance rien) ; (3) une mise `won`/`lost` ne se recycle jamais,
> le retour est calculé à la réussite d'après la difficulté courante.

### Modèle de données — **Dexie v8**

Deux champs ajoutés sur `Contract` (aucun index nouveau — non interrogés, comme
`recurrence`/`streak`/`reputation` avant) :

- `stake: number` — montant misé, **déjà débité** du solde. `0` = pas de mise.
- `stakeOutcome: 'none' | 'pending' | 'won' | 'lost'` — issue de la mise.
  `'none'` par défaut ; `'pending'` dès qu'une mise > 0 est posée ; `'won'`/
  `'lost'` une fois résolue (figée).

**Migration v8** : schéma v7 recopié + rétro-remplissage `stake = 0`,
`stakeOutcome = 'none'` sur les contrats existants (comme les backfills v3→v7).

> **Invariant** : `stake > 0 ⇔ stakeOutcome ≠ 'none'`. Les crédits « en jeu »
> vivent **uniquement** dans `stake` d'un contrat `pending` ; le solde joueur ne
> les contient plus (débit à la pose).

### Module pur — `src/game/risk.ts` (+ `risk.test.ts`)

Cœur de règle sans I/O, **testé** (comme `reputation.ts`/`streak.ts`) :

- `STAKE_MULTIPLIERS: Record<Difficulty, number>` = `{ trivial: 1.5, easy: 2,
  medium: 2.5, hard: 3, legendary: 4 }` (H4).
- `stakePayout(stake, difficulty): number` = `Math.round(stake × mult)` — **retour
  total** crédité à la réussite (inclut la mise déjà débitée ; gain net = retour −
  mise).
- `isStakeEligible({ recurrence, dueDate, status }): boolean` = `recurrence === null
  && dueDate !== null && status === 'open'` (H2 + H5 : one-shot à échéance, ouvert).
- `isStakeLost({ stakeOutcome, dueDate, status }, now): boolean` = `pending` +
  encore `open` + **échéance dépassée** (réutilise le helper de date d'US-006 —
  `daysUntilDue` ; le jour d'échéance reste gagnable, dépassé = perdu). Borne
  exacte **verrouillée à l'implémentation/recette**.

### Mouvements de crédits — `usePlayerStore`

`grantReward` n'ajoute que du positif → nouvelle action **`adjustCredits(delta):
Promise<void>`** : applique un delta (négatif pour un débit), **plancher 0**
(garantie CA-7), persiste (`playerRepo.update`) et met l'état à jour. Réutilisée
pour débit (pose), remboursement (modif/retrait/suppression) et gain (réussite).

### Orchestration (où vit chaque mouvement)

| Événement | Crédits | `stakeOutcome` | Où |
|-----------|---------|----------------|----|
| **Pose / modification** d'une mise | débit du delta `-(nouvelle − ancienne)` après remboursement de l'ancienne | `pending` (ou `none` si retrait) | `useContractsStore.setStake` |
| **Retrait** de la mise | remboursement `+ancienne` | `none` (stake→0) | idem |
| **Suppression** d'un contrat `pending` | remboursement `+stake` | — | `useContractsStore.remove` |
| **Réussite** (complétion avant échéance) | crédit `+stakePayout` | `pending`→`won` | `useCompleteContract` |
| **Perte** (échéance dépassée) | **aucun** (déjà débité à la pose) | `pending`→`lost` | `useContractsStore.load()` |

- **`setStake(id, amount)`** (nouvelle action store) : valide `1 ≤ amount ≤ solde
  + mise_actuelle` (CA-2), sinon rejet sans effet ; rembourse l'ancienne mise et
  débite la nouvelle via `adjustCredits` ; persiste `stake`/`stakeOutcome`. Le
  couplage inter-stores se fait par `usePlayerStore.getState()` (précédent : `load()`
  atteint déjà `factionsRepo`).
- **Réussite** dans `useCompleteContract` : après `complete()` réussi, si le
  contrat était `pending`, `adjustCredits(stakePayout(...))` + bascule `won` +
  **toast « mise réussie »** (gain net). Garde : transition `pending→won`
  **uniquement à la 1ʳᵉ complétion valide** (pas de re-paiement après réouverture ;
  une mise `won`/`lost` est figée).
- **Perte** dans `load()` : balayage des contrats `pending` expirés → bascule
  `lost` (persistée, donc **idempotente** au fil des chargements) ; les pertes du
  chargement sont **collectées** et remontées à `AppShell` (comme les pénalités de
  réputation US-012) qui déclenche un **toast « mise perdue » une seule fois**.

### UI

- **`StakeControl.tsx`** (nouveau, calqué sur `RecurrenceControl`) dans
  `ContractDetail` : visible **seulement si éligible** (`isStakeEligible`) ; sinon
  message d'indisponibilité (« nécessite une échéance / one-shot »). Saisie du
  montant (plafonnée), aperçu du **retour potentiel** (`stakePayout`), bouton
  retirer. Contrat résolu → état lecture seule `won`/`lost`.
- **`StakeChip.tsx`** (nouveau, calqué sur `StreakChip`) sur `ContractItem` :
  puce « à risque · {montant} » (icône `coins`, accent tension) ; variantes
  visuelles `won` (menthe) / `lost` (rouge muté).
- Câblage : `ContractDetailConnected` passe `onSetStake` (+ solde dispo) ;
  `ContractDetail` reçoit la prop et insère `StakeControl`.
- **i18n** `contracts.stake.*` FR/EN : `label`, `placeholder`, `potential`,
  `remove`, `atRisk`, `won`, `lost`, `toastWon`, `toastLost`, `needDue`,
  `needOneShot`, `insufficient`. Icône `coins` (déjà présente).

### Fichiers impactés

- `src/db/types.ts` — `Contract.stake`, `Contract.stakeOutcome` + type `StakeOutcome`.
- `src/db/db.ts` — **migration v8** (backfill).
- `src/db/repositories/contracts.ts` — init `stake`/`stakeOutcome` à `create`.
- `src/game/risk.ts` + `src/game/risk.test.ts` — **nouveaux** (module pur testé).
- `src/stores/usePlayerStore.ts` — `adjustCredits`.
- `src/stores/useContractsStore.ts` — `setStake`, perte au `load()`, remboursement au `remove`.
- `src/features/contracts/useCompleteContract.ts` — gain + bascule `won` + toast.
- `src/features/contracts/StakeControl.tsx`, `StakeChip.tsx` — **nouveaux**.
- `src/features/contracts/ContractDetail.tsx`, `ContractDetailConnected.tsx`, `ContractItem.tsx` — câblage/affichage.
- `src/stores/useFeedbackStore.ts` — file/déclencheur « mise perdue ».
- `src/app/AppShell.tsx` — toasts de perte (i18n) + séquencement au chargement.
- `src/i18n/locales/fr.json`, `en.json` — `contracts.stake.*`.

### Points tranchés / à verrouiller

- **Perte sans mouvement de crédit** (débit fait à la pose) → cohérent, évite un
  double compte ; le solde ne bouge qu'à la pose/modif/retrait/gain.
- **Résolu = figé** : rouvrir un contrat `won`/`lost` ne relance pas la mise.
- **Difficulté modifiable** après la pose : le retour est calculé **à la réussite**
  d'après la difficulté courante (aperçu recalculé en direct).
- Borne exacte « avant l'échéance » alignée sur `isOnTime`/`daysUntilDue` (US-006)
  → **verrouillée en recette**.

## 3. Design  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

- **Écrans / composants concernés :**
  1. **`ContractDetail`** — nouveau bloc **« Mise à risque »** (`StakeControl`,
     calqué sur `RecurrenceControl`) : état **inéligible** (message « nécessite une
     échéance, one-shot »), état **saisie** (montant plafonné + aperçu du retour
     potentiel + retirer), états **résolus** `won` / `lost` en lecture seule.
  2. **`ContractItem`** (ligne de la liste) — **puce « à risque »** (`StakeChip`,
     calqué sur `StreakChip`, icône `coins`) avec le montant ; variantes visuelles
     **gagné** (menthe) / **perdu** (rouge muté).
  3. **Toasts** — « mise réussie » (succès, gain net) et « mise perdue » (danger,
     montant). Réutilisent la mécanique de toasts existante (US-010/012).
- **Priorités de design à cadrer sur la maquette :** lisibilité de la **tension**
  (un contrat à risque doit se « sentir » dans la liste sans surcharger) ; clarté
  de l'**aperçu du retour** (mise M → retour ×mult) ; cohérence NIGHTWIRE
  (bevels, mono, accents) avec les contrôles existants du détail.
- **Maquette :** `docs/maquettes/US-013/` (`index.html` + `showcase.jsx`, Claude
  Design — non versionnée par convention). **Validée PO le 19/07/2026.**
- **Décisions design actées :**
  - **Plafond A** : le seul plafond de mise = **solde disponible** (bouton MAX =
    tout le solde ; pas de cap distinct). Conforme H5.
  - **Bouton « Miser » explicite** : la pose se fait sur **confirmation** (montant
    saisi en brouillon → bouton `Miser {M} cr` → débit). `setStake` n'est **pas**
    appelé à chaque frappe. Bouton `Retirer la mise` séparé.
  - Puce liste **série ↔ risque mutuellement exclusives** (série = récurrent,
    risque = one-shot) — jamais les deux sur une même ligne.
  - Échéance rendue **au jour** en US-013 (le compte à rebours horaire de la
    maquette relève d'US-014). Le bloc de mise est indépendant de ce point.
  - Palette : mise en jeu = **ambre**, gagné = **menthe**, perdu = **rouge muté**
    (tokens `--amber-*` / `--mint-*` / `--red-*`).

## 4. Plan d'implémentation  _(porte de validation)_

> Ordre : socle données → règle pure **testée d'abord (TDD)** → stores →
> orchestration → UI → i18n → vérifs. Une étape = un lot cohérent commitable.

1. **Modèle & migration Dexie v8.** `db/types.ts` : `type StakeOutcome =
   'none' | 'pending' | 'won' | 'lost'` + `Contract.stake: number` &
   `Contract.stakeOutcome: StakeOutcome` (commentés). `db/db.ts` : `version(8)`
   (schéma v7 recopié, backfill `stake = 0` / `stakeOutcome = 'none'`).
   `repositories/contracts.ts` : `create` initialise les deux champs.

2. **Règle pure `game/risk.ts` (+ `risk.test.ts`, TDD — tests avant code).**
   `STAKE_MULTIPLIERS = { trivial:1.5, easy:2, medium:2.5, hard:3, legendary:4 }` ;
   `stakePayout(stake, difficulty) = Math.round(stake × mult)` ;
   `isStakeEligible({ recurrence, dueDate, status })` ; `isStakeLost({ stakeOutcome,
   dueDate, status }, now)`. Cas testés : barème par difficulté, arrondi, plancher,
   éligibilité (one-shot + échéance + open), perte (pending + expiré + open), borne
   exacte du jour d'échéance (aligne sur `dueDate`/`isOnTime` d'US-006).

3. **`usePlayerStore.adjustCredits(delta)`.** Applique un delta au solde,
   **plancher 0**, persiste (`playerRepo.update`), met l'état à jour. (Réutilisé
   par pose/remboursement/gain.)

4. **`useContractsStore.setStake(id, amount)`.** Valide `1 ≤ amount ≤ solde +
   mise_actuelle` (sinon rejet sans effet) ; rembourse l'ancienne mise puis débite
   la nouvelle via `adjustCredits` ; persiste `stake` + `stakeOutcome`
   (`pending` si `amount > 0`, sinon `none`, stake→0 au retrait). Couplage
   inter-stores via `usePlayerStore.getState()`.

5. **Remboursement à la suppression.** `useContractsStore.remove` : si le contrat
   est `pending`, `adjustCredits(+stake)` avant suppression.

6. **Perte au `load()`.** Dans le balayage existant : contrat `pending` + expiré
   + `open` → bascule `stakeOutcome = 'lost'` (persistée, idempotente) ; **collecter**
   `{ contractTitle, amount }` des pertes du chargement (aucun mouvement de crédit).
   Exposer la collecte pour qu'`AppShell` la remonte (même patron que les pénalités
   de réputation US-012).

7. **Feedback « mise perdue ».** `useFeedbackStore` : file/déclencheur
   `stakeLost` (liste transitoire ou item unique) → toast **danger** une seule
   fois. Le **gain** (mise réussie) passe par un toast **succès** déclenché dans le
   hook (étape 8), pas besoin d'un canal dédié.

8. **Gain à la réussite — `useCompleteContract`.** Après un `complete()` qui paie,
   si le contrat était `pending` : `adjustCredits(stakePayout(...))`, bascule
   `stakeOutcome = 'won'`, **toast « mise réussie »** (gain net). Garde stricte :
   transition `pending → won` **uniquement** (pas de re-paiement après réouverture ;
   `won`/`lost` figé).

9. **UI — `StakeControl.tsx`** (calqué sur `RecurrenceControl`) dans
   `ContractDetail` + câblage `ContractDetailConnected` (passe le **solde dispo** et
   `onSetStake`). 4 états maquette : **inéligible** (message), **saisie** (solde/
   plafond=solde, champ + MAX, aperçu Mise→Retour→Gain net, `Miser {M} cr` /
   `Retirer`), **gagné** (menthe, lecture seule), **perdu** (rouge, lecture seule).

10. **UI — `StakeChip.tsx`** (calqué sur `StreakChip`) sur `ContractItem` : puce
    `coins` + montant, variantes en jeu (ambre) / gagné (menthe) / perdu (rouge).
    Exclusive avec `StreakChip`.

11. **AppShell.** Rendu des toasts « mise perdue » depuis la collecte du `load()`
    (i18n) + séquencement au chargement (perte résolue avant/pendant l'affichage,
    comme la réputation US-012).

12. **i18n `contracts.stake.*`** FR/EN : `label`, `placeholder`, `solde`,
    `plafond`, `max`, `potential`/`mise`/`retour`/`gainNet`, `stakeBtn`, `remove`,
    `atRisk`, `won`, `lost`, `toastWon`, `toastLost`, `needDue`, `needOneShot`,
    `insufficient`, `debitWarning`.

13. **Vérifs & recette.** `typecheck + lint + build + tests` verts, puis recette
    des 8 critères d'acceptation (skill `recette`) — dont la borne exacte du jour
    d'échéance (point verrouillé §2).

> **Découpage de commits suggéré** : (1–2) socle données + règle testée ·
> (3–8) logique stores/orchestration · (9–12) UI + i18n · (13) recette. À affiner
> au fil de l'eau ; le commit final via skill `commit`.
