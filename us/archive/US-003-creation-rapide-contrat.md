# US-003 — Création rapide de contrat (règle des 2 s)

- **MVP :** 1
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-003-creation-rapide-contrat

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** permettre de créer un contrat (une tâche) en **~2 secondes** :
  focaliser une barre de saisie, taper un titre, valider avec **Entrée** → le
  contrat est créé et persisté. C'est l'application directe de la règle d'or du
  cahier des charges : _« ajouter une tâche prend 2 secondes, la gamification
  vient après »_. Aucun champ de gamification n'est obligatoire à la saisie.

  Cette US livre la **capacité de saisie rapide** et son **écran hôte minimal**.
  Elle **ne construit pas** la liste complète des contrats (US-004) ni le
  tableau de bord / HUD (US-010) : ces vues enrichiront le même écran plus tard.

- **Pour qui :** l'utilisateur qui veut capturer une tâche à la volée, sans
  friction ni formulaire, avant que la couche RPG n'entre en jeu.

- **Périmètre volontairement exclu** (couvert par d'autres US) :
  - voir / terminer / éditer / supprimer les contrats → **US-004** ;
  - priorité, échéance, sous-tâches → **US-005** ; récurrence → **US-006** ;
  - choix de la faction à la saisie → **US-007** (ici : pas de faction imposée) ;
  - difficulté ajustable & récompense → **US-008** (ici : difficulté par défaut).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Une **barre de saisie** de contrat est visible sur l'écran et focalisable
     au clavier (focus disponible sans détour à la souris).
  2. Saisir un titre puis **Entrée** → un contrat `status: open` est créé et
     **persistant** (via la couche `contractsRepo`/Dexie) : il est toujours là
     après un rechargement (F5).
  3. Après validation, le champ **se vide et conserve le focus** → on peut
     enchaîner une 2ᵉ création au clavier sans toucher la souris.
  4. Un titre **vide ou composé uniquement d'espaces** ne crée **aucun** contrat
     (le titre saisi est par ailleurs trimmé).
  5. Le contrat est créé avec des **valeurs par défaut** (difficulté par défaut,
     aucune faction, aucune échéance) sans saisie supplémentaire obligatoire.
  6. **Feedback immédiat** de la création (confirmation discrète et/ou compteur
     de contrats créés visible) — l'utilisateur sait que c'est enregistré.
  7. Pas de régression : `npm run build` et `npm run lint` passent ; l'app
     démarre.

- **Impact UI : oui, significatif** → l'US déclenchera une **étape design**
  (maquette Claude Design) après les cadrages fonctionnel et technique. Écrans
  pressentis : la **barre de création rapide** et son **écran hôte** (vue
  « Contrats » minimale, base réutilisée par US-004 et US-010).

## 2. Cadrage technique  _(porte de validation)_

> Code en anglais (convention). UI en français.

### Fichiers impactés

- `src/features/contracts/QuickAddContract.tsx` **(nouveau)** — la barre de
  saisie rapide (composant fonctionnel).
- `src/features/contracts/ContractsView.tsx` **(nouveau)** — écran hôte minimal
  (titre + barre + zone de feedback). Base réutilisée par US-004 (liste) et
  US-010 (HUD).
- `src/features/contracts/index.ts` **(nouveau)** — barrel de la feature.
- `src/App.tsx` **(modif.)** — rend `ContractsView` ; la page de démonstration
  d'US-001 est retirée (Zustand/Dexie/PWA déjà validés en recette US-001).

### Logique

- **QuickAddContract** :
  - champ contrôlé `title` (state local) rendu avec le composant DS `Input`
    (`autoFocus` transmis via les props natives → critère 1) ;
  - soumission via `<form onSubmit>` → **Entrée** valide (un seul champ =
    soumission implicite HTML → critère 3), et un bouton DS `Button` déclenche la
    même action à la souris ;
  - `handleSubmit` : `preventDefault` → `title.trim()` → si **vide, ne rien
    faire** (critère 4) → sinon `await contractsRepo.create({ title })` →
    **vider** le champ. En soumission clavier, le focus **reste** dans l'input
    (aucun blur) → enchaînement immédiat (critère 3) ;
  - **valeurs par défaut** : `create()` applique déjà `difficulty:'trivial'`,
    `priority:'normal'`, `factionId:null`, `dueDate:null` → aucune saisie
    supplémentaire (critère 5) ;
  - **feedback** (critère 6) : compteur local de contrats créés dans la session
    et/ou toast (composant DS `Toast`). **Forme exacte tranchée à l'étape
    design.**
- **Pas de store contrats dans cette US** : `QuickAddContract` appelle
  `contractsRepo` directement. Le store réactif Zustand (`useContractsStore`)
  arrivera en **US-004**, quand une liste devra réagir aux créations. (Règle
  anti-dérapage : pas de réactivité sans consommateur.)
- **Aucune modification du design system** attendue : le focus clavier et le
  reset s'obtiennent sans forwarder de `ref` (le `<form>` conserve le focus).

### Impacts modèle de données

**Aucun.** L'US consomme `contractsRepo.create()` (défini en US-002) sans
changement de schéma ni de version Dexie.

### Points à trancher à l'étape design (maquette)

- Placement et style de la barre (pleine largeur ? position sur l'écran).
- Forme du feedback : toast, compteur, ou les deux.
- État vide de l'écran hôte (avant tout contrat) et intitulés.
- Présence ou non d'un bouton « Ajouter » visible (vs Entrée seule).

## 3. Design  _(porte de validation, si impact UI significatif)_

**Applicable — en attente de la maquette (Claude Design).**

### Écrans concernés

1. **Écran « Contrats » (hôte minimal)** — le premier vrai écran de l'app :
   structure globale (en-tête / titre), zone d'accueil de la barre, **état vide**
   (avant tout contrat). Base réutilisée par US-004 (liste) et US-010 (HUD) → à
   penser extensible.
2. **Barre de création rapide** — le champ de saisie et ses **états** : au repos,
   focus (halo néon), en cours de saisie, après validation (champ vidé). Bouton
   « Ajouter » éventuel.
3. **Feedback de création** — la forme retenue (toast, compteur, ou les deux) et
   son emplacement.

### Ce que la maquette doit trancher

- Placement et style de la barre (pleine largeur ? en haut de l'écran ?).
- **Forme du feedback** (critère 6) : toast « Contrat créé », compteur de
  contrats créés dans la session, ou les deux.
- **État vide** de l'écran et intitulés (titre d'écran, placeholder du champ,
  message d'accueil).
- Bouton « Ajouter » **visible** ou **Entrée seule** (le champ reste focalisé).

### Contraintes

- S'appuyer sur le design system **NIGHTWIRE** (tokens + composants existants :
  `Input`, `Button`, `Toast`, `HudPanel` / `Card`…). Pas de nouveau composant DS
  attendu a priori.
- Respecter la règle des 2 s : la barre est l'élément prioritaire, focalisable
  immédiatement, sans friction visuelle.

### Maquette

Fournie par le PO : `docs/maquettes/US-003/` (export Claude Design NIGHTWIRE,
`Contrats.dc.html`).

**Décisions tranchées par la maquette :**
- **Feedback = les deux** : toast HUD « CONTRAT CRÉÉ » (bas-droite, empilé max 3,
  auto-disparition ~2,6 s) **+** compteur « CRÉÉS · SESSION » (grand, mint,
  animé) en haut à droite.
- **Validation** : **Entrée** valide et le champ garde le focus + se vide ;
  bouton **« ⏎ AJOUTER »** visible (DS `Button` secondary + hud) en repli souris.
- **Barre** pleine largeur, en haut, focalisée au chargement (`Input` size lg,
  icône `terminal`).
- **État vide** : icône `radio-tower` + « AUCUN CONTRAT ACTIF » + message
  in-world. **État count>0** : « N CONTRAT(S) EN BUFFER » (message d'attente,
  la liste arrivant en US-004).
- **Saisie vide** → flash rouge de la barre (feedback du critère 4).
- **Écran hôte** : rail de navigation latéral (Contrats actif ; Tableau de bord
  / Archives / Système désactivés « bientôt ») + barre de statut haute
  (wordmark NIGHTWIRE + « SYS ONLINE »).

**Périmètre app-shell — tranché** : le **rail de navigation + la barre de statut
haute** sont **différés à US-010** (HUD/app-shell). US-003 implémente donc le
**cœur** de l'écran seulement : en-tête (overline + « CONTRATS » + compteur de
session), barre de saisie, états vide / buffer, toasts, flash d'erreur.

**Icônes à ajouter au registre `Icon.tsx`** : `terminal`, `crosshair`,
`radio-tower`, `database` (+ `layout-dashboard`, `archive`, `settings` si le rail
est inclus).

→ **STOP, validation de la maquette + arbitrage périmètre shell avant le plan.**

## 4. Plan d'implémentation  _(porte de validation)_

> Cadre : maquette validée, **app-shell différé à US-010**, **store contrats
> différé à US-004**. Code en anglais, UI en français.

1. **Icônes** — ajouter au registre `src/components/ui/core/Icon.tsx` :
   `terminal`, `radio-tower`, `database` (les icônes du rail — `crosshair`,
   `layout-dashboard`, `archive`, `settings` — ne sont pas nécessaires, shell
   différé).
2. **`QuickAddContract.tsx`** — la barre : DS `Input` (size lg, `icon="terminal"`,
   `autoFocus`, placeholder) + DS `Button` (secondary, hud, « ⏎ AJOUTER »).
   État local `draft` ; validation via **Entrée** (`onKeyDown`) et clic ;
   `title.trim()` → si vide, **ne rien créer** + flash rouge local (bordure
   `--red-500`, ~420 ms) ; sinon appelle `onCreate(title)`, **vide** le champ, le
   focus reste dans l'input.
3. **`ContractsView.tsx`** — en-tête (overline « NIGHTWIRE // OPS », titre
   « CONTRATS » `.nw-neon-cyan`, **compteur de session** mint animé) ; monte
   `QuickAddContract` ; ligne d'aide ; **état vide** (`radio-tower` + « AUCUN
   CONTRAT ACTIF » + message) / **état buffer** (count>0 : « N CONTRAT(S) EN
   BUFFER ») ; **pile de toasts** bas-droite (max 3, auto-disparition ~2,6 s).
   Détient `count` + `toasts` + `handleCreate` : `await contractsRepo.create({
   title })` → `count++` → push toast.
4. **`contracts.css`** — keyframes co-localisées `nw-count-pop` (pop du compteur)
   et `nw-toast-in` (entrée du toast).
5. **`index.ts`** — barrel de la feature.
6. **`App.tsx`** — rend `ContractsView` (retire la page de démo US-001). Table
   `demoKV` + helpers laissés dormants (retrait planifié US-010).
7. **Vérif & recette** — `typecheck` + `lint` + `build` ; recette navigateur des
   8 critères (saisie + Entrée → contrat créé, compteur +1, toast ; persistance
   après F5 via `contractsRepo` exposé en dev ; titre vide → flash, rien créé ;
   focus conservé pour enchaîner).

**Notes de périmètre** : compteur **par session** (feedback de création, pas un
total — le total viendra avec la liste US-004) ; pas de store, pas d'app-shell.
