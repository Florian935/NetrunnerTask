# US-011 — Contrats permanents (habitudes) & streaks

- **MVP :** 2
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-011-permanents-streaks

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** transformer les contrats **récurrents** (US-006) en véritables
  **habitudes** en leur ajoutant une **série (streak)** : le nombre de périodes
  consécutives complétées **à temps**. La série grimpe à chaque complétion dans
  les temps, **retombe à zéro** dès qu'une période s'écoule sans complétion, et un
  **record (meilleure série)** est conservé. But : créer la tension d'assiduité
  (« ne pas casser la série ») qui donne une raison de revenir chaque jour.

- **Pour qui :** l'utilisateur unique qui veut ancrer des routines (sport,
  lecture, arrosage, sauvegardes…) et rester motivé par la continuité de sa série.

- **Périmètre / hypothèses (à valider) :**
  - **H1 — Pas de nouveau type de contrat.** La série est une **propriété des
    contrats récurrents** existants : tout contrat avec une `recurrence` devient
    une habitude suivie. Un contrat one-shot n'a pas de série. *(Alternative
    écartée : un flag « habitude » distinct de la récurrence — jugé redondant.)*
  - **H2 — Définition de la série.** `currentStreak` = nombre de complétions
    consécutives faites **avant/à l'échéance** de leur période. +1 à chaque
    complétion dans les temps ; **remise à 0** quand une échéance est dépassée
    sans complétion (détecté au chargement, en même temps que la réactivation
    US-006). `bestStreak` = plus haute valeur jamais atteinte, **ne diminue
    jamais**.
  - **H3 — Une seule incrémentation par période.** Compléter puis rouvrir/
    re-compléter dans la **même** période ne fait **pas** monter la série deux
    fois (cohérent avec l'anti-farm `rewardGranted` d'US-008).
  - **H4 — Pas de « jour de grâce ».** Une période manquée casse la série
    immédiatement (pas de tolérance). *(Une tolérance configurable pourra être
    une évolution ultérieure.)*
  - **H5 — Récompenses inchangées.** US-011 ne fait que **suivre et afficher** la
    série ; elle ne modifie ni l'XP ni les crédits. Les **conséquences** de la
    série (réputation gagnée/perdue, paliers) sont traitées en **US-012**, et un
    éventuel bonus de palier de série est **hors périmètre** ici.
  - **H6 — Affichage.** La série courante est visible sur la **ligne de contrat**
    (puce « 🔥 N », près de la puce récurrence ⟳) et la série + le record dans la
    **surface de détail**. Un contrat récurrent jamais complété affiche « 🔥 0 ».

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Rendre un contrat récurrent (US-006) → une **série « 🔥 0 »** apparaît sur sa
     ligne ; un contrat one-shot n'affiche **aucune** série.
  2. Compléter un contrat récurrent **avant son échéance** → la série passe de N à
     **N+1** ; si N+1 dépasse le record, le **record** est mis à jour.
  3. Rouvrir puis re-compléter le **même** contrat dans la **même période** → la
     série **reste inchangée** (pas de double comptage).
  4. Laisser passer l'échéance d'une période **sans compléter**, puis recharger
     l'app → le contrat **se réactive** (US-006) **et** sa série **retombe à 0**.
  5. Le **record (meilleure série)** affiché ne **diminue jamais**, même après une
     remise à zéro de la série courante.
  6. Série courante et record **persistent** (Dexie) : ils sont identiques après
     un rechargement / une réouverture de l'app.
  7. La surface de détail d'un contrat récurrent affiche **série courante** et
     **meilleure série** ; celle d'un one-shot ne les affiche pas.

- **Impact UI :** **modéré** — puce de série sur la ligne (près de ⟳) + bloc
  série/record dans la surface de détail. À confirmer si une **maquette** est
  nécessaire ou si l'on s'aligne sur l'existant (puces `RecurrenceChip` / méta).

## 2. Cadrage technique  _(porte de validation)_

- **Impacts modèle de données :**
  - Deux champs sur `Contract` : **`currentStreak: number`** (série courante) et
    **`bestStreak: number`** (record). `0` par défaut à la création.
  - **Migration Dexie v5 → v6** (`db.ts`) : schéma v5 recopié (aucun champ
    interrogé → **pas d'index nouveau**, on suit le patron v3/v4/v5) +
    rétro-remplissage `currentStreak = 0`, `bestStreak = 0` sur les contrats
    existants.

- **Logique (règle métier pure, isolée — pattern `game/recurrence.ts`) :**
  - Nouveau module **`src/game/streak.ts`** (pur, sans Dexie/React/i18n), testé
    dans `src/game/streak.test.ts` :
    - `isOnTime(dueDate, now)` : `true` si pas d'échéance **ou** jour(now) ≤
      jour(dueDate). `isMissed(dueDate, now)` : `dueDate` défini **et** jour(now)
      > jour(dueDate). (Comparaison au **jour local**, comme `recurrence.ts` ;
      on mutualise/duplique `startOfDay`.)
    - `applyCompletion({ currentStreak, bestStreak }, onTime)` : `onTime` →
      `current + 1` ; sinon (complétion **en retard**) → `current = 1`.
      `best = max(best, current)`. **Le record ne diminue jamais.**
    - `resetIfMissed({ currentStreak, bestStreak }, dueDate, now)` : ramène
      `currentStreak` à `0` si `isMissed` (record inchangé).
  - **Branchements dans `useContractsStore.ts`** :
    - `complete()` **récurrent** : calculer `onTime = isOnTime(current.dueDate,
      now)` **avant** d'avancer `dueDate`, puis inclure
      `applyCompletion(...)` dans le `patch` (à côté de `dueDate:
      nextOccurrence(...)`). L'**anti-double (H3)** est déjà garanti par le
      verrou « récurrent validé » (un cycle = une complétion).
    - `load()` : pour un récurrent **`open` dont l'échéance est dépassée**
      (`isMissed`), appliquer `resetIfMissed` (série → 0) — **en plus** de la
      réactivation existante des récurrents `done` échus. Les deux cas sont
      exclusifs (`open` vs `done`). Le record est préservé.
    - `setRecurrence(id, null)` (retrait de la récurrence) : remettre
      `currentStreak`/`bestStreak` à `0` (évite un résidu si re-récurrence).
  - **Cohérence** : une complétion en retard sans rechargement passe déjà par le
    chemin `onTime = false` → série remise à 1 ; le reset au `load()` ne sert
    qu'à l'affichage « 🔥 0 » d'un récurrent laissé non complété.

- **Fichiers impactés :**
  - `src/db/types.ts` — champs `currentStreak`, `bestStreak` sur `Contract`.
  - `src/db/db.ts` — migration **v6** + rétro-remplissage.
  - `src/db/repositories/contracts.ts` — valeurs par défaut `0`/`0` à la création.
  - `src/game/streak.ts` **(nouveau)** + `src/game/streak.test.ts` **(nouveau)**.
  - `src/stores/useContractsStore.ts` — `complete()`, `load()`, `setRecurrence()`.
  - `src/features/contracts/StreakChip.tsx` **(nouveau)** — puce « 🔥 N ».
  - `src/features/contracts/ContractItem.tsx` — insérer `StreakChip` (rangée méta,
    près de `RecurrenceChip`), affichée si `recurrence != null`.
  - `src/features/contracts/ContractDetail.tsx` — bloc « Série / Record » pour un
    contrat récurrent.
  - `src/i18n/locales/{fr,en}.json` — clés `contracts.streak.*` (série, record, aria).
  - Icône « flamme » : **icône Lucide `flame`** ajoutée au registre `Icon.tsx`
    (retenue le 19/07/2026 plutôt que l'emoji 🔥 — cohérence NIGHTWIRE, teinte
    contrôlable).

- **Hors périmètre technique** : aucun changement à la couche récompenses
  (`game/rewards.ts`, `usePlayerStore`) — cf. H5 ; réputation = US-012.

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans concernés :** ligne de contrat (puce série), surface de détail (bloc
  série/record).
- **Maquette :** **aucune** — validé PO le 19/07/2026 : on s'aligne sur l'existant
  (puces `RecurrenceChip` / rangée méta), impact visuel trop faible pour justifier
  une maquette Claude Design.

## 4. Plan d'implémentation  _(porte de validation)_

Ordre : le socle pur et testé d'abord, la persistance, puis le branchement store,
enfin l'UI — chaque étape laisse l'app compilable.

1. **Modèle & migration Dexie v6**
   - `db/types.ts` : ajouter `currentStreak: number` et `bestStreak: number` à
     `Contract`.
   - `db/db.ts` : `version(6)` (schéma v5 recopié) + `upgrade` rétro-remplissant
     `currentStreak = 0` / `bestStreak = 0`.
   - `db/repositories/contracts.ts` : initialiser `0`/`0` à la création.
   - *Vérif intermédiaire :* `typecheck` vert.

2. **Logique pure `game/streak.ts` (TDD — tests d'abord)**
   - Écrire `game/streak.test.ts` couvrant : à temps → +1 ; en retard → 1 ;
     record = max (ne baisse pas) ; `isOnTime`/`isMissed` aux bornes (échéance
     aujourd'hui = à temps, hier = manquée) ; `resetIfMissed`.
   - Implémenter `isOnTime`, `isMissed`, `applyCompletion`, `resetIfMissed`
     (comparaison au jour local ; `startOfDay` mutualisé avec `recurrence.ts`).
   - *Vérif :* `npm run test` vert sur le nouveau fichier.

3. **Branchements `stores/useContractsStore.ts`**
   - `complete()` récurrent : `onTime = isOnTime(current.dueDate, now)` **avant**
     l'avancement, puis `applyCompletion` dans le `patch` (+ état local).
   - `load()` : appliquer `resetIfMissed` aux récurrents `open` échus (à côté de
     la réactivation des `done`).
   - `setRecurrence(id, null)` : remettre série/record à `0`.

4. **Icône** — enregistrer `flame` (Lucide `Flame`) dans `components/ui/core/Icon.tsx`.

5. **i18n** — clés `contracts.streak.*` (label série, label record, aria de la
   puce) dans `i18n/locales/fr.json` **et** `en.json`.

6. **UI ligne — `features/contracts/StreakChip.tsx`**
   - Puce « `flame` N » (teinte selon intensité de la série : neutre à 0, accent
     au-delà — à préciser légèrement, sobre). Insérée dans la rangée méta de
     `ContractItem.tsx`, uniquement si `contract.recurrence != null`.

7. **UI détail — `features/contracts/ContractDetail.tsx`**
   - Bloc « Série / Record » pour un contrat récurrent (valeurs courante + record).

8. **Vérifs finales** — `typecheck` + `lint` + `build` + `test` (dont
   `streak.test.ts`) verts ; contrôle manuel des 7 critères via `npm run dev`.

9. **Recette** (skill `recette`) contre les 7 critères d'acceptation → `recettes.md`.

10. **Commit & merge** (skill `commit`) : revue, suivi, archivage de l'US, commit
    conventionnel, push, merge sur `develop`.
