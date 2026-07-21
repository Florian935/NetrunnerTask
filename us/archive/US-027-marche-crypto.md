# US-027 — Marché crypto (Phase A2, 1ʳᵉ tranche)

- **MVP :** A2
- **Priorité :** haute
- **Statut :** fait (recette 9/9 PO le 22/07/2026)
- **Branche :** feature/US-027-marche-crypto

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  Issue du brainstorming du 21/07/2026 (Phase A2, décision #029) : le builder
  (A1→A5) a prouvé sa boucle, mais manque de **profondeur de contenu**. US-027
  introduit une **3ᵉ ressource, le crypto**, avec un comportement
  **délibérément différent** de `cycles`/`data` (qui s'accumulent passivement) :
  le crypto se **convertit manuellement depuis `data`, à un cours qui fluctue
  dans le temps**. C'est la 1ʳᵉ vraie **décision de timing** du jeu (« je
  convertis maintenant ou j'attends un meilleur cours ? »).

  Le cours n'est **pas aléatoire au sens propre** : il est calculé par une
  **fonction déterministe de l'horodatage réel**, sur le même principe que le
  chrono des accélérateurs (US-023) et le rattrapage hors-ligne (US-024) —
  « instant absolu ». Concrètement pour le joueur : un ticker qui monte et
  descend de façon observable (échelle de quelques minutes à quelques heures),
  qu'il peut regarder évoluer et sur lequel il peut choisir d'attendre.

  Le crypto se débloque via un **nouveau nœud dans l'arbre de déblocage
  existant** (financé en `data`) — chaîne narrative cohérente avec l'existant :
  daemons → data → nœud → crypto (même pattern qu'oracle→data en A3). Une fois
  débloqué, le crypto finance à son tour une **2ᵉ branche** de l'arbre de
  déblocage, en parallèle de la branche `data` actuelle, réutilisant le même
  type de composants/mécaniques (nœuds avec coût, état, effet ; potentiel 2ᵉ
  reveal caché sur cette nouvelle branche).

  Reprend explicitement la progression **compute → data → crypto → influence →
  ???** envisagée dans `docs/vision-plateforme.md` §3ter.3.

  *Périmètre v1 volontairement simple (embryon, comme les tranches
  précédentes)* : mécanisme de conversion basique (pas de montant libre
  sophistiqué — un choix simple type « convertir tout »/curseur en %, à
  trancher en cadrage technique), et 3-4 nœuds sur la nouvelle branche pour
  commencer. Paramètres exacts (formule du cours, coûts, effets des nœuds) à
  trancher en cadrage technique — cette étape pose le **quoi**, pas les
  chiffres.

- **Pour qui :**
  Le joueur qui a progressé dans l'arbre `data` (post-A3) et qui, après avoir
  tout débloqué sur la chaîne actuelle, cherche une nouvelle couche à explorer
  — avec, cette fois, une vraie décision active plutôt qu'un simple achat dès
  que le solde le permet.

- **Critères d'acceptation :** (action → résultat attendu)
  1. Tant que le nœud de déblocage crypto n'est pas acheté, **aucune
     information** sur le marché crypto n'est visible (mécanique invisible,
     même traitement que `data` avant `oracle` en A3).
  2. Acheter ce nœud (dans l'arbre `data` existant) → le panneau **marché
     crypto** devient visible sur l'écran `/network`.
  3. Le panneau affiche un **cours qui varie dans le temps**, observable sur
     plusieurs minutes sans aucune action du joueur (ticker vivant).
  4. Le joueur peut **convertir du `data` en crypto** ; le montant crédité
     dépend du cours **au moment de la conversion** (un cours plus haut donne
     plus de crypto pour la même quantité de `data` convertie — vérifiable en
     comparant deux conversions à des instants différents).
  5. Une **2ᵉ branche** de l'arbre de déblocage apparaît, listant au moins 3
     nœuds achetables **en crypto** (coût + état affichés, même traitement que
     la branche `data` existante).
  6. Acheter un nœud de cette branche débite le crypto et applique son effet
     (bonus mesurable) ; solde insuffisant → achat impossible (no-op / bouton
     désactivé, comme partout ailleurs dans le builder).
  7. Un nœud de la nouvelle branche reste **caché** tant qu'une condition n'est
     pas remplie, avec un traitement de reveal dédié — même principe que le
     nœud caché existant de la branche `data` (US-022).
  8. Recharger la page conserve le solde crypto et les nœuds crypto débloqués ;
     le cours affiché reste **cohérent avec le temps réel écoulé** (fonction
     déterministe → pas de valeur incongrue après un reload ou une absence).
  9. **Non-régression** : `cycles`/`data`, l'arbre existant, les accélérateurs
     réels (US-023) et le prestige (US-024) continuent de fonctionner
     normalement.

## 2. Cadrage technique  _(porte de validation)_

> Révisé après maquette (`network-crypto`, validée PO le 21/07/2026) — voir
> §3. Changements vs. 1ʳᵉ version : cours en **CR pour 1 000 data** (pas un
> taux par unité) ; fonction déterministe à **3 oscillations** (pas 2), calée
> sur le ressenti « dérive + bruit + retour à la moyenne » de la maquette ;
> nouveau **3ᵉ type d'effet de nœud** (`cryptoFloor`, plancher de cours) ;
> l'effet du nœud « ARBITRAGE AUTO » est **reformulé** (bonus de production
> classique, pas une conversion automatique — évite de réintroduire une
> accumulation passive du crypto, contraire au principe posé et à
> l'indépendance vis-à-vis du rattrapage hors-ligne) ; accent **ambre**
> (nouveau) → `Card.tsx` étendu ; 2 icônes ajoutées.

- **Fichiers impactés :**
  - `src/components/ui/surfaces/Card.tsx` — `CardAccent` gagne `'amber'`
    (le composant calcule déjà `var(--{accent}-500)` dynamiquement ; les
    tokens `--amber-500`/`--amber-400` existent déjà). **1 ligne.**
  - `src/components/ui/core/Icon.tsx` — 2 icônes ajoutées : `arrow-left-right`
    (bouton de conversion), `landmark` (nœud caché crypto).
  - **Nouveau `src/game/crypto.ts`** (pur, testé, découplé — ne connaît ni
    `builder.ts` ni `unlockTree.ts`, types structurels minimaux) : cours du
    marché (`marketRate`) + conversion (`canConvert`/`convert`).
  - `src/game/unlockTree.ts` — **généralisé multi-devise** (voir Logique) :
    `UnlockTreeCore` gagne `crypto`, `UnlockNodeDef` gagne `currency: 'data' |
    'crypto'` + `effect.cryptoFloor?: number` (nouveau 3ᵉ type d'effet),
    `canBuyNode`/`buyNode` débitent la bonne devise, `visibleNodes(core,
    currency)` prend désormais la devise en paramètre (**appel existant à
    mettre à jour**), nouvelle `cryptoFloorBonus(core)` (max des planchers
    acquis, `0` si aucun). Catalogue `UNLOCK_NODES` étendu : les 4 nœuds
    existants reçoivent `currency: 'data'` (mécanique, sans effet de bord) +
    **1 nouveau nœud data** « RELAIS DE MARCHÉ » (déblocage du marché) +
    **3 nouveaux nœuds crypto** (« ARBITRAGE AUTO » — bonus prod, reformulé ;
    « PLANCHER DE COURS » — `cryptoFloor` ; « LAVERIE FANTÔME », requiert
    PLANCHER DE COURS — bonus cycles) + **1 nœud caché** (« CARTEL://DARK.POOL »
    — `cryptoFloor` fort, 2ᵉ reveal du jeu).
  - `src/game/unlockTree.test.ts` — non-régression (19 tests existants) +
    nouveaux cas (devise croisée, filtrage par `currency`, `cryptoFloorBonus`).
  - `src/game/crypto.test.ts` (nouveau) : bornes/déterminisme/périodicité de
    `marketRate`, `canConvert`/`convert` (no-op, débit/crédit au cours donné).
  - `src/db/types.ts` — `BuilderState` gagne `crypto: number`.
  - `src/db/db.ts` — **migration Dexie v15**.
  - `src/db/seed.ts` — `crypto: 0` à la création du singleton.
  - `src/stores/useBuilderStore.ts` — état `crypto`, nouveau helper
    `treeCore(state)` (remplace `core(state)` aux call-sites `unlockTree.ts`,
    ajoute `crypto`), nouvelle action `convertToCrypto(dataAmount)` (compose
    `cryptoFloorBonus` avec `marketRate` avant conversion).
  - `src/features/builder/UnlockNodeCard.tsx` / `HiddenNodeCard.tsx` —
    **généralisés** : prop `data: number` → `balance: number` + `unit: 'data'
    | 'crypto'` (label de coût générique). Comportement inchangé pour la
    branche `data` existante. Repères d'angle : on garde le **standard 2
    repères** de notre `<Card brackets>` (pas les 4 de la maquette), cohérence
    avec le reste de l'app.
  - `src/features/builder/UnlockTreeSection.tsx` — **généralisé** : prop
    `currency: 'data' | 'crypto'`, appelé **2 fois** depuis `BuilderView`
    (branche `data` inchangée, colonne side + nouvelle branche `crypto`,
    colonne side également, sous la branche data).
  - **Nouveau `src/features/builder/CryptoPanel.tsx`** : ticker de cours +
    conversion (`<Slider>` DS + bouton), rendu conditionnel (`cryptoUnlocked`),
    accent **ambre**, motif hachure diagonale distinctif. Placé en **colonne
    stage**, sous `AcceleratorPanel` (geste actif, layout Option A validé).
  - `src/features/builder/BuilderView.tsx` — insertion de `CryptoPanel`
    (stage) + 2ᵉ appel à `UnlockTreeSection` (side).
  - `src/features/builder/builder.css` — styles du panneau crypto (hachure,
    glow ambre) + variante `nw-anom-glow-amber` du glow de reveal (réutilise
    les keyframes `nw-reveal-clip`/`nw-chroma-jit` déjà existantes d'US-022).
  - `src/i18n/locales/fr.json` / `en.json` — `builder.crypto.*` + extension de
    `builder.unlockTree.*` (libellés génériques devise/unité).

- **Logique :**
  - **Cours du marché (`game/crypto.ts`)** : **pas de persistance** — pure
    fonction déterministe de l'horodatage réel (`marketRate(nowMs)`), exprimée
    en **CR pour 1 000 data convertis** (convention retenue avec la maquette,
    plus lisible qu'un taux par unité). Somme de **3 oscillations** de
    périodes/amplitudes différentes (ex. quelques minutes / ~30 min / ~2 h),
    bornée autour d'un taux moyen (placeholders : moyenne 2,00, bornes
    ~1,05→2,95, affinables en recette) — reproduit le ressenti « dérive +
    bruit + retour à la moyenne » de la maquette (qui utilisait un vrai
    random côté prototype statique) **sans** aléatoire réel, pour rester
    reproductible après reload/absence. Le cours affiché est **toujours
    recalculé à la volée** — aucun champ à ajouter au modèle de données, et
    **aucune interaction avec le rattrapage hors-ligne** (US-024) : le crypto
    ne s'accumule jamais passivement, seule une conversion **active** (donc
    impossible app fermée) le fait varier.
  - **Plancher de cours (`cryptoFloor`)** : nouveau 3ᵉ type d'effet de nœud
    (en plus de `cycles`/`data`), composé par `cryptoFloorBonus(core)` =
    maximum des `cryptoFloor` acquis (`0` si aucun — pas de plancher). Le
    cours **effectif** utilisé à l'affichage et à la conversion est
    `Math.max(marketRate(now), cryptoFloorBonus(core))`. Porté par
    « PLANCHER DE COURS » et le nœud caché « CARTEL://DARK.POOL ».
  - **Conversion** : `convert(core, dataAmount, effectiveRate)` débite `data`,
    crédite `Math.floor((dataAmount / 1000) × effectiveRate)` en `crypto`
    (`effectiveRate` déjà composé par la couche store, voir Store).
    **No-op** (même référence) si montant invalide ou solde insuffisant —
    même contrat que les autres actions du builder. **Périmètre v1** : pas de
    montant libre — un **`<Slider>`** (DS, déjà existant mais jamais utilisé
    jusqu'ici) de 0 à 100 % du solde `data` courant + bouton « Convertir »,
    avec un **aperçu du montant crédité au cours actuel** avant validation.
  - **« ARBITRAGE AUTO » (reformulé)** : garde son nom/icône (`share-2`) mais
    son effet devient un **bonus de production classique**
    (`effect.cycles`/`data`, placeholder), **pas** une conversion automatique
    — évite de réintroduire une accumulation passive du crypto (contraire au
    principe posé et à l'indépendance vis-à-vis du hors-ligne).
  - **Généralisation `unlockTree.ts` (multi-devise)** — plutôt que dupliquer
    tout le module pour une 2ᵉ branche (coûteux, deux implémentations à
    maintenir), chaque `UnlockNodeDef` porte désormais `currency: 'data' |
    'crypto'` ; `canBuyNode`/`buyNode` lisent/débitent `core.data` ou
    `core.crypto` selon le nœud. **`unlockedNodes` reste un seul tableau
    partagé** entre les deux branches (les `id` sont uniques dans tout le
    catalogue, aucune ambiguïté) — ce qui permet de **réutiliser tel quel**
    `requiresNode` pour le lien inter-branches : le 1ᵉʳ nœud de la branche
    crypto (« ARBITRAGE AUTO ») porte `requiresNode: 'breach-market'` (id du
    nœud data de déblocage), aucun mécanisme nouveau. `cycleMultiplier`/
    `dataMultiplier` restent **inchangées** (elles somment déjà tous les
    nœuds acquis, quelle que soit leur devise). `visibleNodes` prend
    désormais `currency` en paramètre pour que chaque branche affiche
    seulement ses propres nœuds.
  - **Déblocage du marché** : nouveau nœud data « RELAIS DE MARCHÉ »
    (`breach-market`, coût en `data`, chaîné à un nœud existant — placeholder).
    Une fois acheté (`unlockedNodes.includes('breach-market')`), `CryptoPanel`
    **et** la 2ᵉ branche de l'arbre deviennent visibles — même contrat que
    `dataUnlocked` aujourd'hui (AC1/AC2, no-op invisible avant).
  - **2ᵉ branche crypto** : 3 nœuds visibles (ARBITRAGE AUTO, PLANCHER DE
    COURS, LAVERIE FANTÔME) + **1 caché** (CARTEL://DARK.POOL, 2ᵉ reveal du
    jeu, même traitement que `ghost-protocol` — glitch amber/cyan réutilisant
    les keyframes existantes, `HiddenNodeCard` généralisé pour accepter un
    solde/unité crypto).
  - **Store** : `convertToCrypto(dataAmount)` calcule `effectiveRate =
    max(marketRate(now), cryptoFloorBonus(treeCore))` puis appelle `convert`
    (persistance immédiate, comme `buyNode`) ; `buyNode`/`applyTick`
    utilisent désormais `treeCore(state)` (ajoute `crypto` à l'objet passé à
    `unlockTree.ts`) à la place de `core()` pour les appels concernant
    l'arbre — `core()`/`tickPure` (production) restent inchangés, `crypto`
    n'entre jamais dans le calcul de production.

- **Impacts modèle de données :**
  - `BuilderState` gagne `crypto: number` (défaut `0`, plancher 0).
  - **Migration Dexie v15** : même pattern que v11→v14 — schéma recopié à
    l'identique (aucun index nouveau), rétro-remplissage `crypto: 0` sur la
    rangée singleton existante.
  - Aucun champ pour le cours du marché (calculé, jamais stocké).

## 3. Design  _(porte de validation, si impact UI significatif)_

**Maquette reçue et validée PO le 21/07/2026** (dossier `network-crypto`,
jouable — panneau marché avec ticker + slider + conversion, nœud de
révélation dans l'arbre `data`, 2ᵉ branche crypto à 3 nœuds + 1 caché, aperçu
d'insertion `/network`). Non versionnée dans le dépôt (convention, comme les
maquettes précédentes).

- **Écrans concernés :** `/network` (`BuilderView`) — nouveau `CryptoPanel`
  en **colonne stage** (sous `AcceleratorPanel`, layout **Option A** : geste
  actif délibéré, comme HACK/accélérateurs) + 2ᵉ instance de l'arbre de
  déblocage en **colonne side** (branche crypto, sous la branche `data`
  existante).
- **Décisions validées avec la maquette :**
  - Accent **ambre** (nouveau — `Card.tsx` étendu, 1 ligne) réservé au marché
    crypto et à sa branche ; motif hachure diagonale distinctif du magenta
    `data`.
  - Cours exprimé en **CR pour 1 000 data** ; ticker avec indicateur de
    tendance (hausse/baisse/stable) + mini-piste de variation (repli
    statique lisible en `prefers-reduced-motion`).
  - `<Slider>` DS (0-100 % du solde `data`) + aperçu live du crypto obtenu +
    bouton de conversion explicite.
  - Contenu retenu : nœud data **RELAIS DE MARCHÉ** (déblocage) ; branche
    crypto **ARBITRAGE AUTO** (reformulé en bonus, voir §2) → **PLANCHER DE
    COURS** (`cryptoFloor`) → **LAVERIE FANTÔME** (bonus cycles, requiert
    PLANCHER DE COURS) ; nœud caché **CARTEL://DARK.POOL** (`cryptoFloor`
    fort, reveal glitch amber/cyan).
  - 2 icônes ajoutées (`arrow-left-right`, `landmark`) ; repères d'angle des
    cartes ramenés au **standard 2 repères** de `<Card brackets>` (la
    maquette en montrait 4, écart assumé pour cohérence avec le reste de
    l'app).
- **Maquette :** `C:\Users\flori\Downloads\network-crypto` (local, PO).

## 4. Plan d'implémentation  _(porte de validation)_

1. **DS** : `components/ui/surfaces/Card.tsx` — `CardAccent` gagne `'amber'`
   (1 ligne). `components/ui/core/Icon.tsx` — ajout `arrow-left-right`,
   `landmark`.
2. **Nouveau `game/crypto.ts`** : `MARKET_CONFIG` (moyenne 2,00, 3 oscillations
   — périodes/amplitudes/phases placeholders, bornes ~1,05→2,95),
   `marketRate(nowMs)`, `CryptoCore`, `canConvert(core, dataAmount)`,
   `convert(core, dataAmount, effectiveRate)` (débite `data`, crédite
   `Math.floor((dataAmount/1000) × effectiveRate)`).
3. **`game/crypto.test.ts`** : bornes de `marketRate` sur une large plage
   d'instants, déterminisme (même `nowMs` → même résultat), `canConvert`/
   `convert` (no-op montant invalide/solde <, calcul correct au taux donné).
4. **`game/unlockTree.ts`** généralisé : `UnlockTreeCore` +`crypto`;
   `UnlockNodeDef` +`currency: 'data'|'crypto'` +`effect.cryptoFloor?`;
   `canBuyNode`/`buyNode` lisent/débitent la bonne devise ;
   `visibleNodes(core, currency)` (paramètre requis) ; nouvelle
   `cryptoFloorBonus(core)`. Catalogue : 4 nœuds existants + `currency:
   'data'` ; nouveau nœud data `breach-market` (RELAIS DE MARCHÉ) ; 3 nœuds
   crypto (`arbitrage-auto` bonus prod, `rate-floor` `cryptoFloor`,
   `ghost-laundry` bonus cycles, requiert `rate-floor`) ; 1 nœud crypto caché
   (`dark-pool`, `cryptoFloor` fort, `requiresGenerator`/seuil à définir en
   recette).
5. **`game/unlockTree.test.ts`** : mise à jour des tests existants (nouveau
   paramètre `currency` sur `visibleNodes`, `currency: 'data'` sur les
   fixtures) — non-régression **19/19** — + nouveaux cas : achat crypto débite
   `crypto` pas `data`, `requiresNode` inter-branches (crypto→data),
   `cryptoFloorBonus` (0 sans nœud, max si plusieurs acquis), filtrage
   `visibleNodes` par devise.
6. **Migration Dexie v15** (`db/db.ts`) + `BuilderState.crypto: number`
   (`db/types.ts`) ; `.upgrade()` rétro-remplissage `0` ; `db/seed.ts` →
   `crypto: 0` à la création.
7. **`stores/useBuilderStore.ts`** : état `crypto` ; nouveau helper
   `treeCore(state)` (`{cycles→non, data, generators, upgrades,
   unlockedNodes, crypto}`, utilisé par `buyNode`/`applyTick` à la place de
   `core()` pour les appels `unlockTree.ts`) ; nouvelle action
   `convertToCrypto(dataAmount)` (`effectiveRate = max(marketRate(now),
   cryptoFloorBonus(treeCore))`, appelle `convert`, persistance immédiate) ;
   `load()`/`persist()` incluent `crypto`.
8. **`features/builder/UnlockNodeCard.tsx` / `HiddenNodeCard.tsx`**
   généralisés : prop `data: number` → `balance: number` + `unit: 'data' |
   'crypto'` ; libellé de coût générique (`{{cost}} {{unit}}`).
9. **`features/builder/UnlockTreeSection.tsx`** généralisé : prop `currency`,
   en-tête/solde/appel `visibleNodes` paramétrés par la devise.
10. **i18n FR/EN** : `builder.crypto.*` (panneau, ticker, tendances,
    conversion) + extension `builder.unlockTree.*` (unités génériques,
    libellés des 5 nouveaux nœuds).
11. **Nouveau `features/builder/CryptoPanel.tsx`** : ticker (valeur + icône de
    tendance + mini-piste statique/animée), soldes `data`/`crypto`,
    `<Slider>` + aperçu live, bouton conversion — sur `<Card hud brackets
    halo="amber">` + motif hachure diagonale (CSS).
12. **`features/builder/BuilderView.tsx`** : insertion `CryptoPanel` (colonne
    stage, sous `AcceleratorPanel`) + 2ᵉ appel `UnlockTreeSection`
    (`currency="crypto"`, colonne side, sous la branche `data`), tous deux
    conditionnés à `cryptoUnlocked` (`unlockedNodes.includes('breach-market')`).
13. **CSS** (`builder.css`) : styles `CryptoPanel` (hachure, glow ambre),
    variante `nw-anom-glow-amber` du glow de reveal (réutilise
    `nw-reveal-clip`/`nw-chroma-jit` existantes), `prefers-reduced-motion`.
14. **Vérifications** : `npm run typecheck && npm run lint && npm run build &&
    npm test` — non-régression complète (A1→A5 + nouveaux tests).
