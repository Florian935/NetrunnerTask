# US-035 — Pity + fragments anti-doublon (approfondit les caisses)

- **MVP :** A3
- **Priorité :** basse
- **Statut :** fait
- **Branche :** feature/US-035-pity-fragments

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :** dernière tranche de la Phase A3 — **approfondit les caisses**
  (US-034) avec deux filets anti-frustration : un **pity** (filet anti-malchance
  sur le tirage) et la **conversion des doublons en fragments** échangeables. La
  malchance et les doublons ne sont plus une impasse ; compléter la collection
  reste toujours possible, même sans réussite au tirage.

- **Pour qui :** le joueur du builder — **rétention long terme / complétionnisme** :
  un objectif de collection atteignable et un tirage qui ne « punit » jamais sèchement.

- **Constat de départ (fonde l'US) :** US-034 (décision #039) **garantit du neuf
  tant que le pool en contient** (critère C6) et verse une **consolation crédits**
  quand le pool est épuisé (décision technique #3, explicitement « couture reprise
  par US-035 »). Conséquence : **aucun vrai doublon**, collection bouclée en ≤ 10
  ouvertures, consolation crédits = pis-aller. US-035 **remplace cette couture**
  par une vraie économie de fragments + un pity.

- **Hypothèses à valider (PO) :**

  - **H1 — Doublons autorisés → conversion en fragments.** On **lève la garantie
    anti-doublon** d'US-034 (C6) : un tirage peut retomber sur un cosmétique déjà
    possédé → **auto-converti en fragments** (quantité indexée sur la rareté). Les
    fragments s'accumulent (persistés). *C'est la « conversion des doublons » de
    la roadmap.*

  - **H2 — Forge (dépense des fragments).** Le joueur dépense des fragments pour
    **débloquer directement un cosmétique non possédé de son choix** (coût indexé
    sur la rareté). Filet **déterministe** : la malchance est toujours
    rattrapable, et les fragments de doublons servent à **finir** la collection.

  - **H3 — Pity (filet anti-malchance sur le tirage).** Un **compteur** garantit
    une montée en rareté après une série d'ouvertures sans haute rareté (ex.
    « légendaire garanti à la Nᵉ ouverture sans légendaire »). Le compteur se
    **réinitialise** à l'obtention. *Seuil N et cran garanti à calibrer.*

  - **H4 — Consolation « pool épuisé ».** Une fois **tout le pool possédé**, il
    n'y a plus rien à forger. *Proposition :* un tirage à pool complet donne des
    **fragments** (cohérent avec H1, monnaie de complétion / statut) plutôt que
    des crédits — remplace la consolation crédits d'US-034. À trancher (fragments
    vs on garde les crédits vs message « collection complète » sans gain).

  - **H5 — Caisse quotidienne / hebdo.** La roadmap la **groupe** avec pity +
    fragments. *Proposition : la **reporter** (hors périmètre US-035)* pour garder
    cette tranche focalisée sur l'anti-malchance ; ré-ouvrable dans une tranche
    ultérieure. À valider.

- **Invariant (non négociable, pas une hypothèse) :** les fragments sont une
  **monnaie de complétion cosmétique uniquement** — aucun effet sur la production
  du Réseau, et **ne s'achètent jamais** (issus **uniquement** des caisses/
  doublons). Fragments **et** collection **survivent à la renaissance** et au
  rechargement (comme `owned`/`crates`, US-034).

- **Critères d'acceptation :** (action → résultat attendu, vérifiables)

  1. **Doublon → fragments** — ouvrir une caisse et tomber sur un cosmétique
     **déjà possédé** : le **solde de fragments augmente** (montant indexé sur la
     rareté), **aucun** doublon ajouté à la collection.
  2. **Nouveau → collection** — tomber sur un cosmétique **non possédé** : il est
     **ajouté** à la collection (comme US-034), **sans** fragments.
  3. **Forge** — dépenser F fragments pour débloquer un cosmétique **non possédé
     choisi** : il devient **possédé et équipable**, solde **−F** ; action
     **impossible** (désactivée) si solde insuffisant.
  4. **Pity** — après la série d'ouvertures définie sans le cran cible, la
     prochaine ouverture **garantit au moins** ce cran ; le compteur de pity se
     **réinitialise** ensuite.
  5. **Solde persistant** — le solde de fragments est **visible** (Garde-robe) et
     **conservé** après rechargement **et** après une renaissance (vérifiable en
     base).
  6. **Rituel lisible** — l'ouverture distingue clairement **doublon → +X
     fragments** d'un **nouveau cosmétique** (traitement visuel distinct).
  7. **Garde-fous** — fragments sans effet sur la production ; **aucun** moyen de
     les acheter (crédits/cycles/crypto) ; ils ne viennent que des caisses.
  8. **i18n FR/EN** + vérifs vertes (typecheck + lint + build/PWA + tests, couche
     pure du pity/fragments/forge **testée**).

- **Impact UI :** **significatif** → **étape design** à prévoir (compteur de
  fragments, **forge** de sélection d'un cosmétique, rituel modifié pour le cas
  doublon, indicateur de pity éventuel). À proposer après validation des cadrages.

## 2. Cadrage technique  _(porte de validation)_

> Cadrage fonctionnel **validé PO le 23/07/2026** (H1→H5 + invariant, 8 critères ;
> recommandations adoptées : H4 = fragments, H5 = report de la caisse
> quotidienne/hebdo).

- **Fichiers impactés :**

  - **`src/game/crates.ts`** — **révise le modèle de tirage** (cœur de l'US) :
    - Nouveaux réglages purs : `FRAGMENT_VALUE: Record<Rarity, number>` (valeur
      d'un doublon), `FORGE_COST: Record<Rarity, number>` (coût de forge, >
      plusieurs doublons du même cran), `PITY_CONFIG` (`{ threshold, rarity }`).
    - `CrateDraw` étendu : `{ kind: 'cosmetic', id }` (nouveau) **|**
      `{ kind: 'fragments', amount, dupId? }` (doublon converti — `dupId` = le
      cosmétique retombé, pour l'affichage).
    - `openCrate(quality, owned, pool, pity, rng)` **revu** : tirage **pur**
      (rareté par `CRATE_ODDS`, **pity** force `legendary` si `pity + 1 ≥
      threshold`), puis item **uniforme** dans la rareté (possédé **ou non**) ;
      possédé → fragments, sinon → cosmétique. **Renvoie `{ draw, pity }`** (pity
      réinitialisé si `legendary` obtenu, +1 sinon). **RNG toujours injecté.**
    - `canForge(fragments, rarity)` pur. **Supprime** `CONSOLATION_CREDITS` +
      la branche crédits (le cas « pool épuisé » devient un doublon comme un
      autre → fragments : plus de cas spécial, la couture #3 d'US-034 disparaît).
  - **`src/game/crates.test.ts`** — **mise à jour** (le no-doublon C6 et la
    consolation crédits d'US-034 sont **remplacés**) + nouveaux tests (doublon →
    fragments, pity force + réinitialise, `canForge`, déterminisme).
  - **`src/db/types.ts`** — `CosmeticsState.fragments: number` +
    `CosmeticsState.pity: number`.
  - **`src/db/db.ts`** — **migration Dexie v21** (`fragments`/`pity`
    rétro-remplis à 0 ; patron des migrations de champ).
  - **`src/db/seed.ts`** — `fragments: 0`, `pity: 0` sur le singleton neuf.
  - **`src/stores/useCosmeticsStore.ts`** — état `fragments`/`pity` ;
    `openCrate` revu (applique `draw` : `grant` **ou** `fragments +=` ; met à
    jour `pity` ; persiste ; renvoie le `draw`) ; **`forge(id)`** (garde
    non-possédé + `canForge` → `grant([id])` + `fragments -= FORGE_COST`,
    persiste).
  - **UI (design)** : **compteur de fragments** (en-tête Garde-robe /
    `CratesPanel`), **`ForgePanel`/`ForgeModal`** (choisir un cosmétique non
    possédé + coût + bouton, désactivé si solde <), **`CrateOpeningModal`**
    branche **doublon → +X fragments** (traitement distinct du nouveau, C6),
    indicateur de **pity** éventuel.
  - **`src/features/cosmetics/WardrobeView.tsx`** — monte le solde + la forge ;
    câble `forge`.
  - **`src/components/ui/core/Icon.tsx`** — glyphes forge/fragments (pressentis
    `hammer`/`gem`, à figer en codant).
  - **`src/i18n/locales/{fr,en}.json`** — libellés fragments / forge / pity /
    doublon.

- **Logique :**
  - **Doublons** : `openCrate` ne filtre plus les possédés — un item possédé
    tiré est converti en `FRAGMENT_VALUE[rarity]`. La collection se complète
    désormais par la **chance** (nouveau tirage) **ou** la **forge** (déterministe).
  - **Pity** : compteur **global** (`pity`) d'ouvertures depuis le dernier
    `legendary`. À `threshold`, la prochaine ouverture **force** le cran
    `legendary` (peut être un doublon → fragments : pity garantit la **rareté**,
    la forge garantit l'**item**). Réinitialisé à l'obtention d'un légendaire.
  - **Forge** : dépense déterministe pour cibler précisément un manque — l'issue
    de secours contre la malchance (H2).
  - **Pool complet** : chaque tirage est alors un doublon → fragments (aucun cas
    spécial ; remplace proprement la consolation crédits d'US-034).

- **Impacts modèle de données :**
  - **2 champs persistés** `CosmeticsState.fragments` + `pity` → **migration
    Dexie v21** (rétro-remplissage 0). Sur le singleton d'identité → **survivent
    à la renaissance** par construction (invariant + C5).
  - Aucun nouveau cosmétique (le pool d'US-034 suffit) ; aucun impact
    `builderState`/`player`/`contracts`/`factions`.

- **Décisions techniques (à valider) :**
  1. **`openCrate` revu** (doublons autorisés + pity, RNG injecté) — supprime la
     garantie anti-doublon **et** la consolation crédits d'US-034 (remplacées par
     l'économie de fragments). Tests d'US-034 mis à jour en conséquence.
  2. **Pity global visant `legendary`** (le cran le plus rare = l'anti-malchance
     ressentie), `threshold` réglable — garantit la **rareté**, pas l'item.
  3. **Forge = filet déterministe** ciblant l'**item** (`FORGE_COST` par rareté).
  4. **Valeurs `FRAGMENT_VALUE` / `FORGE_COST` / `PITY_CONFIG.threshold`
     ajustables en recette** (équilibrage).

## 3. Design  _(porte de validation, si impact UI significatif)_

_Pressenti significatif (voir « Impact UI »). À cadrer après le cadrage technique._

## 3. Design — _validé PO le 23/07/2026_

- **Écrans concernés :** Garde-robe (`/wardrobe`) — solde de fragments, forge,
  jauge de pity ; rituel d'ouverture (cas doublon).
- **Maquette :** `pity-fragments` (reçue 23/07/2026). Fidèle NIGHTWIRE ; réutilise
  rampe rareté / `CosmeticCard` / `RarityBadge` / aperçus / panneau CAISSES.
  Identité fragments **mint/cristal** (= token `--mint-500`, aliasé `--fragment-*`).
  Écarts validés : garder mint (alias sémantique) · barème maquette adopté
  (ajustable) · forge = **pool exclusif caisses** non possédé uniquement · solde
  affiché dans en-têtes CAISSES + Forge (pas de refonte du bandeau à 3 compteurs).

## 4. Plan d'implémentation  _(porte de validation)_

> Ordre bas→haut (règle pure → données → store → UI → i18n → vérifs). Réutilise le
> DS ; **NOUVEAU** = composant à créer. **Rappel** : le modèle de tirage d'US-034
> est **révisé** (doublons + pity remplacent le no-doublon + la consolation crédits).

1. **`game/crates.ts` révisé + `crates.test.ts` mis à jour.** Ajouter
   `FRAGMENT_VALUE: Record<Rarity, number>` (5/12/30/75/200), `FORGE_COST`
   (40/100/250/600/1500), `PITY_CONFIG = { threshold: 30, rarity: 'legendary' }`.
   `CrateDraw` = `{ kind: 'cosmetic'; id }` **|** `{ kind: 'fragments'; amount;
   dupId? }`. `openCrate(quality, owned, pool, pity, rng)` → **`{ draw, pity }`**
   (tirage pur ; pity force `legendary` si `pity+1 ≥ threshold` ; item uniforme
   dans la rareté, possédé → fragments+dupId, sinon cosmétique ; pity ré-init si
   légendaire, +1 sinon). `canForge(fragments, rarity)`. **Supprimer**
   `CONSOLATION_CREDITS` + branche crédits. Tests : doublon → fragments ;
   pity force + réinitialise ; `canForge` ; barème ; déterminisme (RNG injecté).

2. **`db/types.ts`** — `CosmeticsState.fragments: number` + `pity: number`.

3. **`db/db.ts` — migration Dexie v21** (`fragments`/`pity` rétro-remplis à 0).

4. **`db/seed.ts`** — `fragments: 0`, `pity: 0` sur le singleton neuf.

5. **`stores/useCosmeticsStore.ts`** — état `fragments`/`pity` (load/persist) ;
   `openCrate(quality)` revu (garde stock ; `openCrate` pur avec `pity` ; applique
   `draw` : `grant` **ou** `fragments +=` ; met à jour `pity` ; persiste ; renvoie
   le `draw`) ; **`forge(id)`** (garde non-possédé + `canForge` → `grant([id])` +
   `fragments -= FORGE_COST[rarity]`, persiste).

6. **`theme/tokens/crate.css`** — alias `--fragment` / `--fragment-rgb` (→ mint).

7. **`Icon.tsx`** — `gem`, `hammer`, `copy`.

8. **`CosmeticCard`** — état **`forge`** : aperçu en couleur + ligne **coût**
   (`FragmentAmount`) + bouton « Forger » / « solde insuffisant · manque X ».
   Nouvelles props `forgeCost?`/`fragments?`/`onForge?`.

9. **`FragmentBalance` (NOUVEAU, DS)** — pastille compteur (glyphe `gem` mint,
   halo). Utilisée dans les en-têtes CAISSES + Forge.

10. **`PityMeter` (NOUVEAU, DS)** — jauge segmentée `pity/threshold` + état
    « GARANTI AU PROCHAIN » (halo légendaire).

11. **`ForgePanel` (NOUVEAU, DS)** — `<Card hud brackets>` mint : liste les
    cosmétiques **exclusifs caisses non possédés** (`crateCosmetics()` ∖ `owned`)
    en `CosmeticCard state="forge"` ; en-tête + solde + phrase d'explication.

12. **`CrateOpeningModal`** — remplace la branche crédits par **doublon →
    fragments** (résout `dupId` via `COSMETIC_BY_ID`, filigrane « déjà possédé »,
    pied « +X fragments » mint) ; branche `cosmetic` inchangée.

13. **`WardrobeView` + `CratesPanel`** — monter `FragmentBalance` (en-têtes),
    `PityMeter` (panneau CAISSES) et `ForgePanel` (après CAISSES) ; passer
    `fragments`/`pity` depuis le store ; câbler `forge`.

14. **`cosmetics.css`** — keyframes `nw-frag-pop` (pop du gain) + `nw-pity-glow`
    (halo « garanti »), sous garde `prefers-reduced-motion`.

15. **i18n FR/EN** — fragments (solde, barème), forge (titre, coût, forger,
    insuffisant/manque), pity (label, restant, garanti), doublon (déjà possédé,
    converti en).

16. **Vérifs** — `typecheck` + `lint` + `build`/PWA + `tests` verts ; vérif
    visuelle navigateur en recette (doublon → fragments, forge abordable/
    insuffisant, pity force + réinitialise, survie renaissance).
