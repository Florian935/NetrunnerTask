# US-036 — L'Éveil de la Corruption

- **MVP :** A4 (Phase A4 — Corruption / Voie sombre, décision #041)
- **Priorité :** haute
- **Statut :** fait
- **Branche :** feature/US-036-eveil-corruption

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** Le **premier reveal** de la Phase A4 et le **cadre** qui les rendra
  tous possibles. À force de renaître (prestige), le Réseau finit par **se
  dérégler** : une **séquence glitch « wahou »** surgit et propose un **pacte** —
  embrasser la corruption ou la refuser. C'est un **moment de rupture** (« tu
  croyais avoir tout vu ») qui récompense l'investissement long terme. Cette
  tranche livre **le choc + le cadre + le choix** ; la mécanique de la voie sombre
  (production dopée instable) vient en **US-037**.

- **Pour qui :** Le **joueur solo engagé** qui a assez investi pour atteindre la
  3ᵉ renaissance — la corruption est sa surprise, la preuve que le jeu « ne
  s'arrête jamais » (P6). Et, sous le capot, **pour les reveals futurs** : le
  moteur posé ici (réveil de l'IA, fausses limites…) se rebranchera dessus sans
  réécriture.

### Hypothèses de cadrage

- **H1 — Moteur de reveals extensible (le vrai actif).** Un **registre** de
  reveals (couche pure), chacun décrit par un **prédicat de déclenchement pur** sur
  l'état de jeu + un flag **persisté append-only** « découvert » (patron
  `achievedMilestones` d'US-028, survit à la renaissance). La **corruption est la
  1ʳᵉ entrée** ; ajouter un reveal = ajouter une entrée, pas réécrire.

- **H2 — Déclenchement au prestige (3ᵉ renaissance, ajustable).** La corruption
  s'**arme** dès que `prestigeCount ≥ seuil` (**seuil = 3**, ajustable en recette)
  **et** qu'elle n'est pas déjà découverte. Vérifié **après une renaissance** et
  **au `load()`** (rattrapage si le joueur a franchi le seuil hors-ligne / avant la
  livraison de la feature).

- **H3 — Séquence glitch « wahou » (P9).** À l'armement, une **mise en scène**
  (idéalement plein écran / prise de contrôle du HUD) se joue **une seule fois** :
  aberration chromatique magenta (token `--crate-blackice-chroma-rgb` déjà présent),
  scanlines qui s'emballent, **message menaçant**. **Variante
  `prefers-reduced-motion` obligatoire** (présentation statique lisible, sans
  animation agressive).

- **H4 — Le pacte (le choix, jamais imposé — P5).** La séquence propose **EMBRASSER
  / REFUSER**, choix **persisté**.
  - **Refuser n'est jamais un cul-de-sac** : l'offre **se re-présente** à la
    prochaine renaissance éligible.
  - **Embrasser est réversible** : une action **« Purger »** revient au Réseau
    propre, **sans** retirer le cosmétique déjà gagné (P8) ; la corruption reste
    « découverte » et **ré-embrassable** à volonté.
  - États : `dormant` → `offered` (glitch armé, en attente) → `embraced` /
    `refused` ; `refused` re-`offered` ; `embraced` ⇄ purgé.

- **H5 — Récompense v1 (pur statut).** Embrasser applique **immédiatement** le
  **thème corrompu** (re-skin global, axe distinct du thème cosmétique équipé) et
  débloque **1 cosmétique/titre glitch EXCLUSIF** (source dédiée « corruption »,
  **gagné jamais acheté**, survit à la renaissance — cohérent A3 : cosmétique = pur
  statut). La **mécanique dopée/instable = US-037**.

- **Invariant :** la corruption est un **choix de pur statut** — **aucun avantage
  fonctionnel** (la production/l'arbre/les ressources sont identiques qu'on accepte
  ou non en v1), **rien de définitif n'est détruit** (refus non bloquant, embrasser
  réversible), **gagnée par le jeu jamais achetée**, **survit à la renaissance**,
  **100 % local-first**.

### Critères d'acceptation _(action → résultat attendu, vérifiables)_

1. **Sous le seuil** — avec `prestigeCount = 2`, jouer/renaître normalement :
   **aucune** corruption ne se déclenche, l'app est inchangée.
2. **Déclenchement** — atteindre la 3ᵉ renaissance (`prestigeCount` passe à 3) :
   la **séquence glitch se joue une fois** et le **pacte** (Embrasser / Refuser)
   s'affiche.
3. **Rattrapage + non-répétition** — recharger l'app avec `prestigeCount ≥ 3` et
   corruption non découverte : la séquence se déclenche au `load()`. Après un choix,
   **elle ne se re-déclenche plus** au rechargement.
4. **Refuser** — choisir Refuser : l'app **reste en état normal** (pas de thème
   corrompu, pas de cosmétique glitch) ; à la **renaissance suivante**
   (`prestigeCount` → 4), **l'offre réapparaît**.
5. **Embrasser** — choisir Embrasser : le **thème corrompu s'applique aussitôt**
   (re-skin global visible) **et** 1 cosmétique/titre glitch exclusif apparaît dans
   les **possédés** (visible en Garde-robe, marqué exclusif « corruption »).
6. **Persistance** — le choix et l'état de corruption **survivent** à un
   rechargement **et** à une renaissance ultérieure (non remis à zéro par le
   prestige).
7. **Purger** — depuis l'état embrassé, l'action **« Purger »** revient au **look
   propre** **sans** retirer le cosmétique déjà gagné ; la corruption reste
   « découverte » et **ré-embrassable**.
8. **Reduced-motion** — avec `prefers-reduced-motion` actif, la séquence se
   présente en **version statique lisible** (pas d'animation agressive), le pacte
   reste **pleinement fonctionnel**.
9. **Garde-fou (aucun avantage)** — à état de jeu égal, la **production, l'arbre de
   déblocage et les ressources sont identiques** que l'on ait embrassé ou refusé
   (la corruption ne change **que** l'esthétique + le cosmétique en v1).

> **Impact UI significatif détecté** → **étape design/maquette Claude Design
> requise** avant l'implémentation (séquence glitch « wahou » plein écran + thème
> corrompu global + surface du pacte + entrée Garde-robe pour le cosmétique glitch).
> Je te le signalerai après validation des cadrages fonctionnel puis technique.

## 2. Cadrage technique  _(porte de validation)_

### Fichiers impactés

**Créés :**
- `src/game/reveals.ts` _(pur, testé)_ — **le moteur de reveals** (H1) :
  `RevealId` (`'corruption'`, extensible), `RevealContext` (`{ prestigeCount }`,
  extensible), `RevealDef { id; trigger: (ctx) => boolean }`, registre `REVEALS`,
  `CORRUPTION_PRESTIGE_THRESHOLD = 3` (exporté, ajustable), et
  `newlyTriggeredReveals(discovered, ctx): RevealId[]`. **Déterministe, zéro RNG**
  (`crates.ts` reste le seul module hasardeux de `game/*`).
- `src/game/reveals.test.ts` — seuil, déclenchement, non-re-déclenchement via
  `discovered`, extensibilité du registre.
- `src/features/corruption/` _(nouveau dossier feature)_ :
  - `corruptionTheme.ts` — `applyCorruption(on)` / `mirrorCorruption(on)` /
    `bootCorruption()` : pose l'attribut **`data-corruption="on"`** sur `<html>`
    + miroir localStorage anti-FOUC. **Calque exact de `features/cosmetics/theme.ts`.**
  - `CorruptionRevealOverlay.tsx` — la **séquence glitch plein écran** (H3) + le
    **pacte** Embrasser / Refuser (H4) ; variante `prefers-reduced-motion`.
  - `CorruptionRevealHost.tsx` — écoute `corruption === 'offered'` et monte
    l'overlay (hébergé dans `AppShell`, comme les toasts).
  - `CorruptionControl.tsx` — surface **« Purger » / « Ré-embrasser »** (état
    `embraced`/`purged`), sur `<Card>`/`<Button>` DS.
  - `corruption.css` — keyframes glitch, **sous garde reduced-motion**.
  - `index.ts` — exports.
- `src/theme/tokens/corruption.css` — tokens du **thème corrompu** (palette
  altérée, réutilise `--crate-blackice-chroma-rgb`), scopés `:root[data-corruption="on"]`.
  Importé dans l'agrégat de thèmes.

**Modifiés :**
- `src/game/cosmetics.ts` — `source?: 'crate' | 'corruption'` ; **+1 cosmétique
  glitch** (un **titre**) `source: 'corruption'` ; helper `corruptionCosmetics()`.
- `src/game/cosmetics.test.ts` — couvre la nouvelle source.
- `src/db/types.ts` — `CosmeticsState` gagne `discoveredReveals: string[]`,
  `corruption: CorruptionState`, `corruptionArmedAt: number | null`.
- `src/db/db.ts` — **migration Dexie v22** (rétro-remplissage).
- `src/db/seed.ts` — seed du singleton cosmétique avec les nouveaux champs.
- `src/stores/useCosmeticsStore.ts` — nouveaux champs + `checkReveals(ctx)`,
  `embraceCorruption()`, `refuseCorruption()`, `purgeCorruption()` ; application du
  thème corrompu au `load()` + miroir.
- `src/stores/useBuilderStore.ts` — appelle
  `useCosmeticsStore.getState().checkReveals({ prestigeCount })` **après
  `prestige()`** et **au `load()`** (rattrapage). Patron cross-store existant
  (cf. `grantMilestoneCrates`).
- `src/main.tsx` — `bootCorruption()` à côté de `bootCosmeticTheme()`.
- `src/app/AppShell.tsx` — monte `CorruptionRevealHost`.
- `src/features/cosmetics/WardrobeView.tsx` (ou `ProfileView`) — insère
  `CorruptionControl` (surface exacte tranchée au design).
- `src/components/ui/core/Icon.tsx` — icône(s) glitch si besoin (sinon réutilise
  `skull`/`biohazard`/`triangle-alert`/`zap-off` déjà au registre).
- `src/i18n/locales/{fr,en}.json` — bloc `corruption.*` (message glitch, pacte,
  purger, nom du titre). **Style compact une ligne préservé.**

### Logique

- **Moteur (`reveals.ts`, pur)** : `newlyTriggeredReveals(discovered, {prestigeCount})`
  → reveals dont le prédicat déclenche **et** absents de `discovered`. Corruption :
  `prestigeCount >= CORRUPTION_PRESTIGE_THRESHOLD`.
- **`checkReveals(ctx)` (store cosmétique)**, appelé par le store builder après
  `prestige()` et au `load()` :
  - `corruption === 'dormant'` **et** corruption nouvellement déclenchée →
    `offered`, append `'corruption'` à `discoveredReveals`, `corruptionArmedAt =
    prestigeCount`.
  - **Ré-offre (H4)** : `corruption === 'refused'` **et** `prestigeCount >
    corruptionArmedAt` (⇒ une **nouvelle** renaissance depuis le refus) → `offered`,
    `corruptionArmedAt = prestigeCount`.
  - Persiste si changement.
- **`embraceCorruption()`** (depuis `offered` ou `purged`) → `embraced` ; applique
  le thème corrompu + miroir ; `grant([<titre glitch>])` (idempotent, garde le
  cosmétique à vie) ; persiste.
- **`refuseCorruption()`** (depuis `offered`) → `refused` ; persiste.
- **`purgeCorruption()`** (depuis `embraced`) → `purged` ; **retire** le thème
  corrompu + miroir (**cosmétique conservé**, P8) ; persiste. `purged` est
  ré-embrassable directement (pas d'attente de renaissance).
- **`load()` (store cosmétique)** applique le thème corrompu ssi
  `corruption === 'embraced'` (+ miroir), comme `applyCosmeticTheme`.
- **Présentation** : `CorruptionRevealHost` monte l'overlay quand
  `corruption === 'offered'` ; l'overlay joue la séquence (statique si
  reduced-motion) et propose Embrasser/Refuser → actions ci-dessus.

### Impacts modèle de données

- **`CosmeticsState` + 3 champs** → **migration Dexie v22** (patron des migrations
  de champ v11→v21) : rétro-remplissage `discoveredReveals: []`,
  `corruption: 'dormant'`, `corruptionArmedAt: null`. Aucune reconciliation de
  `owned` (le titre glitch est du contenu neuf qu'aucune save ne possède).
  `CorruptionState = 'dormant' | 'offered' | 'refused' | 'embraced' | 'purged'`.
- **Rattrapage (critère 3)** : une save avec `prestigeCount ≥ 3` déclenche
  `offered` au **1ᵉʳ `load()` post-migration** — le comportement voulu (le joueur
  déjà avancé découvre la corruption à la mise à jour).
- **Aucun changement à `BuilderState`** (le déclencheur lit `prestigeCount`
  existant, v14). **Aucun nouveau RNG.**

### Décisions techniques à valider

1. **Persistance sur `CosmeticsState`** (singleton d'identité, **survit à la
   renaissance** par construction, possède déjà l'application de thème + miroir).
   Le ledger générique `discoveredReveals` y réside en v1 ; extraction vers un
   domaine `reveals` dédié possible plus tard si des reveals **non cosmétiques**
   apparaissent.
2. **Thème corrompu = axe CSS distinct** (`data-corruption`), **composable
   par-dessus** le thème cosmétique équipé (`data-cosmetic-theme`) — pas un
   cosmétique de garde-robe.
3. **Récompense v1 = un titre glitch** `source: 'corruption'` (catalogue exact
   finalisé au design).
4. **5 états** + `corruptionArmedAt` pour la ré-offre post-refus (borne « nouvelle
   renaissance »).
5. **Séquence complète au 1ᵉʳ dévoilement** ; la **ré-offre** (post-refus, nouvelle
   renaissance) re-présente le pacte — framing éventuellement allégé, à trancher au
   design.

## 3. Design  _(porte de validation, si impact UI significatif)_

**Impact UI significatif confirmé** → maquette Claude Design requise.

### Écrans / surfaces concernés

1. **La séquence glitch « wahou » + le pacte** (`CorruptionRevealOverlay`) —
   overlay **plein écran** qui prend le contrôle du HUD : aberration chromatique
   magenta (`--crate-blackice-chroma-rgb`), scanlines qui s'emballent, message
   menaçant, puis les **deux choix EMBRASSER / REFUSER**. + **variante
   `prefers-reduced-motion`** (présentation statique lisible, sans animation
   agressive). Surface **la plus critique** (c'est le moment « wahou »).
2. **Le thème corrompu** (re-skin global) — à quoi ressemble le HUD **une fois
   corrompu** : palette altérée (magenta/void), glitch ambiant **léger** (non
   fatigant). Montrer un écran existant (Réseau **ou** Garde-robe) en version
   corrompue vs normale.
3. **Le contrôle Purger / Ré-embrasser** (`CorruptionControl`) — carte/panneau DS
   affichant l'état courant (corrompu / purgé) + l'action.
4. **Le titre glitch exclusif** — sa `CosmeticCard` (marquée « corruption », comme
   « Trouvé en caisse » d'US-034) en Garde-robe + son rendu sur le Profil.

### Maquette

Reçue le 23/07/2026 (`C:\Users\flori\Downloads\corruption`, **non versionnée** —
convention #007). 4 surfaces + stills + démo interactive. **Très fidèle à notre DS
réel** (vérifié) : `StatCard`/`HudPanel`/`ProgressBar`/`Tag`/`Badge`/`Button`/`Icon`
existent tous, l'accent **`magenta` est déjà dans notre palette DS**, et
`RarityBadge`/`RankPips`/`CosmeticCard` (états `locked`/`unequipped`/`equipped`/
`forge`) sont ceux d'US-031/033/035.

**Plan de réutilisation :**
- **Réutilisé tel quel :** `Card`, `Button`, `Icon`, `StatCard`, `HudPanel`,
  `ProgressBar`, `Tag`, `Badge` ; `RarityBadge`/`RankPips`/`CosmeticCard` existants ;
  `RunnerIdCard`/`ProfileView` (US-032) pour la surface 4.
- **Nouveau** (dans `features/corruption/`, justifié, respecte le DS) : `GlitchText`
  (texte à décalage RGB), `Interference` (overlay scanlines/grain/glitch-block,
  `level` 0-1), `GlitchMark` (hexagone glitché), `CorruptionRevealOverlay`
  (= `PactCanvas` : glitch → hail → pacte → issue), `CorruptionRevealHost`,
  `CorruptionControl`, `PactButton` ; `corruption.css` (keyframes, garde
  reduced-motion) ; `theme/tokens/corruption.css` (tokens du thème corrompu).

**Écarts / interprétations (validés PO à confirmer) :**
1. **Thème corrompu = re-skin GLOBAL via `data-corruption`** (technique validée
   §2), **pas** `accent="magenta"` par composant. La maquette passe l'accent à
   chaque composant pour *démontrer* le look ; en vrai, un overlay CSS global
   re-teinte le chrome (patron « Chrome + fonds » d'US-031) + glitch ambiant léger
   (`Interference`). Le `BuilderHUD` de démo n'est qu'un exemple : c'est l'**écran
   Réseau réel** qui sera re-teinté.
2. **Pas de 6ᵉ rareté.** Le titre glitch reste **`rarity: 'legendary'` +
   `source: 'corruption'`** ; le traitement magenta/glitch de la carte est piloté
   par `source === 'corruption'` (comme « Trouvé en caisse » d'US-034, mais glitch).
   On garde 5 raretés (alternative écartée : vrai 6ᵉ cran, plus lourd, non requis).
3. **Surface 4 = intégrer dans `ProfileView`/`RunnerIdCard` existants** (US-032) via
   le thème corrompu global — pas un nouveau `MiniProfile` (celui de la maquette
   n'est qu'un rendu).
4. **Narratif** repris (hail du GLITCH « TU CROYAIS AVOIR TOUT VU », 3 lignes,
   messages d'issue) → **i18n FR + EN** (EN à écrire).
5. **Contenus de démo écartés** : toggle reduced-motion, boutons « DÉCLENCHER/
   REJOUER », stats inventées (« ∞ », débit 9.4M). Une icône à ajouter au registre :
   **`shield-x`** (refuser/purger) ; le reste existe déjà.
6. **Timings** (glitch 1,6 s → hail 3,2 s → pacte) repris en placeholder,
   **ajustables en recette**.

**Alignements notables :** « CE PACTE EST IRRÉVERSIBLE — EN APPARENCE » + « le
glitch reviendra » collent exactement aux garde-fous (embrasser réversible via
purge ; refus ré-offert à la renaissance suivante) ; reduced-motion géré (saute
glitch/hail, statique) = critère 8 ; `CorruptionControl` corrupted↔purged = cycle
`embraced`↔`purged`.

**STOP — validation de la maquette avant le plan d'implémentation.**

## 4. Plan d'implémentation  _(porte de validation)_

Ordre bas→haut (pur → données → stores → thème → UI → i18n → vérifs). Chaque
étape laisse `typecheck` vert.

**Couche pure (game/) — le moteur + le contenu**
1. **`game/reveals.ts`** — moteur de reveals **déterministe** : types (`RevealId =
   'corruption'`, `RevealContext = { prestigeCount }`, `RevealDef`), registre
   `REVEALS`, `CORRUPTION_PRESTIGE_THRESHOLD = 3` (exporté), `newlyTriggeredReveals(
   discovered, ctx): RevealId[]`. **Zéro RNG.**
2. **`game/reveals.test.ts`** — `prestigeCount` 2 ⇒ rien, 3 ⇒ `['corruption']` ;
   déjà dans `discovered` ⇒ rien ; déterminisme ; extensibilité du registre.
3. **`game/cosmetics.ts`** — étend `source?: 'crate' | 'corruption'` ; ajoute **le
   titre glitch** (`rarity: 'legendary'`, `source: 'corruption'`) ; helper
   `corruptionCosmetics()`. Met à jour `game/cosmetics.test.ts`.

**Données (Dexie) — persistance qui survit à la renaissance**
4. **`db/types.ts`** — `CorruptionState = 'dormant' | 'offered' | 'refused' |
   'embraced' | 'purged'` ; `CosmeticsState` gagne `discoveredReveals: string[]`,
   `corruption: CorruptionState`, `corruptionArmedAt: number | null`.
5. **`db/db.ts`** — **migration v22** (rétro-remplissage `[]` / `'dormant'` /
   `null` ; patron des migrations de champ v11→v21).
6. **`db/seed.ts`** — seed le singleton cosmétique avec les 3 nouveaux champs.

**Store cosmétique — la logique du reveal + du pacte**
7. **`useCosmeticsStore.ts`** — state (3 champs) + `checkReveals(ctx)` (arme
   `offered` si `dormant` & déclenché ; ré-offre si `refused` & `prestigeCount >
   corruptionArmedAt`) + `embraceCorruption()` (→ `embraced`, applique thème +
   `grant([titre])`) + `refuseCorruption()` (→ `refused`) + `purgeCorruption()`
   (→ `purged`, retire le thème, garde le titre) ; `load()` applique le thème
   corrompu ssi `embraced` + miroir ; persistance.

**Thème corrompu — l'axe CSS global**
8. **`features/corruption/corruptionTheme.ts`** — `applyCorruption(on)` /
   `mirrorCorruption(on)` / `bootCorruption()` (attribut `data-corruption`, calque
   exact de `features/cosmetics/theme.ts`).
9. **`theme/tokens/corruption.css`** — tokens du re-skin magenta sous
   `:root[data-corruption="on"]` (re-teinte chrome + fonds, patron « Chrome +
   fonds » US-031, réutilise `--crate-blackice-chroma-rgb`) ; importer dans
   l'agrégat de thèmes.
10. **`main.tsx`** — `bootCorruption()` à côté de `bootCosmeticTheme()` (anti-FOUC).

**Déclenchement — brancher sur le prestige**
11. **`useBuilderStore.ts`** — `checkReveals({ prestigeCount })` **après
    `prestige()`** et **au `load()`** (rattrapage), via
    `useCosmeticsStore.getState()` (patron `grantMilestoneCrates`).

**UI — primitives glitch, séquence, contrôle**
12. **Primitives** `features/corruption/` : `GlitchText.tsx`, `Interference.tsx`
    (`level` 0-1), `GlitchMark.tsx` + `corruption.css` (keyframes `nw-glitch-*`,
    **toutes sous garde `prefers-reduced-motion`**).
13. **`CorruptionRevealOverlay.tsx`** + **`PactButton.tsx`** — séquence
    `glitch → hail → pacte → issue` (reduced-motion : saute direct au pacte,
    statique) ; boutons EMBRASSER/REFUSER → `embraceCorruption`/`refuseCorruption`.
14. **`CorruptionRevealHost.tsx`** — monte l'overlay quand `corruption === 'offered'`
    (hébergé dans `AppShell`, comme les toasts).
15. **`CorruptionControl.tsx`** — Purger / Ré-embrasser ; visible **seulement** si
    `corruption ∈ {embraced, purged}` ; inséré dans **`WardrobeView`** (hub
    cosmétique / thèmes).
16. **`CosmeticCard.tsx`** — traitement `source === 'corruption'` (badge de source
    + rendu titre glitch, calque de « Trouvé en caisse »). `ProfileView`/
    `RunnerIdCard` : vérifier le rendu sous `data-corruption` (titre glitch équipé),
    ajuster au besoin. `features/corruption/index.ts` exports.

**Finitions**
17. **`Icon.tsx`** — ajoute **`shield-x`** au registre statique (refuser/purger).
18. **i18n** `locales/{fr,en}.json` — bloc `corruption.*` (hail, pacte, issues,
    contrôle, nom du titre) ; **style compact une ligne préservé** ; EN écrit.
19. **Vérifs** : `typecheck` + `lint` + `build`/PWA + `tests` (reveals +
    cosmetics), viser **vert**. Vérif visuelle navigateur en recette (séquence,
    reduced-motion, rattrapage `prestigeCount ≥ 3`, purge, survie renaissance).
