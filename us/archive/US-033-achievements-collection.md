# US-033 — Achievements-récompenses + aperçu de collection

- **MVP :** A3 (Phase A3 — Identité & Collection, décision #035)
- **Priorité :** moyenne
- **Statut :** fait
- **Branche :** feature/US-033-achievements-collection

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  La **voie déterministe** de l'acquisition hybride (décision #035) : des
  **accomplissements** (dont certains cachés) débloquent des **cosmétiques
  ciblés et garantis**. Concrètement, cette US **bascule le socle d'US-031 de
  « tout débloqué » vers « une partie se gagne »** : quelques cosmétiques de
  départ restent acquis, les autres se méritent en atteignant des objectifs
  précis. S'y ajoute un **aperçu de collection** (progression par rareté, du type
  « il te reste X légendaires dans le pool ») pour nourrir le complétionnisme.

  C'est la 1ʳᵉ des deux voies d'acquisition (l'autre, aléatoire = caisses,
  US-034). Elle donne des **objectifs concrets à viser** et une **récompense qui
  se garde** — cœur de la rétention long-terme A3.

  **Hors périmètre** : les caisses / le hasard (US-034), le pity/fragments
  (US-035), tout nouveau cosmétique au-delà du catalogue d'US-031 (on débloque
  l'existant, on n'en crée pas de nouveaux ici).

- **Pour qui :**
  Le joueur complétionniste : il veut savoir **quoi viser**, sentir que ses
  accomplissements **rapportent quelque chose de visible et permanent**, et
  suivre **où il en est** dans sa collection.

- **Hypothèses de cadrage** (à valider / arbitrer par le PO) :
  - **H1 — Les achievements étendent les jalons d'US-028** (recommandé, et
    conforme à la roadmap « relie/étend les jalons d'US-028 »). Un accomplissement
    reste un **prédicat sur l'état** (comme un jalon), auquel on **attache une
    récompense cosmétique**. On réutilise le socle US-028 (prédicats,
    flag `achievedMilestones`, feedback) plutôt qu'un système parallèle.
    *Alternative : un catalogue d'achievements distinct (`game/achievements.ts`)
    dédié aux récompenses. → PO tranche.*
  - **H2 — Répartition départ / à gagner.** Restent **acquis au départ** les
    cosmétiques de base (les 4 équipés par défaut : thème `nightwire`, avatar
    `daemon`, bannière `sweep`, titre `architect`). Les **~10 autres** deviennent
    **à débloquer** via achievements, la rareté de la récompense calée sur la
    difficulté de l'accomplissement (un cosmétique légendaire = un objectif
    exigeant). *→ PO valide le principe et l'ampleur.*
  - **H3 — Sauvegarde existante** (tout est `owned` depuis US-031, pré-release) :
    au chargement (migration), **recalculer `owned` = cosmétiques de départ ∪
    récompenses des achievements déjà satisfaits**. On **re-verrouille** donc ce
    qui n'a pas encore été mérité, pour rendre la boucle de déblocage réelle et
    testable. *→ PO valide (sinon tout resterait débloqué et l'US serait sans
    effet visible).*
  - **H4 — Affichage** : (a) la **liste des accomplissements** (état atteint +
    cosmétique récompensé ; les cachés restent masqués tant que non atteints) —
    en réutilisant/étendant le panneau des jalons **`MilestonesPanel`** (US-028) ;
    (b) l'**aperçu de collection** (par rareté : « débloqués / total », « X
    légendaires restants ») en tête de la **Garde-robe**. *→ PO valide ces deux
    emplacements.*
  - **H5 — Feedback de déblocage** : quand un accomplissement livre un cosmétique,
    un **retour dédié** (toast/reveal « cosmétique débloqué ») distinct du toast
    de jalon simple.

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. **Départ partiellement verrouillé** : sur une partie neuve, seuls les
     cosmétiques de départ (H2) sont **possédés** ; les autres apparaissent
     **verrouillés** en Garde-robe (non équipables), avec l'indication de
     **comment les débloquer**.
  2. **Déblocage par accomplissement** : atteindre l'objectif d'un achievement à
     récompense → le **cosmétique correspondant est ajouté aux possédés** et
     devient **équipable**.
  3. **Feedback de déblocage** : au moment du déblocage, un **retour dédié**
     signale le cosmétique gagné (H5).
  4. **Garantie & permanence** : le cosmétique débloqué l'est **définitivement**
     (survit à la renaissance, au rechargement) ; le déblocage est **déterministe**
     (pas de hasard) et **ne se reproduit pas** (idempotent).
  5. **Liste des accomplissements** : un écran/panneau liste les achievements avec
     leur **état** (atteint / à faire) et le **cosmétique récompense** ; les
     **cachés** ne sont pas révélés tant que non atteints (H4a).
  6. **Aperçu de collection** : la Garde-robe affiche la **progression par
     rareté** (débloqués / total) et le **reste par cran** (ex. « X légendaires
     restants ») (H4b).
  7. **Cosmétiques verrouillés non équipables** : tenter d'équiper un cosmétique
     non encore débloqué est **impossible** (pas d'action « Équiper »).
  8. **i18n FR/EN** : libellés des achievements, récompenses, aperçu de
     collection, feedback — traduits, aucune chaîne en dur.

- **Impact UI significatif : OUI** (état verrouillé/déblocage en Garde-robe,
  liste d'accomplissements avec récompenses, aperçu de collection, feedback de
  déblocage). → **Étape design (maquette)** à prévoir après validation des
  cadrages.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel validé PO le 23/07/2026 (H1 étendre les jalons · H2 départ
> vs à-gagner · H3 re-verrouillage · H4 `MilestonesPanel` + aperçu Garde-robe).

- **Principe** — H1 : on **étend les jalons US-028** au lieu d'un système
  parallèle. Un jalon peut porter une **récompense cosmétique** ; l'atteindre
  **débloque** le cosmétique. Le catalogue de jalons devient le catalogue
  d'achievements. Aucun nouveau flag persisté (on réutilise `achievedMilestones`
  + `owned`).

- **Fichiers modifiés :**
  - `src/game/milestones.ts` — `MilestoneDef` gagne **`reward?: string`** (`id`
    d'un cosmétique). **Mapping curaté** (rareté ~ difficulté) des **10
    cosmétiques à gagner** sur les jalons (les 2 jalons **cachés** `ghost`/
    `cartel` portent les récompenses les plus rares). Helpers purs :
    `rewardFor(milestoneId)`, `milestoneForCosmetic(cosmeticId)` (map inverse,
    pour l'état verrouillé de la Garde-robe).
  - `src/game/cosmetics.ts` — nouvelle constante **`STARTER_COSMETICS`** (les 4
    équipés par défaut) ; **`DEFAULT_COSMETICS.owned` passe de « tout » à
    `STARTER_COSMETICS`** (H2/H3 : une partie neuve ne possède que le départ).
  - `src/db/db.ts` — **migration Dexie v19** (H3) : recalcule le singleton
    `cosmeticsState` → `owned = STARTER ∪ récompenses(achievedMilestones)` (lit
    `builderState.achievedMilestones` + le mapping de `milestones.ts`), et
    **réconcilie `equipped`** (un slot pointant un cosmétique désormais
    verrouillé repasse au défaut de son type). Pas de champ nouveau — bump de
    version pour rejouer l'`upgrade`.
  - `src/stores/useCosmeticsStore.ts` — action **`grant(ids)`** : ajoute les `id`
    aux `owned` (idempotent, no-op si déjà possédés), persiste ; renvoie les
    nouveaux.
  - `src/stores/useBuilderStore.ts` — là où un jalon devient atteint
    (`checkAndApplyMilestones`, `hack`, et le merge silencieux de `load()`) :
    collecter les récompenses des jalons **nouvellement** atteints →
    `useCosmeticsStore.getState().grant(rewardIds)` → pour chaque déblocage,
    `useFeedbackStore.triggerCosmeticUnlock(id)` (**pas** de toast au `load()`
    silencieux, comme pour les jalons — le déblocage hors-ligne reste discret).
  - `src/stores/useFeedbackStore.ts` — nouvelle **file `cosmeticUnlocks`**
    (comme `milestones`) + `triggerCosmeticUnlock`/`dismissCosmeticUnlock`.
  - `src/app/AppShell.tsx` — héberge le nouveau **`CosmeticUnlockToast`**.
  - `src/features/cosmetics/CosmeticCard.tsx` — **état verrouillé** (cosmétique
    non possédé) : pas de bouton « Équiper », pastille cadenas + **indice de
    déblocage** (le jalon source, via `milestoneForCosmetic`).
  - `src/features/cosmetics/WardrobeView.tsx` — affiche **tout le catalogue**
    (possédés + verrouillés visibles) ; **masque** les cosmétiques dont le jalon
    source est **caché et non atteint** (même logique « scellé » que l'arbre) ;
    intègre l'**aperçu de collection** en tête.
  - `src/features/builder/MilestonesPanel.tsx` — chaque ligne affiche le
    **cosmétique récompense** (verrouillé → nom masqué si jalon caché).
  - `src/i18n/locales/{fr,en}.json` — clés `cosmetics.locked.*` (indice),
    `cosmetics.collection.*` (aperçu, « X légendaires restants »),
    `cosmetics.unlock.*` (toast), + intitulés de récompense (réutilisent
    `cosmetics.items.<id>.name`). Zéro chaîne en dur.

- **Fichiers créés :**
  - `src/game/collection.ts` (+ `collection.test.ts`) — **couche pure** :
    `collectionByRarity(owned)` → par cran `{ owned, total }` (aperçu de
    collection). Cible testable (convention #014).
  - `src/features/cosmetics/CollectionPreview.tsx` — barre/synthèse par rareté en
    tête de Garde-robe (consomme `collectionByRarity`).
  - `src/features/cosmetics/CosmeticUnlockToast.tsx` — retour dédié de déblocage
    (reveal du cosmétique gagné + sa rareté), même famille que `MilestoneToast`.

- **Logique clé :**
  - **Déblocage déterministe & idempotent (C2/C4)** : un jalon à récompense qui
    devient atteint `grant`e son cosmétique une seule fois (l'`id` déjà dans
    `owned` = no-op ; `achievedMilestones` append-only garantit « une fois »).
  - **Permanence (C4)** : `owned` vit dans `cosmeticsState`, non touché par
    `prestige()` → survit à la renaissance.
  - **Verrouillage (C1/C7)** : la Garde-robe lit le catalogue complet ;
    `isOwned` pilote équipable/verrouillé. Un cosmétique de jalon caché non
    atteint est **omis** (ni possédé, ni indice).
  - **Reconciliation équipé** : après re-verrouillage (migration), aucun slot ne
    peut rester équipé sur un cosmétique verrouillé (repli défaut) — invariant
    « équipé ⊂ possédé ».

- **Impacts modèle de données :**
  - **Aucun champ nouveau.** **Migration Dexie v19** = *reconciliation de
    données* du singleton `cosmeticsState` (`owned`/`equipped`) selon les
    accomplissements. `MilestoneDef.reward` est du **code** (catalogue), non
    persisté. Compat ascendante : une partie neuve démarre au `STARTER` via le
    seed inchangé (qui lit `DEFAULT_COSMETICS.owned`).

- **Décisions techniques à acter (PO) :**
  1. **Récompense portée par le jalon** (`MilestoneDef.reward`) — extension, pas
     de nouveau système ni de flag persisté (H1).
  2. **Re-verrouillage par migration v19** (recompute `owned` + réconcilie
     `equipped`) plutôt que de laisser les saves existantes tout débloqué (H3).
  3. **Aperçu de collection = couche pure `game/collection.ts`** + composant
     dédié, en tête de Garde-robe (H4b).

## 3. Design  _(porte de validation, si impact UI significatif)_

> Cadrages fonctionnel + technique validés PO le 23/07/2026. Impact UI
> significatif → **maquette à fournir par le PO (Claude Design)** avant le plan.
> **STOP.**

- **Écrans / surfaces concernés :**
  1. **`CosmeticCard` — état VERROUILLÉ** (3ᵉ état, après équiper/équipé d'US-031)
     : cadenas, cosmétique grisé/tramé, **indice de déblocage** (le jalon source,
     ex. « Débloqué par : PREMIÈRE RENAISSANCE »), pas de bouton « Équiper ».
     Badge de rareté toujours visible (on sait ce qu'on vise).
  2. **Aperçu de collection (`CollectionPreview`)** — en tête de Garde-robe :
     synthèse **par rareté** (débloqués / total, ex. barres/pastilles par cran) +
     mise en avant du **reste** (« X légendaires restants dans le pool »).
  3. **`MilestonesPanel` étendu** — chaque ligne de jalon montre le **cosmétique
     récompense** (aperçu + rareté ; masqué si jalon caché non atteint).
  4. **`CosmeticUnlockToast`** — retour de déblocage : **reveal** du cosmétique
     gagné (aperçu + nom + rareté), même famille que `MilestoneToast`.

- **À rappeler à la maquette :** référentiel **NIGHTWIRE** (tokens `src/theme/`),
  pas la charte SparkWine. **Réutiliser** la rampe de rareté et la `CosmeticCard`
  d'US-031 (on ajoute juste l'état verrouillé), le langage des aperçus par type,
  et la famille de toasts d'US-028.

- **Maquette :** `cosmectic-progression` (Claude Design, reçue le 23/07/2026 ;
  **non versionnée**, convention #007). 4 surfaces : `CosmeticCard` 3 états
  (verrouillé/équiper/équipé), aperçu de collection par rareté, panneau
  accomplissements (récompense + lignes scellées), `CosmeticUnlockToast`.

- **Analyse (cohérence DS + faisabilité) :**
  - **Fidèle à nos tokens**, et surtout **réutilise à l'identique** la rampe de
    rareté, les aperçus par type et la `CosmeticCard` d'US-031 : on **étend**,
    on ne réécrit pas. L'état verrouillé = aperçu grisé/tramé + cadenas + bloc
    « DÉBLOQUÉ PAR » (bordure pointillée, icône `key-round`).
  - Toast de déblocage bien dans la famille des toasts existants (`nw-toast-in`,
    brackets, scanlines). Nécessite un petit keyframe `nw-reveal` (nouveau).

- **Réutilisation du design system (consigne PO) :**
  - `CosmeticCard` → on **étend l'existante** (US-031) avec un 3ᵉ état
    **verrouillé** (`locked` + `hint`), pas une nouvelle carte.
  - `RarityBadge`/`RankPips`/aperçus par type → **réutilisés tels quels** (US-031).
  - Panneau accomplissements → **extension du `MilestonesPanel` existant** (US-028,
    onglet Réseau) : on ajoute une **puce récompense** par ligne. Pas de nouveau
    panneau parallèle (H4a).
  - Nouveaux composants : `CollectionPreview` (bandeau), `RewardChip` (puce
    récompense), `CosmeticUnlockToast` (reveal). Icônes à ajouter : `award`,
    `layout-grid`.

- **Écarts recommandés (à valider) :**
  - **Contenu des accomplissements = nos vrais jalons builder (US-028)** + mapping
    de récompense, **pas** les accomplissements de la maquette. Les exemples
    « Série de 7 jours » et « 50 tâches purgées » relèvent du **module perso**
    (to-do) — **écartés** (cohérent avec le découplage #022 et la décision profil
    #037 : l'identité/collection est celle du **Réseau**). « Première
    renaissance » (GÉN. 01) correspond bien à un vrai jalon (`reborn`).
  - **Pas de fraction de progression** (« 38/50 ») sur les lignes : nos jalons
    sont des **prédicats booléens** (atteint / à faire / scellé), pas des
    compteurs. On garde atteint/à-faire/scellé.
  - Le CTA « ÉQUIPER → » du toast reste **indicatif** (le toast informe ; l'action
    se fait en Garde-robe) — ou cliquable vers `/wardrobe`, à voir en implémentation.

## 3. Design  _(porte de validation, si impact UI significatif)_

_Impact UI significatif détecté (voir §1) — maquette à fournir par le PO après
les cadrages._

## 4. Plan d'implémentation  _(porte de validation)_

> Cadrages + maquette `cosmectic-progression` validés PO le 23/07/2026. Ordre
> bas → haut, chaque étape vérifiable. Pas de code avant validation.

1. **Récompenses & départ (couches pures) + tests** :
   - `game/cosmetics.ts` : `STARTER_COSMETICS` (`nightwire`, `avatar-daemon`,
     `banner-sweep`, `title-architect`) ; `DEFAULT_COSMETICS.owned = STARTER`.
   - `game/milestones.ts` : `MilestoneDef.reward?: string` + **mapping curaté**
     des 10 cosmétiques à gagner (proposition, ajustable en recette) : hack→
     `avatar-raven`, daemon→`avatar-phantom`, roster→`banner-surge`, upgrade→
     `title-ghost`, data→`cryo`, tree→`avatar-icebreaker`, accel→`title-overdrive`,
     crypto→`ecarlate`, reborn→`banner-apex`, ghost(caché)→`title-zeroday` ;
     `cartel`(caché) sans récompense. Helpers `rewardFor`/`milestoneForCosmetic`.
   - Tests : chaque cosmétique **earnable** mappé une fois ; les `STARTER` ne
     sont récompense d'aucun jalon ; cachés → raretés hautes.
2. **`game/collection.ts` + tests** — `collectionByRarity(owned)` → par cran
   `{ owned, total }` + reste (« X légendaires restants »).
3. **Migration Dexie v19** (`db.ts`) — recalcule le singleton `cosmeticsState` :
   `owned = STARTER ∪ rewardFor(achievedMilestones)` (lit `builderState`), et
   **réconcilie `equipped`** (slot sur cosmétique verrouillé → défaut du type).
   Pas de champ nouveau (bump de version pour l'`upgrade`). Seed inchangé (part
   de `DEFAULT_COSMETICS.owned` = STARTER).
4. **Store cosmétique** — `useCosmeticsStore.grant(ids)` (ajoute aux `owned`,
   idempotent, persiste, renvoie les nouveaux).
5. **Feedback** — `useFeedbackStore` : file **`cosmeticUnlocks`** +
   `triggerCosmeticUnlock`/`dismissCosmeticUnlock`.
6. **Câblage du déblocage** (`useBuilderStore`) — dans `checkAndApplyMilestones`,
   `hack`, et le merge de `load()` : pour les jalons **nouvellement** atteints à
   récompense → `grant(...)` + `triggerCosmeticUnlock(...)` (**pas** de toast au
   `load()` silencieux).
7. **Icônes** — `award`, `layout-grid` au registre `Icon.tsx`.
8. **`cosmetics.css`** — keyframe `nw-reveal` (+ `nw-blink` si besoin), garde
   reduced-motion.
9. **`CosmeticCard` — état verrouillé** : prop `state`/`locked` + `hint` ; aperçu
   grisé/tramé + cadenas overlay + bloc « DÉBLOQUÉ PAR » (pas de bouton Équiper).
10. **`RewardChip`** (`features/cosmetics/`) — puce récompense (icône type +
    nom + `RarityBadge` ; scellé → « ??? » + cadenas).
11. **`CosmeticUnlockToast`** (`features/cosmetics/`) — reveal (aperçu + nom +
    rareté + source), hébergé dans `AppShell`.
12. **`CollectionPreview`** (`features/cosmetics/`) — bandeau par rareté
    (pastilles + reste), en tête de Garde-robe.
13. **`WardrobeView`** — affiche **tout le catalogue** (possédés + verrouillés
    visibles) ; **masque** les cosmétiques de jalon **caché non atteint** ;
    `CosmeticCard` reçoit `state`/`hint` (via `milestoneForCosmetic`) ; intègre
    `CollectionPreview` en tête.
14. **`MilestonesPanel`** — ajoute la **puce récompense** (`RewardChip`) par
    ligne (masquée « ??? » si jalon caché non atteint).
15. **i18n FR/EN** — `cosmetics.locked.*` (« Débloqué par »), `cosmetics.collection.*`
    (« X légendaires restants »), `cosmetics.unlock.*` (toast), libellés jalons
    inchangés (récompense = `cosmetics.items.<id>.name`). Zéro chaîne en dur.
16. **Vérifications** — `typecheck` + `lint` + `build`/PWA + `test` ; vérif
    visuelle `:5180` avant recette (dont C1 : re-verrouillage effectif via v19).
