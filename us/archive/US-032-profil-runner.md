# US-032 — Profil / ID runner

- **MVP :** A3 (Phase A3 — Identité & Collection, décision #035)
- **Priorité :** moyenne (chemin critique A3, après US-031)
- **Statut :** fait
- **Branche :** feature/US-032-profil-runner

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  La **vitrine** de la Phase A3 : un écran de **profil / ID runner** qui assemble
  en une carte d'identité les **cosmétiques équipés** (avatar + bannière + titre,
  posés en US-031) et les **statistiques de progression** du joueur. C'est là que
  les cosmétiques équipés — jusqu'ici sans surface d'affichage dédiée (le thème
  mis à part) — prennent enfin tout leur sens : le joueur **se regarde et
  s'affiche**.

  US-032 ne crée **aucun nouveau cosmétique** ni mécanique de jeu : elle
  **consomme** l'état d'US-031 (`useCosmeticsStore`) et les états de progression
  déjà persistés (joueur, builder, factions). Elle **relie** le profil à la
  Garde-robe (aller y changer ses cosmétiques).

  **Hors périmètre** : gagner des cosmétiques (US-033/034), l'aperçu de collection
  « X légendaires restants » (US-033), toute stat qui n'existe pas déjà en base.

- **Pour qui :**
  Le joueur (mono-utilisateur, local-first) qui veut une **identité visible** —
  une carte de runner qui résume qui il est (apparence + palmarès) et donne envie
  de débloquer/équiper mieux. Brique centrale de la rétention long-terme A3.

- **Hypothèses de cadrage — validées PO le 23/07/2026 :**
  - **H1 (validée) — Callsign runner éditable.** L'app n'a aucun nom de joueur ;
    on ajoute un **callsign court éditable** (ex. « RUNNER-7F »), persisté, avec
    une valeur par défaut au premier lancement. C'est le cœur de l'« ID runner ».
  - **H2 (validée, corrigée) — Stats du BUILDER uniquement, permanentes.** Le
    profil est l'ID du runner **du Réseau** ; les données du **module perso**
    (XP/niveau/crédits du `Player`, réputation de faction) sont **exclues**
    (privées, découplées depuis le pivot #022). On affiche les **3 stats
    permanentes** (les seules qui survivent à la renaissance) :
    **Génération** (`prestigeCount`), **Jalons** (`X / total`, US-028),
    **Cosmétiques débloqués** (`X / total`, US-031). Le reste du Réseau
    (cycles/data/crypto, daemons) repart à zéro à chaque renaissance → non
    affiché (non identitaire).
  - **H3 (validée) — Profil et Garde-robe = deux écrans reliés** : `/profile`
    (vitrine, lecture) avec un **CTA « Personnaliser »** menant à `/wardrobe`
    (équipement, US-031). Pas de fusion en onglets.
  - **H4 — Navigation** : activer l'emplacement **`profile`** déjà réservé dans le
    rail (icône `user`, en bas) → route `/profile`.
  - **H5 — Rendu des cosmétiques en grand** : la **bannière** devient l'arrière-
    plan héroïque de la carte, l'**avatar** un portrait proéminent, le **titre**
    affiché sous le callsign. Reprend le langage visuel des aperçus d'US-031, en
    format vitrine.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Accès** : cliquer l'entrée **Profil** du rail → l'écran `/profile`
     s'affiche.
  2. **Cosmétiques équipés affichés** : le profil montre l'**avatar**, la
     **bannière** et le **titre** actuellement équipés (ceux d'US-031).
  3. **Reflet de l'équipement** : équiper un autre avatar/bannière/titre en
     Garde-robe → de retour sur le profil, l'affichage **reflète le nouvel
     équipement** (et après rechargement aussi).
  4. **Statistiques exactes** : les 3 stats affichées (Génération =
     `prestigeCount`, Jalons `X/total`, Cosmétiques débloqués `X/total`)
     correspondent aux **valeurs réelles** de l'état (mêmes chiffres que le
     panneau prestige / le registre des jalons / la Garde-robe). **Aucune donnée
     du module perso** (XP/niveau/crédits/réputation) n'est affichée.
  5. **(si H1) Callsign** : modifier le callsign → il est **enregistré** et
     **persiste** au rechargement.
  6. **Lien vers la Garde-robe** : un **CTA « Personnaliser »** depuis le profil
     mène à `/wardrobe`.
  7. **Cohérence de thème** : le profil respecte le **thème équipé** (re-skin
     US-031) comme le reste de l'app.
  8. **i18n FR/EN** : tous les libellés du profil sont traduits, aucune chaîne en
     dur.

- **Impact UI significatif : OUI.** Nouvel écran « héros » (carte d'identité,
  bannière en fond, portrait, stats). → **Étape design (maquette)** à prévoir
  après validation des cadrages fonctionnel puis technique.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel validé PO le 23/07/2026 (H1 callsign · H2 = 3 stats builder
> permanentes, perso exclu · H3 deux écrans reliés).

- **Nature de l'US : écran de présentation quasi pur.** Le profil **lit** des
  états déjà persistés et exposés — `useCosmeticsStore` (équipés + possédés),
  `useBuilderStore` (`prestigeCount`, `achievedMilestones`) — et les totaux des
  catalogues (`MILESTONE_DEFS.length`, `COSMETICS.length`). **Seule donnée
  nouvelle** : le **callsign** (H1).

- **Fichiers créés :**
  - `src/features/profile/ProfileView.tsx` — l'écran `/profile` : carte d'ID
    **héros** (bannière équipée en fond, avatar en portrait, callsign + titre
    équipé), bloc **3 stats** (Génération / Jalons X/total / Cosmétiques X/total),
    **CTA « Personnaliser »** → `/wardrobe`. Rendu grand format des cosmétiques
    **bespoke** (réutilise les helpers `rarityStyle` + `RarityBadge` d'US-031 ;
    le glyphe d'avatar/le motif de bannière via `Icon`, les palettes de thème
    n'entrent pas ici — c'est le HUD global qui porte le thème).
  - `src/features/profile/CallsignEditor.tsx` — champ callsign éditable en place
    (affichage → bouton crayon → `<Input>` DS + valider/annuler).
  - `src/game/profile.ts` (+ `profile.test.ts`) — **couche pure** minimale :
    `normalizeCallsign(raw)` (trim, longueur bornée, repli si vide). Cible
    testable (convention #014).
  - `src/features/profile/index.ts` — barrel.

- **Fichiers modifiés :**
  - `src/db/types.ts` — `CosmeticsState` gagne **`callsign: string`**.
  - `src/db/db.ts` — **migration Dexie v18** : recopie du schéma v17 +
    rétro-remplissage `callsign` par défaut sur le singleton `cosmeticsState`
    existant (patron des migrations de champ v11→v16).
  - `src/db/seed.ts` — callsign par défaut à la création du singleton cosmétique.
  - `src/stores/useCosmeticsStore.ts` — expose `callsign` + **`setCallsign(raw)`**
    (via `normalizeCallsign`, persistance immédiate). `load()` lit le champ.
  - `src/app/router.tsx` — route **`/profile`** → `ProfileView`.
  - `src/components/layout/NavRail.tsx` — l'emplacement **`profile`** en bas
    (aujourd'hui désactivé, icône `user`) devient un **`NavLink`** actif vers
    `/profile` (conserve sa position basse, après `nav-spacer`).
  - `src/i18n/locales/{fr,en}.json` — namespace **`profile.*`** (titre, libellés
    des 3 stats, callsign/édition, CTA) + **`nav.profileCode`**. Zéro chaîne en dur.
  - `src/components/ui/core/Icon.tsx` — icônes manquantes éventuelles (a priori
    aucune : `user`/`square-pen`/`check`/`x`/`arrow-right`/`shirt` déjà au registre).

- **Logique clé :**
  - **Callsign** : `setCallsign` normalise (trim + longueur max + repli sur défaut
    si vide) puis persiste. **Survit à la renaissance** par construction (porté
    par `cosmeticsState`, que `prestige()` ne touche pas).
  - **Stats** : lecture directe — `prestigeCount` ; `achievedMilestones.length` /
    `MILESTONE_DEFS.length` ; `owned.length` / `COSMETICS.length`. Aucun calcul de
    jeu, **aucune** lecture du `Player`/factions (perso exclu, H2).
  - **Thème** : l'écran hérite du re-skin global (US-031) sans traitement dédié.

- **Impacts modèle de données :**
  - **1 champ ajouté** — `CosmeticsState.callsign` — **migration Dexie v18**.
    Aucune autre entité touchée. **Aucune** nouvelle table (le callsign rejoint
    le singleton d'identité `cosmeticsState`, cf. décision ci-dessous).

- **Décisions techniques à acter (PO) :**
  1. **Callsign porté par `cosmeticsState`** (le singleton d'identité, qui survit
     déjà à la renaissance) plutôt que par une **nouvelle table** (surdimensionné
     pour un champ) ou par `Player` (module perso, **exclu** par H2). 1 champ,
     migration v18.
  2. **Profil = vitrine en lecture seule** composant les stores existants ; la
     seule écriture est le callsign. Pas de duplication d'état.
  3. **Rendu grand format des cosmétiques bespoke** dans `ProfileView` (les
     aperçus d'US-031 sont calibrés petits) — mais **réutilise** `rarityStyle`,
     `RarityBadge` et `Icon`.

## 3. Design  _(porte de validation, si impact UI significatif)_

> Cadrages fonctionnel + technique validés PO le 23/07/2026. Impact UI
> significatif (écran héros) → **maquette à fournir par le PO (Claude Design)**
> avant le plan d'implémentation. **STOP.**

- **Écrans / surfaces concernés :**
  1. **Écran Profil (`/profile`)** — la carte d'**ID runner** en grand : la
     **bannière équipée** en arrière-plan héroïque, l'**avatar** en portrait
     proéminent, le **callsign** + le **titre équipé** en tête. Surface
     principale à maquetter (composition, hiérarchie, densité).
  2. **Bloc des 3 stats** — Génération (`prestigeCount`) · Jalons (X/total) ·
     Cosmétiques débloqués (X/total). Traitement HUD (readouts), lecture claire.
  3. **Éditeur de callsign** — état affichage (callsign + petit crayon) → état
     édition (champ + valider/annuler).
  4. **CTA « Personnaliser »** — bouton menant à la Garde-robe (`/wardrobe`).
  5. **Entrée de navigation Profil** — activation de l'emplacement `user` déjà
     réservé (bas du rail).

- **À rappeler à la maquette :** référentiel visuel = **NIGHTWIRE** (tokens
  `src/theme/`), pas la charte SparkWine. Réutiliser le langage des cosmétiques
  d'US-031 (avatar = glyphe hexagonal, bannière = dégradé teinté rareté + motif,
  titre = display néon, rampe de rareté `--rarity-*`). L'écran hérite du **thème
  équipé** (re-skin US-031). **Données perso exclues** (pas d'XP/crédits/faction).

- **Maquette :** `profil-runner` (Claude Design, reçue le 23/07/2026 ; **non
  versionnée**, convention #007). Écran Profil : carte d'ID héros (bannière 21:9
  teintée rareté en fond, avatar hexagonal chevauchant, callsign affichage/édition,
  titre équipé + badge), bloc 3 stats, CTA « Personnaliser », entrée de nav Profil.

- **Analyse (cohérence DS + faisabilité) :**
  - **Fidèle à nos tokens** (`--clip-bevel-*`, `--scanlines`, `--grid-lines`,
    `--glow-cyan`, `--text-glow-cyan`, `--dur-*`…) et **réutilise la rampe de
    rareté d'US-031** (mêmes teintes/rangs/glow). Rien de nouveau côté tokens.
  - **3 stats conformes à H2** : Génération / Jalons (X/11) / Cosmétiques (X/14) —
    **aucune donnée perso** (bien respecté).
  - Détails à adapter : `--clip-bevel-lg` (absent de nos tokens) → on utilise le
    `hud` de `<Card>` (clip-bevel-md) ; icône Génération `refresh-cw` de la
    maquette → **`orbit`** (déjà notre marqueur de « génération/renaissance »,
    US-029) pour la cohérence.

- **Réutilisation du design system (consigne PO) :**
  - Bloc 3 stats → **notre `<StatCard>`** (`label`/`value`/`icon`/`accent` —
    accents violet/cyan/mint dispo). On ne réimplémente pas la tuile.
  - Carte d'ID → sur **`<Card hud brackets>`** (frame/clip/brackets), corps
    bespoke (bannière + avatar chevauchant + identité).
  - `RarityBadge` + `RankPips` → **réutilisés tels quels** (features/cosmetics,
    US-031).
  - CTA « Personnaliser » + boutons Valider/Annuler → **`<Button>`** (secondary/
    ghost). Navigation via `Link`/`useNavigate` (react-router).
  - Callsign : champ **bespoke** (le `<Input>` DS, mono/boxé, ne convient pas à
    l'échelle « héros » display 46px du callsign) — création justifiée ; boutons
    sur `<Button>`.
  - Avatar hexagonal **grand format** + bannière héros → nouveaux composants
    présentationnels (réutilisent `rarityStyle`/`Icon`) ; les aperçus d'US-031
    sont calibrés petits.
  - `NavRail` → on garde le nôtre, on **active** l'entrée Profil (les libellés
    RÉSEAU/TÂCHES/STATS de la maquette sont illustratifs).
  - Scaffolding `ShowBlock`/`CallsignInline` de la maquette = showcase-only, non
    livré.
  - **Icônes à ajouter** : `pencil` (édition callsign), `milestone` (stat jalons).
  - **Animations optionnelles** (petit `profile.css`, reduced-motion) : balayage
    de bannière (`nw-sweep`) + point « connecté » (`nw-blink`).

## 3. Design  _(porte de validation, si impact UI significatif)_

_Impact UI significatif détecté (voir §1) — maquette à fournir par le PO après
les cadrages._

## 4. Plan d'implémentation  _(porte de validation)_

> Cadrages + maquette `profil-runner` validés PO le 23/07/2026. Ordre bas → haut,
> chaque étape vérifiable. Aucune ligne de code avant validation de ce plan.

1. **Couche pure `game/profile.ts` + tests** — `DEFAULT_CALLSIGN` +
   `normalizeCallsign(raw)` (trim, majuscules, charset `A-Z 0-9 -`, **12 car.
   max**, repli sur le défaut si vide). Tests : vide→défaut, trop long→tronqué à
   12, minuscules→majuscules, espaces rognés, caractères interdits filtrés.
   (Convention #014.)
2. **Modèle & persistance** — `db/types.ts` : `CosmeticsState.callsign: string` ;
   `db/db.ts` **migration Dexie v18** (recopie v17 + rétro-remplissage
   `callsign = DEFAULT_CALLSIGN` sur le singleton existant, patron v11→v16) ;
   `db/seed.ts` : callsign par défaut à la création.
3. **Store** — `useCosmeticsStore` gagne `callsign` + **`setCallsign(raw)`** (via
   `normalizeCallsign`, persistance immédiate) ; `load()`/`persist()` incluent le
   champ.
4. **Icônes** — ajouter `pencil` + `milestone` au registre `Icon.tsx`.
5. **`features/profile/profile.css`** — keyframes `nw-sweep` (balayage bannière)
   + `nw-blink` (point « connecté »), sous garde `prefers-reduced-motion`.
6. **`RunnerIdCard.tsx`** — carte d'ID sur **`<Card hud brackets>`** : bannière
   équipée en fond 21:9 (dégradé teinté rareté + motif `Icon` + hachures +
   balayage), **avatar hexagonal grand format** chevauchant (halo rareté),
   callsign (via `CallsignEditor`), titre équipé + `RarityBadge`. Réutilise
   `rarityStyle`/`RarityBadge`/`RankPips`.
7. **`CallsignEditor.tsx`** — état affichage (callsign display + bouton crayon) ↔
   édition (champ bespoke + compteur 12 + Valider/Annuler sur **`<Button>`**).
   Écrit via `setCallsign`.
8. **`ProfileView.tsx`** — écran `/profile` : en-tête HUD + **CTA
   « Personnaliser »** (`<Button secondary>` → `/wardrobe` via `Link`) +
   `RunnerIdCard` + **bloc 3 `<StatCard>`** : Génération (`orbit`, violet,
   `prestigeCount`) · Jalons (`milestone`, cyan, `X/total` jalons) · Cosmétiques
   (`shirt`, mint, `X/total` possédés). Lit `useCosmeticsStore` + `useBuilderStore`
   + `MILESTONE_DEFS.length`/`COSMETICS.length`. Barrel `index.ts`.
9. **Navigation & route** — `router.tsx` route `/profile` ; `NavRail.tsx` :
   l'entrée `profile` (bas du rail) devient un `NavLink` actif vers `/profile`.
10. **i18n FR/EN** — namespace `profile.*` (kicker, titre, `ID RUNNER`/connecté,
    labels/hint callsign, labels des 3 stats, CTA) + `nav.profileCode`. Zéro
    chaîne en dur.
11. **Vérifications** — `typecheck` + `lint` + `build`/PWA + `test` verts ; vérif
    visuelle `:5180` avant recette.
