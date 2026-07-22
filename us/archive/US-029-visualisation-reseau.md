# US-029 — Visualisation du Réseau

- **MVP :** A2
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-029-visualisation-reseau

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** Remplacer la représentation actuelle des daemons (liste de
  cartes) et de l'arbre de déblocage (lignes verticales par branche) par une
  **carte visuelle unique de nœuds interconnectés** représentant tout le
  Réseau — daemons possédés, nœuds des branches `data` et `crypto` de
  l'arbre, et une trace des renaissances passées — qui **grandit et se
  transforme visuellement** à mesure que le joueur progresse. Reprend la
  métaphore d'origine du projet (« une grille de cyberspace qui grandit sans
  fin », `docs/vision-plateforme.md` §3ter.5), jamais livrée sous forme
  visuelle jusqu'ici (Phase A1→A5 s'est limitée à des panneaux de stats).

- **Pour qui :** Le joueur — donner un sentiment concret et immédiat que
  « mon Réseau grandit », identifié comme le plus gros potentiel « wow » du
  builder lors du brainstorming de rétention (21/07/2026), au lieu de ne lire
  cette progression que dans des chiffres de panneaux.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Ouvrir `/network` → une carte visuelle unique s'affiche, montrant les
     daemons possédés et les nœuds des 2 branches de l'arbre comme des
     éléments visuels reliés entre eux (pas une liste verticale de cartes).
  2. Un élément non débloqué (daemon verrouillé, nœud d'arbre non atteint)
     est visuellement distinct (assombri/silhouette) d'un élément
     débloqué/possédé (illuminé).
  3. Acheter/débloquer un élément (daemon, amélioration, nœud d'arbre) → la
     carte se met à jour immédiatement, avec une transition visible marquant
     le moment (pas un simple re-render silencieux).
  4. Un nœud caché (`ghost-protocol`, `dark-pool`) reste invisible/scellé sur
     la carte tant que sa condition n'est pas remplie ; son apparition
     (reveal) est un moment visuel marqué, distinct d'un déblocage normal.
  5. Une renaissance laisse une **trace visuelle permanente** sur la carte
     (ex. marqueur de génération), distincte du reset de la progression
     elle-même — le joueur voit combien de fois il a renais directement sur
     la carte, pas seulement un nombre dans un panneau.
  6. Toutes les actions déjà possibles aujourd'hui (acheter un daemon, une
     amélioration, un nœud d'arbre) restent accessibles et fonctionnelles
     depuis la nouvelle carte — aucune fonctionnalité perdue par rapport aux
     panneaux actuels qu'elle remplace.
  7. La carte reste lisible et utilisable aussi bien en tout début de partie
     (peu d'éléments) qu'en fin de progression (arbre complet, nombreux
     daemons) — pas de chevauchement illisible aux deux extrêmes.
  8. Recharger l'application → la carte reflète immédiatement l'état réel
     sauvegardé, sans rejouer les animations d'apparition d'un contenu déjà
     acquis avant la fermeture.
  9. `prefers-reduced-motion` respecté : les transitions/animations de la
     carte sont supprimées ou réduites au minimum pour les joueurs qui le
     demandent (convention déjà suivie par tout le builder).

- **Hors périmètre v1 (à noter explicitement pour cadrer l'effort) :**
  - Pas de disposition libre/zoom/pan configurable par le joueur : layout
    fixe ou semi-fixe pour cette 1ʳᵉ version.
  - Le **Marché crypto** (ticker + conversion, geste actif du joueur) reste
    un panneau séparé (`CryptoPanel`) — la branche crypto de l'arbre est
    représentée sur la carte, mais le geste de conversion n'y est pas
    absorbé.
  - Les **Accélérateurs** (activité chronométrée) restent un panneau séparé
    (`AcceleratorPanel`) — pas un état statique représentable sur une carte
    de progression.
  - L'action de renaissance elle-même (bouton, confirmation) reste dans
    `PrestigePanel` ; seule sa **trace** (marqueur de génération) apparaît
    sur la carte.
  - Le **REGISTRE** des jalons (US-028) reste un panneau séparé (consultation
    à plat, pas une donnée topologique).
  - Pas de carte multi-joueurs/clanique (Phase B, hors sujet ici).

## 2. Cadrage technique  _(porte de validation)_

- **Constat de départ (rassurant sur l'effort)** : tout l'état « qui est
  débloqué / possédé / disponible » existe **déjà** et est **déjà pur et
  testé** — `isUnlocked`/`unlockedGenerators`/`nextLockedGenerator`
  (`game/builder.ts`), `nodeState`/`visibleNodes`/`isConditionMet`
  (`game/unlockTree.ts`). Cette US n'ajoute **aucune règle de jeu nouvelle** :
  c'est une **couche de présentation** qui réutilise ces sélecteurs pour
  nourrir une carte au lieu d'une liste. Le gros de l'effort est donc bien
  réel mais **concentré côté rendu** (layout, SVG, interactions, CSS), pas
  côté logique de jeu — ce qui borne le risque.

- **Décision structurante — pas de nouvelle dépendance, layout fixe
  hand-authored** : le graphe est petit et croît lentement (13 nœuds
  aujourd'hui : 4 daemons + 9 nœuds d'arbre, +1-2 par future US de contenu).
  Plutôt qu'une librairie de graphe/force-layout (dépendance nouvelle,
  positionnement non déterministe — contraire à AC7 « carte lisible »), le
  layout est un **catalogue de positions `{x, y}` par `id`, écrit à la main**
  (même esprit que les coûts placeholder de `GENERATORS`/`UNLOCK_NODES`,
  affinables en recette). Rendu en **SVG inline** pour les arêtes (`<line>`/
  `<path>`, sans dépendance) + nœuds en `<div>` positionnés en absolu
  au-dessus (réutilise le composant `Icon` existant, pas de rendu SVG de
  glyphe à gérer). Cohérent avec l'existant : `motion` (déjà une dépendance)
  peut piloter les transitions d'apparition (AC3/AC4), pas de nouvelle lib
  d'animation.

- **Le graphe est déjà implicite dans les catalogues existants** : la chaîne
  `unlockAfter` des daemons, la chaîne `requiresNode` de chaque branche de
  l'arbre, **et** les liens transverses déjà présents via `requiresGenerator`
  (`cryo-cache`/`ghost-protocol` → `wraith`, `dark-pool` → `oracle`) relient
  **déjà** la couche daemons et la couche arbre en un seul graphe connexe —
  exactement ce qu'il faut pour « une carte du Réseau dans son ensemble »
  (validé avec le PO). Un seul lien purement visuel/narratif est ajouté sans
  dépendance de jeu réelle : `oracle → overclock`, pour ancrer la racine de
  la branche `data` sur la chaîne des daemons (`overclock` n'a aujourd'hui
  aucune condition dans le catalogue, seulement un coût).

- **Fichiers impactés :**
  - **Nouveau** `src/features/builder/networkMap.ts` — module pur de
    présentation (pas de Dexie/React) : catalogue des positions par `id`
    (daemons + nœuds d'arbre), liste des arêtes (dérivée de `unlockAfter`/
    `requiresNode`/`requiresGenerator` + le lien narratif `oracle→overclock`),
    et une fonction `buildMapNodes(state)` qui **compose** les sélecteurs
    existants (`unlockTree.ts`/`builder.ts`) en une liste de vue-modèles de
    nœuds (`id`, `kind: 'generator' | 'tree'`, état, position). Aucune
    nouvelle règle : uniquement de l'assemblage + du layout.
  - **Nouveau** `src/features/builder/networkMap.test.ts` — tests
    d'intégrité des données (chaque `id` de `GENERATORS`/`UNLOCK_NODES` a une
    position, chaque arête référence des `id` valides, aucune position
    dupliquée) ; pas de re-test des règles de déblocage (déjà couvertes).
  - **Nouveau** `src/features/builder/NetworkMap.tsx` — composant
    orchestrateur : rend le SVG des arêtes + les nœuds positionnés, gère la
    sélection d'un nœud (état local `selectedId`).
  - **Nouveau** `src/features/builder/NetworkMapNode.tsx` — visuel d'un nœud
    (badge icône + halo selon l'état : scellé/verrouillé/disponible/acquis),
    commun aux daemons et aux nœuds d'arbre.
  - **Nouveau** `src/features/builder/NetworkMapDetail.tsx` — panneau de
    détail/achat du nœud sélectionné (remplace les boutons Compiler/Améliorer/
    Débloquer aujourd'hui embarqués dans chaque carte de liste) ; couvre AC6.
  - **Retirés** (remplacés, plus utilisés) : `DaemonCard.tsx`, `TeaserCard.tsx`,
    `UnlockNodeCard.tsx`, `HiddenNodeCard.tsx`, `UnlockTreeSection.tsx` — et
    le CSS associé dans `builder.css` nettoyé (pas de code mort).
  - `BuilderView.tsx` — retire la liste de daemons + les 2 appels à
    `UnlockTreeSection`, insère `<NetworkMap />`. **Question de layout
    ouverte** : la carte a probablement besoin de plus de largeur que
    l'actuelle colonne `builder__side` (760px max) — tranché à l'étape
    design (maquette), pas ici.
  - `builder.css` (ou nouveau `networkMap.css` co-localisé) — nouvelle
    section CSS : positionnement des nœuds, styles d'arêtes (actif/inactif),
    animations de reveal/déblocage/renaissance, `prefers-reduced-motion`.
  - `src/i18n/locales/{fr,en}.json` — réutilise les clés existantes
    `builder.generators.*`/`builder.unlockTree.*` (noms/effets inchangés) ;
    nouvelles clés uniquement pour le chrome de la carte (titre, légende,
    panneau de détail).

- **Logique :**
  - `buildMapNodes(state)` : pour chaque daemon du catalogue, calcule son état
    via `isUnlocked`/`owned`/`level` (existant) ; pour chaque nœud d'arbre,
    son état via `nodeState`/`visibleNodes` (existant, gère déjà le masquage
    des nœuds cachés — AC4 vient **gratuitement**). Chaque vue-modèle porte sa
    position (lookup dans le catalogue de layout) et la liste de ses arêtes
    entrantes/sortantes (pour le rendu SVG).
  - Sélection/achat : `NetworkMapDetail` appelle directement les actions déjà
    existantes du store (`buyGenerator`/`buyUpgrade`/`buyNode`) selon le
    `kind` du nœud sélectionné — aucune nouvelle action de store.
  - Renaissance (AC5) : un marqueur de génération lit simplement
    `prestigeCount` (déjà persisté, US-024) — élément additif autour de la
    carte, pas un nœud du graphe.
  - Transitions (AC3/AC4/AC8) : au montage, l'état courant s'affiche
    **directement** sans rejouer d'animation (comme `HiddenNodeCard`
    aujourd'hui, qui ne « reveal » que sur une transition `visible: false →
    true` détectée par `useEffect`, pas au premier rendu) — même pattern
    repris pour chaque nœud de la carte.

- **Impacts modèle de données : aucun.** Ni nouveau champ `BuilderState`, ni
  migration Dexie — la carte est une lecture pure de l'état déjà persisté
  (`generators`/`upgrades`/`unlockedNodes`/`data`/`crypto`/`prestigeCount`)
  combiné à un catalogue de layout **statique** (non persisté, comme
  `GENERATORS`/`UNLOCK_NODES`).

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans concernés :** `/network` (`BuilderView.tsx`) — refonte majeure.
  Remplace entièrement la liste de daemons (`builder__daemon-list`) et les 2
  arbres en lignes (`UnlockTreeSection` × 2, branches `data`/`crypto`) par une
  **carte unique**. Questions à trancher par la maquette :
  1. **Emplacement/largeur** : la carte reste-t-elle dans la colonne `side`
     actuelle (760px max) ou devient-elle une zone à part, plus large
     (probable vu la densité visée) ?
  2. **Interaction de sélection** : clic sur un nœud → quel mécanisme pour le
     panneau de détail/achat (`NetworkMapDetail`) — popover ancré au nœud,
     panneau latéral fixe, modale ?
  3. **Marqueur de renaissance** (AC5) : quelle forme visuelle (anneaux
     concentriques autour de la carte, badge de génération, autre) ?
  4. **Style des arêtes/nœuds** : cohérence avec le langage visuel NIGHTWIRE
     déjà établi (halos par état : mint acquis, magenta/ambre selon devise,
     scellé pour les nœuds cachés — repris du système actuel).
  Impact UI **très significatif** (remplace 5 composants existants par une
  refonte complète de la zone principale de `/network`) → étape design
  **indispensable** avant le plan d'implémentation.
- **Maquette :** reçue (`C:\Users\flori\Downloads\network-map`) — analysée en
  profondeur avec le PO avant validation. Décisions actées :
  - **Langage visuel adopté tel quel** : nœuds hexagonaux, halo par état
    (mint acquis / couleur-devise disponible avec halo pulsé / acier scellé /
    assombri verrouillé), arêtes typées (mint plein+lueur acquis→acquis ;
    tirets « qui coulent » dans la couleur de devise vers un nœud disponible ;
    pointillé acier verrouillé ; **pointillé cyan** pour les liens transverses
    daemon→nœud) ; reveal glitch des nœuds cachés (repris de `HiddenNodeCard`
    A3) ; HUD « N / 13 nœuds actifs ».
  - **4 recommandations de la maquette acceptées** : (1) la carte casse la
    colonne 760px en **bande large (~1040px)**, tout le reste de `/network`
    reste dans la colonne centrée ; (2) **popover ancré au nœud** (desktop) /
    sheet bas (mobile) pour le détail/achat ; (3) **anneaux orbitaux rouges +
    badge « GÉN. 0X »** autour de la carte pour la renaissance ; (4) **état par
    le trait** pour les arêtes.
  - **Écart corrigé — données de nœuds** : la maquette est un mockup dont
    plusieurs nœuds sont inventés (`swarm`/VECTEUR-SWARM, `ledger`/LEDGER-TAP,
    `vault`/COLD-VAULT) et à qui il manque 3 vrais nœuds (`breach-market`/
    RELAIS DE MARCHÉ, `rate-floor`/PLANCHER DE COURS, `ghost-laundry`/LAVERIE
    FANTÔME). **Source de vérité = `game/builder.ts` + `game/unlockTree.ts` +
    i18n existant** : on branche les 13 **vrais** nœuds (4 daemons + 5 data +
    4 crypto), on réutilise les chaînes i18n d'effet/nom existantes (aucune
    nouvelle copie de nœud).
  - **Écart corrigé — structure du graphe** (arbitrage PO) : on abandonne les
    deux ailes symétriques de la maquette au profit de la **vraie chaîne de
    dépendances** : daemons (`scraper→sifter→wraith→oracle`) → nœuds data →
    **RELAIS DE MARCHÉ** (nœud-passerelle mis en valeur) → nœuds crypto ; liens
    transverses réels uniquement (`cryo-cache`↔wraith, `ghost-protocol`↔wraith,
    `dark-pool`↔oracle). Les positions sont **réauthored** en conséquence.
  - **Gap de la maquette relevé** : son `NodeDetail` est taillé pour un nœud
    d'arbre (un seul bouton « Débloquer »). Un **daemon** a deux gestes
    (Compiler une unité + Améliorer par niveau) et un compte possédé — le
    popover devra traiter le cas daemon distinctement (AC6, aucune
    fonctionnalité perdue).
  - **Ajustements de cohérence** : maths renaissance calculées depuis
    `prestige.ts` (`1,5^n` → GÉN. 03 = ×3,375, pas ×2,25 comme le texte de la
    maquette) ; icône `orbit` (badge génération) à ajouter au registre DS.

## 4. Plan d'implémentation  _(porte de validation)_

> Rappel : **zéro règle de jeu nouvelle, zéro migration Dexie**. Tout l'état
> vient des sélecteurs purs existants ; l'US est une couche de présentation.

1. **Module pur `src/features/builder/networkMap.ts`** :
   - `MAP_LAYOUT` : position `{x, y}` par `id` des 13 nœuds (espace de coord.
     fixe, ex. 1040×620), **authored pour refléter la vraie chaîne** (daemons
     en épine basse → data → RELAIS DE MARCHÉ passerelle → crypto). Valeurs
     placeholder, **affinées en recette live** (comme les coûts des catalogues).
   - `MAP_EDGES` : arêtes dérivées des vraies dépendances — `unlockAfter`
     (daemons), `requiresNode` (arbre) pour les arêtes de branche ;
     `requiresGenerator` pour les liens transverses. Plus **quelques arêtes
     purement visuelles** documentées pour rattacher au graphe les nœuds sans
     dépendance dure (`overclock`/`cryo-cache` n'ont pas de `requiresNode`) —
     aucune incidence de jeu.
   - `buildMapNodes(state)` : compose `isUnlocked`/`unlockedGenerators`/`owned`/
     `level` (`builder.ts`) et `nodeState`/`visibleNodes` (`unlockTree.ts`) en
     vue-modèles `{ id, kind: 'generator'|'tree', currency, state, x, y }`.
     `state` ∈ `acquired|available|locked|sealed`. Le masquage des cachés vient
     **gratuitement** de `visibleNodes` (AC4).
   - `mapEdgeState(edge, nodesById)` : état visuel pur d'une arête
     (acquis→acquis / alimente-un-dispo / verrouillé / transverse), pour le
     rendu SVG.
2. **Tests `src/features/builder/networkMap.test.ts`** : intégrité des données
   — chaque `id` de `GENERATORS`/`UNLOCK_NODES` a une position ; chaque arête
   référence des `id` valides ; aucune position dupliquée ; un nœud caché non
   révélé est `sealed`. Pas de re-test des règles de déblocage (déjà couvertes
   par `builder.test`/`unlockTree.test`).
3. **i18n FR/EN** — nouvelles clés `builder.map.*` **uniquement pour le chrome**
   de la carte (titre « CARTE DU RÉSEAU », `nœuds actifs`, légende, labels
   d'état du popover, « Débloquer »/« Débloqué »/« Verrouillé », badge
   « Génération », hint « Clique un nœud »). Noms/effets/coûts des nœuds :
   **réutilisent** `builder.generators.*` / `builder.unlockTree.*` existants.
4. **`Icon.tsx`** — ajouter `orbit` (badge génération) + `mouse-pointer-click`
   (hint) au registre statique. Les icônes des nœuds sont déjà toutes
   enregistrées (vrais catalogues).
5. **`NetworkMapNode.tsx`** (nouveau) — visuel d'un nœud : hexagone, halo/anneau
   selon `state`, pastille « acquis », halo pulsé « disponible », glitch de
   reveal joué **uniquement sur transition** `sealed→visible` (via `useEffect`,
   même pattern que `HiddenNodeCard` — pas au 1ᵉʳ rendu, AC8) ; petit compteur
   `×N` pour un daemon possédé ; `prefers-reduced-motion` respecté.
6. **`NetworkMapDetail.tsx`** (nouveau) — popover ancré (pointe vers le nœud,
   flip gauche/droite selon `x`). **Deux formes** selon `kind` : nœud d'arbre =
   un bouton « Débloquer » (coût dans la devise) ; **daemon = Compiler (achat
   unité, coût croissant) + Améliorer (niveau) + compte possédé** — appelle
   `buyNode` / `buyGenerator` / `buyUpgrade` du store (actions existantes,
   aucune nouvelle). Couvre AC6.
7. **`RenaissanceRings` + `GenBadge`** (dans un fichier map ou co-localisés) —
   anneaux orbitaux rouges (0 = anneau dormant pointillé ; N = N anneaux
   tournants, plafonnés visuellement) + badge « GÉN. 0X », lisent
   `prestigeCount` ; le bonus affiché vient de `prestigeMultiplier` (`prestige.ts`).
8. **`NetworkMap.tsx`** (nouveau, orchestrateur) — fond (grille + halos de zone),
   `<svg>` inline des arêtes (via `mapEdgeState`), nœuds positionnés en %,
   HUD « N / 13 », anneaux + badge, état local `selectedId`, rend
   `NetworkMapDetail` pour le nœud sélectionné (fermeture au clic ailleurs).
9. **`networkMap.css`** (co-localisé) — positionnement, styles d'arêtes/nœuds,
   animations (`edge-flow`, `node-pulse`, `orbit`, reveal-glitch), bloc
   `prefers-reduced-motion`, et la **bande large** : largeur mini + `overflow-x`
   scroll sous un seuil pour préserver la lisibilité sur petit écran (AC7).
10. **`BuilderView.tsx` + layout** — retirer la liste de daemons, le teaser, les
    2 `UnlockTreeSection` et leurs en-têtes ; insérer `<NetworkMap />` dans une
    **bande pleine largeur** qui casse la colonne `builder__side` (760px),
    entre « production réseau » et le panneau Renaissance. Conserver tous les
    autres panneaux (HACK, accélérateurs, crypto, prestige, registre).
11. **Suppression du remplacé** — retirer `DaemonCard.tsx`, `TeaserCard.tsx`,
    `UnlockNodeCard.tsx`, `HiddenNodeCard.tsx`, `UnlockTreeSection.tsx`, leur CSS
    dans `builder.css`, et leurs exports éventuels dans `builder/index.ts`.
    Vérifier l'absence d'autres consommateurs avant suppression (pas de code
    mort, périmètre propre).
12. **Vérifs vertes** : `typecheck` + `lint` + `build` + `test`.
13. **Vérification visuelle navigateur** (Playwright headless) : rendu des 3
    états de remplissage, **calage fin des positions** avec le PO en live
    (comme les visuels précédents), popover/ancrage, reveal, responsive/scroll,
    `reduced-motion`. Ajustements de coordonnées attendus ici.
14. **Recette** (skill `recette`) contre les 9 critères d'acceptation §1.
