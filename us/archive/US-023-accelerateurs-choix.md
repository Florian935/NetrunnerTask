# US-023 — A4 : Accélérateurs réels au choix

- **MVP :** A
- **Priorité :** haute
- **Statut :** fait (recette 8/8 PO le 20/07/2026)
- **Branche :** feature/US-023-accelerateurs-choix

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  Introduire un **catalogue d'accélérateurs réels** : des activités courtes,
  **vérifiées par l'app** (niveau 1 de `vision-plateforme.md` §3ter.4 — l'app
  est l'arbitre, incheatable), que le joueur peut exécuter **à la demande**
  pour obtenir un **overclock temporaire** de la production du Réseau (boost
  de `cycleMultiplier`/`dataMultiplier`, voir `game/builder.ts`).

  Conformément à P5 (santé d'abord) et à la roadmap (§ Phase A — A4), le
  builder **tient déjà debout seul** depuis A1-A3 : l'accélérateur n'est
  **jamais imposé**, jamais un mur, jamais un timer punitif. C'est un
  « cheat-code » optionnel que le joueur choisit **quand il veut**, **parmi**
  plusieurs options — jamais une activité unique forcée.

  Périmètre livré maintenant (roadmap A4) : le **cadre extensible** (catalogue
  data-driven + mécanique d'exécution + effet d'overclock) et **1 à 2**
  accélérateurs concrets pour le prouver — pas le catalogue complet. D'autres
  s'ajouteront plus tard sans réécriture (même logique que `GENERATORS` en
  US-021).

  Accélérateur retenu pour ce premier lot : **session de focus chronométrée**
  (deep work « run de hack », l'app tient le chrono → vérifiable par
  construction, aucune dépendance externe/capteur). Un 2ᵉ accélérateur pourra
  être ajouté dans ce même lot si le temps le permet (à trancher au cadrage
  technique), sinon il rejoint le backlog.

- **Pour qui :**
  Le joueur qui veut faire progresser son Réseau plus vite **via une vraie
  action** plutôt que d'attendre passivement — sans jamais y être contraint.

- **Critères d'acceptation :**
  1. Depuis l'écran `/network`, un joueur peut ouvrir un **catalogue
     d'accélérateurs** listant au moins 1 accélérateur disponible, avec son
     principe expliqué avant de le lancer (pas de surprise/piège).
  2. Le joueur peut **choisir de ne pas** lancer d'accélérateur et continuer à
     jouer normalement — aucune relance intrusive, aucun compteur qui
     pénalise l'absence d'utilisation.
  3. Lancer l'accélérateur « focus chronométré » démarre un **chrono tenu par
     l'app** (durée annoncée à l'avance) ; le joueur voit l'état « en cours »
     depuis l'écran `/network`.
  4. Si le joueur **va au bout** du chrono (sans quitter/interrompre selon la
     règle de vérification définie au cadrage technique), un **overclock
     temporaire** s'applique à la production (cycles et/ou data) pour une
     durée annoncée, visible dans l'UI (indicateur actif + temps restant).
  5. Si le joueur **interrompt** l'accélérateur avant la fin, aucun overclock
     n'est accordé ; l'échec est communiqué sans culpabilisation (ton neutre,
     pas de pénalité au-delà de l'absence de bonus).
  6. Un **2ᵉ lancement** n'est possible qu'une fois le précédent overclock (ou
     son cooldown, si retenu au cadrage technique) terminé — pas d'empilement
     à l'infini qui viderait le geste de sens.
  7. L'état de l'accélérateur (en cours / overclock actif / disponible)
     **survit** à un rechargement de page (persistance Dexie, cohérent avec
     `useBuilderTick`/`load()` existants).
  8. `prefers-reduced-motion` respecté sur les éventuelles animations
     d'overclock (cohérent avec P9 / US-020→022).

## 2. Cadrage technique  _(porte de validation)_

- **Fichiers impactés :**
  - **Nouveau** `src/game/accelerators.ts` — module pur, testé, **découplé** de
    `game/builder.ts` et `game/unlockTree.ts` (même convention que US-022 : la
    couche store compose les trois avant `tick()`).
  - **Nouveau** `src/game/accelerators.test.ts`.
  - `src/db/types.ts` — `BuilderState` gagne `acceleratorRun` / `acceleratorBoost`.
  - `src/db/db.ts` — **migration Dexie v13**.
  - `src/stores/useBuilderStore.ts` — état `run`/`boost`, actions
    `startAccelerator(id)` / `cancelAccelerator()`, résolution des transitions
    intégrée à `applyTick`, composition du multiplicateur de boost avant `tick()`.
  - `src/features/builder/useBuilderTick.ts` — inchangé dans sa boucle (le tick
    250 ms existant porte aussi la résolution accélérateur) ; commentaire à jour.
  - **Nouveau** `src/features/builder/AcceleratorPanel.tsx` (les 3 états dans
    un seul fichier — variations fines d'une même coque, comme `accelerators.jsx`
    de la maquette — sur `<Card hud brackets halo="cyan">`).
  - `src/features/builder/BuilderView.tsx` — insertion du panneau dans la
    colonne **stage**, sous `HackZone` (**layout Option A**, maquette validée).
  - `src/features/builder/builder.css` — styles idle/running/boosted (anneau de
    focus, glow SURCADENCE, barre de progression si non couverte par
    `<ProgressBar>`), `prefers-reduced-motion` (P9).
  - `src/components/ui/core/Icon.tsx` — ajout de **2 icônes** au registre :
    `Play` (bouton Lancer) et `Brain` (anneau de focus). Le reste de la
    maquette est couvert par le registre existant : `clock` (au lieu de
    `timer`/`hourglass`), `gauge` (au lieu de `gauge-circle`), `x` (au lieu de
    `pause-circle`), `plus` (au lieu de `plus-circle`), `zap` — **aucun autre
    import Lucide**.
  - `src/i18n/locales/fr.json` / `en.json` — namespace `builder.accelerators.*`.
  - `us/US-023-accelerateurs-choix.md` — cadrage (ce fichier).
  - Réutilisation telle quelle : `useFeedbackStore.pushToast` (pas de nouveau
    champ), `<Card>`, `<ProgressBar>`, `<Button>` (DS existant — voir §Design).

- **Logique :**
  - **Catalogue data-driven** `ACCELERATORS: AcceleratorDef[]` (même esprit que
    `GENERATORS`/`UNLOCK_NODES`) : 1 entrée pour ce lot, `focus` — `durationMs`
    (chrono tenu par l'app), `boostDurationMs`, `boostEffect: { cycles?, data? }`
    (fraction ajoutée au multiplicateur, même forme que `UnlockNodeDef.effect`).
    **Réglages placeholder, affinables en recette** (même convention que
    `BUILDER_CONFIG`), **alignés sur la maquette validée** : `durationMs = 25 min`,
    `boostDurationMs = 15 min`, `boostEffect = { cycles: 1 }` (×2 pendant le boost).
  - **État** porté par `BuilderState`, mêmes noms de champs que le modèle de
    données (comme `UnlockTreeCore` reprend `unlockedNodes` tel quel) :
    `AcceleratorCore = { acceleratorRun: {id, endsAt} | null; acceleratorBoost:
    {id, endsAt} | null }` :
    - `canStart` → vrai ssi `acceleratorRun === null && acceleratorBoost === null`
      (**AC6**, anti-empilement).
    - `start(id, now)` → pose `acceleratorRun = {id, endsAt: now + durationMs}` ;
      no-op si `!canStart`.
    - `cancel(now)` → vide `acceleratorRun` s'il est actif (retour idle),
      **no-op** sinon ; **aucune pénalité** au-delà de l'absence de bonus (**AC5**).
    - `resolve(now)` (pure) : `acceleratorRun` échu → devient `acceleratorBoost` ;
      `acceleratorBoost` échu → redevient `null`. Appelée à **chaque `applyTick`**
      (tant que l'onglet est visible) **et** une fois au `load()` (rattrapage si
      le run/boost s'est terminé app fermée).
    - `endsAt` est un **instant absolu**, indépendant du premier plan de l'app —
      choix délibéré : ça n'empêche pas d'éteindre l'écran pendant le focus
      (cohérent avec `vision-plateforme.md` §3ter.4 "écran éteint / app au 1ᵉʳ
      plan"), et ça évite un mur technique de détection de premier plan hors
      périmètre de ce lot.
    - `boostMultiplier(state, now)` → `{cycles, data}` = `1 + boostEffect.*` si
      `acceleratorBoost` actif et non expiré, sinon `{1, 1}`.
  - **Composition** (couche store, comme US-022) : `mult.cycles = cycleMultiplier(core)
    × boostMultiplier(...).cycles`, idem `data`, avant `tick()`.
  - Toute **transition d'état** (`start`/`cancel`/`run→boost`/`boost→null`)
    **persiste immédiatement** (comme `buyNode`) — contrairement au tick continu
    de `cycles`/`data` (throttlé 4 s).
  - **Feedback** : `run→boost` réussi → toast `success` (« SURCADENCE active ») ;
    `cancel` (interruption) → toast `info` neutre (« Focus interrompu · aucune
    pénalité »), ton non culpabilisant (**AC5**), fidèle à `InterruptToast` de
    la maquette.
  - **Collision de nom — tranchée avec la maquette** : le nœud d'arbre
    `overclock` (US-022, `game/unlockTree.ts`, bonus **permanent** +25 % cycles)
    affiche déjà le libellé **« OVERCLOCK »**. Le boost **temporaire** d'A4 porte
    le libellé UI **« SURCADENCE »** (validé) ; le code/i18n de `accelerators.ts`
    n'utilise jamais le terme `overclock` (réservé à `unlockTree.ts`).

- **Impacts modèle de données :**
  - `BuilderState` (table Dexie `builderState`, singleton) gagne 2 champs
    nullables : `acceleratorRun: { id: string; endsAt: number } | null` et
    `acceleratorBoost: { id: string; endsAt: number } | null`.
  - **Migration Dexie v13** : même pattern que v11/v12 — schéma recopié à
    l'identique (aucun index nouveau, champs non interrogés), rétro-remplissage
    `null`/`null` sur la rangée singleton existante.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Maquette reçue et validée PO le 20/07/2026** (dossier `network-accelerators`,
jouable — 3 états du panneau + toast d'interruption + aperçu d'insertion dans
`/network`). Non versionnée dans le dépôt (convention, comme les maquettes
précédentes).

- **Écrans concernés :** `/network` (`BuilderView`) — nouveau panneau
  `AcceleratorPanel`, colonne **stage** (gauche), **sous `HackZone`**
  (**layout Option A** retenu : regroupe les 2 gestes actifs du joueur — hack
  numérique manuel et effort réel — la colonne **side** reste dédiée à
  l'automatisation passive des daemons/de l'arbre).
- **Décisions validées avec la maquette :**
  - Accent **cyan** réservé au panneau (violet = daemons, magenta = data/arbre).
  - Libellé du boost temporaire : **« SURCADENCE »** (distinct du nœud permanent
    « OVERCLOCK »), avec légende explicite dans l'état boost.
  - Réglages : 25 min de focus → 15 min de SURCADENCE ×2 sur les cycles.
  - Bandeau discret « d'autres accélérateurs en développement » sous la carte
    (extensibilité, sans pastille intrusive — AC1/AC2 respectés).
  - Toast d'interruption neutre, sans ton d'échec (AC5).
- **Maquette :** `C:\Users\flori\Downloads\network-accelerators` (local, PO).

## 4. Plan d'implémentation  _(porte de validation)_

1. **Migration Dexie v13** (`db/db.ts`) + `BuilderState` (`db/types.ts`) :
   ajout `acceleratorRun: { id: string; endsAt: number } | null` et
   `acceleratorBoost: { id: string; endsAt: number } | null` ; `.upgrade()`
   avec rétro-remplissage `null`/`null` sur la rangée singleton (même modèle
   que v11/v12).
2. **Nouveau `game/accelerators.ts`** : `AcceleratorDef` (`id`, `icon`,
   `durationMs`, `boostDurationMs`, `boostEffect: {cycles?, data?}`), catalogue
   `ACCELERATORS` (1 entrée `focus`, réglages 25 min / ×2 / 15 min) +
   `ACCELERATOR_BY_ID`. État `AcceleratorCore` (`acceleratorRun`/
   `acceleratorBoost`, mêmes noms que `BuilderState`). Fonctions pures :
   `canStart`, `start`, `cancel`, `resolve`, `boostMultiplier`. **Découplé** de
   `builder.ts`/`unlockTree.ts` (types structurels minimaux, aucun import
   croisé — même discipline que `unlockTree.ts`).
3. **`game/accelerators.test.ts`** (nouveau) : `canStart` (anti-empilement
   AC6), `start`/`cancel` (no-op si non éligible, AC5), `resolve` (run→boost à
   `endsAt`, boost→null à expiration, rattrapage si `now` largement dépassé),
   `boostMultiplier` (neutre hors boost, effectif pendant).
4. **`stores/useBuilderStore.ts`** : état étendu (`acceleratorRun`,
   `acceleratorBoost`), `load()` mis à jour (+ un `resolve(now)` immédiat pour
   le rattrapage app-fermée), nouvelles actions `startAccelerator(id)` /
   `cancelAccelerator()` (persistance immédiate, comme `buyNode`). `applyTick`
   appelle `resolve(now)` à chaque passage, compose `boostMultiplier` avec
   `cycleMultiplier`/`dataMultiplier` (`unlockTree`) avant `tick()`, et
   persiste immédiatement si `resolve` a produit une transition d'état.
   Déclenche `pushToast` (succès à `run→boost`, info neutre à `cancel`).
5. **Icônes** (`components/ui/core/Icon.tsx`) : ajouter `Play` et `Brain` au
   registre (`play`, `brain`) — seuls ajouts Lucide de cette US.
6. **i18n FR/EN** : clés `builder.accelerators.*` — nom/principe de `focus`,
   libellés des 3 états (repos/en cours/SURCADENCE), stats annoncées
   (durée/effet/boost), boutons (Lancer/Abandonner), toast d'interruption,
   bandeau d'extensibilité.
7. **Nouveau `features/builder/AcceleratorPanel.tsx`** : orchestration (lit
   `useBuilderStore`, calcule la phase repos/running/boost à partir de
   `acceleratorRun`/`acceleratorBoost` + horloge locale rafraîchie à la
   seconde pour le compte à rebours), et les 3 rendus d'état sur
   `<Card hud brackets halo="cyan">` — boutons via `<Button variant="secondary"
   hud>` (Lancer) / `<Button variant="ghost" hud>` (Abandonner), compte à
   rebours via `<ProgressBar accent="cyan" />`. Bandeau d'extensibilité en
   pied de carte.
8. **Intégration `BuilderView.tsx`** : insertion d'`AcceleratorPanel` dans la
   colonne stage, sous `HackZone`.
9. **CSS** (`builder.css`) : anneau de focus (rotation lente, apaisée),
   glow pulsé de la SURCADENCE, `prefers-reduced-motion` (variantes statiques),
   fidèles à la maquette.
10. **Vérifications** : `npm run typecheck && npm run lint && npm run build &&
    npm test` — non-régression complète (A1→A3 + nouveaux tests).
