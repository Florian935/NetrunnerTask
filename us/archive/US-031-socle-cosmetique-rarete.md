# US-031 — Socle cosmétique & rareté

- **MVP :** A3 (Phase A3 — Identité & Collection, décision #035)
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-031-socle-cosmetique-rarete

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  La **fondation** du système cosmétique de la Phase A3. Introduit la notion de
  **cosmétique** — un objet **purement esthétique**, sans aucun effet de jeu —
  organisé par **type** et par **rareté**, que le joueur **possède** et **équipe**.

  Cette tranche livre le **socle générique** que consommeront les US suivantes :
  1. un **catalogue** de cosmétiques de départ, typés et classés par rareté ;
  2. une **rampe de rareté** visuelle (badge + traitement cohérent) ;
  3. un écran **Garde-robe** pour voir ce qu'on possède et **équiper** ;
  4. l'**effet live** de l'équipement d'un **thème** : re-skin immédiat du HUD.

  **Hors périmètre de cette tranche** (volontairement) : gagner de nouveaux
  cosmétiques (déblocage par accomplissement = **US-033**, caisses = **US-034**),
  l'écran de **profil / ID runner** qui exposera l'avatar/la bannière/le titre
  (= **US-032**), le catalogue complet (on démarre étroit). On **démarre avec
  quelques cosmétiques déjà débloqués** pour prouver la boucle d'équipement de
  bout en bout.

- **Pour qui :**
  Le joueur (mono-utilisateur, local-first) qui, une fois le builder maîtrisé,
  veut **personnaliser l'apparence de son Réseau** et commencer à se construire
  une **identité** — la première brique de la rétention long-terme de la Phase A3.

- **Hypothèses de cadrage** (à valider / arbitrer par le PO) :
  - **H1 — Rampe de rareté à 5 crans.** Proposition : `COMMUN · AMÉLIORÉ · RARE ·
    ÉPIQUE · LÉGENDAIRE` (noms in-world cyberpunk affinables en design). Chaque
    cran a une **couleur/traitement distinct** (composant `RarityBadge`). La
    rareté est un **signal de prestige**, **aucun effet fonctionnel**.
  - **H2 — Types de cosmétiques dans le modèle : `thème` · `avatar` · `bannière` ·
    `titre`.** En v1, **seul le `thème` a un effet visible** (re-skin du HUD).
    `avatar`/`bannière`/`titre` sont **équipables et persistés** dès maintenant,
    mais leur **surface d'affichage arrive en US-032** (profil). *→ Décision PO
    la plus structurante : soit on inclut les 4 types dès le socle (US-032 = pure
    vitrine consommant l'équipé), soit on restreint US-031 aux **thèmes seuls** et
    US-032 introduit les 3 autres types. Proposition : les 4 types dès le socle.*
  - **H3 — Un seul cosmétique équipé par type à la fois.** Équiper remplace
    l'équipé précédent du même type. Le thème actuel (NIGHTWIRE) est un cosmétique
    **`COMMUN` équipé par défaut** ; il y a **toujours un thème actif** (on ne peut
    pas se retrouver sans thème).
  - **H4 — Contenu de départ** (tous **débloqués** au départ, le mérite viendra en
    US-033/034), réparti sur la rampe pour montrer les crans : ~**3 thèmes** (dont
    le défaut), ~**3 avatars**, ~**2 bannières**, ~**2 titres**. Quantités
    indicatives, ajustables en design.
  - **H5 — Nouvel écran « Garde-robe »** accessible depuis la navigation (onglet
    dédié). Il pourra **fusionner** avec le profil (US-032) le moment venu ; ici
    il sert d'abord à **prouver la boucle voir → équiper**.
  - **H6 — Les cosmétiques survivent à la renaissance (prestige).** L'inventaire
    (possédés + équipés) **n'est pas réinitialisé** par `prestige()` — le statut
    et l'identité sont **permanents** (cohérent P8 « rien n'est jamais vain » ;
    même logique que les jalons `achievedMilestones` d'US-028).
  - **H7 — Zéro avantage fonctionnel.** Équiper un cosmétique ne modifie **aucune**
    valeur de jeu (production/s, coûts, soldes, seuils) — pur statut visuel
    (contrainte permanente de la roadmap).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Voir sa collection** : ouvrir l'écran **Garde-robe** → les cosmétiques
     **possédés** s'affichent, **groupés par type**, chacun portant son **badge de
     rareté** (couleur/cran correspondant à H1).
  2. **Équiper un thème** : équiper un thème « X » depuis la Garde-robe → le HUD
     **change immédiatement** de palette (couleurs/accents) sur toute l'app.
  3. **Un seul thème actif** : équiper un second thème → le premier se **déséquipe
     automatiquement** ; le nouveau est marqué **« Équipé »** (jamais deux thèmes
     équipés à la fois).
  4. **État d'équipement lisible** : un cosmétique non équipé propose l'action
     **« Équiper »** ; le cosmétique équipé de son type affiche l'état **« Équipé »**
     (pas de bouton « Équiper » redondant sur l'objet déjà porté).
  5. **Rampe de rareté cohérente** : chaque cran de rareté a un **traitement visuel
     distinct** et **identique partout** où un cosmétique est représenté (badge +
     carte de cosmétique).
  6. **Persistance** : recharger l'app après avoir équipé → le **thème** et les
     autres cosmétiques **équipés sont restaurés** à l'identique (stockage Dexie).
  7. **Survie à la renaissance** : déclencher une **renaissance** (prestige) →
     l'**inventaire et les cosmétiques équipés sont conservés** (non réinitialisés),
     alors que les ressources de jeu, elles, repartent à zéro.
  8. **Pur statut** : équiper **n'importe quel** cosmétique → **aucune valeur de
     jeu** (débit/s affiché, coûts des daemons/nœuds, soldes) ne change.
  9. **(si H2 = 4 types)** Équiper un **avatar / une bannière / un titre** → le
     choix est **enregistré et persiste** au rechargement (sa surface d'affichage,
     le profil, arrive en US-032 ; ici on vérifie l'enregistrement de l'équipé).

- **Impact UI significatif : OUI.** Nouvel écran (Garde-robe) + système visuel de
  rareté (badge, cartes) + re-skin dynamique du HUD par thème. → **Étape design à
  prévoir** (maquette) avant le plan d'implémentation, après validation des
  cadrages fonctionnel puis technique.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel validé PO le 22/07/2026 (H1 = 5 crans · H2 = **4 types dès
> le socle** · H6 = survie à la renaissance). Découpage ci-dessous.

- **Architecture d'ensemble** — un **nouveau domaine `cosmetics`**, isolé du
  builder (comme `game/builder`, `unlockTree`, `accelerators`, `prestige`,
  `crypto`, `milestones` : modules purs découplés + table + repo + store
  dédiés). La couche pure ne connaît ni Dexie ni React ni i18n (convention).

- **Fichiers créés :**
  - `src/game/cosmetics.ts` — **couche pure** (testée, cible prioritaire #014) :
    - types `CosmeticType = 'theme' | 'avatar' | 'banner' | 'title'` et
      `Rarity = 'common' | 'enhanced' | 'rare' | 'epic' | 'legendary'` (H1),
      constante `RARITY_ORDER` (tri) ;
    - interface `Cosmetic` (`id`, `type`, `rarity`, clés i18n `nameKey`/`descKey`,
      `icon`/aperçu ; pour un `theme` : `id` = clé de surcharge CSS) ;
    - **catalogue data-driven `COSMETICS`** (contenu de départ H4 : ~3 thèmes dont
      le défaut, ~3 avatars, ~2 bannières, ~2 titres) — ajouter un cosmétique =
      une entrée de données (patron `GENERATORS`/`ACCELERATORS`) ;
    - état pur `CosmeticsCore { owned: string[]; equipped: Record<CosmeticType,
      string> }` + helpers **purs** : `equip(core, id)` (no-op si non possédé,
      sinon remplace l'équipé du **même type** → un seul équipé/type, H3),
      `isOwned`, `equippedOf(core, type)`, `cosmeticsByType`, tri par rareté.
    - **Zéro import** de `builder`/`prestige`/… et **aucune** valeur de jeu (H7).
  - `src/db/repositories/cosmetics.ts` — `cosmeticsRepo` (`get`/`save`), seul
    point d'accès à la table (patron `builderRepo`), exporté via `db/index.ts`.
  - `src/stores/useCosmeticsStore.ts` — store Zustand : `owned`, `equipped`,
    `loaded`, `load()`, **`equip(id)`** (mute via `game/cosmetics` + **persiste
    immédiatement** — écriture rare, comme les achats, pas de throttle), + un
    sélecteur du thème équipé. Chargé au montage dans `AppShell` (comme
    `useBuilderStore`/`useFactionsStore`).
  - `src/theme/tokens/rarity.css` — **rampe de rareté** `--rarity-common` →
    `--rarity-legendary` (+ variantes glow). **Solde la dette DS #008/#022.**
  - `src/theme/tokens/themes.css` — **moteur de re-skin** : un bloc par thème
    `:root[data-cosmetic-theme='<id>'] { --accent: …; --accent-2: …; --bg-app:
    …; … }` qui **surcharge** les alias sémantiques de `colors.css`. Le thème
    NIGHTWIRE par défaut = **aucune surcharge** (attribut absent). Les deux
    fichiers sont importés dans `src/theme/index.css`.
  - `src/features/cosmetics/` — UI (patron `features/builder`) :
    - `RarityBadge.tsx` (pastille/liseré coloré par rareté, réutilisable) —
      **reconstruit sur NIGHTWIRE** (dette #008) ;
    - `CosmeticCard.tsx` (aperçu + nom + `RarityBadge` + action **Équiper** /
      état **Équipé**) sur le composant DS `<Card hud brackets>` —
      **reconstruit sur NIGHTWIRE** (dette #008) ;
    - `WardrobeView.tsx` (écran Garde-robe : cosmétiques **groupés par type**,
      fond signature hérité de `.nav-main`) ;
    - `index.ts` (barrel).

- **Fichiers modifiés :**
  - `src/db/db.ts` — **migration Dexie v17** : recopie du schéma v16 + **nouvelle
    table** `cosmeticsState: 'id'` (patron d'ajout de table v10/`builderState`,
    pas de rétro-remplissage de rangée — le singleton est créé par le seed).
  - `src/db/types.ts` — interface `CosmeticsState { id: 'me'; owned: string[];
    equipped: Record<CosmeticType, string> }`.
  - `src/db/seed.ts` — `ensureSeeded()` crée le singleton `cosmeticsState` s'il
    est absent (idempotent) : `owned` = ids de départ (H4), `equipped` = défauts
    (thème NIGHTWIRE `common` + avatar/bannière/titre de base).
  - `src/db/index.ts` — export de `cosmeticsRepo`.
  - `src/app/router.tsx` — route **`/wardrobe`** → `WardrobeView`.
  - `src/components/layout/NavRail.tsx` — **activer** une destination
    « Garde-robe » (déplacer l'emplacement `nav.inventory` de `FUTURE` vers
    `ROUTES`, ou nouvelle entrée dédiée ; icône `shirt`/`palette`).
  - `src/app/AppShell.tsx` — monter `useCosmeticsStore.load()` + **appliquer le
    thème équipé** : `document.documentElement.dataset.cosmeticTheme =
    <idThèmeÉquipé>` (effet réagissant à l'équipé). `prefers-reduced-motion`
    respecté (transition douce optionnelle).
  - `src/components/ui/core/Icon.tsx` — icônes lucide manquantes au registre
    statique (ex. `shirt`/`palette`/`user-square`/`flag`).
  - `src/i18n/locales/{fr,en}.json` — namespaces `cosmetics.*`/`wardrobe.*`
    (types, raretés, noms/desc des cosmétiques de départ, `Équiper`/`Équipé`,
    titre d'écran) + `nav.wardrobe`(+`Code`). **Zéro chaîne en dur.**
  - `src/game/cosmetics.test.ts` — tests de la couche pure.

- **Logique clé :**
  - **Équipement** : `equip(id)` → no-op si non possédé ; sinon
    `equipped[type] = id` (remplace l'ancien du même type). Il y a **toujours**
    un thème équipé (défaut au seed), donc AC2/AC3 tiennent.
  - **Re-skin** : 100 % **CSS piloté par attribut** (`data-cosmetic-theme`), pas
    de JS de theming au runtime → offline-safe, pas de recalcul. Changer de
    thème = changer l'attribut → surcharge instantanée des variables.
  - **Anti-FOUC (flash au boot)** : l'équipé vit en IndexedDB (async) → risque de
    flash du thème par défaut avant application. **Mitigation proposée** : miroir
    de l'**id du thème équipé** en `localStorage` (comme la langue `nt-lang`),
    appliqué **synchronement au boot** ; source de vérité = Dexie.
  - **Survie à la renaissance (H6/AC7)** : garantie **par construction** — l'état
    cosmétique vit dans sa propre table/són propre store ; `prestige()` ne touche
    que `builderState`. Rien à coder de spécial ; **à couvrir en recette**.
  - **Zéro avantage (H7/AC8)** : aucun helper cosmétique n'entre dans
    `applyTick`/les multiplicateurs — vérifié par découplage + test.

- **Impacts modèle de données :**
  - **Nouvelle table `cosmeticsState`** (singleton `id:'me'`), **migration Dexie
    v17**. **Aucun** champ ajouté à `Contract`/`Faction`/`Player`/`BuilderState`,
    **aucune** modification des entités existantes. Compat ascendante :
    l'ancienne sauvegarde obtient son singleton cosmétique au prochain seed.

- **Décisions techniques à acter (PO) :**
  1. **Table dédiée `cosmeticsState`** plutôt qu'extension de `BuilderState`
     (séparation identité/économie ; survie prestige par construction ; repo/
     store propres — cohérent avec `Player` séparé de `BuilderState`).
  2. **Re-skin par attribut CSS `data-cosmetic-theme`** (+ surcharges dans
     `themes.css`), avec **miroir localStorage** du thème équipé pour éviter le
     FOUC au démarrage.
  3. **Écran dédié `/wardrobe`** activant un emplacement de nav déjà réservé,
     amené à **fusionner avec le profil (US-032)**.

## 3. Design  _(porte de validation, si impact UI significatif)_

> Cadrages fonctionnel + technique validés PO le 22/07/2026. Impact UI
> significatif confirmé → **maquette à fournir par le PO (Claude Design)** avant
> le plan d'implémentation. **STOP.**

- **Écrans / surfaces concernés :**
  1. **Écran Garde-robe (`/wardrobe`)** — nouvel écran, sur le fond signature
     hérité de `.nav-main`. Cosmétiques **groupés par type** (thèmes / avatars /
     bannières / titres), état possédé + équipé lisible. C'est la surface
     principale à maquetter (layout des groupes, en-tête, densité).
  2. **`CosmeticCard`** — la carte d'un cosmétique : **aperçu** (le rendu diffère
     par type : échantillon de palette pour un thème, glyphe pour un avatar,
     visuel pour une bannière, texte stylé pour un titre), **nom**, **`RarityBadge`**,
     action **« Équiper »** / état **« Équipé »**. Composée sur `<Card hud brackets>`.
  3. **Rampe de rareté (`RarityBadge` + traitement)** — les **5 crans** (COMMUN →
     LÉGENDAIRE) : couleur/liseré/glow de chacun, cohérents partout. Reconstruit
     sur NIGHTWIRE (dette #008) — la maquette fixe la charte visuelle de rareté.
  4. **Palettes des thèmes de départ** — le point le plus structurant du design :
     puisqu'équiper un thème **re-skin tout le HUD**, la maquette doit définir la
     **palette de chaque thème alternatif** (surcharges des alias `--accent`,
     `--bg-*`, etc.). Proposition : le défaut NIGHTWIRE (cyan) + ~2 thèmes
     alternatifs (ex. une dominante magenta/rouge, une dominante mint/violet).
  5. **Entrée de navigation** — icône + libellé « Garde-robe » dans le `NavRail`
     (activation d'un emplacement déjà réservé).

- **Maquette :** `wardrobe` (Claude Design, reçue le 22/07/2026 ; **non versionnée**,
  convention #007). 5 surfaces livrées : écran Garde-robe complet, `CosmeticCard`
  (4 types × états équiper/équipé), rampe de rareté (5 crans), 3 palettes de
  thèmes avec fragment de HUD comparateur, entrée de nav.

- **Analyse de la maquette (cohérence DS + faisabilité) :**
  - **Fidèle à nos tokens réels** : la maquette n'invente pas de tokens — elle
    consomme ceux de `src/theme/tokens/` (`--clip-bevel-sm/md`, `--clip-notch`,
    `--scanlines`, `--grid-lines`, `--hatch-cyan`, `--glow-cyan`, `--dur-*`,
    `--ease-out`, `--text-glow-cyan`, `--shadow-3`, `.nw-brackets`…). Rien à
    ajouter côté effets/couleurs de base.
  - **Rampe de rareté** (5 crans) : `COMMUN` gris `#7f8aa0` · `AMÉLIORÉ` vert
    `#8fdf57` · `RARE` bleu `#4d9dff` · `ÉPIQUE` violet `#b06bff` · `LÉGENDAIRE`
    or `#ffcf47`, différenciés **surtout par glow + rangs (chevrons) + matière**
    (bonne réponse au risque de collision). **Ces teintes vont dans
    `theme/tokens/rarity.css`** (dette #008 soldée). *Réserve mineure* : `ÉPIQUE`
    violet ≈ violet daemons (`#a855f7`) et `LÉGENDAIRE` or ≈ ambre crypto
    (`#ffb020`) — sans conséquence car la rareté ne s'affiche que dans la
    Garde-robe (pas sur le HUD de jeu) et se distingue par pips/glow.
  - **Palettes de thèmes** : 3 thèmes (`nightwire` défaut cyan · `ecarlate`
    magenta/rouge · `cryo` mint/violet), chacun remappant accent + accents 2/3 +
    fonds app/panneau/surface + texte + bordures. **Ces définitions deviennent
    les blocs `:root[data-cosmetic-theme='<id>']` de `theme/tokens/themes.css`.**

- **Réutilisation du design system (consigne PO) — les composants maquette (chrome
  inline, `Brackets`, boutons ad hoc) seront portés sur NOS composants :**
  - `CosmeticCard` → composé sur **`<Card hud brackets>`** (existe) + bouton
    **« Équiper » sur `<Button>`** (existe). On ne réimplémente pas le chrome.
  - Icônes → **registre statique `Icon.tsx`** (ajout des manquantes : `shirt`,
    `palette`, `user-round`, `flag`, `badge-check`, `ghost`, `skull`, `bot`,
    `bird`, `radar`, `zap`, `crown`, `check-check`, `plus`… selon présence).
  - `RarityBadge` → **nouveau** composant (dette #008), réutilisant `<Badge>` si
    la forme s'y prête, sinon bespoke + petit primitif `RankPips` (chevrons).
  - Aperçus par type (`ThemePreview`/`AvatarPreview`/`BannerPreview`/
    `TitlePreview`) → **nouveaux** petits composants présentationnels
    (`features/cosmetics/`), aucune règle de jeu.
  - `NavRail` → on **garde le nôtre** (routes réelles Tableau de bord/Contrats/
    Réseau) et on **active** l'entrée « Garde-robe » (icône `shirt`) ; les
    libellés de la maquette (RÉSEAU/TÂCHES/STATS/CONFIG) sont illustratifs.
  - Le scaffolding de la maquette (`ShowBlock`, `CardStates`, comparateur de
    thèmes) est **showcase-only** — non livré.

- **Écarts recommandés pour le périmètre US-031 :**
  - **Retirer la pastille « CRÉDITS 4 820 »** de l'en-tête : l'acquisition (et
    a fortiori l'achat) est **hors périmètre** (US-033/034), et acheter un
    cosmétique contre des crédits **violerait** le garde-fou « gagné, pas
    acheté ». On démarre avec le contenu débloqué (H4).
  - **Compteur « X/Y débloqués »** : gardé en version minimale (nombre possédé) ;
    l'**aperçu de collection** complet (« reste X légendaires ») est **US-033**.

- **Profondeur du re-skin — décidée PO (22/07/2026) : « Chrome + fonds ».** Le
  thème surcharge la **couche sémantique** (`--accent`(+hover/press), `--bg-app/
  panel/surface/hover/inset`, `--text-primary/secondary/muted/label`, `--border`/
  `--border-strong`, `--border-neon`) + une **passe courte** routant les points
  très visibles codés en dur (rail de nav, `.nw-brackets`, liens) vers ces alias.
  Les **couleurs de jeu restent fixes** (`--accent-2` data/magenta, daemons/
  violet, crypto/ambre, prestige/rouge **non surchargés**) pour la lisibilité
  gameplay. `nightwire` = thème par défaut = **aucune** surcharge.

## 4. Plan d'implémentation  _(porte de validation)_

> Cadrages + maquette validés PO. Ordre **bas → haut** (pur → données → store →
> UI → intégration), chaque étape vérifiable. Aucune ligne de code avant
> validation de ce plan.

1. **Couche pure `game/cosmetics.ts` + tests** — types `CosmeticType`
   (`theme|avatar|banner|title`) / `Rarity` (5 crans) + `RARITY_ORDER` ;
   interface `Cosmetic` ; **catalogue `COSMETICS`** (contenu de départ H4, repris
   de la maquette : 3 thèmes, 4 avatars, 3 bannières, 4 titres) ; état
   `CosmeticsCore {owned, equipped}` ; helpers purs `equip`/`isOwned`/
   `equippedOf`/`cosmeticsByType`/tri. Tests : equip remplace l'équipé du même
   type, no-op si non possédé, tri par rareté, invariant « chaque équipé par
   défaut ∈ owned ». (Convention #014.)
2. **Tokens `theme/tokens/rarity.css`** — rampe `--rarity-common` →
   `--rarity-legendary` (+ variantes glow/rgb) d'après la maquette. Importée dans
   `theme/index.css`. **Solde la dette DS #008/#022.**
3. **Tokens `theme/tokens/themes.css`** — blocs `:root[data-cosmetic-theme=
   'ecarlate']` et `[...='cryo']` surchargeant **uniquement** la couche sémantique
   décidée (accent chrome + fonds + texte + bordures). `nightwire` = pas de bloc.
   Importée dans `theme/index.css`.
4. **Passe d'aliasing courte** — router les points très visibles codés en dur
   (rail `appShell.css`/`NavRail`, `.nw-brackets` de `base.css`, liens) de
   `--cyan-500`/`--void-*` vers `--accent`/`--bg-*` pour que le re-skin « prenne ».
   Périmètre strict (liste fermée), pas d'audit global (anti-dérapage §8).
5. **Modèle & persistance** — `db/types.ts` (`CosmeticsState` + export
   `CosmeticType`) ; `db/db.ts` **migration v17** (recopie v16 + table
   `cosmeticsState: 'id'`) ; `db/seed.ts` (singleton idempotent : `owned` de
   départ + `equipped` défauts) ; `db/repositories/cosmetics.ts` (`cosmeticsRepo`) ;
   export dans `db/index.ts`.
6. **Store `stores/useCosmeticsStore.ts`** — `owned`/`equipped`/`loaded`/`load()`/
   `equip(id)` (via `game/cosmetics`, persistance immédiate) + sélecteur du thème
   équipé. **Miroir `localStorage`** de l'id de thème équipé (anti-FOUC).
7. **Application du thème** — lecture **synchrone** du miroir `localStorage` au
   boot (`main.tsx`) pour poser `data-cosmetic-theme` avant le 1ᵉʳ paint ;
   `AppShell` charge le store et **synchronise** l'attribut sur l'équipé.
8. **Composants rareté** (`features/cosmetics/`) — `RankPips` (chevrons) +
   `RarityBadge` (sur nos tokens `--rarity-*` ; `<Badge>` réutilisé si adéquat).
9. **Aperçus par type** — `ThemePreview` / `AvatarPreview` / `BannerPreview` /
   `TitlePreview` (présentationnels, zéro règle de jeu).
10. **`CosmeticCard`** — composée sur **`<Card hud brackets>`** + action sur
    **`<Button>`** ; états « Équiper » / « Équipé » ; branche l'aperçu selon le type.
11. **`WardrobeView`** — sections par type (grille responsive), en-tête HUD
    **sans pastille crédits**, compteur « X/Y débloqués » minimal, fond signature
    hérité. Barrel `features/cosmetics/index.ts`.
12. **Navigation & route** — `router.tsx` route `/wardrobe` ; `NavRail.tsx`
    active l'entrée « Garde-robe » (icône `shirt`) ; icônes manquantes ajoutées à
    `Icon.tsx` ; i18n `nav.wardrobe`(+`Code`).
13. **i18n FR/EN** — namespaces `cosmetics.*`/`wardrobe.*` (types, raretés,
    noms/desc des cosmétiques de départ, `Équiper`/`Équipé`, en-tête). **Zéro
    chaîne en dur.**
14. **Vérifications** — `typecheck` + `lint` + `build`/PWA + `tests` verts ;
    vérif visuelle sur `:5180` avant recette PO.

## 4. Plan d'implémentation  _(porte de validation)_

_À compléter après validation des cadrages et de la maquette._
