# US-020 — A1 : Noyau du builder (squelette vertical)

- **MVP :** A (Phase A — jeu builder, pivot #022)
- **Priorité :** haute
- **Statut :** en cours
- **Branche :** feature/US-020-noyau-builder

> Contexte : première brique du pivot (décision #022, `docs/vision-plateforme.md`,
> `docs/roadmap.md` § Roadmap produit). But de cette US : **le squelette jouable**
> du builder — la plus petite boucle qui tourne — pour répondre à **la** question
> qui conditionne tout le projet : *le socle est-il satisfaisant ?* Local-first,
> **sans backend**. Le module to-do existant n'est pas touché.

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** un premier écran de jeu « **Réseau** » où l'utilisateur bâtit un
  début d'empire de netrunner. Une ressource (**`cycles`**), une **action manuelle
  « hack »** qui en produit, et un **premier générateur** achetable qui produit des
  cycles **automatiquement** (tant que l'app est ouverte). La boucle **produire →
  dépenser → produire plus** doit tourner et donner envie de continuer. Rien de
  plus : c'est un squelette vertical destiné à **valider le fun** avant d'investir.

- **Pour qui :** l'utilisateur solo (mono-utilisateur) ; et le PO, qui s'en sert
  pour **trancher si le socle builder mérite qu'on continue** (Phase A).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. Depuis la navigation de l'app, un onglet/lien **« Réseau »** ouvre le nouvel
     écran du builder.
  2. **Au tout premier lancement** : solde de `cycles` = **0**, **aucun** générateur
     possédé, production automatique = **0/s**.
  3. **Cliquer sur « Hack »** augmente le solde de `cycles` d'un **montant de base
     fixe** (ex. +1) **à chaque clic**.
  4. **Acheter un générateur** débite son **coût** en `cycles` et incrémente le
     nombre possédé ; l'achat est **impossible** (bouton désactivé/refusé) si le
     solde est **insuffisant**.
  5. **Chaque générateur possédé produit des `cycles` automatiquement** : le solde
     **augmente seul** au rythme affiché (`cycles/s`) tant que l'écran/app est
     ouvert.
  6. Le **coût du prochain générateur augmente** à chaque achat (escalade), et ce
     coût est **affiché** avant l'achat.
  7. **Recharger l'app conserve l'état** (solde + générateurs possédés) : la
     progression n'est **pas perdue**. *(Le calcul de la production « hors-ligne »
     pendant l'absence est explicitement reporté à A5/US-024 — au rechargement, on
     reprend les compteurs sauvegardés, sans créditer le temps écoulé.)*
  8. Le **module to-do existant reste inchangé et pleinement fonctionnel** (aucune
     régression : création 2 s, complétion, XP/crédits, etc.).
  9. **Hors-ligne préservé (PWA)** : l'écran Réseau et sa boucle de production
     fonctionnent sans réseau, comme le reste de l'app.

- **Hors périmètre (anti-dérapage — reporté aux tranches suivantes) :**
  - Plusieurs types de générateurs, upgrades, multiplicateurs, réglage de la courbe
    exponentielle → **A2 / US-021**.
  - Nouvelle couche de ressource, arbre de déblocage, reveal caché → **A3 / US-022**.
  - Accélérateurs issus du réel (focus, podométrie, quiz…) → **A4 / US-023**.
  - Production hors-ligne (temps écoulé pendant l'absence), prestige/renaissance →
    **A5 / US-024**.
  - Lien avec le to-do / économie perso, cosmétiques, monétisation, tout le
    connecté (clans, classements) → **A6 / Phase B**.

- **Impact UI significatif :** **OUI** — c'est un **nouvel écran principal** (le
  builder « Réseau »), à construire sur le design system NIGHTWIRE. → **étape
  design à prévoir** (au minimum une maquette légère du builder) avant
  l'implémentation. À confirmer au cadrage technique.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel **validé PO le 19/07/2026**.

- **Fichiers impactés :**
  - **Logique pure** : `src/game/builder.ts` (+ `builder.test.ts`) — rendement du
    hack, coût escaladé du générateur, production/s. Zéro dépendance UI/Dexie
    (cible de test #014).
  - **Store** : `src/stores/useBuilderStore.ts` (Zustand) — état réactif + actions
    `hack()`, `buyGenerator()`, `tick(deltaMs)`, `load()`. S'appuie sur la logique
    pure + le repo.
  - **Persistance** : `src/db/` — nouvelle entité **`BuilderState`** (singleton
    `id:'me'`), **migration Dexie v10**, repository `builderRepo` (aucun Dexie hors
    de `src/db/`, #009). Écriture **throttlée** (pas à chaque tick).
  - **Boucle de production** : hook `useBuilderTick` (intervalle ~250 ms–1 s) monté
    dans la vue ; incrémente via `tick(deltaMs)` ; **pause propre** onglet masqué
    (`visibilitychange`). **Pas de calcul hors-ligne** (reporté A5/US-024).
  - **Vue & route** : `src/features/builder/BuilderView.tsx` + route **`/network`**
    dans `AppShell` (react-router v7, #015) + entrée dans le rail de navigation.
  - **UI** : primitives NIGHTWIRE (`HudPanel`, `StatCard`, `Button`, `Icon`) ;
    retour « hack » animé via **Framer Motion** (#011).
  - **i18n** : catalogue `builder.*` FR + EN, zéro chaîne en dur (#010) ; icône(s)
    ajoutées au registre statique si besoin.

- **Logique :**
  - Constantes de réglage dans `builder.ts` : `HACK_YIELD` (ex. 1), `GEN_BASE_COST`,
    `GEN_COST_GROWTH` (ex. ×1,15/achat), `GEN_YIELD_PER_SEC`.
  - `nextGeneratorCost(count)` = `round(GEN_BASE_COST × GEN_COST_GROWTH^count)` ;
    `productionPerSec(count)` = `count × GEN_YIELD_PER_SEC`.
  - `hack` → `cycles += HACK_YIELD` ; `buyGenerator` → si `cycles ≥ cost` alors
    `cycles -= cost; count += 1` (sinon no-op) ; `tick(dt)` →
    `cycles += productionPerSec(count) × dt/1000`. Fonctions **pures + testées** ;
    le store orchestre et persiste.

- **Impacts modèle de données :**
  - Nouvelle entité **`BuilderState`** : `{ id:'me', cycles:number,
    generatorCount:number, updatedAt:number }` (`updatedAt` = base de tick, réutilisé
    par A5). **Migration Dexie v10** (seed idempotent à 0, patron #009). **Aucune
    modification** de `Contract`/`Faction`/`Player`.
  - `cycles` = `number` JS (suffisant pour A1 ; grande échelle = tranches ultérieures).

- **Architecture évolutive (réponse PO, 19/07/2026)** : le futur multi-mondes /
  multi-DS est préservé par de **bonnes frontières**, pas par un moteur spéculatif.
  *Déjà acquis* : thème = **tokens/données** (`src/theme/`, §6 vision), logique de
  jeu **pure et isolée** de l'UI (`src/game/`). *Ajouté ici, à bas coût* : réglages
  **regroupés en objet config** (pas de nombres magiques épars) ; composants sur
  **tokens sémantiques** (aucune couleur en dur) → futur monde = nouveau pack de
  tokens + module de mécaniques, sans réécriture. *Délibérément PAS en A1* :
  généraliser les générateurs en système data-driven (→ **A2**, sur 2 cas réels) ;
  bâtir un « world-engine » (→ extrait de mondes réels le moment venu). À détailler
  dans `docs/architecture.md` quand le multi-mondes approchera.
- **Immersion (P9)** : l'écran doit **incarner NIGHTWIRE** (fond signature, cadres
  HUD, néon) et rendre le **hack « juteux »**. Enjeux techniques : Framer Motion,
  respect `prefers-reduced-motion` (`MotionConfig`, #011), perf du tick, PWA/offline.
  La **mise en scène complète** relève de l'étape design ci-dessous — sur A1 : «
  immersif sans sur-production ».

## 3. Design  _(porte de validation, si impact UI significatif)_

Significatif : **nouvel écran principal**.

- **Écrans concernés :** l'écran **« Réseau »** (`/network`) — le builder.
- **Maquette :** **reçue le 20/07/2026** (`docs/maquettes/US-020/`, prototype JSX
  jouable NIGHTWIRE : `game.jsx` + `showcase.jsx`). Couvre les états **initial
  (0/0/0)**, **en cours** (production active) et **achat désactivé** (solde
  insuffisant), en **mobile** (rail bas) et **desktop** (rail gauche, hero+hack à
  gauche, daemon en flanc). Immersion P9 : fond du monde (navy + quadrillage
  dérivant + 4 halos d'angle), **hack juteux** (anneau d'onde + `+1` qui gicle +
  noyau hexa néon), daemon `SCRAPER-01`. `prefers-reduced-motion` respecté.
  **Adoptée.** **Maquette non versionnée** (convention #007) — supprimée après
  implémentation. À la recette, la carte daemon maison a été remplacée par le
  composant DS `<Card hud brackets halo="violet">` (repères d'angle collés aux
  coins, comme les contrats).
- **Décision de périmètre (rail)** : on ajoute **uniquement l'onglet Réseau** au
  rail existant (Tableau de bord + Contrats). « Stats »/« Profil » de la maquette =
  **projections futures, non implémentées** en A1.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Dexie v10 + entité `BuilderState`** : version 10, table `builderState`
   (singleton `id:'me'`), seed idempotent `{cycles:0, generatorCount:0, updatedAt}`
   (patron #009) ; `builderRepo` (get/save).
2. **Logique pure `src/game/builder.ts`** (+ `builder.test.ts`) : objet config
   `BUILDER_CONFIG` (rendement manuel, daemon `{baseCost, growth, yieldPerSec}`) ;
   `nextGeneratorCost(owned)`, `productionPerSec(owned)`, `hack`, `buyGenerator`
   (refus si solde <), `tick(state, dtMs)`. Tests des règles.
3. **Store `useBuilderStore`** (Zustand) : `{cycles, generatorCount, loaded}`,
   `load()`, `hack()`, `buyGenerator()`, `applyTick(dtMs)` — mutations via la
   logique pure puis persistance **throttlée**.
4. **Hook `useBuilderTick`** : boucle (~100–250 ms), calcule `dt`, appelle
   `applyTick` ; **pause sur `visibilitychange`** ; **pas de rattrapage hors-ligne**
   (→ A5) ; persistance throttlée (période + au blur).
5. **i18n `builder.*`** FR + EN (titres, daemon, `HACK`/`Compiler`, « solde
   insuffisant », hints). Zéro chaîne en dur (#010).
6. **Registre d'icônes** (`Icon.tsx`, #008) : ajouter `share-2`, `cpu`, `zap`,
   `plus`, `lock`, `alert-triangle` (+ celles du rail si absentes).
7. **CSS feature** (`src/features/builder/*.css`) : porter les keyframes
   (`nw-drift-slow`, `nw-breathe`, `nw-hack-ring`, `nw-float-up`, `nw-pop`) + le
   fond du monde ; **vérifier/mapper les tokens** (`--grid-lines`, `--void-700`,
   `--clip-bevel-md`, glows) contre `src/theme/`.
8. **Composants** (`src/features/builder/`) : `WorldBg`, `CycleReadout`,
   `HackZone`, `DaemonCard`, `BuilderView` (layouts mobile/desktop de la maquette),
   branchés sur `useBuilderStore` (remplace l'état local du proto). `MotionConfig
   reducedMotion="user"` (#011).
9. **Route & navigation** : route **`/network`** dans `AppShell` (#015) + onglet
   **Réseau** dans le rail existant. **Pas** de Stats/Profil (§3).
10. **Non-régression to-do** : Contrats + boucle existante intacts (aucune modif
    de `Contract`/`Faction`/`Player`).
11. **Vérifs** : typecheck + lint + build + tests (dont `builder.test.ts`) ; test
    **PWA/hors-ligne** (`build` + `preview`) — l'écran Réseau tourne offline.
12. **Recette** (skill `recette`) : dérouler les 9 critères d'acceptation.
