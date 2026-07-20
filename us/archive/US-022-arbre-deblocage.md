# US-022 — A3 : 2ᵉ couche de ressource + arbre de déblocage + 1ᵉʳ reveal caché

- **MVP :** A
- **Priorité :** haute
- **Statut :** fait (recette 8/8 PO le 20/07/2026)
- **Branche :** feature/US-022-arbre-deblocage

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
  Après A2 (daemons + upgrades), la chaîne des 4 daemons actuels
  (`scraper → sifter → wraith → oracle`) est entièrement déblocable et le jeu
  « boucle » sans se renouveler. A3 introduit le **1ᵉʳ recadrage** façon
  Paperclips :
  1. Une **2ᵉ ressource, les *données* (`data`)**, distincte des cycles.
     Possible `oracle` (le daemon terminal actuel) débloque une nouvelle
     mécanique d'**extraction de données** : une partie de la production du
     Réseau se met à générer des `data` en plus des `cycles`. Les cycles
     cessent d'être la seule finalité du jeu — ils nourrissent désormais
     aussi cette couche au-dessus.
  2. Un nouvel **arbre de déblocage** (nouvel écran ou nouvelle section) qui
     dépense les `data` pour débloquer des **nœuds** : un nouveau daemon,
     une capacité ou un bonus. Chaque nœud a un coût en `data` et peut
     dépendre d'un nœud précédent (chaîne, comme les daemons en A2).
  3. **1ᵉʳ reveal caché (P6)** : un nœud de l'arbre est **totalement
     invisible** tant qu'une condition seuil n'est pas atteinte (ex. cumul
     de `data` généré, ou posséder tous les daemons actuels niveau ≥ 1) —
     aucun teaser, aucun indice préalable (contrairement au verrou visible
     des daemons en A2). Dès que la condition est remplie, le nœud
     **apparaît soudainement** dans l'arbre, avec un feedback visuel dédié
     qui marque l'instant (effet « attends, il y avait *encore* ça ?! »).

  *Paramètres exacts (taux d'extraction de données, nombre de nœuds, coûts,
  effet de chaque nœud, condition précise du reveal caché) sont à trancher
  en cadrage technique — cette étape fonctionnelle pose le **quoi**, pas les
  chiffres.*

- **Pour qui :**
  Le joueur qui a fini la boucle daemons/upgrades de A2 (proto-testeur
  solo/PO à ce stade) et qui doit sentir que « le jeu se réinvente » plutôt
  que plafonner sur les 4 mêmes daemons.

- **Critères d'acceptation :** (action → résultat attendu)
  1. Avant de posséder `oracle` (≥ 1) : aucune information sur `data` (valeur,
     débit) n'est visible — le jeu se comporte comme en A2, tout au plus un
     indice d'ambiance neutre (« flux data · scellé », voir maquette) sans
     rien révéler du mécanisme.
  2. Acheter `oracle` (1ᵉʳ exemplaire) → la mécanique d'extraction de
     données devient visible/active ; un compteur de `data` apparaît.
  3. Le compteur de `data` augmente dans le temps (ou via l'action qui la
     génère), de façon visible et cohérente avec la production du Réseau.
  4. Un nouvel écran/section « Arbre de déblocage » liste au moins 2 nœuds
     achetables avec `data`, chacun affichant son coût et son état
     (verrouillé / débloqué / déjà acquis).
  5. Acheter un nœud dont le solde de `data` est suffisant débite le coût et
     applique son effet (ex. un nouveau daemon apparaît dans le catalogue
     Réseau, ou un bonus mesurable s'active) ; solde insuffisant → achat
     impossible (bouton désactivé ou no-op), comme pour les daemons.
  6. Un nœud spécifique reste **sans aucune information communiquée** (pas de
     nom, coût, ou existence confirmée) tant que sa condition cachée n'est pas
     remplie — un élément d'ambiance neutre peut occuper l'espace (ex. « secteur
     scellé »), mais rien ne trahit le nœud (voir maquette `network-datatree`,
     validée PO le 20/07/2026). Une fois la condition remplie, il apparaît dans
     l'arbre au chargement suivant (ou en direct si l'app est ouverte), avec un
     traitement visuel qui le distingue d'un déblocage normal.
  7. Recharger la page conserve `data`, les nœuds débloqués et l'état du
     reveal cachée (persistance, comme `cycles`/`generators`/`upgrades`
     aujourd'hui).
  8. La boucle existante (HACK manuel, achat/upgrade des 4 daemons, calcul
     des cycles/s) continue de fonctionner sans régression.

## 2. Cadrage technique  _(porte de validation)_

> Révisé après maquette (`network-datatree`, validée PO le 20/07/2026) — voir
> §3. Changements vs. 1ʳᵉ version : dépendance de nœud généralisable à une
> condition daemon (pas seulement chaîné à un autre nœud) ; condition du reveal
> caché portée par les daemons (`generators`), donc **suppression de
> `dataEarnedTotal`** (champ devenu inutile) ; effet du nœud caché = bonus
> multiplicatif fort (×3 data) plutôt qu'un nouveau daemon.

- **Fichiers impactés :**
  - `src/game/builder.ts` — `BuilderCore` gagne `data` et `unlockedNodes` ;
    nouvelle `dataPerSec()` ; `tick()` étendu (accrue aussi `data`, accepte des
    multiplicateurs optionnels).
  - `src/game/unlockTree.ts` **(nouveau)** — module pur, même discipline que
    `game/streak.ts`/`game/reputation.ts` : catalogue `UNLOCK_NODES`, visibilité,
    achat, multiplicateurs. Testé isolément (`unlockTree.test.ts`).
  - `src/db/types.ts` — `BuilderState` gagne les 2 mêmes champs.
  - `src/db/db.ts` — migration **Dexie v12**.
  - `src/stores/useBuilderStore.ts` — état étendu, action `buyNode(id)`,
    `applyTick` compose les multiplicateurs de `unlockTree` avant d'appeler
    `tick()`.
  - `src/features/builder/` — nouveau readout `data` (conditionnel, panneau
    teinté magenta) sur `BuilderView.tsx` + nouveaux composants pour l'arbre de
    déblocage (`UnlockTreeSection.tsx`, `UnlockNodeCard.tsx`, `HiddenNodeCard.tsx`
    — noms indicatifs, fidèles à la maquette).
  - `src/i18n/locales/{fr,en}.json` — clés `builder.data.*`,
    `builder.unlockTree.*` (+ par nœud, sur le modèle `builder.generators.<id>`).
  - `src/game/builder.test.ts` (non-régression, cas ajoutés) +
    `src/game/unlockTree.test.ts` (nouveau).

- **Logique :**
  - **Extraction de données** : tant que le daemon `oracle` n'est pas possédé
    (`generators.oracle < 1`), `dataPerSec = 0` (mécanique invisible, AC1).
    Une fois possédé, `dataPerSec = productionPerSec(core) × DATA_RATE ×
    dataMultiplier` (`DATA_RATE` placeholder ~0,1, affinable en recette).
    `tick()` accrue `cycles` **et** `data` dans la même passe.
  - **Dépendance de nœud généralisée** (retenu après maquette — `CRYO-CACHE`
    y requiert `1× WRAITH` upgradé, pas un nœud) : chaque `UnlockNodeDef`
    porte **deux conditions indépendantes et cumulables** (ET logique) :
    - `requiresNode: string | null` — chaîne parmi les nœuds de l'arbre (comme
      `unlockAfter` pour les daemons).
    - `requiresGenerator: { id: string; count: number; upgradeLevel?: number } | null`
      — condition sur l'état des daemons (US-021), ex. `{ id: 'wraith', count: 1,
      upgradeLevel: 1 }`.
    Modèle **data-driven déclaratif** (pas de prédicat en fonction opaque) pour
    rester cohérent avec `GENERATORS` et permettre l'affichage du libellé de
    condition (ex. « Requiert 1× WRAITH-2X ») directement depuis les données.
  - **Arbre de déblocage** : catalogue `UNLOCK_NODES`, 4 entrées (fidèles à la
    maquette) :
    1. `overclock` — `requiresNode: null`, `requiresGenerator: null`, bonus
       `+25 %` sur `productionPerSec` (cycles).
    2. `parallelism` — `requiresNode: 'overclock'`, bonus `+50 %` sur
       `dataPerSec`. *(La formulation « les daemons produisent aussi pendant
       un HACK » de la maquette décrit un mécanisme qui n'existe pas
       aujourd'hui — le HACK manuel et la production automatique des daemons
       sont déjà indépendants, aucune pénalité à lever. Pour rester dans le
       périmètre d'A3 — un bonus multiplicatif, comme les 3 autres nœuds —
       sans inventer une nouvelle mécanique de HACK non cadrée.)*
    3. `cryo-cache` — `requiresNode: null`, `requiresGenerator: { id: 'wraith',
       count: 1 }` (« WRAITH-2X » est le **nom d'affichage** du daemon
       `wraith`, pas un niveau d'upgrade requis — vérifié contre
       `builder.generators.wraith.name` dans l'i18n existant), bonus `+40 %`
       sur `dataPerSec`. *(Le
       « plafond hors-ligne ×2 » de la maquette anticipe le calcul de
       production hors-ligne qui reste A5/US-024 — hors périmètre ici ; pour
       A3 ce nœud applique seulement son bonus multiplicatif, comme les
       autres. Sa vraie utilité hors-ligne s'activera naturellement quand A5
       sera livrée, sans reprendre ce nœud.)*
    4. `ghost-protocol` (`GHOST://ROGUE.AI`) — **`hidden: true`**,
       `requiresGenerator: { id: 'wraith', count: 12 }`, **indépendant du
       reste de l'arbre** (`requiresNode: null`) : c'est délibéré — le reveal
       ne dépend pas d'avoir fini la branche visible, il surgit d'un axe
       différent (l'investissement en `wraith`), ce qui le rend moins
       prévisible et plus surprenant (P6). Bonus fort : `+200 %` sur
       `dataPerSec` (soit ×3 au total, comme la maquette). « Débloque une
       branche entière » (texte de la maquette) reste un teaser narratif pour
       une tranche future (A4+) — **pas construit maintenant**.
    Pour un nœud **non caché**, une même fonction `requiresNode`/
    `requiresGenerator` détermine s'il est chaîné (état `locked` si non
    rempli) ; sinon état `available` (achetable si solde suffisant) ou
    `acquired`. Pour un nœud **caché**, la **même condition sert à la fois de
    condition de reveal et de condition d'achat** : tant qu'elle n'est pas
    remplie, le nœud est filtré de la liste visible (AC6) ; dès qu'elle l'est,
    il apparaît directement en état `available` (jamais `locked` caché — cf.
    maquette, la carte « anomalie » a son bouton d'achat dès l'irruption).
    Achat : débite `data`, ajoute l'`id` à `unlockedNodes` ; **no-op** (même
    référence) si condition non remplie ou solde insuffisant (même contrat que
    `buyGenerator`/`buyUpgrade`).
  - **Multiplicateurs** : `cycleMultiplier(state) = 1 + Σ effect.cycles` et
    `dataMultiplier(state) = 1 + Σ effect.data` sur les nœuds de
    `unlockedNodes` (empilement **additif**, pas multiplicatif entre nœuds —
    évite l'emballement combinatoire ; à revisiter si besoin en recette).
  - **Découplage** : `unlockTree.ts` n'importe **rien** de `builder.ts` (types
    structurels minimaux : `{ data, generators, upgrades, unlockedNodes }`)
    pour éviter toute dépendance circulaire ; c'est la **couche store** qui
    compose les deux (calcule les multiplicateurs via `unlockTree`, les passe
    à `tick()`). `builder.ts` reste inchangé dans son fonctionnement
    daemons/upgrades (AC8, non-régression).
  - Chiffres (`DATA_RATE`, coûts des 4 nœuds, seuils de condition, bonus) =
    **placeholders**, affinables en recette — même traitement que les coûts de
    `GENERATORS` aujourd'hui.

- **Impacts modèle de données :**
  - `BuilderState` (et `BuilderCore`) gagnent **2 champs** : `data: number`,
    `unlockedNodes: string[]`. (`dataEarnedTotal` envisagé en 1ʳᵉ version,
    **abandonné** — la condition du reveal caché repose sur `generators`,
    déjà persisté ; rien à ajouter pour ça.)
  - **Migration Dexie v12** : table `builderState` inchangée (même clé `id`) —
    `.upgrade()` ajoute les valeurs par défaut (`data: 0`, `unlockedNodes: []`)
    à la rangée singleton existante, sur le même modèle que la migration v11
    (US-021).

## 3. Design  _(porte de validation, si impact UI significatif)_

**Maquette reçue et validée PO le 20/07/2026** (dossier `network-datatree`,
jouable — 3 sections : lecteur DATA avant/après sur l'écran Réseau, arbre à
3 nœuds visibles acquis/dispo/verrouillé, séquence de reveal du nœud caché
`GHOST://ROGUE.AI`). Non versionnée dans le dépôt (convention, comme les
maquettes précédentes).

- **Écrans concernés :** écran « Réseau » (nouveau panneau `data`, teinté
  magenta, badge « NOUVEAU FLUX » à l'apparition) + nouvelle section « Arbre
  de déblocage » (épine verticale, cartes façon daemon, nœud caché en irruption
  glitch cyan/magenta).
- **Maquette :** `C:\Users\flori\Downloads\network-datatree` (local, PO).

## 4. Plan d'implémentation  _(porte de validation)_

1. **Migration Dexie v12** (`db/db.ts`) + `BuilderState` (`db/types.ts`) :
   ajout `data: number`, `unlockedNodes: string[]` ; `.upgrade()` avec valeurs
   par défaut sur la rangée singleton (même modèle que v11).
2. **`game/builder.ts`** : étendre `BuilderCore` (`data`, `unlockedNodes`),
   `BUILDER_CONFIG.dataRate`, nouvelle `dataPerSec(core, dataMult?)`, `tick()`
   étendu (accrue aussi `data`, accepte des multiplicateurs optionnels
   `{ cycles?, data? }`, défaut = 1 → comportement A1/A2 inchangé).
3. **`game/builder.test.ts`** : non-régression (cas existants) + nouveaux cas
   (`dataPerSec` nul avant `oracle`, actif après ; `tick` avec multiplicateurs).
4. **Nouveau `game/unlockTree.ts`** : `UnlockNodeDef` (`requiresNode`,
   `requiresGenerator`, `hidden`, `effect`), catalogue `UNLOCK_NODES` (4
   nœuds : `overclock`, `parallelism`, `cryo-cache`, `ghost-protocol` caché),
   `nodeState()`, `visibleNodes()`, `canBuyNode()`, `buyNode()`,
   `cycleMultiplier()`, `dataMultiplier()`. Types structurels minimaux, aucun
   import de `builder.ts`.
5. **`game/unlockTree.test.ts`** (nouveau) : chaîne entre nœuds, condition
   daemon (`requiresGenerator`), achat (débit + no-op), nœud caché absent puis
   visible dès condition remplie, calcul des multiplicateurs.
6. **`db/repositories/builder.ts`** : vérification (le repo transmet déjà
   l'objet complet — a priori aucun changement de code nécessaire).
7. **`stores/useBuilderStore.ts`** : état étendu (`data`, `unlockedNodes`),
   `load()` mis à jour, nouvelle action `buyNode(id)` (persistance immédiate,
   comme `buyGenerator`/`buyUpgrade`), `applyTick` compose
   `cycleMultiplier`/`dataMultiplier` via `unlockTree` avant d'appeler
   `tick()`.
8. **Icônes** (`components/ui/core/Icon.tsx`) : ajouter `gauge`, `split`,
   `snowflake`, `skull`, `triangle-alert`, `unlock`, `download`, `minus` au
   registre (fidèles à la maquette).
9. **i18n FR/EN** : clés `builder.data.*` (label, badge « nouveau flux »),
   `builder.unlockTree.*` (titre section, libellés d'état, bouton d'achat,
   libellé de condition verrouillée) + par nœud
   `builder.unlockTree.nodes.<id>.{name, effect}`, et le bloc dédié
   `ghost-protocol` (nom, description, bandeau anomalie, bouton).
10. **`DataReadout`** (nouveau composant, `features/builder/`) : panneau
    magenta biseauté, rendu conditionnel (`generators.oracle >= 1`), badge
    « nouveau flux » lors de la 1ʳᵉ apparition (état local, non persisté).
11. **`UnlockNodeCard`** (états acquis / dispo / verrouillé, fidèle à la
    maquette) + **`HiddenNodeCard`** (phases caché / irruption / stable,
    séquence glitch, variante statique `prefers-reduced-motion`).
12. **`UnlockTreeSection`** : assemble l'épine verticale + les cartes,
    branchée sur `useBuilderStore` (nœuds visibles, achat).
13. **Intégration `BuilderView.tsx`** : insertion de `DataReadout` sous le
    compteur cycles + `UnlockTreeSection` sous la liste des daemons.
14. **CSS** (`builder.css`) : styles fidèles à la maquette (biseaux, glow
    magenta/cyan, animations d'irruption + variante reduced-motion).
15. **Vérifications** : `npm run typecheck && npm run lint && npm run build &&
    npm test` — non-régression complète (A1/A2 + nouveaux tests).
