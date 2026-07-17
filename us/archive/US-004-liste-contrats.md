# US-004 — Liste des contrats & complétion

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-004-liste-contrats

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** afficher la **liste des contrats** sous la barre de création et
  permettre de les **gérer** : voir, **terminer**, **éditer** (le titre),
  **supprimer**. La liste est **réactive** : toute création/modification s'y
  reflète immédiatement (introduction du store contrats Zustand, différé
  d'US-003). C'est le moment où l'écran « Contrats » devient un vrai to-do
  utilisable.

- **Pour qui :** l'utilisateur qui veut consulter et faire avancer ses contrats
  au quotidien (le cœur du gestionnaire de tâches).

- **Périmètre volontairement exclu** (couvert ailleurs) :
  - **récompense** (XP/crédits) et animation « hack réussi » à la complétion →
    **US-008** ; ici, terminer ne fait que changer l'état ;
  - édition de la **difficulté / priorité / échéance / sous-tâches** → US-005 /
    US-008 ; ici, l'édition porte sur le **titre** ;
  - **filtrage par faction** → US-007 ; **récurrence** → US-006.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Les contrats existants s'affichent dans une **liste** (le plus récent en
     haut) ; persistante : ils sont toujours là après un rechargement (F5).
  2. **Réactivité** : créer un contrat via la barre l'**ajoute immédiatement** à
     la liste, sans rechargement.
  3. **Terminer** : une action sur un contrat le marque `done` ; son rendu change
     (distinction visuelle claire ouvert / terminé) ; l'état **persiste** après
     F5. L'action est réversible (ré-ouvrir) — _à confirmer au design_.
  4. **Éditer** : renommer le **titre** d'un contrat en place ; la modification
     **persiste**.
  5. **Supprimer** : une action retire le contrat de la liste **et** de la base ;
     persiste après F5. Garde-fou contre la suppression accidentelle
     (confirmation ou annulation) — _forme à définir au design_.
  6. **État vide** conservé quand il n'y a aucun contrat (l'état « buffer »
     placeholder d'US-003 est remplacé par la vraie liste).
  7. **i18n** : tous les libellés et messages ont leurs entrées **FR et EN**
     (aucune chaîne en dur).
  8. **Réordonnancement animé** : terminer / ré-ouvrir (et créer / supprimer)
     **anime** le déplacement du contrat dans la liste (transition fluide, pas de
     saut brutal) ; respecte `prefers-reduced-motion`.
  9. Pas de régression : `npm run build` et `npm run lint` passent.

- **Impact UI : oui, significatif** → **étape design** (maquette) après les
  cadrages fonctionnel et technique. Écrans/éléments : la **liste** et l'**item
  de contrat** (affordances terminer / éditer / supprimer), la distinction
  ouvert/terminé, l'évolution de l'en-tête (compteur de session → compteur réel ?).

## 2. Cadrage technique  _(porte de validation)_

> Code en anglais, UI via i18n (FR/EN), commentaires FR.

### Store Zustand (introduit ici)

- `src/stores/useContractsStore.ts` **(nouveau)** — source de vérité réactive de
  la liste. State : `contracts: Contract[]`, `loaded: boolean`. Actions (chacune
  appelle `contractsRepo` puis met à jour l'état en mémoire) :
  - `load()` → `contractsRepo.list()` (récent en haut) ;
  - `create(title)` → `create` puis **prepend** ;
  - `complete(id)` / `reopen(id)` → maj statut (`done`/`open`, `completedAt`) ;
  - `rename(id, title)` → maj titre ;
  - `remove(id)` → suppression.
- Chargement initial : `load()` au montage de `ContractsView` (`useEffect`).

### Fichiers impactés

- `src/stores/useContractsStore.ts` **(nouveau)**.
- `src/stores/useDemoStore.ts` **(suppr.)** — mort depuis le retrait de la démo
  (US-003). _(À confirmer par un grep avant suppression.)_
- `src/features/contracts/ContractsView.tsx` **(modif.)** — consomme le store,
  crée via le store (réactivité), affiche la liste, retire l'état « buffer »
  placeholder d'US-003. Conserve toasts ; le compteur d'en-tête peut évoluer
  (session → réel) — _tranché au design_.
- `src/features/contracts/ContractList.tsx` **(nouveau)** — rend la liste (ou
  l'état vide).
- `src/features/contracts/ContractItem.tsx` **(nouveau)** — un contrat :
  affichage, distinction ouvert/terminé, actions terminer/ré-ouvrir, édition du
  titre en place, suppression.
- `src/features/common/ConfirmDialog.tsx` **(nouveau)** — popup de confirmation
  (NIGHTWIRE n'a pas de composant modal → petit composant local ; promouvable en
  composant DS plus tard). Look défini par la maquette.
- `src/components/ui/core/Icon.tsx` **(modif.)** — ajouter les icônes d'actions
  (ex. `pencil`, `trash-2`, `rotate-ccw`, `check`… selon la maquette).
- `src/i18n/locales/{fr,en}.json` **(modif.)** — libellés liste, actions, dialog.
- `src/features/contracts/contracts.css` **(modif. éventuelle)** — états d'item.

### Logique

- **Réactivité** : `ContractsView` ne fait plus d'appel repo direct pour créer —
  il passe par `useContractsStore.create`, la liste se met à jour seule.
- **Édition en place** : clic sur « éditer » → le titre devient un `Input`,
  Entrée/blur valide (`rename`), Échap annule.
- **Suppression** : action → `ConfirmDialog` → si confirmé, `remove`.
- **Terminer** reste dans la liste avec un style « terminé » ; **réversible**
  (ré-ouvrir).

### Impacts modèle de données

**Aucun** : réutilise `contractsRepo` (create/update/complete/remove d'US-002).
`reopen` = `update(id, { status: 'open', completedAt: null })`.

### Points à trancher à l'étape design (maquette)

- Layout de l'item et des **affordances** (icônes au survol ? boutons ?).
- Rendu **terminé** (barré / estompé / coche néon).
- Interaction d'**édition en place** (déclencheur, validation/annulation).
- **ConfirmDialog** (style HUD, textes, boutons).
- Évolution de l'**en-tête** : compteur « session » → compteur réel
  (ouverts / total) ?

## 3. Design  _(porte de validation, si impact UI significatif)_

**Applicable — en attente de la maquette (Claude Design).**

### Éléments à maquetter

1. **La liste** sous la barre de création (récent en haut) et sa cohabitation
   avec l'en-tête + la barre existants.
2. **L'item de contrat** : titre + affordances **terminer / éditer / supprimer**
   (icônes au survol ou boutons), et ses **états** : ouvert, survol, **terminé**
   (barré / estompé / coche néon), **édition en place**.
3. **ConfirmDialog** de suppression (style HUD : titre, message, boutons
   Annuler / Supprimer).
4. Évolution de l'**en-tête** : le compteur « CRÉÉS · SESSION » devient-il un
   compteur réel (ouverts / total) ?

### Décisions déjà prises (à respecter dans la maquette)

- Terminer un contrat → il **reste dans la liste** (style terminé), réversible.
- Supprimer → **confirmation par popup** (ConfirmDialog), pas d'undo par toast.

### Contraintes

- Design system **NIGHTWIRE** (tokens + composants existants) ; UI **FR**
  (in-world), câblée i18n. Réutiliser `Card`/`HudPanel`, `Button`, `IconButton`,
  `Checkbox`, `Input`, `Icon`. Le modal est un nouveau composant à styler HUD.

### Maquette

Fournie et **validée** : `docs/maquettes/US-004/` (export Claude Design NIGHTWIRE).

**Décisions tranchées par la maquette :**
- **Item** : `Checkbox` (cocher = terminer, reste dans la liste), titre + sous-ligne
  mono « CTR · 0xNN », badge **TERMINÉ** (mint) + titre **barré/estompé** si fait.
  Édition/suppression = **icônes au survol** (`square-pen`, `trash-2`).
- **Survol de ligne** : liseré néon interne à gauche + révélation des outils.
- **Édition en place** : titre → `Input` + check/x ; **Entrée** enregistre,
  **Échap** annule.
- **Suppression** : **modal HUD** = overlay void flouté + `HudPanel` accent
  magenta (réutilise le composant DS, pas de modal from scratch) ; `shield-alert`,
  rappel du contrat, boutons **Annuler** (ghost) / **Supprimer** (danger). Clic
  hors modal / Échap = annuler. **Toast danger « CONTRAT PURGÉ »** après confirm.
- **En-tête** : « CRÉÉS · SESSION » → **« ACTIFS / TOTAL » + `ProgressBar`**
  (terminés / total).
- **Section « FILE D'ATTENTE »** avec « N ACTIFS · N TERMINÉS ».
- **État vide** : « GRID VIDE » + message (remplace l'« AUCUN CONTRAT ACTIF »
  d'US-003).

**Ajouts introduits (notés, en périmètre)** : barre de progression d'en-tête,
tag hexa par contrat (dérivé de l'`id`, affichage seul), toast de suppression.
Icônes à ajouter : `square-pen`, `trash-2`.

**Affinage post-maquette (validé PO)** : les contrats terminés **descendent en
bas de liste** (tri d'affichage : ouverts d'abord, puis terminés ; dans chaque
groupe, du plus récent au plus ancien). Cocher fait descendre le contrat,
décocher le remonte à sa place chronologique. Ceci **supersède** le « reste en
place » de la maquette, au profit d'une file active plus focalisée. **Le
réordonnancement est animé** (nécessaire à la lisibilité de l'interaction) via
**Framer Motion** (`motion` : `layout` pour le déplacement, `AnimatePresence`
pour entrée/sortie ; `MotionConfig reducedMotion="user"` respecte
`prefers-reduced-motion`) — **dans le périmètre**. _(auto-animate écarté :
n'animait de façon fiable que la suppression dans notre config React 19.)_

## 4. Plan d'implémentation  _(porte de validation)_

> Maquette validée. Code en anglais, UI via i18n (FR/EN), commentaires FR.

1. **Icônes** — ajouter `square-pen` et `trash-2` au registre `Icon.tsx` (les
   autres — `check`, `x`, `shield-alert`, `terminal`, `radio-tower` — sont déjà là).
2. **Store** — `src/stores/useContractsStore.ts` (Zustand) : state
   `{ contracts: Contract[], loaded: boolean }` ; actions `load`, `create(title)`
   (prepend), `complete(id)`, `reopen(id)`, `rename(id, title)`, `remove(id)` —
   chacune via `contractsRepo` puis maj de l'état.
3. **Nettoyage** — supprimer `src/stores/useDemoStore.ts` (mort depuis US-003,
   après grep).
4. **Helper** — petit `contractCode(id)` (dérive « 0xNN » depuis l'`id`,
   déterministe, affichage seul).
5. **`ConfirmDialog`** — `src/features/common/ConfirmDialog.tsx` : overlay flouté
   (clic = annuler, `stopPropagation` sur le contenu, **Échap** = annuler) +
   `HudPanel` magenta ; props `title`, `message`, `itemLabel`, `itemCode`,
   `onCancel`, `onConfirm`. Boutons Annuler (ghost) / Supprimer (danger, hud).
6. **`ContractItem`** — ligne : mode **vue** (Checkbox terminer, titre + code,
   badge TERMINÉ, outils édit/suppr au survol) et mode **édition** (Input +
   check/x, Entrée/Échap). État d'édition local. Callbacks `onToggle`,
   `onRename`, `onDelete`.
7. **`ContractList`** — en-tête « FILE D'ATTENTE » + « N ACTIFS · N TERMINÉS » +
   map des `ContractItem`.
8. **`ContractsView`** (refonte) — `load()` au montage ; en-tête **ACTIFS/TOTAL +
   ProgressBar** ; création via `store.create` (réactif) ; `ContractList` ou
   **état vide « GRID VIDE »** ; toasts (création `success`, suppression `danger`) ;
   état du `ConfirmDialog` (contrat ciblé). Retrait de l'état « buffer » d'US-003.
9. **i18n** — nouvelles clés FR/EN (file d'attente, compteurs, badge/actions item,
   édition, état vide « GRID VIDE », dialog de suppression, toast « CONTRAT
   PURGÉ ») ; retrait des clés « buffer » devenues inutiles.
10. **`contracts.css`** — survol de ligne (liseré néon interne + révélation des
    outils), keyframes `nw-modal-in` / `nw-overlay-in` (+ `prefers-reduced-motion`).
11. **Animation** — **Framer Motion** : `ContractItem` en `motion.div` (`layout`
    + `initial/animate/exit`), `AnimatePresence` dans `ContractList`,
    `MotionConfig reducedMotion="user"` au niveau `App`. Anime déplacement (tri),
    ajout et suppression.
12. **Vérif & recette** — `typecheck` + `lint` + `build`, puis recette navigateur
    des 9 critères (liste réactive, terminer/ré-ouvrir, éditer, supprimer +
    confirm, persistance F5, i18n FR/EN, état vide, **réordonnancement animé**).

**Impact modèle de données** : aucun (réutilise `contractsRepo`).
