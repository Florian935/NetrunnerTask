# US-006 — Récurrence des contrats

- **MVP :** 1
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-006-recurrence

> **Évolution validée en recette (18/07/2026)** — le comportement de complétion a
> changé par rapport au cadrage initial : au lieu de « redevient *open*
> immédiatement », un récurrent complété passe **VALIDÉ** (case cochée,
> « ⟳ revient le JJ.MM ») et **reste verrouillé** (anti-farm) jusqu'à sa prochaine
> échéance, où il est **réactivé au chargement** de l'app. Ajouts : échéance
> **auto-posée/recalculée** à la définition/au changement de récurrence
> (`firstOccurrence`). Détail complet dans `project/recettes.md` (US-006).
> Report backlog : échéances horodatées + rappels/notifications PWA.

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** permettre qu'un contrat **se répète** selon un rythme (quotidien /
  hebdomadaire / mensuel). C'est le dernier attribut de contrat du CDC §4
  (après priorité / échéance / sous-tâches, faits en US-005). Un contrat
  récurrent est une **habitude** : le cocher le valide (récompense normale) puis
  le **reprogramme à la prochaine échéance** — il redevient « à faire ». Les
  **streaks** (compteur d'assiduité) restent **hors périmètre** (→ MVP 2).

- **Pour qui :** le joueur qui a des tâches répétitives (sport quotidien, rapport
  hebdo, loyer mensuel) et veut les saisir **une fois** puis les retrouver
  automatiquement à chaque échéance, sans les recréer.

- **Décisions de game design (validées 18/07/2026) :**
  1. **Deux modes de récurrence** (+ « aucune ») :
     - **Intervalle** `tous les N [jour | semaine | mois]`
       (`{ mode: 'interval', every: N ≥ 1, unit: 'day' | 'week' | 'month' }`) —
       « tous les 3 jours », « toutes les 2 semaines », « tous les mois ».
     - **Jour de semaine** `tous les [lundi … dimanche]`
       (`{ mode: 'weekday', weekday: 1..7 }`, ISO 1 = lundi) — cadence
       hebdomadaire calée sur ce jour ; la prochaine échéance est le prochain
       jour de semaine correspondant (cohérent avec l'ancrage Option A).
  2. **À la complétion** : le contrat **roule sur la même entrée** (pas
     d'historique des occurrences) — récompense versée, puis `status` repasse à
     `open`, `rewardGranted` remis à `false`, et l'**échéance avance** d'une
     période.
  3. **Ancrage = échéance prévue** (cadence stable, « Option A ») : prochaine
     échéance = **échéance actuelle + une période** (sinon, pas d'échéance →
     ancrage sur aujourd'hui). **Cas en retard** : si l'échéance suivante
     tomberait encore dans le passé, on avance jusqu'à la **première occurrence
     future** (jamais une échéance déjà passée).
     _Exemple : hebdo, échéance lundi, coché samedi → prochaine échéance lundi
     suivant (la cadence reste sur les lundis)._
  4. **Récompense à chaque occurrence** : oui — chaque occurrence terminée paie
     XP + crédits (l'anti-farm d'US-008 ne joue qu'**au sein** d'une occurrence).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Définir une récurrence (intervalle)** — dans la modale de détail, je
     choisis `tous les N` + unité (jour / semaine / mois) ; **persisté** après F5.
  2. **Définir une récurrence (jour fixe)** — je choisis « tous les [lundi] » ;
     **persisté** après F5.
  3. **Retirer la récurrence** — je repasse un contrat récurrent en « aucune » ;
     il redevient un contrat one-shot ; persisté.
  4. **Indicateur visible** — un contrat récurrent affiche une **puce de
     récurrence** (ex. « ⟳ TOUS LES 3 JOURS », « ⟳ TOUS LES LUNDIS ») sur sa
     ligne (liste et HUD).
  5. **Complétion → reprogrammation** — je coche un contrat **tous les 1 jour** à
     échéance aujourd'hui → récompense versée (toast + gains), puis le contrat
     **redevient `open`** avec **échéance = demain** (il n'est plus coché).
  6. **Avance par intervalle** — `tous les 2 jours` → +2 j ;
     `toutes les 1 semaine` → +7 j ; `tous les 1 mois` → +1 mois (même
     quantième), à partir de l'échéance courante (sinon d'aujourd'hui).
  7. **Avance par jour fixe** — « tous les lundi », échéance ce lundi, coché →
     prochaine échéance = **lundi suivant** ; coché en avance (samedi) → toujours
     le **lundi suivant** (cadence stable).
  8. **Jamais dans le passé** — un contrat récurrent en retard qui est complété
     est reprogrammé à la **première occurrence future** (roll-forward).
  9. **Récompense à chaque occurrence** — cocher aujourd'hui puis (échéance
     avancée) re-cocher à la prochaine occurrence **repaie** XP + crédits.
  10. **Anti-farm intra-occurrence** — au sein d'une même occurrence, décocher/
      re-cocher ne repaie pas (marqueur `rewardGranted`, US-008 inchangé).
  11. **Synergie HUD** — un contrat récurrent à échéance du jour apparaît dans
      « contrats du jour » ; après complétion il **quitte** la liste du jour
      (échéance repoussée) — US-010 inchangé.
  12. **Non-récurrent inchangé** — un contrat sans récurrence se comporte comme
      avant (une complétion, reste `done`).
  13. **i18n FR/EN** — libellés de récurrence (contrôle + puce, dont noms de
      jours) via `t()`, catalogues FR **et** EN ; aucune chaîne en dur.

- **Impact UI :** modéré — nouveau contrôle dans la modale de détail
  (aucune / intervalle N + unité / jour de semaine) + puce de récurrence sur la
  ligne (liste & HUD). **Pas de maquette** (validé PO) — composition à partir de
  briques déjà maquettées/validées (sélecteur segmenté, champ nombre, sélecteur
  de jour, style de la puce d'échéance) ; **rendu montré à la recette**.

## 2. Cadrage technique  _(porte de validation)_

- **⚠️ Point anti-farm à valider (conséquence du « redevient open » immédiat) :**
  si cocher un contrat récurrent le rouvre aussitôt avec l'échéance avancée, on
  peut le **re-cocher en boucle** le même jour → farm de récompense. Correctif
  proposé : **un contrat récurrent n'est complétable que lorsqu'il est dû**
  (`dueDate == null` ou `dueDate ≤ aujourd'hui`). Une fois reprogrammé à une date
  future, **sa case est inactive** jusqu'à cette échéance (petit repère
  « prochaine : JJ.MM »). Sur le **HUD**, seuls les contrats du jour
  apparaissent → aucun état inactif à gérer là-bas. _À confirmer._

- **Fichiers impactés :**
  - **`src/db/types.ts`** — type `Recurrence` + champ `Contract.recurrence`.
  - **`src/db/db.ts`** — **Dexie v5** (recopie du schéma v4 + rétro-remplissage
    `recurrence = null`). Pas d'index nouveau (`recurrence` non interrogé).
  - **`src/db/repositories/contracts.ts`** — `create` pose `recurrence: null` ;
    ajout de `setRecurrence(id, recurrence)`.
  - **`src/game/recurrence.ts` _(nouveau, pur, testé Vitest)_** — calcul de la
    prochaine occurrence + libellé structuré.
  - **`src/stores/useContractsStore.ts`** — `complete()` gère le roulement +
    garde « dû » ; ajout de l'action `setRecurrence`.
  - **`src/features/contracts/ContractDetail.tsx`** — contrôle de récurrence
    (aucune / intervalle N + unité / jour de semaine).
  - **`src/features/contracts/ContractDetailConnected.tsx`** — câble `setRecurrence`.
  - **`src/features/contracts/ContractItem.tsx`** + **`dashboard/TodayContractRow.tsx`**
    — puce de récurrence ; case inactive + repère « prochaine » sur la ligne
    quand récurrent non dû (liste only).
  - **`src/i18n/locales/{fr,en}.json`** — libellés récurrence (unités, jours,
    puce, « prochaine occurrence », « sans récurrence »).

- **Modèle de données :**
  ```ts
  export type Recurrence =
    | { mode: 'interval'; every: number; unit: 'day' | 'week' | 'month' }
    | { mode: 'weekday'; weekday: number } // ISO 1 = lundi … 7 = dimanche
  // Contract.recurrence: Recurrence | null   // null = one-shot (défaut)
  ```
  **Migration Dexie v5** : `recurrence = null` sur les contrats existants.

- **Couche pure `recurrence.ts` :**
  - `nextOccurrence(recurrence, anchor: number | null, now): number` — renvoie la
    **prochaine échéance strictement future** (> début de journée courante).
    Ancrage = `anchor` (échéance actuelle) sinon aujourd'hui ; avance d'une
    période ; **roll-forward** tant que le candidat ≤ aujourd'hui.
    - `interval/day` : +`every` jours ; `interval/week` : +`every`×7 jours ;
      `interval/month` : +`every` mois (même quantième, clamp fin de mois).
    - `weekday` : plus proche date de ce jour ISO **strictement après**
      aujourd'hui.
  - `recurrenceLabelParts(recurrence)` — renvoie les éléments (mode, nombre,
    unité, jour) que le composant traduit via `t()` (i18n hors couche pure).
  - Tests : chaque mode, roll-forward (retard), cadence stable (jour fixe),
    clamp mensuel.

- **Complétion (`useContractsStore.complete`) :**
  - Contrat **non récurrent** : comportement actuel inchangé.
  - Contrat **récurrent** :
    - **Garde** : si non dû (`dueDate` future) → renvoyer `null` (aucun paiement,
      aucune avance) — anti-farm.
    - Sinon : calculer la récompense (occurrence courante), puis **rouler** —
      persister `{ status:'open', completedAt:null, rewardGranted:false,
      dueDate: nextOccurrence(recurrence, dueDate, now) }` ; renvoyer la
      récompense (le hook `useCompleteContract` verse XP/crédits + toasts comme
      d'habitude).
  - `reopen` inchangé (un récurrent ne reste jamais `done`).

- **Impacts modèle de données :** ajout `Contract.recurrence` (**migration Dexie
  v5**, rétro-rempli `null`). Aucune autre table touchée. Compatible US-005/008/010
  (sous-tâches, anti-farm, HUD `todayContracts` — un récurrent dû du jour y
  apparaît, et le quitte après complétion puisque l'échéance passe au futur).

## 3. Design  _(porte de validation, si impact UI significatif)_

**Pas de maquette** (validé PO le 18/07/2026). L'UI se compose de briques déjà
maquettées/validées : contrôle de récurrence dans la modale de détail (sélecteur
segmenté façon priorité pour l'unité + champ nombre + sélecteur de jour) et puce
« ⟳ … » sur la ligne (style de la puce d'échéance). Rendu **montré à la recette** ;
ajustements le cas échéant.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Modèle + migration** — `Recurrence` + `Contract.recurrence` dans
   `db/types.ts` ; **Dexie v5** (`db.ts`, rétro-remplissage `null`) ; `create`
   pose `recurrence: null` + action repo `setRecurrence` (`repositories/contracts.ts`).
2. **Couche pure `game/recurrence.ts` (+ tests, TDD)** — `nextOccurrence`
   (intervalle jour/semaine/mois avec clamp + jour de semaine, ancrage Option A,
   roll-forward) et `recurrenceLabelParts`. Tests dérivés des critères 5-8 :
   +N jours, +N semaines, +N mois, clamp fin de mois, jour fixe (à l'heure / en
   avance), roll-forward retard.
3. **Store `useContractsStore`** — action `setRecurrence(id, recurrence)` ;
   `complete()` : garde « dû » (récurrent non dû → `null`) + roulement (récompense
   puis `open` / `rewardGranted:false` / échéance = `nextOccurrence`). État maj.
4. **i18n `fr`/`en`** — `recurrence.*` : modes, unités (jour/semaine/mois,
   pluriels), jours de la semaine, gabarits de puce (« ⟳ tous les {{n}} {{unit}} »,
   « ⟳ tous les {{day}} »), « aucune », « prochaine ».
5. **Modale de détail `ContractDetail`** — section RÉCURRENCE : sélecteur
   aucune / intervalle / jour fixe ; si intervalle → champ nombre + unité
   segmentée ; si jour fixe → sélecteur L-M-M-J-V-S-D. `onSetRecurrence` câblé
   via `ContractDetailConnected`.
6. **Puce + garde sur la ligne** — `ContractItem` : puce « ⟳ … » ; si récurrent
   **non dû** → case désactivée + repère « prochaine : JJ.MM ». `TodayContractRow` :
   puce « ⟳ … » (toujours dû sur le HUD, pas d'état inactif).
7. **Recette + vérifs** — dérouler les 13 critères (skill `recette`, rendu UI
   montré au PO), `typecheck` + `lint` + `test` + `build`.
