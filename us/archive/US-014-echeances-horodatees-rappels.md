# US-014 — Échéances horodatées + rappels / notifications PWA

- **MVP :** 2
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-014-echeances-horodatees-rappels

## 1. Cadrage fonctionnel  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

> Décisions PO : **Périmètre B** ; crans « X min avant » = **aucun / 10 min / 1 h**
> (point de départ) ; **rappel désactivé par défaut** sur un contrat horodaté.


- **Quoi :** enrichir l'échéance d'un contrat d'une **heure optionnelle** (au-delà
  du jour actuel) et alerter le joueur à l'approche / au dépassement d'une échéance
  via des **rappels**. Aujourd'hui l'échéance est gérée **au jour** : l'heure n'a
  de valeur que si une **alerte** l'accompagne.

- **Pour qui :** le joueur qui a des tâches à heure fixe (rendez-vous, prise de
  médicament, créneau) et veut être **prévenu**, pas seulement voir une pastille
  « en retard » en ouvrant l'app.

### ⚠️ Décision de périmètre à trancher — l'ambition des « rappels »

Contrainte dure : **une app local-first, mono-utilisateur, sans serveur** ne peut
**pas** garantir une notification système **quand elle est fermée**. Les seules
voies (Web Push, Notification Triggers, Periodic Background Sync) exigent soit un
serveur push, soit des API expérimentales limitées à Chromium et peu fiables — à
l'oppose du choix produit (PWA locale hors-ligne). Trois périmètres possibles :

- **Périmètre A — Horodatage + signaux in-app seulement.** L'échéance gagne une
  heure ; la logique « en retard / bientôt » devient **à l'heure près** ; un
  **rappel visuel dans l'app** (bandeau/toast « échéances imminentes ») s'affiche à
  l'ouverture et pendant l'usage. **Aucune notification système.** 100 % fiable,
  local-first pur.
- **Périmètre B — A + notifications système *best-effort* (recommandé).** En plus
  de A : demande de **permission**, et **notification système** émise **quand l'app
  est ouverte** (au premier plan ou en arrière-plan récent) au moment où une
  échéance arrive/est dépassée, + un **rattrapage à l'ouverture** (« pendant ton
  absence, X contrats sont arrivés à échéance »). **Honnête sur la limite** : pas
  de notification si l'app n'a pas tourné depuis.
- **Périmètre C — Notifications en arrière-plan garanties (hors local-first).**
  Nécessite un **serveur push + VAPID**. Sort du cadre produit actuel → **à
  écarter** (ou à requalifier en US d'infra dédiée bien plus tard).

> **✅ PÉRIMÈTRE RETENU : B** (validé PO le 19/07/2026). Horodatage + signaux
> in-app + notifications système **best-effort** (émises quand l'app tourne +
> rattrapage à l'ouverture), honnête sur la limite. C écarté (hors local-first).

- **Hypothèses fonctionnelles à valider :**
  - **H1 — Heure optionnelle.** Une échéance peut être **au jour** (comportement
    actuel, « toute la journée ») **ou horodatée** (jour + heure). Sans heure, rien
    ne change pour les US existantes.
  - **H2 — « En retard » à l'heure près (si horodatée).** Un contrat horodaté est
    **en retard** dès que l'instant est **dépassé** (ex. 18:00 aujourd'hui → en
    retard à 18:01). Au jour (sans heure), on garde le comportement actuel (en
    retard le **lendemain**).
  - **H3 — Cohérence avec l'existant.** Le passage à l'heure s'applique **partout**
    où l'échéance compte : statut retard/bientôt (US-005), **réactivation des
    récurrents** (US-006, à l'instant plutôt qu'au jour), **perte de mise à risque**
    (US-013, à l'instant). Une habitude à heure fixe se reprogramme **en conservant
    son heure**.
  - **H4 — Rappels (périmètre B).** Le joueur peut activer les rappels (permission
    demandée **explicitement**, jamais au chargement sans action). Un rappel est
    émis **à l'échéance** ; option « **X minutes avant** » (préréglage simple, ex.
    aucun / 10 min / 1 h). Rattrapage à l'ouverture pour les échéances passées
    pendant l'absence.
  - **H5 — Réglages minimalistes.** Pas d'écran de préférences dédié au MVP : le
    choix « rappel » se fait **au niveau du contrat** (dans le détail), la
    permission est demandée à la première activation.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Dans le détail d'un contrat, **ajouter une heure** à l'échéance → l'heure est
     **persistée** (visible après F5), affichée sur la ligne et le détail (ex.
     « 18.07 · 18:42 »).
  2. **Retirer l'heure** (garder le jour) → l'échéance repasse « toute la journée » ;
     retirer l'échéance entière → aucune échéance (comme aujourd'hui).
  3. Contrat **horodaté dont l'heure est dépassée** (même jour) → affiché **en
     retard** ; un contrat **au jour** le même jour reste **du jour** (pas en
     retard). (H2)
  4. Contrat **récurrent horodaté** complété → sa prochaine occurrence **conserve
     l'heure** (ex. tous les jours à 08:00 → prochaine à 08:00). (H3)
  5. **Récurrent horodaté** dont l'instant est atteint → **réactivé** (rouvert) au
     chargement à partir de cet instant, pas seulement au changement de jour. (H3)
  6. **Mise à risque** (US-013) sur un contrat horodaté → **perdue** dès l'**instant**
     d'échéance dépassé (au chargement), cohérent avec H2. (H3)
  7. _(Périmètre B)_ Activer les rappels sur un contrat → **permission demandée** ;
     accordée → une **notification système** est émise à l'échéance **tant que l'app
     tourne** ; refusée → repli sur le **signal in-app**, sans erreur.
  8. _(Périmètre B)_ Rouvrir l'app après qu'une échéance est passée hors-ligne → un
     **rattrapage** signale les contrats arrivés à échéance pendant l'absence
     (in-app, + notification si permission accordée).
  9. _(A & B)_ Un **rappel/notification n'octroie aucune récompense** et ne modifie
     aucun contrat — c'est un **signal** seul.

> **Impact UI significatif — étape design à prévoir** : sélecteur d'**heure** dans
> le détail (à côté de la date), affichage de l'heure sur ligne/détail, réglage de
> **rappel** par contrat (+ « X min avant »), demande de **permission**, bandeau/
> toast de **rattrapage**. Je te le signalerai après validation des cadrages.

## 2. Cadrage technique  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

> Points tranchés PO : (1) **rappel autorisé aussi sur un contrat au jour**
> (déclenché à `deadlineInstant` = minuit suivant) ; (2) **tick ~30 s** ; (3)
> **`soon` = « dans l'heure »** pour un horodaté (seuil exact figé en design).

### Idée-clé — l'« instant limite » unifie tout

Aujourd'hui 5 fonctions comparent l'échéance **au jour** (`startOfDay`) :
`dueStatus` (US-005), `isOnTime`/`isMissed` (streak US-011), `isStakeLost`
(US-013), réactivation des récurrents (`load()`, US-006). On introduit **une seule**
notion pure :

```
deadlineInstant(dueDate, hasTime) =
  hasTime ? dueDate                         // horodaté : l'instant exact
          : startOfDay(dueDate) + 1 jour    // au jour : minuit suivant (fin de journée)
```

Alors **tout** se ramène à `now >= deadlineInstant` :
- **en retard / manqué / mise perdue / récurrent à réactiver** ⟺ `now >= deadlineInstant`.
- **à temps** ⟺ `now < deadlineInstant`.

Vérification : pour un contrat **au jour**, `now >= startOfDay(dueDate)+1j`
équivaut **exactement** au comportement actuel (`isMissed` = jour strictement
passé). **Aucune régression** sur l'existant ; l'horodaté ajoute juste la précision.

### Modèle de données — **Dexie v9**

Trois champs sur `Contract` (aucun index nouveau) :
- `dueHasTime: boolean` — l'échéance porte-t-elle une **heure** ? `false` = « toute
  la journée » (comportement actuel). `dueDate` reste l'epoch ms (minuit local si
  `false`, instant exact si `true`).
- `reminderLead: number | null` — **minutes avant** l'instant limite pour le rappel.
  `null` = pas de rappel (**défaut**) ; `0` = à l'échéance ; `10`, `60` = crans.
- `reminderNotifiedFor: number | null` — **instant limite déjà notifié** (dédoublonne
  le rappel au fil des ticks/rechargements). Diffère quand l'échéance change ou
  qu'un récurrent se reprogramme → le rappel peut re-sonner pour la nouvelle occurrence.

**Migration v9** : schéma v8 recopié + backfill `dueHasTime = false`,
`reminderLead = null`, `reminderNotifiedFor = null`.

### Couche pure — `game/dueTime.ts` (+ `dueTime.test.ts`, TDD)

Cœur temporel centralisé, **testé** :
- `deadlineInstant(dueDate, hasTime)` (ci-dessus).
- `isPastDeadline(dueDate, hasTime, now)` = `now >= deadlineInstant`.
- `dueState(dueDate, hasTime, now): 'overdue' | 'soon' | 'neutral'` — remplace
  `dueStatus` en tenant compte de l'heure (`soon` : horodaté = dans l'heure /
  au jour = aujourd'hui ou demain, à confirmer en design).
- `reminderTrigger(dueDate, hasTime, lead)` = `deadlineInstant − lead·60000`.

**Refactor des prédicats existants** pour déléguer à `dueTime` + accepter `hasTime` :
- `streak.ts` : `isOnTime`/`isMissed` prennent `hasTime` (mise à jour de
  `streak.test.ts`).
- `risk.ts` : `isStakeLost` prend `hasTime` (mise à jour de `risk.test.ts`).
- `dueDate.ts` : `daysUntilDue` conservé (tri/affichage), `dueStatus` délègue à
  `dueState` ; ajout d'un format `formatDueShort` avec heure (« 18.07 · 18:42 »)
  et parsing `<input type="time">`.

### Récurrence — conserver l'heure

`recurrence.ts` pose aujourd'hui les occurrences à **minuit** (`startOfDay`). Pour
un récurrent **horodaté**, `nextOccurrence`/`firstOccurrence` doivent **réappliquer
l'heure** de l'ancre (ex. tous les jours à 08:00 → prochaine à 08:00). Ajout d'un
paramètre `hasTime` (ou report de l'offset heure-minute de l'ancre après calcul du
jour).

### Service de rappels (périmètre B) — `features/reminders/`

- **Permission** : `Notification.requestPermission()`, déclenchée **à l'activation**
  d'un rappel dans le détail (jamais au chargement). Repli silencieux si refusée.
- **Ordonnanceur foreground** : hook `useReminders` monté dans `AppShell`, **tick**
  `setInterval` (~30 s) + passe unique au montage (**rattrapage**). À chaque tick,
  pour chaque contrat **ouvert** avec `reminderLead !== null` :
  `now >= reminderTrigger` **et** `reminderNotifiedFor !== deadlineInstant` →
  émettre la **notification système** (si permission) **+ signal in-app** (toast),
  puis persister `reminderNotifiedFor = deadlineInstant` (anti-répétition, survit au
  reload).
- **Rattrapage à l'ouverture** : assuré par la 1ʳᵉ passe (les rappels dus pendant
  l'absence sonnent une fois) ; agrégé en un toast « X échéances pendant ton
  absence » si plusieurs.
- **Signal in-app** indépendant de la permission (le rappel reste visible même
  notifications refusées).

### Stores

- `useContractsStore` : `setDueDate(id, dueDate, hasTime)` (signature étendue — la
  garde mise à risque US-013 demeure) ; `setReminderLead(id, lead)` (+ demande de
  permission côté UI) ; réactivation des récurrents au `load()` via
  `isPastDeadline` ; `resetIfMissed`/`isStakeLost` appelés avec `hasTime` ;
  `reminderNotifiedFor` remis à jour par le service.
- `useFeedbackStore` : réutilisé pour les toasts de rappel/rattrapage (canal
  existant, éventuel item dédié « échéance »).

### UI

- **`ContractDetail`** : sélecteur d'**heure** (`<input type="time">`) à côté de la
  date (actif si une date est posée ; l'effacer repasse « toute la journée ») ;
  contrôle **rappel** (segments Aucun / À l'échéance / 10 min / 1 h) → à
  l'activation, demande de permission ; état « notifications refusées » informatif.
- **`ContractItem`** : l'heure s'affiche dans la pastille d'échéance quand horodatée.
- **`AppShell`** : montage `useReminders` + toast de rattrapage.

### Fichiers impactés

- `src/db/types.ts` — `dueHasTime`, `reminderLead`, `reminderNotifiedFor`.
- `src/db/db.ts` — **migration v9** ; `repositories/contracts.ts` — init au `create`.
- `src/game/dueTime.ts` + `dueTime.test.ts` — **nouveaux** (cœur temporel).
- `src/game/streak.ts` + `streak.test.ts`, `src/game/risk.ts` + `risk.test.ts`,
  `src/game/recurrence.ts` — délégation + `hasTime`.
- `src/features/contracts/dueDate.ts` — `dueStatus`→`dueState`, format + parsing heure.
- `src/features/dashboard/todayContracts.ts` — s'appuie sur `isPastDeadline`.
- `src/stores/useContractsStore.ts` — `setDueDate`/`setReminderLead`/réactivation.
- `src/features/reminders/useReminders.ts` (+ helper notifications) — **nouveau**.
- `src/app/AppShell.tsx` — montage rappels + rattrapage.
- `src/features/contracts/ContractDetail.tsx`, `ContractItem.tsx`,
  `ContractDetailConnected.tsx` — heure + rappel + affichage.
- `src/i18n/locales/fr.json`, `en.json` — `contracts.due.*` / `contracts.reminder.*`.

### Points à trancher / à verrouiller

- **Granularité du tick** (~30 s) : compromis réactivité / coût. À confirmer.
- **`soon`** : seuil horodaté (« dans l'heure » ?) vs au jour (aujourd'hui/demain)
  — à figer avec la maquette.
- **Rappel sur contrat au jour** : ~~autorisé ?~~ **NON** (révision design PO) — le
  rappel **exige une heure** ; sans heure, `reminderLead` reste `null` et les
  segments sont inactifs. `reminderTrigger` = `dueDate − lead·60000` (dueDate =
  instant exact, contrat toujours horodaté quand un rappel est actif).
- **`Notification` indisponible** (navigateur/iOS hors PWA installée) : repli
  in-app only, sans erreur (dégradation propre).

## 3. Design  _(porte de validation)_ — ✅ VALIDÉ PO le 19/07/2026

> **Révision actée** : le **rappel exige une heure** (réservé aux contrats
> **horodatés**) — la maquette prime sur le point technique #1. Sans heure, les
> segments de rappel sont **inactifs** + note « un rappel horaire exige une heure ».
> Maquette `docs/maquettes/US-014/` (non versionnée). Composant `Alert` réutilisé ;
> 6 icônes à ajouter (`calendar`, `clock`, `bell`, `bell-off`, `calendar-clock`,
> `clock-alert`).


- **Écrans / composants concernés :**
  1. **`ContractDetail`** — bloc **échéance enrichi** : date + **sélecteur d'heure**
     (`<input type="time">`, actif si date posée ; effaçable → « toute la journée »)
     ; contrôle **rappel** (segments **Aucun / À l'échéance / 10 min / 1 h**) ;
     état **permission** (à demander à l'activation ; message si refusée).
  2. **`ContractItem`** (ligne) — pastille d'échéance affichant **l'heure** quand
     horodatée (ex. « 18.07 · 18:42 ») ; états **bientôt** / **en retard** à
     l'heure près.
  3. **Rattrapage** — toast/bandeau « X échéances pendant ton absence » à
     l'ouverture, + rappel unitaire (notif système + toast in-app).
- **Priorités de design :** garder le bloc échéance **lisible** malgré l'ajout
  heure + rappel (ne pas surcharger le détail) ; rendre l'état **rappel/permission**
  clair et honnête (best-effort) ; cohérence NIGHTWIRE.
- **Maquette :** _en attente — à fournir par le PO (Claude Design)._ 🔶 **STOP**

## 4. Plan d'implémentation  _(porte de validation)_

> Ordre : socle données → cœur temporel **testé (TDD)** → refactor des prédicats →
> récurrence → stores → service de rappels → UI → i18n → vérifs+recette. Le fil
> rouge : **zéro régression** sur le comportement « au jour » existant.

1. **Modèle & migration Dexie v9.** `db/types.ts` : `Contract.dueHasTime: boolean`,
   `reminderLead: number | null`, `reminderNotifiedFor: number | null`.
   `db/db.ts` : `version(9)` (backfill `false` / `null` / `null`).
   `repositories/contracts.ts` : init au `create`.

2. **Cœur temporel `game/dueTime.ts` (+ `dueTime.test.ts`, TDD — tests d'abord).**
   `deadlineInstant(dueDate, hasTime)` (horodaté → `dueDate` ; au jour →
   `startOfDay(dueDate) + 1 j`) ; `isPastDeadline(dueDate, hasTime, now)` ;
   `dueState(dueDate, hasTime, now)` (`overdue` / `soon` = dans l'heure si horodaté,
   aujourd'hui/demain si au jour / `neutral`) ; `reminderTrigger(dueDate, lead)`.
   Cas testés : **équivalence stricte au comportement au-jour actuel** (non-régression),
   bascule horodatée à la minute, seuils `soon`.

3. **Refactor des prédicats existants (déléguer à `dueTime` + `hasTime`).**
   - `game/streak.ts` : `isOnTime`/`isMissed` prennent `hasTime` → `!isPastDeadline`
     / `isPastDeadline`. MAJ `streak.test.ts`.
   - `game/risk.ts` : `isStakeLost` prend `hasTime` → `isPastDeadline`. MAJ
     `risk.test.ts`.
   - `features/contracts/dueDate.ts` : `dueStatus` délègue à `dueState` ;
     `formatDueShort` gagne l'heure (« 18.07 · 18:42 ») ; parsing `<input type="time">`
     (`toTimeInputValue`/`fromTimeInputValue`).

4. **Récurrence horodatée.** `game/recurrence.ts` : `firstOccurrence`/`nextOccurrence`
   prennent `hasTime` et **réappliquent l'heure** de l'ancre (offset h/min après
   calcul du jour). MAJ tests recurrence si présents.

5. **Stores.** `useContractsStore` :
   - `setDueDate(id, dueDate, hasTime)` (signature étendue — garde mise à risque
     US-013 conservée ; effacer l'heure → `hasTime=false`, et **coupe le rappel** :
     `reminderLead=null` puisque le rappel exige une heure).
   - `setReminderLead(id, lead)` (persiste ; UI déclenche la permission).
   - Réactivation des récurrents au `load()` via `isPastDeadline` ;
     `resetIfMissed`/`isStakeLost` appelés avec `hasTime`.

6. **Service de rappels `features/reminders/`.** Helper `notifications.ts`
   (`ensurePermission()`, `notify(title, body)`, dégradation propre si `Notification`
   absent). Hook **`useReminders`** (monté dans `AppShell`) : tick `setInterval`
   (~30 s) + passe unique au montage (**rattrapage**) ; pour chaque contrat ouvert
   **horodaté** avec `reminderLead !== null` : si `now >= reminderTrigger` **et**
   `reminderNotifiedFor !== deadlineInstant` → notif système (si permission) + toast
   in-app, puis persiste `reminderNotifiedFor = deadlineInstant`. Rattrapage agrégé
   → **bandeau `Alert`** « X échéances pendant ton absence ».

7. **UI détail — `ContractDetail`.** Sélecteur d'**heure** à côté de la date (actif
   si date posée ; effaçable → « toute la journée »). Contrôle **rappel** (segments
   **Aucun / À l'échéance / 10 min / 1 h**) **actif seulement si une heure est
   posée** (sinon inactif + note). Bloc **permission** (bouton « Activer » / état
   refusé honnête). Câblage `ContractDetailConnected` (`onSetDueDate` étendu,
   `onSetReminderLead`, état permission).

8. **UI ligne — `ContractItem`.** Pastille d'échéance affichant **l'heure** si
   horodatée, états `soon` (ambre, « dans l'heure ») / `overdue` (rouge) via
   `dueState` ; **puce rappel** (cloche violette) si `reminderLead !== null`.
   6 icônes ajoutées au registre.

9. **AppShell.** Montage `useReminders` + rendu du bandeau de rattrapage + toasts.

10. **`todayContracts.ts`** (HUD) : s'appuie sur `isPastDeadline`/`dueState` (l'heure
    affine « en retard / du jour »).

11. **i18n `contracts.due.*` / `contracts.reminder.*`** FR/EN : heure, « toute la
    journée », segments de rappel, permission (activer / refusé / best-effort),
    rattrapage, corps de notification.

12. **Vérifs & recette.** `typecheck + lint + build + tests` verts (dont
    non-régression `dueTime`), puis recette des 9 critères (skill `recette`).

> **Découpage de commits suggéré** : (1–4) socle données + cœur temporel testé +
> refactor prédicats · (5–6) stores + service de rappels · (7–11) UI + i18n ·
> (12) recette. Commit final via skill `commit`.
