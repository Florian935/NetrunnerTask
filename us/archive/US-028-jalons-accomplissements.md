# US-028 — Jalons / accomplissements du Réseau

- **MVP :** A2
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-028-jalons-accomplissements

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** Un système de **jalons** (achievements) qui ponctue la
  progression du builder : une liste fixe d'étapes clés déjà présentes dans
  le jeu (premier daemon, seuils de production, premier nœud débloqué,
  premier reveal caché, première conversion crypto, première renaissance…),
  chacune marquée « atteinte » la première fois que sa condition est
  remplie, avec un **petit feedback dédié** au moment où elle est franchie
  (dans l'esprit des toasts existants : passage de niveau, montée de rang de
  réputation). Un jalon atteint reste acquis pour toujours (aucune régression,
  y compris après une renaissance). Un **panneau Jalons** permet de consulter
  à tout moment la liste complète (atteints / non atteints) — objectif
  déclaré par la roadmap : « effort faible, impact rétention élevé ».

- **Pour qui :** Le joueur, seul utilisateur de l'app. Objectif : donner des
  objectifs concrets et un sentiment de progression jalonnée pendant les
  phases de jeu passif/idle, en s'appuyant uniquement sur des événements de
  jeu qui existent déjà (aucune nouvelle mécanique de gameplay introduite).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Acheter le tout premier daemon (SCRAPER-01) → le jalon « Premier
     daemon » passe à l'état atteint et un toast dédié s'affiche une seule
     fois, au moment de l'achat.
  2. Débloquer chacun des 3 autres daemons (sifter, wraith, oracle) → le
     jalon correspondant à chacun passe à l'état atteint au moment du
     premier achat de ce daemon.
  3. Atteindre un premier seuil de production cumulée de cycles (ex.
     1 000, puis 1 000 000) → le jalon de seuil correspondant passe à l'état
     atteint, avec toast dédié.
  4. Débloquer le tout premier nœud de l'arbre de déblocage (branche `data`
     ou `crypto`) → le jalon « Premier nœud débloqué » passe à l'état
     atteint.
  5. Révéler un nœud caché (`ghost-protocol` ou `dark-pool`) → le jalon de
     reveal correspondant passe à l'état atteint, avec toast dédié (distinct
     du toast de reveal existant, ou combiné — à trancher au cadrage
     technique).
  6. Réaliser la toute première conversion `data` → `crypto` → le jalon
     « Premier arbitrage » passe à l'état atteint.
  7. Réaliser la toute première renaissance (prestige) → le jalon « Première
     renaissance » passe à l'état atteint.
  8. Recharger l'application après avoir atteint un ou plusieurs jalons →
     ces jalons restent marqués atteints (persistance), y compris après une
     renaissance qui réinitialise par ailleurs la progression courante.
  9. Ouvrir le panneau Jalons → la liste complète s'affiche avec, pour
     chaque jalon, son état (atteint / non atteint) ; un jalon non atteint
     ne révèle pas de détail qui spoilerait un contenu cependant déjà caché
     par ailleurs (ex. reveal) au-delà de ce qui est déjà visible dans le
     jeu.
  10. Franchir un jalon déjà atteint une seconde fois (ex. rachat, replay
      après renaissance) → aucun nouveau toast ne se déclenche (pas de
      répétition du feedback one-shot).

- **Hors périmètre v1 (à noter si utile pour le backlog) :** pas de
  récompense en jeu (crédits/bonus) attachée aux jalons — uniquement du
  feedback et de la reconnaissance, pour rester « effort faible » ; pas de
  jalons combinatoires complexes (ex. « tous les daemons + tout l'arbre en
  moins de X minutes »).

## 2. Cadrage technique  _(porte de validation)_

- **Fichiers impactés :**
  - **Nouveau** `src/game/milestones.ts` — module pur (aucun Dexie/React),
    calqué sur `game/prestige.ts`/`game/accelerators.ts` : catalogue
    `MILESTONE_DEFS` (~11 entrées, voir Logique) + fonction pure
    `checkMilestones` qui compare un état avant/après et retourne les jalons
    **nouvellement** atteints.
  - **Nouveau** `src/game/milestones.test.ts` — tests unitaires du module pur
    (mêmes conventions que `crypto.test.ts`/`unlockTree.test.ts`).
  - `src/db/types.ts` — `BuilderState` gagne `achievedMilestones: string[]`
    (ids atteints, append-only, ne diminue jamais).
  - `src/db/db.ts` — migration Dexie **v16** : `achievedMilestones = []` par
    défaut sur la rangée singleton existante (même schéma de table `builderState:
    'id'`, pas de nouvel index — même modèle que les migrations v11→v15).
  - `src/db/seed.ts` — si le singleton y est initialisé explicitement, ajouter
    le champ par défaut (à vérifier en implémentation).
  - `src/stores/useBuilderStore.ts` — après chaque action qui peut faire
    progresser un jalon (`buyGenerator`, `buyNode`, `convertToCrypto`,
    `prestige`, `hack`/`applyTick` pour les seuils de cycles), appelle
    `checkMilestones`, ajoute les nouveaux ids à `achievedMilestones`,
    persiste, déclenche le feedback.
  - `src/stores/useFeedbackStore.ts` — nouveau type `MilestoneItem` + état
    `milestone: MilestoneItem | null` + action `triggerMilestone(item)`
    (auto-clear ~4 s, calqué sur `triggerRankUp`).
  - **Nouveau** `src/features/builder/MilestonesPanel.tsx` — panneau de
    consultation (liste atteints/à venir), inséré dans `BuilderView.tsx` /
    `builder.css` (emplacement précis à trancher à l'étape suivante).
  - `src/i18n/locales/fr.json` / `en.json` — nouvelles clés
    `builder.milestones.*` (titre panneau + nom/description par jalon).

- **Logique :**
  - Catalogue fixe `MILESTONE_DEFS` (11 entrées, id stable jamais renommé une
    fois persisté, ids repris de la maquette validée) : `hack` (1ᵉʳ hack
    manuel), `daemon` (1ᵉʳ daemon acheté), `roster` (≥2 types de daemons
    possédés simultanément), `upgrade` (1ʳᵉ amélioration achetée), `data`
    (2ᵉ ressource en ligne — daemon qui déverrouille `data` possédé), `tree`
    (1ᵉʳ nœud de l'arbre débloqué), `accel` (1ᵉʳ boost SURCADENCE obtenu —
    système accélérateurs US-023, absent du cadrage initial, ajouté suite à
    la maquette), `crypto` (1ʳᵉ conversion `data`→`crypto`), `reborn` (1ʳᵉ
    renaissance), `ghost`/`cartel` (reveal de `ghost-protocol`/`dark-pool`).
  - **Simplification actée par la maquette** : plus besoin de « seuils
    opportunistes » sur `cycles` (les jalons de seuils numériques disparaissent
    au profit d'événements de jeu plus lisibles). Chaque jalon devient un
    **prédicat pur évalué sur l'état courant** (`(state) => boolean`), sans
    diffing avant/après : `checkMilestones(state, achieved)` parcourt
    `MILESTONE_DEFS`, ignore les ids déjà dans `achieved`, retourne ceux dont
    le prédicat est vrai. Le flag persisté (jamais retiré) reste la seule
    garantie qu'un jalon acquis résiste à la baisse de `cycles`/`data`/
    `crypto`/`unlockedNodes` à l'achat et à la remise à zéro par
    `prestige()` (AC1/AC8) — un prédicat comme « `unlockedNodes.length > 0` »
    redeviendrait faux après une renaissance si on ne le figeait pas.
  - Prédicats concrets : `hack` — vrai dès le premier appel à l'action
    `hack()` (pas d'état à tester, c'est l'appel lui-même qui est
    l'événement) ; `daemon` — `Object.keys(generators).length ≥ 1` ;
    `roster` — `≥ 2` types distincts dans `generators` ; `upgrade` —
    `Object.keys(upgrades).length ≥ 1` ; `data` — condition déjà existante
    `generators[BUILDER_CONFIG.dataUnlockGenerator] ≥ 1` (celle qui pilote
    `DataReadout`) ; `tree` — `unlockedNodes.length ≥ 1` ; `accel` —
    `acceleratorBoost !== null` (au moment où le store le pose, y compris
    résolu au `load()` si l'accélérateur s'est terminé hors-ligne) ;
    `crypto` — `crypto > 0` juste après `convertToCrypto` ; `reborn` —
    `prestigeCount ≥ 1` ; `ghost`/`cartel` — `unlockedNodes.includes(...)`.
  - Points d'appel dans `useBuilderStore` : après `hack`, `buyGenerator`,
    `buyUpgrade`, `buyNode`, `convertToCrypto`, `startAccelerator`/
    `applyTick` (résolution du boost), `prestige`, **et** `load()` (un
    accélérateur peut se résoudre en boost pendant l'absence). Le store fait
    l'**union** avec `achievedMilestones` et déclenche **un toast par jalon
    nouvellement atteint** (plusieurs jalons au même tick/`load()` →
    plusieurs toasts en file).
  - `MilestonesPanel` (« REGISTRE ») : lecture pure de `achievedMilestones` +
    du catalogue, aucune interaction. Les jalons `ghost`/`cartel` non atteints
    restent masqués (nom en blocs, cadenas, « signal scellé ») — respecte AC9
    et reprend le vocabulaire déjà en place pour les nœuds cachés.

- **Impacts modèle de données :**
  - `BuilderState.achievedMilestones: string[]` — nouveau champ, défaut `[]`.
  - Migration Dexie **v16** : table `builderState` inchangée (`id` reste la
    seule clé, pas de nouvel index — le champ n'est pas interrogé),
    rétro-remplissage `[]` sur la rangée singleton existante (même modèle
    que les migrations v11→v15).
  - Aucun changement sur `Contract` / `Faction` / `Player` (jalons
    strictement liés au builder « Réseau »).

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans concernés :** `/network` (`BuilderView.tsx`) — deux ajouts :
  1. **Nouveau panneau « Jalons »** (`MilestonesPanel`), consultation pure
     (11 entrées, coche visuelle atteint/non atteint), pressenti en fin de
     colonne `builder__side` — après `PrestigePanel` (transverse à tous les
     systèmes : daemons, arbre, crypto, prestige) — mais l'emplacement exact
     reste ouvert à la maquette.
  2. **Nouvelle variante de toast** pour le feedback one-shot à l'instant où
     un jalon est franchi (distincte des toasts génériques `success` — dans
     l'esprit du micro-moment `RankUpItem` de la réputation).
  Impact UI **significatif** (nouveau pattern visuel, comme les précédents
  panneaux `ReputationPanel`/`PrestigePanel`/`AcceleratorPanel`) → étape
  design proposée et **validée** avant le plan d'implémentation.
- **Maquette :** reçue (`C:\Users\flori\Downloads\network-milestones`) — soumise à validation PO. Décisions proposées :
  - Panneau nommé **« REGISTRE »** (kicker `trace://jalons`), chrome **neutre frost** (pas de halo de système — argument : c'est la carte des systèmes, pas un système actif), liseré supérieur frost + repères d'angle blancs, en-tête avec compteur `n / 11` + barre de progression **mint**. Chaque ligne atteinte reçoit un liseré + badge **mint** (écho de l'état « acquis » déjà utilisé arbre/daemons) ; ligne non atteinte en retrait (opacité réduite) ; les 2 jalons cachés restent masqués (nom en blocs `███`, icône cadenas, « signal scellé ») tant que non atteints — cohérent avec le vocabulaire « scellé » déjà utilisé pour les nœuds cachés (`builder.unlockTree.reveal.sealedHint`).
  - Toast **« Jalon atteint »** bespoke (sceau hexagonal écho du bouton HACK, double liseré, eyebrow mono mint, balayage sheen), nettement distinct du toast générique, empilable (plusieurs jalons au même instant → entrées décalées).
  - Placement confirmé : fin de colonne `builder__side`, sous `PrestigePanel`.
  - **Écart tranché avec le PO (validé)** : liste de la maquette retenue —
    voir §2 Logique, catalogue mis à jour en conséquence.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Migration Dexie v16** (`src/db/types.ts` + `src/db/db.ts`) :
   `BuilderState.achievedMilestones: string[]`, upgrade `[]` par défaut sur
   la rangée singleton (même modèle que v11→v15). Vérifier `src/db/seed.ts`.
2. **Module pur `src/game/milestones.ts`** : catalogue `MILESTONE_DEFS` (11
   entrées : id, clé i18n, icône, prédicat pur sur un sous-ensemble
   structurel de `BuilderState`) + `checkMilestones(state, achieved) => string[]`
   (nouveaux ids, ids déjà atteints ignorés). Découplé (aucun import
   Dexie/React), à l'image de `game/prestige.ts`.
3. **Tests `src/game/milestones.test.ts`** : un cas par prédicat (atteint /
   non atteint / déjà atteint → pas de re-déclenchement), + cas `roster`
   (2 types) et les 2 reveals cachés.
4. **`useFeedbackStore.ts`** : type `MilestoneItem` (id, nom résolu ou clé
   i18n, icône), état `milestones: MilestoneItem[]` (file, pas un
   singleton — plusieurs jalons peuvent tomber ensemble), action
   `triggerMilestone(id)` qui pousse + auto-dismiss individuel (~4 s,
   décalage d'entrée si plusieurs).
5. **`useBuilderStore.ts`** : ajoute `achievedMilestones` au state + à
   `persist()` + à `load()` (valeur brute depuis la base, pas de recalcul
   rétroactif). Après `hack`, `buyGenerator`, `buyUpgrade`, `buyNode`,
   `convertToCrypto`, `startAccelerator`/`applyTick` (résolution boost),
   `prestige`, **et** `load()` (résolution accélérateur hors-ligne) :
   appelle `checkMilestones`, ajoute les nouveaux ids (union), persiste,
   appelle `triggerMilestone` pour chacun.
6. **i18n FR/EN** (`builder.milestones.*`) : titre panneau « REGISTRE »,
   kicker `trace://jalons`, libellé « jalons », les 11 × {name, desc},
   textes génériques (« pas encore atteint », « signal scellé »), eyebrow
   toast « JALON ATTEINT ».
7. **`src/features/builder/MilestoneToast.tsx`** (nouveau, bespoke — comme
   `RankUpToast.tsx`) : sceau hexagonal (`Icon`), double liseré, eyebrow
   mono mint, balayage sheen (respecte `prefers-reduced-motion`), largeur/
   position calquées sur la maquette.
8. **`src/features/builder/MilestonesPanel.tsx`** (nouveau) : `<Card hud
   brackets>` (pas de halo — chrome neutre), en-tête compteur `n/11` +
   `ProgressBar accent="mint"`, lignes bespoke (badge icône biseauté, nom,
   description, statut atteint/non atteint), masquage `███`/cadenas pour
   `ghost`/`cartel` non atteints.
9. **`builder.css`** : styles des nouveaux composants (lignes registre,
   animation sheen du toast, liseré/repères d'angle neutres).
10. **`BuilderView.tsx`** : insertion de `MilestonesPanel` en fin de colonne
    `builder__side`, sous `PrestigePanel`.
11. **`AppShell.tsx`** : nouvelle zone d'affichage (coin haut-droit, pile
    verticale) pour `milestones` (file du feedback store), rendu via
    `MilestoneToast`, à côté des zones existantes (palier haut-centre,
    toasts bas-droite).
12. **Vérifs vertes** : `npm run typecheck && npm run lint && npm run build && npm test`.
13. **Recette** (skill `recette`) contre les 10 critères d'acceptation §1.
