# US-021 — A2 : Daemons & automatisation

- **MVP :** A (Phase A — jeu builder, pivot #022)
- **Priorité :** haute
- **Statut :** en cours
- **Branche :** feature/US-021-daemons-automatisation

> Contexte : 2ᵉ brique de la Phase A (roadmap produit, `docs/roadmap.md`). US-020
> a posé la boucle nue (un daemon, un HACK). A2 fait **respirer le builder tout
> seul** : plusieurs types de daemons, un mécanisme d'**amélioration (upgrade)**,
> et une montée qui devient **exponentielle** → naît une vraie **optimisation**
> (« qu'est-ce que j'achète en priorité ? »). C'est ici qu'on **généralise** la
> logique d'US-020 (un générateur → un catalogue **piloté par la donnée**), comme
> annoncé au cadrage US-020 (sur 2 cas réels). Local-first, sans backend.

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** étendre l'écran « Réseau » d'un seul daemon à un **catalogue de
  plusieurs types de daemons** (chacun son coût et sa production), qui se
  **débloquent progressivement**, plus au moins un **upgrade** qui **multiplie**
  la production. Le joueur ne fait plus que marteler HACK : il **arbitre** ses
  achats et regarde sa production s'emballer.

- **Pour qui :** l'utilisateur solo — et le PO, pour valider que la couche
  d'**automatisation + optimisation** donne envie de revenir (rétention Phase A).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1. L'écran Réseau propose **au moins 3 types de daemons**, chacun avec **nom,
     production/s et coût propres**.
  2. Les coûts/productions sont **indépendants par type** : acheter un type
     n'altère pas le coût des autres.
  3. Le **coût d'un type monte à chaque achat de ce type** (escalade par type),
     affiché avant achat ; **achat refusé** (verrouillé) si solde insuffisant.
  4. **Déblocage progressif** : un type reste **caché/verrouillé** tant que sa
     condition n'est pas remplie (règle simple et lisible, ex. « posséder ≥ 1 du
     type précédent ») ; il **apparaît** dès qu'elle l'est → sensation de
     découverte.
  5. **Au moins un upgrade** achetable **multiplie la production** (globale), à
     **niveaux** (coût escaladé) ; son effet est **visible immédiatement** sur le
     débit `cycles/s`.
  6. Le **débit total `cycles/s`** = somme des productions de tous les daemons
     possédés **× multiplicateur(s) d'upgrade** ; affiché et exact.
  7. Le daemon **SCRAPER-01 (US-020) est conservé** comme 1ᵉʳ du catalogue ; la
     **progression existante est préservée** après migration (cycles + SCRAPER-01
     déjà possédés intacts).
  8. Types possédés **et** upgrades **persistent** après rechargement (F5).
  9. Le **HACK manuel** (US-020) reste inchangé et fonctionnel.
  10. Non-régression : local-first + hors-ligne préservés, **to-do intact**,
      `prefers-reduced-motion` respecté (P9).

- **Hors périmètre (anti-dérapage — tranches suivantes) :**
  - 2ᵉ couche de ressource / arbre de déblocage / reveal caché → **A3 / US-022**.
  - Accélérateurs issus du réel (focus, pas, quiz…) → **A4 / US-023**.
  - Production hors-ligne (temps écoulé) + prestige → **A5 / US-024**.
  - Lien module perso, monétisation, connecté (clans/classements) → **A6 / Phase B**.

- **Impact UI significatif :** **Oui, modéré** — l'écran Réseau évolue (liste de
  plusieurs daemons + section « améliorations »). On **réutilise `DaemonCard`** (DS).
  → **étape design à prévoir** : disposition de la liste de daemons + des upgrades
  (maquette légère probable). À confirmer au cadrage technique.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel **validé PO le 20/07/2026** : **3-4 types** de daemons ;
> **upgrades par type** (chaque daemon a sa piste d'amélioration).

- **Fichiers impactés :**
  - `src/game/builder.ts` (+ `builder.test.ts`) — **généralisation** : catalogue
    **`GENERATORS`** (data-driven, 3-4 defs : `id`, `baseCost`+`costGrowth`,
    `baseYieldPerSec`, règle de **déblocage**, **`upgrade` par type** `{baseCost,
    costGrowth, multiplier}`, `icon`, clés i18n nom/rôle). Fonctions généralisées :
    `generatorCost(def, owned)`, `upgradeCost(def, level)`,
    `generatorProduction(def, owned, upLevel)`, `productionPerSec(state)` (somme),
    `isUnlocked(def, state)`, `hack`, `buyGenerator(state, id)`,
    `buyUpgrade(state, id)`, `tick(state, dt)`.
  - `src/db/types.ts` — `BuilderState` : `generatorCount` (nombre) → **`generators:
    Record<string, number>`** (possédés/type) + **`upgrades: Record<string, number>`**
    (niveau d'upgrade/type) ; `cycles`/`updatedAt` inchangés.
  - `src/db/db.ts` — **migration Dexie v11** : `generatorCount` →
    `generators: { scraper: <count> }`, `upgrades: {}` (préserve SCRAPER-01 + cycles).
  - `src/db/seed.ts` — état vierge `{ cycles:0, generators:{}, upgrades:{}, updatedAt }`.
  - `src/stores/useBuilderStore.ts` — état maps ; actions **`buyGenerator(id)`** /
    **`buyUpgrade(id)`** (logique pure + persistance immédiate) ; `applyTick`
    inchangé (s'appuie sur `productionPerSec(state)`).
  - `src/features/builder/` — `BuilderView` (liste des daemons **débloqués**, mappée
    sur le catalogue + total lu du store) ; **`DaemonCard` paramétré** par def +
    possédés + niveau d'upgrade + achetabilités, avec **bouton d'upgrade par type** ;
    `builder.css` (bouton upgrade, style éventuel « verrouillé »).
  - `src/i18n/locales/{fr,en}.json` — `builder.generators.<id>.{name,role}` (3-4) +
    libellés upgrade (`builder.upgrade`, niveau, coût). Zéro chaîne en dur.
  - `src/components/ui/core/Icon.tsx` — 2-3 icônes daemon (ex. `bug`, `ghost`, `waves`).

- **Logique :**
  - Production d'un type = `owned × baseYieldPerSec × (upgrade.multiplier ^ upLevel)` ;
    **débit total** = somme sur les types possédés. Coûts escaladés (générateur **et**
    upgrade) via `ceil(base × croissance^n)`.
  - **Déblocage chaîné** : un type est visible dès que
    `generators[def.unlock.afterOwned] ≥ 1` ; le 1ᵉʳ (SCRAPER-01) est toujours
    débloqué. Achats en **no-op** si solde insuffisant.
  - Fonctions **pures + testées** (catalogue, coûts, production avec upgrade,
    déblocage, achats) ; le store orchestre + persiste (immédiat à l'achat
    daemon/upgrade ; hack/tick throttlés par le hook — inchangé US-020).

- **Impacts modèle de données :**
  - `BuilderState = { id:'me', cycles, generators: Record<string,number>, upgrades:
    Record<string,number>, updatedAt }`. **Migration Dexie v11** depuis v10
    (`generatorCount` → `generators.scraper` ; `upgrades: {}`).
  - Ids de générateurs = **clés stables** (catalogue) → ajouter un type = **une
    entrée de données**, pas de migration. (Généralisation annoncée au cadrage
    US-020 §2, sur 2 cas réels : ici on en a 3-4.)

## 3. Design  _(porte de validation, si impact UI significatif)_

Cadrage technique **validé PO le 20/07/2026**. Impact UI modéré : l'écran « Réseau »
gagne une **liste de daemons**, un **contrôle d'upgrade par type**, et un état
**verrouillé/teaser** pour les daemons non encore débloqués. **Réutilise `DaemonCard`**
(DS, US-020).

- **Écrans concernés :** écran « Réseau » (`/network`) — liste de `DaemonCard`
  (débloqués), contrôle d'upgrade intégré à chaque carte, carte verrouillée/teaser.
- **Maquette :** **reçue & adoptée le 20/07/2026** (`docs/maquettes/US-021/`, proto
  JSX). Carte daemon à **2 boutons** — **Compiler** (cyan, +1 unité) + **Améliorer**
  (menthe→ambre, `Nv.{lvl+1}` + coût + effet ×2, prod avant→après) ; **carte teaser**
  verrouillée (« ??? » respirant + scanline + condition de déblocage `key-round`) ;
  **bandeau « Production réseau »** (total `/s` + nb de types) ; liste empilée
  (mobile) / grille 2 colonnes (desktop) ; **4 daemons** (scraper / sifter / wraith
  + oracle-teaser). **Non versionnée** (convention #007) — supprimée après
  implémentation. *Implémentation* : cartes sur le composant DS `<Card>` (pas la
  carte maison du proto) ; icônes à ajouter `filter`, `ghost`, `radar`, `key-round`.

## 4. Plan d'implémentation  _(porte de validation)_

1. **Généraliser `game/builder.ts`** (+ `builder.test.ts`) : catalogue `GENERATORS`
   (4 defs : scraper/sifter/wraith/oracle — coût base+croissance, prod/u, `upgrade`
   {base, croissance, ×mult}, `unlock` chaîné, icône, clés i18n). Fonctions :
   `generatorCost`, `upgradeCost`, `generatorProduction(def, owned, lvl)`,
   `productionPerSec(state)`, `isUnlocked(def, state)`, `nextLockedGenerator(state)`,
   `hack`, `buyGenerator(state, id)`, `buyUpgrade(state, id)`, `tick`. Tests (coûts,
   prod avec upgrade, déblocage chaîné, achats no-op).
2. **Modèle & migration** : `BuilderState` → `generators`/`upgrades` maps ; **Dexie
   v11** (`generatorCount` → `generators.scraper`, `upgrades:{}`) ; `seed` nouvel état
   `{cycles:0, generators:{}, upgrades:{}, updatedAt}`.
3. **Store `useBuilderStore`** : état maps + `buyGenerator(id)` / `buyUpgrade(id)`
   (logique pure + persistance immédiate) ; `applyTick` via `productionPerSec(state)`.
4. **Icônes** : ajouter `filter`, `ghost`, `radar`, `key-round` au registre.
5. **i18n** : `builder.generators.<id>.{name,role}` (4) + `builder.upgrade.*`
   (« Améliorer », niveau, coût, effet ×2 avant→après) + `builder.teaser.*`
   (« ??? », verrouillé, signature chiffrée, condition « posséder 1× {prev} », ≈prod)
   + `builder.totalRate` (« Production réseau », « {n} types »). FR + EN.
6. **`DaemonCard`** (paramétré) sur `<Card hud brackets halo="violet">` : def + owned
   + lvl + achetabilités → **2 boutons** (Compiler cyan / Améliorer menthe `Nv.+coût`)
   + ligne d'effet. Flash au level-up (respect `prefers-reduced-motion`).
7. **`TeaserCard`** (nouveau) : carte verrouillée (bordure pointillée, `???` respirant,
   scanline `nw-teaser-scan`, ≈prod, condition de déblocage). Reduced-motion OK.
8. **`TotalRate`** (nouveau/intégré) : bandeau « Production réseau » = débit total +
   nb de types.
9. **`BuilderView`** : section daemons = bandeau total + liste des daemons **débloqués**
   (map catalogue, chaîné) + **teaser** du prochain verrouillé ; empilé mobile / grille
   2 col desktop. Compteur héros + HACK d'US-020 inchangés.
10. **CSS** (`builder.css`) : 2 boutons côte à côte, carte teaser (pointillé + scanline),
    keyframe level-up flash ; `prefers-reduced-motion`.
11. **Vérifs** : typecheck + lint + build/PWA + tests ; **migration v11 vérifiée**
    (SCRAPER-01 + cycles préservés).
12. **Recette** (skill `recette`) : les 10 critères d'acceptation.
