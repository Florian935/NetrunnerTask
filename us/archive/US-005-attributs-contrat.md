# US-005 — Attributs de contrat (priorité, échéance, sous-tâches)

- **MVP :** 1
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-005-attributs-contrat

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** enrichir un contrat de trois attributs d'organisation — **priorité**,
  **échéance** et **sous-tâches** — pour en faire un vrai gestionnaire de tâches
  (le « module de fond » du CDC §4), **sans alourdir la création rapide** (règle
  des 2 s). Priorité et échéance existent déjà dans le modèle mais ne sont ni
  éditables ni affichées ; les **sous-tâches sont nouvelles**.

- **Pour qui :** l'utilisateur qui veut prioriser, dater et découper ses contrats
  (grosse tâche → étapes), au-delà du simple titre.

- **Périmètre / frontières :**
  - **Dans US-005 :** régler et afficher la **priorité** ; définir/afficher une
    **échéance** (avec mise en évidence « en retard » / « bientôt ») ; gérer une
    **liste de sous-tâches** (ajout, coche, suppression) avec un indicateur de
    progression.
  - **Hors US-005 :** la **récurrence** → US-006 ; toute **pénalité** liée à une
    échéance dépassée (réputation, streak) → MVP 2 ; l'impact des attributs sur
    la **récompense** (la récompense reste fonction de la **seule difficulté**,
    US-008 — priorité et sous-tâches ne rapportent pas d'XP).

- **Décisions produit (validées) :**
  - **D1 — Surface d'édition :** les attributs se règlent dans une **surface
    d'édition/détail du contrat** (panneau ou modale — forme figée au design),
    pas dans la barre de création rapide qui reste à 2 s. → impact UI
    significatif, **étape design**.
  - **D2 — Priorité :** purement **organisationnelle** (indépendante de la
    difficulté, cf. modèle). Affichée par un indicateur sur la ligne. **Tri
    validé (réordonner) :** parmi les contrats **ouverts**, haute > normale >
    basse, puis récence (`createdAt` desc). Les contrats terminés restent en bas.
  - **D3 — Échéance :** date **optionnelle**, modifiable/effaçable. Affichée sur
    la ligne (format localisé). **Signal visuel seul :** un contrat **ouvert**
    dépassé est signalé « en retard » (rouge), une échéance aujourd'hui/demain
    « bientôt » (amber). **Aucune pénalité et aucun réordonnancement** lié à
    l'échéance (les pénalités/réputation sont MVP 2).
  - **D4 — Sous-tâches :** **checklist** de libellés, cochables/supprimables,
    avec progression (ex. « 2/5 »). Elles **n'influencent ni la récompense ni la
    complétion** : cocher toutes les sous-tâches ne termine **pas**
    automatiquement le contrat (complétion = action explicite sur le contrat).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Priorité — édition :** dans la surface d'édition, choisir la priorité
     (basse / normale / haute) ; la valeur est persistée (visible après F5).
  2. **Priorité — affichage :** la priorité d'un contrat est visible sur sa ligne
     (indicateur distinct par niveau).
  3. **Priorité — tri :** parmi les contrats ouverts, ceux de priorité haute
     apparaissent avant les normale, puis basse (à priorité égale : plus récent
     d'abord). Les terminés restent en bas.
  4. **Échéance — définition :** définir une date d'échéance sur un contrat, la
     modifier, puis l'effacer ; chaque état est persisté (F5).
  5. **Échéance — affichage & alerte :** l'échéance est affichée sur la ligne ;
     un contrat ouvert **dépassé** est signalé « en retard », un contrat dont
     l'échéance est aujourd'hui/demain est signalé « bientôt ».
  6. **Sous-tâches — gestion :** ajouter plusieurs sous-tâches à un contrat, en
     cocher/décocher, en supprimer ; l'ensemble est persisté (F5).
  7. **Sous-tâches — progression :** quand un contrat a des sous-tâches, sa ligne
     affiche l'avancement (ex. « 2/5 »), mis à jour au cochage.
  8. **Sous-tâches — pas de récompense :** cocher une sous-tâche n'octroie
     **aucun** XP/crédit (la récompense reste liée à la complétion du contrat,
     US-008). Terminer le contrat ne dépend pas de l'état des sous-tâches.
  9. **Création rapide inchangée :** créer un contrat au clavier reste un geste
     de 2 s (attributs optionnels, réglés après création).
  10. **i18n FR/EN :** tous les libellés ajoutés (priorité, échéance,
      « en retard / bientôt », sous-tâches, progression) sont dans les deux
      catalogues ; aucune chaîne en dur.

- **Impact UI :** **significatif** → surface d'édition/détail du contrat
  (priorité + échéance + liste de sous-tâches) et indicateurs sur la ligne
  (priorité, échéance/alerte, progression sous-tâches). **Étape design à prévoir.**

## 2. Cadrage technique  _(porte de validation)_

### Impacts modèle de données (Dexie **v4**)

- **Sous-tâches — tableau embarqué sur `Contract`** (pas de table séparée) :
  `subtasks: SubTask[]` avec `SubTask = { id: string; title: string; done:
  boolean }`. L'ordre d'affichage = ordre du tableau (insertion ; pas de
  réordonnancement au périmètre). Choix embarqué justifié : volumes faibles,
  local-first, les sous-tâches se chargent/persistent avec leur contrat (atomique,
  aucune jointure). → `src/db/types.ts`.
- **`priority` et `dueDate`** : **déjà** dans `Contract`, aucun changement de
  schéma — on les **expose** seulement.
- **Migration Dexie v4** (`src/db/db.ts`) : `version(4)` recopie la `.stores()`
  de v3 (aucun index nouveau : `subtasks` n'est pas interrogé) + `upgrade` qui
  **rétro-remplit** `subtasks = []` sur les contrats existants.
- **`contractsRepo.create`** : initialise `subtasks: []` ; `CreateContractInput`
  supporte déjà `priority`/`dueDate` (rien à changer côté création rapide).

### Couche données (`src/db/repositories/contracts.ts`)

- Ajouter des méthodes typées (la manipulation du tableau reste dans la couche
  données) :
  - `setPriority(id, priority)`, `setDueDate(id, dueDate | null)` — simples
    `update`.
  - `addSubtask(id, title)`, `toggleSubtask(id, subtaskId)`,
    `removeSubtask(id, subtaskId)` — lisent le contrat, recalculent `subtasks`,
    réécrivent le champ.

### État applicatif (`src/stores/useContractsStore.ts`)

- Nouvelles actions miroir : `setPriority`, `setDueDate`, `addSubtask`,
  `toggleSubtask`, `removeSubtask` (mutation repo + maj optimiste de l'état).
- **Aucune interaction avec la récompense** (US-008) : cocher une sous-tâche
  n'appelle **jamais** `grantReward` ; `complete` reste inchangé.

### Tri (priorité) — `src/features/contracts/ContractsView.tsx`

- Étendre `sortedContracts` : ouverts d'abord, puis **par priorité**
  (high > normal > low via un rang `PRIORITY_ORDER`), puis `createdAt` desc.
  Terminés en bas (récence). L'échéance **n'entre pas** dans le tri (D3).

### UI

- **Surface d'édition/détail du contrat** — nouveau composant
  `src/features/contracts/ContractDetail.tsx` (modale réutilisant `HudPanel`,
  comme `ConfirmDialog` ; forme exacte figée au design). Contient : priorité
  (sélecteur), échéance (champ date + effacer), **liste de sous-tâches** (ajout
  par saisie + Entrée, coche, suppression), et le titre/difficulté (regroupement
  du titre + difficulté ici à confirmer au design ; l'édition inline du titre
  peut rester pour le renommage rapide). Ouverte via une action sur la ligne
  (icône « détail »).
- **Ligne de contrat** (`ContractItem.tsx`) : ajouter les indicateurs
  - **priorité** (pastille/chevron par niveau, basse discrète),
  - **échéance** (puce date + couleur d'alerte : rouge « en retard », amber
    « bientôt »),
  - **progression sous-tâches** (« 2/5 ») quand il y en a.
  - + bouton d'ouverture du détail.
- **Sélecteur de priorité** : petit composant réutilisable (façon
  `DifficultyDots`) ou `Select`. **Champ date** : pas de composant dédié dans le
  DS (`ui/index.ts` : Input/Select/Checkbox/… sans DatePicker) → **`<input
  type="date">` habillé au thème** (à valider au design ; alternative : trois
  champs, écartée).

### Dates & alertes

- `dueDate` en epoch ms. Comparaison au **début de journée** locale pour statut :
  passé → « en retard » ; aujourd'hui/demain → « bientôt » ; sinon neutre.
- Affichage **localisé** via `Intl.DateTimeFormat` selon la langue courante
  (FR JJ/MM/AAAA), cohérent avec la règle dates de `docs/conventions.md`.
- Helper pur dédié (ex. `src/features/contracts/dueDate.ts`) : `dueStatus(dueDate,
  now)` + formatage — testable, pas de logique dans le JSX.

### i18n (FR/EN, aucune chaîne en dur — #010)

- Priorité : `contracts.priority.{low,normal,high}` + `contracts.priorityLabel`.
- Échéance : `contracts.dueDateLabel`, `contracts.due.overdue` (« En retard »),
  `contracts.due.soon` (« Bientôt »), `contracts.due.clear` (effacer).
- Sous-tâches : `contracts.subtasks.title`, `.addPlaceholder`, `.progress`
  (`{{done}}/{{total}}`), `.remove`.
- Détail : titre de la surface, libellés d'actions.

### Périmètre / non-régression

- La **création rapide** (2 s) reste inchangée (attributs réglés après création).
- **US-008 intacte** : récompense = complétion du contrat uniquement.
- `typecheck` + `lint` + `build` verts ; recette manuelle (pas de runner de
  tests dans le projet).

### Décisions à tracer (`docs/decisions.md`)

- Sous-tâches **embarquées** sur `Contract` (vs table séparée) → Dexie v4.
- Tri par priorité (réordonnancement) ; échéance = signal visuel seul ;
  sous-tâches sans impact sur récompense/complétion.
- Surface d'édition/détail du contrat (nouvelle brique UI).

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans / éléments concernés :**
  1. **Surface de détail du contrat** (modale `HudPanel`) : priorité (sélecteur),
     échéance (champ date + effacer), **liste de sous-tâches** (saisie + Entrée,
     coche, suppression, progression), titre ; difficulté regroupée ici ou non.
  2. **Ligne de contrat** : indicateurs **priorité** (par niveau), **échéance**
     (puce date + couleur d'alerte rouge « en retard » / amber « bientôt »),
     **progression sous-tâches** (« 2/5 »), + bouton d'ouverture du détail.
- **Contraintes :** design system **NIGHTWIRE V3** ; ne pas surcharger la ligne
  (indicateurs discrets) ; création rapide inchangée.
- **Maquette : reçue & validée** (`docs/maquettes/US-005/`, HTML DC). Partis pris
  retenus :
  - **Priorité = barres de signal** (à gauche du titre) : basse = 1 barre
    `steel-600`, normale = 2 `steel-200`, haute = 3 `cyan-500` + glow. La
    **forme** porte le niveau ; **pas de couleur** (réservée à l'échéance).
  - **Échéance = puce** `◷ JJ.MM [· TAG]` : neutre (steel, sans tag), amber
    « BIENTÔT » (échéance à ≤ 1 jour), rouge « EN RETARD » (dépassée).
  - **Sous-tâches** sur la ligne = « done/total » (mono + icône `list-checks`),
    affiché **seulement s'il y en a** ; passe au mint quand tout est coché.
  - **Détail = modale `HudPanel` cyan** « DÉTAIL DU CONTRAT » (statut = code) :
    INTITULÉ, difficulté, PRIORITÉ (3 segments), ÉCHÉANCE (`<input type="date">`
    + effacer), SOUS-TÂCHES (liste cochable + suppression + ajout + barre de
    progression mint) ; bouton « FERMER ».
- **Décision d'édition — révisée en recette (surface unique) :** deux boutons
  d'édition (crayon inline + sliders) jugés trop lourds → **un seul bouton
  « modifier »** (crayon `square-pen`) ouvre le détail, qui édite **tout** :
  titre, **difficulté**, priorité, échéance, sous-tâches. L'édition inline d'US-008
  est **supprimée** ; titre et difficulté deviennent **éditables dans la modale**
  (Input + `DifficultyDots`). Ligne = **modifier + corbeille**.
- **Non versionnée au commit final** (comme US-003/004/008).

## 4. Plan d'implémentation  _(porte de validation)_

Ordre : socle données → règles pures → repo/store → tri → UI (ligne + modale) →
i18n → recette. Chaque étape autonome et vérifiable.

1. **Modèle & migration Dexie v4**
   - `src/db/types.ts` : `SubTask { id: string; title: string; done: boolean }` ;
     `Contract.subtasks: SubTask[]`.
   - `src/db/db.ts` : `version(4).stores({…v3…}).upgrade(` rétro-remplir
     `subtasks = []` `)`.
   - `src/db/repositories/contracts.ts` : `create` initialise `subtasks: []` ;
     ajouter `setPriority(id, priority)`, `setDueDate(id, dueDate|null)`,
     `addSubtask(id, title)`, `toggleSubtask(id, subtaskId)`,
     `removeSubtask(id, subtaskId)`.
   - *Vérif :* reload sans perte ; nouveaux contrats `subtasks: []`.

2. **Règles pures — priorité & échéance** (`src/game/` ou `features/contracts/`)
   - **Priorité** : `PRIORITY_ORDER = ['low','normal','high']`, rang pour le tri,
     `PRIORITY_BARS[priority] = { lit, color }` (low 1 `steel-600`, normal 2
     `steel-200`, high 3 `cyan-500`+glow) → `src/game/priority.ts`.
   - **Échéance** : `dueStatus(dueDate: number, now: number)` →
     `'overdue' | 'soon' | 'neutral'` (seuils : jour actuel local ; `< 0` overdue,
     `≤ 1` soon) + `formatDueShort(dueDate, locale)` (JJ.MM) →
     `src/features/contracts/dueDate.ts`. Comparaison au **début de journée**.

3. **Store contrats** (`useContractsStore`)
   - Actions `setPriority`, `setDueDate`, `addSubtask`, `toggleSubtask`,
     `removeSubtask` (repo + maj optimiste). Aucune n'appelle `grantReward`.

4. **Tri par priorité** (`ContractsView.sortedContracts`)
   - ouverts d'abord ; à statut égal, **priorité** (high→low via rang) puis
     `createdAt` desc. Terminés en bas (récence). Échéance hors tri.

5. **Ligne enrichie** (`ContractItem.tsx`)
   - **Barres de priorité** (composant `PriorityBars`) à gauche du titre (contrats
     ouverts).
   - **Puce d'échéance** (`◷ JJ.MM [· TAG]`, couleur selon `dueStatus`) et
     **progression sous-tâches** (`done/total` + icône `list-checks`) dans la
     ligne méta, quand présents.
   - **Bouton `sliders-horizontal`** (« Régler les attributs ») ouvrant la modale,
     en plus du crayon (édition inline conservée) et de la corbeille.

6. **Modale de détail** (`src/features/contracts/ContractDetail.tsx`)
   - Coque calquée sur `ConfirmDialog` (overlay + `HudPanel` accent cyan, Échap /
     clic-hors = fermer). Contenu : INTITULÉ + difficulté **lecture seule** ;
     **PRIORITÉ** (3 segments cliquables → `setPriority`) ; **ÉCHÉANCE**
     (`<input type="date">` habillé `color-scheme:dark` → `setDueDate`, + effacer) ;
     **SOUS-TÂCHES** (progression + `ProgressBar` mint ; liste `Checkbox` +
     libellé + supprimer ; champ d'ajout `Input icon=plus` + Entrée) ; bouton
     « TERMINÉ ». Câblée dans `ContractsView` (état `detailId`).
   - Conversion date : `dueDate` (epoch ms) ↔ valeur `<input type="date">`
     (`YYYY-MM-DD`, jour local).

7. **i18n FR/EN** — priorité (`low/normal/high` + `priorityLabel`), échéance
   (`dueDateLabel`, `due.overdue`, `due.soon`, `due.clear`, `due.none`),
   sous-tâches (`subtasks.title`, `.addPlaceholder`, `.progress` = `{{done}}/{{total}}`,
   `.remove`, `.empty`), détail (`detail.title`, `item.attributes`).

8. **Recette & décisions**
   - Dérouler les 10 critères (skill `recette`) → `project/recettes.md`.
   - `docs/decisions.md` : sous-tâches embarquées (Dexie v4), tri par priorité,
     échéance signal-seul, modale de détail, priorité = barres.
   - `typecheck` + `lint` + `build` verts ; retrait de la maquette au commit.

*Micro-choix proposés (sinon je pars là-dessus) :* réutiliser le composant de
sous-tâche (Checkbox + libellé + delete) inline dans la modale (pas de composant
séparé) ; barres de priorité en petit composant `PriorityBars` réutilisable.
