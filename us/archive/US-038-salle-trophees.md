# US-038 — Socle Salle des trophées

- **MVP :** A5 (Vitrine & prestige de collection, décision #045)
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-038-salle-trophees

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** un **écran dédié « Salle des trophées »** où le joueur **compose
  lui-même** un présentoir mettant en scène ses **pièces maîtresses**. Fondation
  (squelette vertical) de la Phase A5 : on livre un présentoir **jouable de bout en
  bout** avec les **cosmétiques** possédés comme premier contenu épinglable ; les
  accomplissements (US-039) et les sets (US-040) viendront ensuite s'y brancher.

- **Pour qui :** le joueur solo, à qui A3 (collection) et A4 (corruption) ont donné
  de quoi collectionner mais **aucun lieu pour l'exposer**. C'est sa vitrine de
  fierté — d'abord pour lui, et le socle sur lequel la Phase B (social) donnera un
  public.

- **Hypothèses fonctionnelles :**

  - **H1 — Écran dédié.** Nouvelle destination « Salle des trophées » accessible
    depuis la navigation principale, **distincte** du Profil (US-032, carte d'ID) et
    de la Garde-robe (US-031+, gérer/équiper). Un CTA depuis le Profil y renvoie
    (comme le CTA Profil → Garde-robe existant).

  - **H2 — Le présentoir.** Une grille d'**emplacements de trophée** où le joueur
    épingle des trophées. En V1, le contenu épinglable = les **cosmétiques
    possédés** (thème / avatar / bannière / titre, **toutes sources** :
    départ / jalon / caisse / corruption).

  - **H3 — Curation manuelle.** Le joueur **épingle / retire / remplace** librement
    le trophée d'un emplacement. Le présentoir est **agnostique au type** : on peut
    y exposer plusieurs cosmétiques du même type (ex. 3 thèmes gagnés), **contrairement
    à l'équipement** qui reste un-par-type. Épingler est **indépendant d'équiper**
    (on expose une pièce possédée, équipée ou non).

  - **H4 — Emplacements qui se gagnent.** Le présentoir démarre avec un **petit
    nombre** d'emplacements et **s'agrandit avec la progression** — la vitrine
    devient un objectif, pas un décor passif. V1 livre au moins le **1er palier de
    déblocage** fonctionnel, avec un feedback dédié à l'obtention.

  - **H5 — Mise en scène des pièces maîtresses.** Le rendu **valorise la rareté
    gagnée** (réutilise la rampe `--rarity-*` / `RarityBadge` / `rarityStyle` d'A3) ;
    un emplacement vide **invite explicitement** à épingler. La rareté est le
    langage de prestige, pas le nombre.

  - **H6 — Persistance & survie.** La composition du présentoir et les emplacements
    débloqués **survivent** au rechargement **et à la renaissance** (les cosmétiques
    restent possédés ; les épinglages restent valides tant que la pièce est possédée).

- **Invariant (garde-fous #043, non négociables) :** pur statut — **épingler ne
  donne aucun avantage fonctionnel** (ni XP, ni crédits, ni production) ; la richesse
  exposée = **complétion / rareté gagnée, jamais solde ni quantité** ; tout objet de
  statut est **non échangeable par conception** (champ `tradeable = false` posé dès
  cette US, avant toute production de contenu — taxonomie préventive #043) ;
  **gagné jamais acheté** ; local-first, sans backend ; réversible (retirer un
  trophée n'a aucune conséquence).

- **Arbitrages tranchés (PO, 24/07/2026) :**
  1. **Point d'entrée** → **entrée de nav dédiée + CTA depuis le Profil** (patron
     US-032 → Garde-robe).
  2. **Sur quoi les emplacements se gagnent** → **indexés sur les jalons atteints
     (US-028)** — système existant, append-only, survit à la renaissance, narratif
     cohérent (« accomplir débloque des vitrines »).
  3. **Nombre de départ + 1er palier** → **3 emplacements au départ, +1 au 1er
     palier** ; valeurs à régler en recette.
  4. **Épingler plusieurs fois le même type** → **oui** (présentoir agnostique au
     type — exposer les pièces gagnées non équipées).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Depuis la nav, ouvrir la **Salle des trophées** → l'écran s'affiche avec le
     présentoir (emplacements débloqués, dont vides).
  2. Épingler un cosmétique **possédé** dans un emplacement vide → il apparaît dans
     l'emplacement, mis en scène avec sa **rareté** (badge / traitement visuel).
  3. Retirer un trophée épinglé → l'emplacement redevient vide (invite à épingler).
     Remplacer → l'emplacement affiche le nouveau trophée.
  4. Un cosmétique **non possédé** n'est **pas épinglable** (absent du sélecteur ou
     clairement indisponible).
  5. Épingler / retirer un trophée **n'a aucun effet mécanique** : XP, crédits,
     production et **équipement** restent inchangés (épingler ≠ équiper).
  6. Un même type de cosmétique peut occuper **plusieurs emplacements** (ex. deux
     thèmes distincts exposés simultanément).
  7. À l'atteinte du **1er palier de progression**, un **nouvel emplacement** devient
     disponible, avec un **feedback** de déblocage.
  8. **Recharger** l'app → composition du présentoir et emplacements débloqués
     **conservés à l'identique**.
  9. Après une **renaissance** → le présentoir et ses emplacements **survivent**
     (cosmétiques toujours possédés, épinglages conservés).
  10. **Aucune surface** n'expose une **quantité brute** (« X objets ») comme mesure
      de richesse ; la valeur mise en avant = **rareté / pièces gagnées**.
  11. `prefers-reduced-motion` respecté sur toute animation de mise en scène /
      déblocage.

## 2. Cadrage technique  _(porte de validation)_

Principe directeur : rester **local-first, purement esthétique, découplé** (patron
`cosmetics.ts` — aucune valeur de jeu, n'importe rien de `builder`/`prestige`). Le
présentoir est de la **présentation** au-dessus de données existantes ; la seule
donnée neuve persistée est la composition du présentoir.

- **Décision 1 — Abstraction « trophée épinglable » (extensible dès maintenant).**
  Nouveau type discriminé `ShowcasePin` dans un module pur **`game/showcase.ts`** :
  en V1 un seul variant `{ kind: 'cosmetic'; ref: string }` (`ref` = `id` du
  catalogue `COSMETICS`). Le discriminant `kind` est posé **maintenant** pour que
  US-039 ajoute `'milestone'` / `'prestige'` / `'corruption'` **sans migration de
  forme**. Un présentoir = `ShowcasePin[]` (l'index dans le tableau = l'emplacement).

- **Décision 2 — Emplacements DÉRIVÉS des jalons (zéro champ redondant).** Le nombre
  d'emplacements débloqués est une **fonction pure** `unlockedSlots(achievedCount)`
  (patron `prestigeThreshold` dérivé de `prestigeCount` — pas de champ persisté). Le
  singleton `achievedMilestones` (déjà sur `BuilderState`, append-only, survit à la
  renaissance) reste la **source de vérité unique**. `SHOWCASE_SLOT_CONFIG` :
  **base 3**, **+1 par palier de jalons** (courbe à régler en recette, comme
  `SURCHARGE_CONFIG`). L'écran lit les **deux** stores (comme `ProfileView`), le
  store cosmétique **n'a jamais besoin** de connaître les jalons → découplage
  préservé. **Raffiné par la maquette** : le module expose aussi `slotProgress(count)
  → { open, nextAt, achieved }` (barre d'en-tête « prochain à N jalons ») et
  `topExposedRarity(showcase)` (tuile « pièce maîtresse exposée » = rareté max
  épinglée) — deux dérivés purs, cohérents #043 (rareté, jamais quantité).

- **Décision 3 — Taxonomie `tradeable: false` (#043, préventif).** Le modèle des
  objets de statut porte un champ **littéral `tradeable: false`** (le type interdit
  `true`, jamais échangeable par construction). Ajouté à l'interface `Cosmetic`
  (`game/cosmetics.ts`) et **rempli à la construction du catalogue** (`COSMETICS`
  gelé via une passe qui pose `tradeable: false`) pour **ne pas dupliquer** sur les
  24 entrées. Le futur type de trophée hétérogène (US-039) héritera de la même
  contrainte. **Non persisté** (donnée de catalogue) → aucune migration pour lui.

- **Décision 4 — Opérations pures + validation.** `game/showcase.ts` expose
  `pin(showcase, slot, pin)` / `unpin(showcase, slot)` / `reconcile(showcase, owned,
  slotCount)`. Règles : un `ref` doit être **possédé** (sinon rejet — couvre C4) ;
  **unicité par `ref`** (on n'épingle pas deux fois la même pièce) mais **plusieurs
  pièces du même `type` autorisées** (H3/C6) ; un slot au-delà des emplacements
  débloqués est rejeté ; `reconcile` purge les pins orphelins (robustesse — `owned`
  étant append-only, cas rare). **No-op par référence** (patron `equip`).

- **Décision 5 — Persistance (migration Dexie v24).** Nouveau champ
  **`showcase: ShowcasePin[]`** sur `CosmeticsState` (singleton d'identité → **survit
  à la renaissance** par construction). **Migration v24** : schéma v23 recopié +
  rétro-remplissage `showcase = []` (patron des migrations de champ v11→v23) ; aucune
  reconciliation (présentoir vide au départ). Seed (`db/seed.ts`) + valeur initiale
  du store + fallback `load()` à `[]`.

- **Décision 6 — Store `useCosmeticsStore`.** +champ `showcase` ; actions
  `pinTrophy(slot, pin)` / `unpinTrophy(slot)` (délèguent à `game/showcase.ts`,
  persistance immédiate, patron `equip`/`grant`) ; `showcase` ajouté à `persist()` et
  au `load()`. **Jamais** de lien vers `equipped` (garantit C5 : épingler ≠ équiper).

- **Décision 7 — Feedback de déblocage d'emplacement (C7).** Émis là où les jalons
  sont vérifiés (`useBuilderStore`, après `checkMilestones`) : si
  `unlockedSlots(avant) < unlockedSlots(après)`, pousser un toast via la **file**
  `useFeedbackStore` (patron `milestones` — file, pas singleton). Silencieux au
  `load()`/backfill (comme les jalons).

- **Décision 8 — UI, nouveau dossier `features/showcase/`.**
  `ShowcaseView.tsx` (écran, route `/showcase`) ; `ShowcaseGrid` + `TrophySlot`
  (vide → invite à épingler ; rempli → trophée mis en scène ; verrouillé → cadenas +
  indice « atteins N jalons ») ; `TrophyPicker` (sélecteur **modal** des cosmétiques
  **possédés** non déjà épinglés). **Réutilise nos composants** (RAPPEL PO) plutôt que
  de réimplémenter les primitives de la maquette : `RarityBadge`/`RankPips`/
  `rarityStyle` (couleur de rareté), `previews.tsx` (aperçus par type), `CosmeticCard`
  (cartes du sélecteur), `Card hud brackets` (cadres + scanlines), patron
  `CrateOpeningModal` (ossature du modal), `Button`/`Icon`/`ProgressBar`. **Slot #1
  featured** en **double largeur** (maquette validée, position fixe non configurable).
  `showcase.css` (keyframes de mise en scène/déblocage/légendaire **sous garde
  `prefers-reduced-motion`** — C11) ; actions Remplacer/Retirer **accessibles au
  clavier** (focus-within, pas seulement `:hover`).

- **Décision 9 — Nav & entrée.** `router.tsx` +`{ path: 'showcase' }` ; `NavRail.tsx`
  +entrée `ROUTES` `/showcase` (icône à ajouter au registre `Icon.tsx`, ex. `trophy`/
  `award`) ; **CTA depuis `ProfileView`** vers `/showcase` (patron du CTA
  « Personnaliser » → `/wardrobe`). i18n FR/EN bloc `showcase.*` + `nav.showcase`/
  `nav.showcaseCode`.

- **Tests.** `game/showcase.test.ts` : `unlockedSlots` (base, palier, monotonie),
  `pin`/`unpin` (possédé requis, unicité par `ref`, multi-même-type, slot hors
  bornes), `reconcile`. Garantit la logique pure sans React/Dexie.

- **Impacts modèle de données (résumé) :**
  - `CosmeticsState.showcase: ShowcasePin[]` — **nouveau**, **migration Dexie v24**
    (rétro `[]`), survit à la renaissance.
  - `Cosmetic.tradeable: false` — **nouveau** (taxonomie #043), **non persisté**
    (catalogue), aucune migration.
  - `BuilderState` — **inchangé** (les emplacements dérivent de `achievedMilestones`
    existant).

- **Hors périmètre (reporté).** Accomplissements épinglables + provenance = **US-039**
  (le type `ShowcasePin` est posé extensible dès ici) ; sets & complétion = **US-040**.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Impact UI significatif : OUI** (confirmé). Cadrages fonctionnel + technique validés
PO le 24/07/2026 → **étape design : maquette Claude Design attendue** (fournie par le
PO). Nom de maquette suggéré : **`showcase`**.

- **Surfaces à maquetter (4) :**
  1. **Écran Salle des trophées** — le présentoir : grille d'**emplacements** dans
     leurs 3 états (**vide** = invite à épingler · **rempli** = trophée mis en scène
     avec sa **rareté** [rampe `--rarity-*`/`RarityBadge`/aperçu par type d'US-031] ·
     **verrouillé** = cadenas + indice « atteins N jalons »). En-tête HUD, indication
     du nombre d'emplacements débloqués (**sans quantité brute d'objets** — C10).
  2. **`TrophyPicker`** — sélecteur (modal ou panneau) pour choisir le cosmétique
     **possédé** à épingler dans un emplacement (liste filtrée : possédés, non déjà
     épinglés ; groupée/triée par type & rareté). Réutilise `CosmeticCard`/aperçus.
  3. **Feedback de déblocage d'emplacement** — toast « nouvel emplacement de vitrine »
     (patron file `MilestoneToast`).
  4. **CTA depuis le Profil** — bouton d'entrée vers `/showcase` inséré dans le header
     de `ProfileView` (à côté de « Personnaliser », patron existant).

- **Contraintes de design (rappel invariant/#043) :** richesse = rareté/complétion
  gagnée, **jamais quantité** ; toute animation sous garde `prefers-reduced-motion`
  (C11) ; réutiliser le DS acquis (A3) plutôt que d'inventer.

- **Maquette `trophy-room` reçue + analysée + validée PO le 25/07/2026** (fournie
  hors-dépôt, `Downloads/trophy-room`, **non versionnée** — patron #007). Très fidèle
  au DS réel et **conforme au garde-fou #043** (la rareté porte la couleur, **aucun
  compteur d'objets**, progression lue en jalons). Le prototype **réimplémente ses
  primitives** (`RarityBadge`/`RankPips`/`Preview`/`Brackets`/`Scan`/chips) pour
  tourner en isolation → à l'implémentation, **mappées sur nos vrais composants**
  (`features/cosmetics/` : `RarityBadge`, `RankPips`, `rarityStyle`, `previews.tsx`,
  `CosmeticCard` ; DS core : `Card hud brackets`, `Button`, `Icon`, `ProgressBar` ;
  patrons `CrateOpeningModal` / `CosmeticUnlockToast`).

  **3 écarts tranchés PO :** (1) **slot #1 featured** en double largeur adopté
  (position fixe) ; (2) sélecteur = **modal superposé** (patron `CrateOpeningModal`) ;
  (3) toast = **deep-link** vers le sélecteur sur le nouvel emplacement. **Écartés :**
  contenu de démo (15 objets `OWNED`, thème « spectre ») → source de vérité =
  catalogue réel + i18n ; clés de rareté FR → EN du code.

## 4. Plan d'implémentation  _(porte de validation)_

Ordre **bas → haut** (patron US-031/037) : logique pure & données d'abord, UI
ensuite ; chaque étape laisse l'app verte (typecheck + lint + tests).

**Couche pure & modèle de données**
1. **`game/showcase.ts`** (module pur) : type discriminé `ShowcasePin`
   (`{ kind: 'cosmetic'; ref: string }`, `kind` extensible US-039) ;
   `SHOWCASE_SLOT_CONFIG` (base 3, +1 par palier de jalons) ; `unlockedSlots(count)`,
   `slotProgress(count) → { open, nextAt, achieved }`, `topExposedRarity(showcase)` ;
   `pin(showcase, slot, pin)` / `unpin(showcase, slot)` / `reconcile(showcase, owned,
   slotCount)` (règles : `ref` possédé, unicité par `ref`, multi-même-type, slot
   borné). N'importe rien de `builder`/`prestige`.
2. **Tests `game/showcase.test.ts`** : courbe/monotonie des slots, `slotProgress`,
   `topExposedRarity`, `pin`/`unpin` (possédé requis, unicité `ref`, multi-type, hors
   bornes), `reconcile`.
3. **Taxonomie `tradeable: false` (#043)** : champ **littéral** `tradeable: false`
   sur l'interface `Cosmetic` + passe de gel à la construction du catalogue
   (`COSMETICS`/`COSMETIC_BY_ID`) — sans dupliquer sur les 24 entrées. Test : aucun
   cosmétique n'est `tradeable`.
4. **Persistance** : `CosmeticsState.showcase: ShowcasePin[]` (`db/types.ts`) +
   **migration Dexie v24** (schéma v23 recopié, rétro `showcase = []`) + seed
   (`db/seed.ts`) + fallback `load()` à `[]`.
5. **Store `useCosmeticsStore`** : +état `showcase` ; `pinTrophy(slot, pin)` /
   `unpinTrophy(slot)` (délèguent à `game/showcase.ts`, persistance immédiate) ;
   `showcase` ajouté à `persist()` et au `load()`. **Jamais** de lien vers `equipped`.

**Feedback de déblocage**
6. **`useFeedbackStore`** : file de toasts « emplacement débloqué » (patron
   `milestones` — file, pas singleton).
7. **`useBuilderStore`** : après `checkMilestones`, si `unlockedSlots(avant) <
   unlockedSlots(après)`, pousser le toast. Silencieux au `load()`/backfill.

**UI — `features/showcase/`**
8. **Icônes** : recenser + ajouter au registre `Icon.tsx` celles manquantes
   (`trophy`, `pin`, `lock`, `plus`, `repeat`, `info`, `award`… — vérifier l'existant).
9. **`TrophySlot`** (3 états vide/rempli/verrouillé + variante **featured** double) :
   réutilise `Card hud brackets`, `RarityBadge`/`RankPips`, `previews.tsx`. Actions
   Remplacer/Retirer accessibles au clavier (focus-within).
10. **`TrophyPicker`** (modal, patron `CrateOpeningModal`) : cosmétiques **possédés
    non épinglés**, groupés par rareté décroissante + filtre par type ; réutilise
    `CosmeticCard`.
11. **`ShowcaseGrid`** + en-tête (tuiles **pièce maîtresse exposée** [`topExposedRarity`]
    + **progression jalons** [`slotProgress`, via `ProgressBar`]) + note de règle #043.
12. **`SlotUnlockToast`** (patron `CosmeticUnlockToast`) + **deep-link** : bouton
    « Épingler » → ouvre le `TrophyPicker` sur le nouvel emplacement.
13. **`ShowcaseView`** (écran) : assemble la grille + le picker + le toast ; lit
    `useCosmeticsStore` (showcase/owned/equipped) + `useBuilderStore`
    (achievedMilestones pour les slots).
14. **`showcase.css`** : keyframes mise en scène / légendaire / entrée toast **sous
    garde `prefers-reduced-motion`**.
15. **Nav & entrée** : route `/showcase` (`router.tsx`) + entrée `NavRail` (icône
    `trophy`) + **CTA `ProfileView`** (`<Button secondary>` → `/showcase`, patron du
    CTA « Personnaliser »).
16. **i18n FR/EN** : bloc `showcase.*` (titre, kicker, états d'emplacement, indice de
    déblocage, sélecteur, toast, note de règle) + `nav.showcase`/`nav.showcaseCode`.

**Vérification**
17. Typecheck + lint + build/PWA + tests **verts**, puis **recette PO** (11 critères
    §1 + scripts console d'injection d'état : épinglage, déblocage de palier,
    persistance, survie renaissance).
