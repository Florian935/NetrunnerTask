# US-034 — Caisses & rituel d'ouverture (voie aléatoire)

- **MVP :** A3
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-034-caisses-ouverture

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** la **voie aléatoire** de l'acquisition hybride de la Phase A3, en
  complément de la voie déterministe soldée par US-033 (jalons → cosmétiques
  garantis). Le joueur **gagne** des caisses en jouant (jamais achetées), les
  ouvre via un **rituel d'ouverture**, et en tire un cosmétique selon une **table
  de probabilités par rareté affichée**. Trois **qualités** de caisse, aux tables
  différentes.

- **Pour qui :** le joueur du builder — objectif **rétention long terme** :
  un pool à compléter, le frisson du tirage, une collection qui déborde ce que le
  mérite seul donne.

- **Constat de départ (fonde l'US) :** le catalogue actuel compte **14
  cosmétiques, tous déjà obtenables en déterministe** (4 de départ + 10
  récompenses de jalons US-033). Des caisses qui piocheraient dans ce même
  catalogue ne lâcheraient que des doublons ou des objets déjà promis. **La voie
  aléatoire n'a de valeur que si elle apporte du contenu exclusif** → voir H1.

- **Hypothèses à valider (PO) :**

  - **H1 — Contenu exclusif aux caisses.** On ajoute un **nouveau pool de
    cosmétiques réservés aux caisses** (les 4 types possibles, majoritairement
    `rare`→`legendary`), qui **ne tombent jamais** de la voie déterministe. La
    collection (aperçu US-033) s'agrandit d'autant. *Proposition : ~8 à 12
    nouveaux cosmétiques exclusifs, dont 1-2 légendaires « drop only ».*

  - **H2 — Comment on gagne une caisse** (garde-fou : jamais contre une monnaie
    farmable). Sources **vérifiées par l'app** et non farmables en boucle.
    *Recommandation :* (a) chaque **renaissance** (prestige, seuil incrémental
    US-026 → effort réellement croissant) octroie une caisse de **qualité
    supérieure** ; (b) chaque **jalon atteint** (US-028, one-shot) octroie **en
    plus** de son cosmétique garanti une caisse **standard** — donne un afflux
    précoce, la renaissance prend le relais ensuite. *(La caisse
    quotidienne/hebdo est explicitement US-035 — hors périmètre ici.)*

  - **H3 — Trois qualités + tables de probas affichées.** Qualités
    **standard / sécurisée / Black ICE** (reprise du thème historique), chacune
    avec sa **table de probabilités par rareté** (la meilleure qualité = plus de
    chances de haute rareté). La table est **consultable avant d'ouvrir**
    (transparence).

  - **H4 — Rituel d'ouverture.** Ouvrir une caisse déclenche une **révélation**
    (animation courte, `prefers-reduced-motion` respecté → révélation
    instantanée) qui dévoile **un** cosmétique avec son cran de rareté, en
    réutilisant `CosmeticCard` + la rampe de rareté d'US-031.

  - **H5 — Doublons en v1.** Le filet anti-malchance (pity) et la conversion des
    doublons (fragments) sont **explicitement US-035**. *Proposition v1 :* tant
    que le pool éligible de la caisse contient au moins un cosmétique **non
    possédé**, le tirage garantit du **neuf** (pas de doublon) ; pool épuisé →
    [comportement à trancher : rien / petit lot de crédits]. À valider.

  - **H6 — Inventaire de caisses non ouvertes.** Les caisses gagnées
    **s'accumulent** (compteur par qualité, persisté Dexie) ; le joueur **choisit
    quand ouvrir** (le rituel garde sa valeur). Emplacement d'accès à trancher au
    design (Garde-robe étendue ou entrée dédiée).

- **Invariant (non négociable, pas une hypothèse) :** un cosmétique tiré est
  **purement esthétique** (aucun effet sur la production) ; les caisses non
  ouvertes **et** les cosmétiques tirés **survivent à la renaissance** et au
  rechargement, comme `owned` d'US-031.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)

  1. **Gagner une caisse** — quand l'événement source se produit (ex.
     renaissance), le **compteur de caisses** de la qualité correspondante
     augmente de **+1** et un **feedback** l'annonce.
  2. **Voir son stock** — l'inventaire affiche le **nombre de caisses non
     ouvertes par qualité** ; une qualité à 0 est absente ou désactivée (pas
     d'ouverture possible).
  3. **Consulter la table** — avant d'ouvrir, le joueur peut afficher la **table
     de probabilités par rareté** de la qualité choisie ; les pourcentages
     **somment à 100 %**.
  4. **Ouvrir** — l'ouverture **décrémente** le compteur de la qualité de **1**,
     joue le rituel, et ajoute **exactement 1** cosmétique à `owned` ; le
     cosmétique tiré appartient au **pool exclusif caisses** (H1).
  5. **Rituel & rareté** — la révélation montre le cosmétique avec son **cran de
     rareté** (`CosmeticCard` + `RarityBadge`) ; en `prefers-reduced-motion`, la
     révélation est **instantanée** (aucune animation), le résultat identique.
  6. **Pas de doublon tant que possible (v1)** — si le pool éligible contient au
     moins un cosmétique non possédé, l'ouverture en donne **toujours un non
     possédé** (jamais un doublon).
  7. **Persistance & renaissance** — après rechargement de l'app **et** après une
     **renaissance**, les caisses non ouvertes et les cosmétiques tirés sont
     **conservés** (vérifiable en base).
  8. **Garde-fous** — un cosmétique tiré est **équipable** via la Garde-robe et
     **sans effet** sur la production ; **aucun moyen** d'obtenir une caisse
     contre des crédits / cycles / crypto.

- **Impact UI :** **significatif** → une **étape design** sera nécessaire avant
  l'implémentation (rituel d'ouverture, inventaire de caisses, affichage des
  tables de probas). À proposer après validation des cadrages fonctionnel puis
  technique.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel **validé PO le 23/07/2026** (H1→H6 + invariant, 8 critères).
> Recommandations adoptées : H2 = renaissance + jalons ; H5 = garantir du neuf
> tant que le pool éligible en contient. Le comportement « pool épuisé » est
> tranché ci-dessous (décision technique #3).

- **Fichiers impactés :**

  - **Nouveau module pur `src/game/crates.ts`** (cœur de règle, testé) —
    qualités de caisse, tables de probabilité, tirage. **Aucune valeur de jeu**
    (comme `cosmetics.ts`), n'importe rien de `builder`/`prestige`.
  - `src/game/cosmetics.ts` — **étend le catalogue `COSMETICS`** avec le pool
    exclusif caisses (H1) + champ `source?: 'crate'` sur `Cosmetic` (défaut =
    déterministe). Helper `crateCosmetics()` (pool exclusif).
  - `src/game/milestones.ts` — inchangé sur les récompenses ; on lit
    `MILESTONE_DEFS` (`hidden`) côté store pour choisir la qualité de caisse
    (décision #2). Aucun `reward` ajouté.
  - `src/db/types.ts` — `CosmeticsState.crates: Record<CrateQuality, number>`
    (stock de caisses **non ouvertes** par qualité).
  - `src/db/db.ts` — **migration Dexie v20** (champ `crates`, rétro-remplissage
    à `{ standard: 0, secured: 0, blackice: 0 }` — patron des migrations de champ
    v11→v16). Aucune reconciliation de `owned` (le pool exclusif est du contenu
    **neuf**, aucune sauvegarde ne le possède).
  - `src/db/seed.ts` — `crates` initial à zéro sur le singleton cosmétique neuf.
  - `src/db/repositories/cosmetics.ts` — inchangé (`save` prend déjà
    `Omit<CosmeticsState,'id'>`, `crates` suit automatiquement).
  - `src/stores/useCosmeticsStore.ts` — état `crates` + `grantCrate(quality)`
    (incrémente, persiste) + `openCrate(quality)` (décrémente, tire via
    `crates.ts`, `grant([id])` ou crédits de consolation, persiste, **renvoie le
    résultat** pour le rituel).
  - `src/stores/useBuilderStore.ts` — **câblage du gain** : `grantCrate` sur
    renaissance (`prestige()`) et sur jalon franchi (`checkAndApplyMilestones` +
    jalon `hack`), silencieux au `load()` (comme `grantMilestoneRewards`).
  - `src/stores/usePlayerStore.ts` — réutilisé (`adjustCredits`) pour la
    consolation « pool épuisé » (décision #3). Aucune modification.
  - `src/stores/useFeedbackStore.ts` — feedback « caisse gagnée »
    (`triggerCrateEarned(quality)`), léger.
  - **UI (design)** : inventaire de caisses + action d'ouverture (panneau, à
    placer au design — Garde-robe ou Profil), **rituel d'ouverture**
    (`CrateOpeningModal` réutilisant `CosmeticCard`/`RarityBadge`), **affichage
    des tables de probas** (`CrateOdds`). État verrouillé de la Garde-robe :
    indice « Trouvé en caisse » pour les cosmétiques `source: 'crate'` (là où
    US-033 affiche le jalon source).
  - `src/i18n/locales/{fr,en}.json` — libellés qualités/rituel/odds + noms,
    descriptions, titres des nouveaux cosmétiques exclusifs.
  - **Tests** : `src/game/crates.test.ts` (nouveau) + extensions
    `cosmetics.test.ts`/`collection.test.ts` (pool exclusif, totaux).

- **Logique :**

  - **Qualités** : `CrateQuality = 'standard' | 'secured' | 'blackice'`
    (standard / sécurisée / Black ICE).
  - **Tables de probas** : `CRATE_ODDS: Record<CrateQuality, Record<Rarity,
    number>>`, chaque ligne **somme à 1** (invariant testé, C3). Qualité montante
    = poids déplacé vers les hautes raretés.
  - **Tirage pur, RNG injecté** : `openCrate(quality, owned, rng = Math.random):
    CrateDraw` où `rng: () => number`. Première introduction de hasard dans
    `game/*` (tous déterministes jusqu'ici) → **RNG injecté** pour des tests
    déterministes (patron : on passe une séquence contrôlée). Algorithme :
    1. tirer une **rareté** selon `CRATE_ODDS[quality]` ;
    2. restreindre au **pool exclusif non possédé** de cette rareté ; si vide,
       se rabattre sur les autres raretés encore non possédées (anti-doublon C6) ;
    3. si **tout le pool exclusif est possédé** → consolation crédits (décision
       #3). Sortie : `{ kind: 'cosmetic', id }` ou `{ kind: 'credits', amount }`.
  - **Gain de caisse** (store builder, événements déjà vérifiés par l'app) :
    renaissance → 1 caisse `secured` ; jalon normal → 1 caisse `standard` ;
    jalon **caché** (`ghost`/`cartel`) → 1 caisse `blackice` (décision #2).
    Silencieux au `load()`, feedback sinon.
  - **Ouverture** (store) : garde `crates[quality] > 0`, appelle le tirage,
    décrémente, applique (`grant`/crédits), persiste ; le rituel révèle le
    résultat (reduced-motion → révélation instantanée, C5).
  - **Aperçu de collection** (US-033) : `collection.ts` inchangé — les nouveaux
    cosmétiques entrant dans `COSMETICS`, les totaux et « X restants » grandissent
    automatiquement.

- **Impacts modèle de données :**
  - **Nouveau champ persisté** `CosmeticsState.crates` → **migration Dexie v20**
    (rétro-remplissage à zéro). Vit sur le singleton **cosmétique** → **survit à
    la renaissance** par construction (`prestige()` ne touche que `builderState`),
    satisfait l'invariant + C7.
  - **Catalogue** étendu (nouveaux `id` stables, `source: 'crate'`) — donnée
    statique, non persistée par joueur. Pas de re-lock de `owned`.
  - Aucun impact sur `builderState`, `player` (hors lecture `adjustCredits`),
    `contracts`, `factions`.

- **Décisions techniques (à valider) :**
  1. **RNG injecté** dans `crates.ts` (`rng: () => number`, défaut `Math.random`)
     — préserve la pureté/testabilité malgré l'introduction du hasard.
  2. **Mapping source → qualité** : renaissance = `secured` · jalon normal =
     `standard` · jalon caché = `blackice`. Donne aux 3 qualités une source
     naturelle et indexée sur l'effort (garde-fou).
  3. **Pool épuisé → consolation crédits** (montant modeste, à régler en recette)
     via `usePlayerStore.adjustCredits`. C'est la **couture** que le pity +
     fragments d'US-035 remplacera. (Alternative écartée : bloquer l'ouverture —
     moins satisfaisant, laisserait des caisses inertes.)

## 3. Design  _(porte de validation, si impact UI significatif)_

_Pressenti significatif (voir « Impact UI »). À cadrer après le cadrage technique._

## 3. Design — _validé PO le 23/07/2026_

- **Écrans concernés :** Garde-robe (`/wardrobe`) — inventaire de caisses,
  table de probas, rituel d'ouverture (overlay), tuile verrouillée « Trouvé en
  caisse ».
- **Maquette :** `crates` (reçue 23/07/2026, `app.jsx` + `index.html`). Fidèle à
  NIGHTWIRE ; rampe de rareté = **exactement** nos tokens `--rarity-*` (réutilise
  `RarityBadge`/`RankPips`/`CosmeticPreview`/`rarityStyle`). Identité caisses
  **violet → frost** (hors accents réservés cyan/rouge/ambre). Écarts validés :
  palette caisses gardée telle quelle · `CRATE_ODDS` = valeurs maquette
  (ajustables recette) · pool exclusif = **contenu à créer** (items maquette
  illustratifs) · résultat du rituel propose « Équiper / Continuer ».

## 4. Plan d'implémentation  _(porte de validation)_

> Ordre bas→haut (règle pure → données → store → UI → i18n → vérifs). Chaque
> étape `game/*` est testée. Réutilise le DS existant ; ne crée de composant que
> quand nécessaire (signalé **NOUVEAU**).

1. **`game/crates.ts` (NOUVEAU, pur) + `crates.test.ts`.** Types
   `CrateQuality = 'standard' | 'secured' | 'blackice'`, `CRATE_QUALITIES`
   (ordre montant). `CRATE_ODDS: Record<CrateQuality, Record<Rarity, number>>`
   (valeurs maquette : `standard` 55/28/12/4/1 · `secured` 30/33/24/10/3 ·
   `blackice` 8/22/34/24/12). `CONSOLATION_CREDITS` (décision #3, montant
   réglable). `CrateDraw = { kind: 'cosmetic'; id } | { kind: 'credits'; amount }`.
   `openCrate(quality, owned, cratePool, rng = Math.random): CrateDraw` : tire une
   rareté selon la table, restreint au pool exclusif **non possédé** de cette
   rareté, se rabat sur les autres raretés non possédées si vide (anti-doublon),
   consolation crédits si pool épuisé. **RNG injecté** (décision #1). Tests :
   Σ = 1 par qualité (C3) ; distribution respectée sur RNG contrôlé ; jamais de
   doublon tant qu'il reste du neuf (C6) ; pool épuisé → crédits ; déterminisme.

2. **`game/cosmetics.ts` — pool exclusif.** Ajouter `source?: 'crate'` à
   `Cosmetic` (absent = déterministe). Étendre `COSMETICS` de **10 cosmétiques
   `source: 'crate'`** (ids/icônes **distincts** de l'existant), couvrant les 4
   types et les 5 raretés (≥ 2 par rareté) :
   - commun : `crate-larva` (avatar) · `crate-null` (titre)
   - amélioré : `crate-static` (bannière) · `crate-wraith` (avatar)
   - rare : `crate-glacier` (titre) · `crate-blackout` (bannière)
   - épique : `crate-nemesis` (avatar) · `crate-omega` (titre)
   - légendaire : `crate-obsidian` (thème) · `crate-voidsurge` (bannière)

   Helper `crateCosmetics()` (les `source: 'crate'`). Glyphes finaux validés
   contre lucide à l'étape 13. Étendre `cosmetics.test.ts` : pool caisses
   **disjoint** des `STARTER_COSMETICS` et des `reward` de jalons ; chaque rareté
   a ≥ 1 item de caisse (garantit un tirage possible).

3. **`game/milestones.ts` — inchangé.** On lit `MILESTONE_DEFS[].hidden` côté
   store (étape 8) pour choisir la qualité ; aucun `reward` ajouté.

4. **Thème `crate-obsidian`.** Ajouter le bloc `[data-cosmetic-theme=
   "crate-obsidian"]` dans `theme/tokens/themes.css` (re-skin « Chrome + fonds »,
   décision US-031). Seul le thème exclusif légendaire touche le CSS de thème.

5. **`db/types.ts`.** `CosmeticsState.crates: Record<CrateQuality, number>`
   (stock de caisses non ouvertes par qualité).

6. **`db/db.ts` — migration Dexie v20.** Champ `crates`, rétro-remplissage
   `{ standard: 0, secured: 0, blackice: 0 }` (patron migrations de champ
   v11→v16). Aucune reconciliation de `owned` (contenu neuf).

7. **`db/seed.ts`.** `crates` à zéro sur le singleton cosmétique neuf.

8. **`stores/useCosmeticsStore.ts`.** État `crates` (chargé au `load`, écrit au
   `persist`). `grantCrate(quality)` (incrémente + persiste). `openCrate(quality)`
   : garde `crates[quality] > 0`, tire via `openCrate` pur (`Math.random`,
   `crateCosmetics()`), décrémente, applique (`grant([id])` ou
   `usePlayerStore.getState().adjustCredits(+amount)`), persiste, **renvoie le
   `CrateDraw`** (le rituel révèle).

9. **`stores/useFeedbackStore.ts`.** Feedback léger « caisse gagnée » —
   `triggerCrateEarned(quality)` (toast dédié discret ; réutilise le patron des
   toasts existants).

10. **`stores/useBuilderStore.ts` — câblage du gain** (décision #2), silencieux
    au `load()` (patron `grantMilestoneRewards`) :
    - `prestige()` réussi → `grantCrate('secured')` + feedback.
    - jalon franchi normal → `grantCrate('standard')` ; jalon **caché**
      (`ghost`/`cartel`) → `grantCrate('blackice')` — dans
      `checkAndApplyMilestones` + le jalon événementiel `hack`.
    - au `load()` : gains rejoués **en silence** (bandeau de rattrapage suffit).

11. **`CrateIcon` (NOUVEAU, DS).** Coffre biseauté (`clip-bevel-sm`), glow montant
    par qualité, état désactivé (grisé), variante « charge » (anticipation).

12. **Composants Garde-robe (NOUVEAUX, DS) :**
    - `CratesPanel` + `CrateSlot` — inventaire (compteur par qualité, « Ouvrir »,
      qualité à 0 désactivée [C2], lien « voir les probabilités », rappel
      « gagnées — jamais achetées »).
    - `CrateOddsTable` — table de probas par qualité (onglets, barres codées
      rareté, Σ = 100 % [C3]).
    - `CrateOpeningModal` — overlay du rituel : phases anticipation → révélation →
      résultat, halo/rayons intensifiés aux hautes raretés, cas consolation
      crédits, actions « Équiper »/« Continuer » ; **variante
      `prefers-reduced-motion` = révélation instantanée** (C5). Réutilise
      `CosmeticCard` + `RarityBadge`.

13. **`CosmeticCard` — extension source caisse.** Brancher `item.source ===
    'crate'` : indice « Trouvé en caisse » + libellé/icône/couleur de la qualité
    (au lieu de « Débloqué par ‹ jalon › »). Nouvelle prop d'indice de caisse.
    L'appelant (`WardrobeView`) fournit la qualité source du cosmétique.

14. **`Icon.tsx`.** Ajouter les glyphes lucide manquants (pressentis : `package`,
    `package-open`, `snowflake`, `shield`, `bar-chart-3`, `sparkles`, `coins`,
    `plus`, `bug`, `antenna`, `drama`, `zap-off`, `biohazard`, `atom`… — liste
    exacte figée en codant, glyphes du pool inclus).

15. **`WardrobeView` — assemblage.** Monter `CratesPanel` ; état d'ouverture du
    `CrateOpeningModal` (branché sur `openCrate` du store) ; ouverture/fermeture
    de `CrateOddsTable` ; câbler l'indice « Trouvé en caisse » des tuiles
    verrouillées `source: 'crate'`. Aperçu de collection (US-033) inchangé (les
    nouveaux cosmétiques grossissent les totaux automatiquement).

16. **CSS.** Keyframes du rituel (charge/secousse/anneau/éclat/rayons/montée)
    dans `cosmetics.css`, sous garde `prefers-reduced-motion: reduce`.

17. **i18n FR/EN.** Libellés qualités + panneau + table + rituel + toast « caisse
    gagnée » + noms/sous-titres/titres des 10 cosmétiques de caisse.

18. **Vérifs.** `typecheck` + `lint` + `build`/PWA + `tests` verts avant recette ;
    vérif visuelle navigateur en recette (dont re-tirage, reduced-motion,
    survie renaissance, pool épuisé → crédits).
