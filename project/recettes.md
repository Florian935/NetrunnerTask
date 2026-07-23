# Recettes — Netrunner Tasks

> Tests de recette par US. Chaque test reprend un critère d'acceptation de l'US.
> Statuts : `à faire` / `validé` / `échoué`.

## US-035 — Pity + fragments anti-doublon (Phase A3)

Recette du 23/07/2026. Critères de `us/US-035-pity-fragments.md` §1. **Vérifs
automatiques** : `typecheck` + `lint` (oxlint) + `build`/PWA + tests Vitest
**272/272** (+3 : `game/crates` révisé — doublons, pity, forge). **Vérif live
PO** (scripts console IndexedDB : injecter fragments/pity, forcer doublons, pool
vierge).

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Doublon (cosmétique déjà possédé) → **converti en fragments** (montant ~ rareté), solde +X, aucun doublon ajouté | `openCrate` (doublon → `FRAGMENT_VALUE`, **testé**) + store `fragments +=` + rituel + PO live | validé | 23/07/2026 |
| C2 | Nouveau cosmétique → **ajouté à la collection**, sans fragments | `openCrate` (item neuf, **testé**) + `grant` + PO live | validé | 23/07/2026 |
| C3 | **Forge** un cosmétique abordable → possédé/équipable, solde −coût | `forge` store + `canForge`/`FORGE_COST` (**testé**) + `ForgePanel` + PO live | validé | 23/07/2026 |
| C3b | Cosmétique trop cher → bouton **désactivé** « manque X » | `CosmeticCard` état `forge` (afford) + PO live | validé | 23/07/2026 |
| C4 | **Pity** : au seuil (30 sans légendaire) → prochaine ouverture **garantit** un légendaire ; compteur réinitialisé | `openCrate` (force + reset, **testé**) + `PityMeter` + PO live | validé | 23/07/2026 |
| C5 | Fragments **et** pity **survivent** au reload **et** à la renaissance | `fragments`/`pity` sur `cosmeticsState` (hors `prestige()`) + migration v21 + PO live | validé | 23/07/2026 |
| C6 | Rituel : doublon (mint « +fragments ») **distinct** du nouveau ; reduced-motion → instantané, même issue | `CrateOpeningModal` (branche doublon + reduced) + PO live | validé | 23/07/2026 |
| C7 | Garde-fous : fragments sans effet de jeu, **jamais** achetés ; forge = exclusifs caisses non possédés | `game/crates` sans valeur de jeu + `ForgePanel` (pool exclusif) + PO live | validé | 23/07/2026 |
| C8 | Couches pures couvertes (doublon, pity, forge) | `crates.test.ts` (**15**) | validé | 23/07/2026 |
| C9 | `typecheck` + `lint` + `build`/PWA + `test` (**272/272**) | exécution | validé | 23/07/2026 |
| — | **Migration Dexie v21** : `fragments`/`pity` rétro-remplis à 0 (survivent à la renaissance) | `db.ts` v21 | validé | 23/07/2026 |
| — | Réutilisation DS : `CosmeticCard` (état `forge`), `Card`/`Icon`, rampe rareté, famille toasts ; token `--fragment-*` (alias mint) | composants existants | validé | 23/07/2026 |

### Boucle de recette — 3 retours PO corrigés en direct

- **BUG-035-1** (mineur) : toast « caisse gagnée » peu lisible (fond `--bg-surface`
  trop proche de la nav + titre acier muet) → **fond opaque void-800 + titre
  `--text-primary`**.
- **BUG-035-2** (mineur) : carte de caisse **disponible** sans fond distinct
  (`--bg-surface` ≈ panneau) → **surface surélevée void-400 + bordure renforcée**.
- **BUG-035-3** (mineur) : carte forgée disparaissait sans animation → **flash
  « FORGÉ »** (`nw-forged`, mint) avant retrait ; commit immédiat en reduced-motion.

### Notes de méthode & écarts (validés PO)

- **Modèle de tirage révisé vs US-034** (assumé) : le no-doublon (C6 d'US-034) et
  la consolation crédits (couture #3) sont **remplacés** par doublons → fragments
  + pity + forge. Tests d'US-034 mis à jour.
- **Identité fragments = mint/cristal** (token `--fragment-*` → `--mint-500`),
  hors accents réservés. **Barème** (`FRAGMENT_VALUE`/`FORGE_COST`) et **pity**
  (seuil 30, `legendary`) = valeurs maquette, **ajustables**.
- **Forge = pool exclusif caisses non possédé** uniquement (les cosmétiques de
  jalon restent gagnés par le jeu).

**Verdict : recette US-035 validée (8/8 critères + vérifs annexes), 3 retours
mineurs corrigés en direct, aucun bug ouvert.**

## US-034 — Caisses & rituel d'ouverture (Phase A3)

Recette du 23/07/2026. Critères de `us/US-034-caisses-ouverture.md` §1. **Vérifs
automatiques** : `typecheck` + `lint` (oxlint) + `build`/PWA + tests Vitest
**269/269** (+18 : `game/crates` 12, catalogue pool exclusif 5, invariant
milestones ajusté). **Vérif live PO** (scripts console IndexedDB pour injecter
stock/états : SURCADENCE, recharge de caisses, pool épuisé).

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Événement source (jalon / renaissance) → compteur de la **qualité** +1 + **feedback** « CAISSE GAGNÉE » | `grantCrate` câblé `useBuilderStore` (renaissance→secured · jalon→standard · caché→blackice) + file `crateEarned`/`CrateEarnedToast` + PO live | validé | 23/07/2026 |
| C2 | Inventaire : compteur **par qualité** ; qualité à 0 **désactivée** (pas d'ouverture) | `CratesPanel`/`CrateSlot` (état vide « à gagner ») + PO live | validé | 23/07/2026 |
| C3 | Table de probas consultable ; les **% somment à 100** | `CRATE_ODDS` (Σ=100 **testé**) + `CrateOddsTable` + PO live | validé | 23/07/2026 |
| C4 | Ouvrir → compteur **−1**, rituel joué, **1** cosmétique du **pool caisses** ajouté à `owned` | `openCrate` store + `openCrate` pur (**testé**) + `crateCosmetics()` + PO live | validé | 23/07/2026 |
| C5 | Rituel révèle la **rareté** (`CosmeticCard`/`RarityBadge`) ; `prefers-reduced-motion` → **révélation instantanée** | `CrateOpeningModal` (phases + branche reduced-motion) + PO live | validé | 23/07/2026 |
| C6 | **Pas de doublon** tant qu'il reste du neuf dans le pool éligible | `openCrate` pur (renormalisation sur raretés dispo, **testé**) + PO live | validé | 23/07/2026 |
| C7 | Caisses non ouvertes **et** cosmétiques tirés **survivent** au reload **et** à la renaissance | `crates`/`owned` sur `cosmeticsState` (hors `prestige()`) + migration v20 + PO live | validé | 23/07/2026 |
| C8 | Garde-fous : tiré **équipable + sans effet** ; **aucun** achat de caisse contre monnaie | `game/crates` sans valeur de jeu + `equip` + absence de tout flux d'achat + PO live | validé | 23/07/2026 |
| C9 | Couches pures couvertes (tirage, tables, anti-doublon, pool épuisé, pool exclusif) | `crates.test.ts` (12) + `cosmetics.test.ts` (+5) | validé | 23/07/2026 |
| C10 | `typecheck` + `lint` + `build`/PWA + `test` (**269/269**) | exécution | validé | 23/07/2026 |
| — | **Migration Dexie v20** : champ `crates` rétro-rempli à zéro (survit à la renaissance par construction) | `db.ts` v20 (upgrade) | validé | 23/07/2026 |
| — | Réutilisation DS : `CosmeticCard`/rareté/aperçus étendus, `<Card hud brackets>`, `Icon`, famille toasts | composants existants + tokens `crate.css` | validé | 23/07/2026 |
| — | Pool épuisé → **consolation crédits** (décision #3, +120 par défaut) ; couture reprise par US-035 | `openCrate` (`credits`) + `adjustCredits` + PO live | validé | 23/07/2026 |

### Notes de méthode & écarts (validés PO)

- **Contenu exclusif créé** : 10 cosmétiques `source: 'crate'` (≥ 2 par rareté,
  4 types, 1 thème `crate-obsidian`), disjoints des départs et des récompenses de
  jalons — la voie déterministe couvre le reste (invariant `milestones.test.ts`
  ajusté en conséquence).
- **Identité caisses violet → givre** (tokens `crate.css`), hors accents réservés
  (cyan/rouge/ambre) — écart de maquette « choix couleur laissé au design », validé.
- **`CRATE_ODDS` et `CONSOLATION_CREDITS` volontairement ajustables** — valeurs de
  la maquette conservées, jugées OK par le PO en recette.
- **Point levé en recette** (non bloquant) : à pool caisses complet, le libellé
  « COLLECTION COMPLÈTE » du rituel désigne le *pool caisses*, pas toute la
  collection (la Garde-robe peut encore montrer des épiques de **jalon**
  verrouillés). Mécanique confirmée correcte (diagnostic console) ; wording
  laissé tel quel.

**Verdict : recette US-034 validée (8/8 critères + vérifs annexes), aucun bug ouvert.**

## US-033 — Achievements-récompenses + aperçu de collection (Phase A3)

Recette du 23/07/2026. Critères de `us/US-033-achievements-collection.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**252/252** (+14 : mapping récompenses jalons, `game/collection`). **Vérif live
PO** sur `:5180` (partie neuve via « Clear site data » → seed v19 direct).

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Partie neuve : seuls les 4 cosmétiques de départ possédés, le reste **verrouillé** (cadenas + « Débloqué par »), cachés non atteints **masqués** | `DEFAULT_COSMETICS.owned = STARTER` + `WardrobeView` (catalogue complet + masquage) + PO live | validé | 23/07/2026 |
| C2 | Atteindre l'objectif d'un accomplissement → le cosmétique récompense devient **possédé et équipable** | `MilestoneDef.reward` + `grant` câblé dans `useBuilderStore` + PO live (HACK → Corbeau) | validé | 23/07/2026 |
| C3 | Au déblocage : **reveal dédié** « Cosmétique débloqué » | file `cosmeticUnlocks` + `CosmeticUnlockToast` (AppShell) + PO live | validé | 23/07/2026 |
| C4 | Déblocage **définitif** (survit reload + renaissance) et **idempotent** (ne se reproduit pas) | `owned` sur `cosmeticsState` (hors `prestige()`) + `grant` idempotent + `achievedMilestones` append-only + PO live | validé | 23/07/2026 |
| C5 | Liste des accomplissements avec **récompense** par ligne ; cachés non atteints → « ??? » | `MilestonesPanel` étendu + `RewardChip` + PO live | validé | 23/07/2026 |
| C6 | **Aperçu de collection** par rareté (débloqués/total) + « X légendaires restants » | `game/collection.ts` (**testé**) + `CollectionPreview` + PO live | validé | 23/07/2026 |
| C7 | Cosmétique **verrouillé non équipable** (pas de bouton Équiper) | `CosmeticCard` état `locked` + PO live | validé | 23/07/2026 |
| C8 | i18n **FR/EN** (verrouillage, récompense, collection, toast) ; aucune chaîne en dur | clés `cosmetics.*` FR+EN + PO live | validé | 23/07/2026 |
| C9 | Couches pures couvertes (mapping récompenses, `game/collection`) | `milestones.test.ts` (+7) + `collection.test.ts` (8) | validé | 23/07/2026 |
| C10 | `typecheck` + `lint` + `build`/PWA + `test` (**252/252**) | exécution | validé | 23/07/2026 |
| — | **Migration Dexie v19** : re-verrouille `owned` = départ ∪ récompenses atteintes + réconcilie `equipped` (invariant « équipé ⊂ possédé ») | `db.ts` v19 (upgrade) | validé | 23/07/2026 |
| — | Réutilisation DS : `CosmeticCard`/rareté/aperçus d'US-031 étendus, `<Card>`/`<Button>`, famille toasts | composants existants | validé | 23/07/2026 |
| — | Course de chargement évitée : cosmétiques chargés **avant** le builder (`AppShell`) — le grant hors-ligne n'est pas écrasé | `loadCosmetics().then(loadBuilder)` | validé | 23/07/2026 |

### Notes de méthode & écarts (validés PO)

- **Contenu des accomplissements = vrais jalons builder (US-028)** + mapping de
  récompense, **pas** les accomplissements de la maquette (« Série de 7 jours »,
  « 50 tâches purgées » = module perso, écartés — cohérent avec le découplage
  #022 / la décision profil #037).
- **Jalons booléens** (atteint / à faire / scellé) — pas de fraction de
  progression (« 38/50 » de la maquette écarté, nos jalons sont des prédicats).
- **Mapping récompense** curé (rareté ~ difficulté ; cachés → titres/bannières
  légendaires) — ajustable si besoin (`game/milestones.ts`).

**Verdict : recette US-033 validée (8/8 critères + vérifs annexes), aucun bug ouvert.**

## US-032 — Profil / ID runner (Phase A3)

Recette du 23/07/2026. Critères de `us/US-032-profil-runner.md` §1. **Vérifs
automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest **238/238**
(+6 sur `game/profile`). **Vérif live PO** sur `:5181`.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Cliquer l'entrée **Profil** du rail → écran `/profile` s'affiche | route `/profile` + `NavLink` actif + PO live | validé | 23/07/2026 |
| C2 | Avatar + bannière + titre **équipés** affichés sur la carte d'ID | `RunnerIdCard` lit `equipped` + PO live | validé | 23/07/2026 |
| C3 | Changer un équipé en Garde-robe → profil **reflète** (avant/après reload) | store partagé `useCosmeticsStore` + PO live | validé | 23/07/2026 |
| C4 | 3 stats exactes (Génération/Jalons X÷11/Cosmétiques X÷14) ; **aucune donnée perso** | lecture `prestigeCount`/`achievedMilestones`/`owned` + totaux catalogues + PO live | validé | 23/07/2026 |
| C5 | Modifier le callsign (MAJ forcées, 12 max, caractères filtrés) → **enregistré + persiste** au reload | `normalizeCallsign` (**testé 6/6**) + `setCallsign` (v18) + PO live | validé | 23/07/2026 |
| C6 | CTA **« Personnaliser »** → `/wardrobe` | `useNavigate` + PO live | validé | 23/07/2026 |
| C7 | Le profil respecte le **thème équipé** (re-skin US-031) | hérite du re-skin global + PO live | validé | 23/07/2026 |
| C8 | i18n **FR/EN** (`profile.*`) ; aucune chaîne en dur | clés FR+EN + composants via `t()` + PO live | validé | 23/07/2026 |
| C9 | `game/profile.ts` couvert (normalisation callsign) | `profile.test.ts` (**6/6**) | validé | 23/07/2026 |
| C10 | `typecheck` + `lint` + `build`/PWA + `test` (**238/238**) | exécution | validé | 23/07/2026 |
| — | Réutilisation DS : `<StatCard>`, `<Card hud brackets>`, `RarityBadge`/`RankPips`, `<Button>` | composants existants | validé | 23/07/2026 |
| — | Migration Dexie **v18** : `callsign` sur `cosmeticsState` (survit à la renaissance) | `db.ts` v18 + seed | validé | 23/07/2026 |

### Ajustements en cours de recette (validés PO, corrigés en direct)

- **Rail de nav non figé** (défaut UX) : sur une vue qui défile, l'entrée Profil
  (bas du rail) n'était atteignable qu'en scrollant tout en bas. Corrigé →
  `.nav-rail` **sticky pleine hauteur** (desktop) / **collé en bas** (mobile),
  `appShell.css`. Le rail reste entièrement visible sur toutes les vues.
- **Repère d'angle haut-droite masqué** sur la carte d'ID : les brackets de
  `<Card>` étaient rendus **sous** le contenu → la bannière opaque recouvrait le
  repère haut-droite. Corrigé → **`z-index` sur les repères de `<Card>`**
  (`components/ui/surfaces/Card.tsx`) : les 2 repères restent visibles quel que
  soit le contenu (correctif propre du DS, bénéfique partout).
- **Cercle décoratif de la bannière tronqué net** en bas (coupe droite par
  l'`overflow:hidden`) : cercle **remonté** (`RunnerIdCard`) pour que son bas
  reste au-dessus du bord → arc net.

**Verdict : recette US-032 validée (8/8 critères + vérifs annexes), aucun bug ouvert.**

## US-031 — Socle cosmétique & rareté (Phase A3)

Recette du 23/07/2026. Critères de `us/US-031-socle-cosmetique-rarete.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**232/232** (+13 sur `game/cosmetics`). **Vérif live PO** sur `:5181` (5180
occupé) — repositories `builderRepo`/`cosmeticsRepo` exposés en dev pour injecter
l'état (renaissance) via la console.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Ouvrir la Garde-robe → cosmétiques **groupés par type** + **badge de rareté** par carte | `WardrobeView` + `cosmeticsByType` + `RarityBadge` + PO live | validé | 23/07/2026 |
| C2 | Équiper un thème → **HUD re-skinné immédiatement** (fonds/panneaux + texte + bordures + accent du rail) sur toute l'app | `themes.css` (`data-cosmetic-theme`) + passe d'aliasing + PO live | validé | 23/07/2026 |
| C3 | Équiper un 2ᵉ thème → le précédent se **déséquipe** (un seul thème actif) | `equip` (remplace l'équipé du même type, **test**) + PO live | validé | 23/07/2026 |
| C4 | Non équipé → **« Équiper »** ; équipé → **« Équipé »** (pas de bouton redondant) | `CosmeticCard` (états) + PO live | validé | 23/07/2026 |
| C5 | Chaque cran de rareté a un **traitement visuel distinct et cohérent** partout | `rarity.css` + `RarityBadge`/`RankPips` + PO live | validé | 23/07/2026 |
| C6 | Recharger l'app après équipement → **thème + équipés restaurés** (pas de FOUC) | `cosmeticsRepo` (v17) + `bootCosmeticTheme` (miroir localStorage) + PO live | validé | 23/07/2026 |
| C7 | Déclencher une **renaissance** → inventaire + équipés **conservés** (Réseau reset) | table `cosmeticsState` séparée (prestige ne touche que `builderState`) + PO live (cycles injectés console) | validé | 23/07/2026 |
| C8 | Équiper n'importe quel cosmétique → **aucune valeur de jeu ne change** (pur statut) | découplage `game/cosmetics` (aucun multiplicateur) + PO live (débit/s inchangé) | validé | 23/07/2026 |
| C9 | Équiper avatar/bannière/titre → choix **enregistré et persistant** au rechargement | `equip` un-par-type + persistance immédiate + PO live | validé | 23/07/2026 |
| C10 | `game/cosmetics.ts` couvert (equip un-par-type, no-op, tri rareté, invariants) | `cosmetics.test.ts` (**13/13**) | validé | 23/07/2026 |
| C11 | `typecheck` + `lint` + `build`/PWA + `test` (**232/232**) | exécution | validé | 23/07/2026 |
| — | **Solde la dette DS #008/#022** : rampe `--rarity-*` + `RarityBadge`/`CosmeticCard` reconstruits sur NIGHTWIRE | `rarity.css` + composants `features/cosmetics/` | validé | 23/07/2026 |
| — | Migration Dexie **v17** : nouvelle table `cosmeticsState` (seed singleton, tout débloqué) | `db.ts` v17 + `seed.ts` | validé | 23/07/2026 |
| — | Écarts périmètre appliqués : **pastille crédits retirée**, compteur « X/Y débloqués » minimal | `WardrobeView` | validé | 23/07/2026 |

### Notes de méthode & limites assumées (validées PO)

- **Re-skin « Chrome + fonds »** (décision PO) : le thème surcharge la couche
  sémantique (accent chrome + fonds + texte + bordures) ; les **couleurs de jeu
  restent fixes** (data magenta, daemons violet, accélérateurs cyan, crypto
  ambre, prestige rouge) pour la lisibilité gameplay.
- **Limites v1 assumées** (ni bugs ni échecs de recette) : le **fond signature
  #017** de la zone de contenu reste navy ; certains éléments chrome codés en
  cyan « en dur » (**boutons secondaires**, quelques lueurs de titres) restent
  cyan (passe d'aliasing volontairement courte, anti-dérapage). Router le reste
  du chrome vers l'accent = suivi possible au backlog si souhaité.
- **Aide de recette** : `builderRepo`/`cosmeticsRepo` ajoutés à l'exposition dev
  `window` (`main.tsx`, bloc `import.meta.env.DEV`) — permet d'injecter l'état
  pour tester C7 (renaissance) sans farmer le seuil.

**Verdict : recette US-031 validée (9/9 critères + vérifs annexes), aucun bug.**

## US-030 — Catalogue d'accélérateurs réels élargi (Phase A2)

Recette du 22/07/2026. Critères de `us/US-030-accelerateurs-elargi.md` §1
(périmètre **Option A** : 1 accélérateur `deep-analysis`, data ×2). **Vérifs
automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest **219/219**
(+6 sur `game/accelerators.ts` : catalogue ≥ 2, `deep-analysis` cible data,
`boostMultiplier`/`boostWindows` data ×2, anti-empilement inter-accélérateurs).
**Recette navigateur** (`npm run dev`, port 5180) confirmée par le PO : **8/8
critères conformes, validé à 100 %**. États injectés dans IndexedDB (helper
console : `acceleratorRun`/`acceleratorBoost`) pour dérouler en cours + SURCADENCE.
**DS réutilisé** (Card / Button / ProgressBar / Icon) ; seul le manquant créé
(composant DS `ProgressRing` + éléments cosmétiques). **Aucune migration Dexie,
aucune règle de jeu nouvelle** (moteur/store déjà génériques par ressource).

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Catalogue à ≥ 2 accélérateurs, ajout par donnée sans réécrire le moteur | entrée `deep-analysis` + test `ACCELERATORS`/`ACCELERATOR_BY_ID` | validé | 22/07/2026 |
| C2 | Repos : le joueur voit et sélectionne quel accélérateur lancer (durée/effet/ressource) | `ReposView` itère `ACCELERATORS` → `startAccelerator(id)` + PO | validé | 22/07/2026 |
| C3 | Session menée à terme → SURCADENCE ; abandon → aucun boost (pas de raccourci) | `resolve`/`cancel` inchangés + PO | validé | 22/07/2026 |
| C4 | Boost `deep-analysis` multiplie la **data** (pas les cycles) ; `focus` les cycles | `boostMultiplier` → `{cycles:1, data:2}` (test) + PO | validé | 22/07/2026 |
| C5 | Anti-empilement : session/boost actif → impossible d'en lancer un autre, UI reflète | `canStart` (test inter-accélérateurs) + vues en cours/SURCADENCE + PO | validé | 22/07/2026 |
| C6 | Fermer/rouvrir pendant session/boost → état résolu correctement (tous accélérateurs) | `resolve`/hors-ligne inchangés + PO (injection) | validé | 22/07/2026 |
| C7 | i18n FR/EN complet (catalogue, phases, libellés), DS existant, accent cyan réservé | clés FR+EN + Card/Button/ProgressBar/Icon + PO | validé | 22/07/2026 |
| C10 | `typecheck` + `lint` + `build` + tests au vert ; `focus`/hors-ligne inchangés | vérifs automatiques 219/219 | validé | 22/07/2026 |
| — | C8-C9 (détox numérique) **hors périmètre** (Option A) → reportés au backlog | — | s/o | 22/07/2026 |

### Ajustement issu de la vérification visuelle (avant validation PO)

- **Halo de l'anneau tronqué au carré** (retour PO) : un `<svg>` a `overflow:
  hidden` par défaut (règle UA) ; le cercle de progression touchant le bord du
  viewport, son `drop-shadow` (halo 6px) était coupé net. Corrigé par
  `overflow: visible` sur le `<svg>` de `ProgressRing` → halo complet, pour
  **tous** les usages du composant. Ajustement dans le périmètre (composant né
  avec l'US) → pas d'entrée `bugs.md`.

**Bug corrigé pendant l'implémentation** (avant recette) : le toast de
SURCADENCE (`useBuilderTick`) calculait le multiplicateur sur `boostEffect.cycles`
en dur → aurait affiché ×1 pour `deep-analysis`. Généralisé via
`acceleratorMultiplier`/`acceleratorResource` (moteur), le toast lit la vraie
ressource boostée.

## US-026 — Prestige incrémental : seuil de renaissance + équilibrage (Phase A2)

Recette du 22/07/2026. Critères de `us/US-026-prestige-incremental.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**213/213** (+6 sur `game/prestige.ts` : base, géométrie 2,5M/6,25M/15,6M,
monotonie C3, invariant anti-boucle C4, ré-éligibilité C6). **Recette
fonctionnelle navigateur** (`npm run dev`, port 5180) confirmée par le PO :
**9/9 critères conformes, validé à 100 %**. États de test injectés dans
IndexedDB (helper console : `cycles` / `prestigeCount`) pour dérouler le flux de
renaissance et la compatibilité d'une sauvegarde existante. Équilibrage retenu :
**`growth = 2,5`** (seuils 1M → 2,5M → 6,25M → 15,6M…), bonus `×1,5` composé
conservé. **Aucune migration Dexie** (seuil dérivé de `prestigeCount`).

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Partie neuve → panneau affiche progression vers **1 000 000** cycles | `prestigeThreshold(0)===1_000_000` + PO (état frais) | validé | 22/07/2026 |
| C2 | Après 1 renaissance → seuil affiché **2 500 000** (> précédent) | `prestigeThreshold(prestigeCount)` dans `PrestigePanel` + PO | validé | 22/07/2026 |
| C3 | Seuil strictement croissant `seuil(n+1) > seuil(n)` | test unitaire (n=0..10) | validé | 22/07/2026 |
| C4 | Anti-boucle : `seuil(n)/bonus(n)` non décroissant (jamais plus rapide) | test unitaire (rapport strictement croissant, `growth>nextMult`) | validé | 22/07/2026 |
| C5 | Cycles ≥ seuil → « Renaître » → reset économie, `prestigeCount+1`, **nouveau seuil plus haut** | `canPrestige`/`prestige` + PO (renaissance live) | validé | 22/07/2026 |
| C6 | Juste après renaissance, solde < nouveau seuil → **non éligible** (bouton masqué, barre repartie) | `canPrestige(prestigeThreshold(count))` + PO | validé | 22/07/2026 |
| C7 | Bonus permanent suit `1,5^count`, toujours appliqué (prod/hors-ligne/débit) — non-régr. US-024 | `prestigeMultiplier` inchangé + PO | validé | 22/07/2026 |
| C8 | Sauvegarde `prestigeCount>0` → count + bonus conservés, seuil = seuil incrémental du count, rien perdu | seuil dérivé, pas de migration + PO (injection count=3 → ×3,38, seuil 15 625 000) | validé | 22/07/2026 |
| C9 | `typecheck` + `lint` + `build` + tests au vert | vérifs automatiques 213/213 | validé | 22/07/2026 |

**Aucun bug ouvert.** Aucun ajustement de code nécessaire en recette (équilibrage
`growth = 2,5` figé au cadrage technique, non contesté à la recette).

## US-029 — Visualisation du Réseau (Phase A2)

Recette du 22/07/2026. Critères de `us/US-029-visualisation-reseau.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**207/207** (dont nouveau `networkMapModel.ts` **13/13** — intégrité layout +
arêtes + états dérivés). **Recette visuelle & interactive navigateur**
(`npm run dev`, port 5180) confirmée par le PO : **9/9 critères conformes,
validé à 100 %**. États de test injectés dans IndexedDB (helper console) pour
dérouler début/milieu/fin, les 2 reveals et la renaissance.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | `/network` affiche une carte unique (daemons + arbre reliés), plus de liste/arbres en lignes | `NetworkMap` remplace liste daemons + 2 `UnlockTreeSection` + PO | validé | 22/07/2026 |
| C2 | États distincts : verrouillé (assombri) / disponible (halo pulsé devise) / acquis (mint + pastille) / scellé | halos pilotés par `state` (`nodeRgb`) + PO | validé | 22/07/2026 |
| C3 | Débloquer un nœud → carte mise à jour immédiatement (nœud illuminé, arêtes mint), sans reload | lecture réactive du store + `mapEdgeVisual` + PO (achat live) | validé | 22/07/2026 |
| C4 | Nœuds cachés scellés (▓▓▓▓, cadenas) tant que condition non remplie ; reveal glitch à l'apparition | `sealed` dérivé de `isConditionMet` (comme `visibleNodes`) + `nw-map-reveal` sur transition + PO (GHOST via wraith×12, DARK.POOL via oracle×2) | validé | 22/07/2026 |
| C5 | Renaissance → trace visuelle permanente sur la carte (badge GÉN. 0X + aura rouge) | `GenBadge` + aura `inset` lisant `prestigeCount` + PO (renaître → GÉN. 01) | validé | 22/07/2026 |
| C6 | Toutes les actions restent possibles depuis la carte (daemon : Compiler + Améliorer + compte ; nœud : Débloquer, 2 devises) | `NetworkMapDetail` (popover DS `<Card>`/`<Button>`) → actions existantes du store + PO | validé | 22/07/2026 |
| C7 | Lisible en début (1/13) comme en fin (arbre quasi complet) ; scroll horizontal sous largeur mini | layout manuel + bande `min-width` + `overflow-x` + PO (états early/rich) | validé | 22/07/2026 |
| C8 | Reload → carte fidèle à l'état sauvegardé, sans rejouer les animations d'un contenu déjà acquis | lecture pure du store persisté + reveal gardé par transition (`useRef`, pas au 1ᵉʳ rendu) + PO (F5) | validé | 22/07/2026 |
| C9 | `prefers-reduced-motion` : animations carte supprimées/réduites, carte lisible statique | bloc `@media (prefers-reduced-motion)` dans `networkMap.css` + PO | validé | 22/07/2026 |
| — | Composants DS réutilisés (`<Card hud brackets halo>`, `<Button>`, `<Icon>`, `<ProgressBar>` ailleurs), accents par état/devise (pas de 7ᵉ couleur) | revue + PO (rendu conforme maquette) | validé | 22/07/2026 |
| — | i18n FR/EN (`builder.map.*` + réutilisation `builder.generators.*`/`unlockTree.*`), aucune chaîne en dur | clés FR+EN via `t()` | validé | 22/07/2026 |
| — | Aucune règle de jeu nouvelle, aucune migration Dexie (couche de présentation pure) | `buildMapNodes` compose les sélecteurs existants, **testé** | validé | 22/07/2026 |

### Ajustements issus de la vérification visuelle (avant validation PO)

- **Popover fermé aussitôt ouvert** : le clic sur un nœud remontait au conteneur
  `.nw-map` dont le `onClick` réinitialisait la sélection. Corrigé par un test
  `e.target === e.currentTarget` (ne referme qu'au clic sur le fond).
- **OVERCLOCK faussement « disponible » en début de partie** : `nodeState`
  renvoie `available` dès que la condition d'arbre est remplie (overclock n'a
  aucun prérequis), sans tenir compte de la ressource. Ajout d'un **gating de
  branche** dans `buildMapNodes` : un nœud reste `locked` tant que sa ressource
  n'est pas ouverte (data via `oracle`, crypto via `breach-market`) — reproduit
  l'ancien comportement (branche cachée avant la ressource).
- **Chevauchement labels du bas ↔ hint** : épine des daemons remontée.
- **Halo décoratif bloquant le clic** : passé en `pointer-events: none`.
- **Coupures droites des blooms d'ambiance** (retour PO) : les
  `radial-gradient(circle … transparent 68%)` gardaient de la couleur au bord
  du div (clippé) → arêtes. Passés en `ellipse closest-side … transparent`
  (transparent atteint pile sur chaque bord, aucune arête).

## US-028 — Jalons / accomplissements du Réseau (Phase A2)

Recette du 22/07/2026. Critères de `us/US-028-jalons-accomplissements.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**194/194** (dont nouveau `game/milestones.ts` **15/15**). **Vérification
visuelle navigateur** (Playwright headless) en amont de la recette PO : 2 bugs
trouvés et corrigés en direct (9 icônes manquantes au registre DS
`components/ui/core/Icon.tsx` ; toast de jalon chevauchant la `StatusBar`,
repositionné). **Recette PO : 10/10 critères conformes, aucun bug trouvé.**
Contenu concret des 11 jalons **ajusté par rapport au cadrage fonctionnel
initial** suite à la maquette validée (§3 de l'US) : remplace les jalons
« sifter/wraith/oracle débloqués » + « seuils de cycles 1k/1M » par PREMIER
HACK, ESSAIM DE DAEMONS, PREMIÈRE AMÉLIO, FLUX DE DATA, et ajoute SURCADENCE
(système accélérateurs US-023, absent du cadrage initial).

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Achat du 1ᵉʳ daemon → jalon DAEMON EN LIGNE atteint + toast dédié une seule fois | `checkMilestones`/`checkAndApplyMilestones` dans `buyGenerator`, **testé** + PO live | validé | 22/07/2026 |
| C2 | ≥ 2 types de daemons distincts possédés → jalon ESSAIM DE DAEMONS atteint | prédicat `roster` (`Object.keys(generators).length ≥ 2`), **testé** + PO | validé | 22/07/2026 |
| C3 | 1ᵉʳ hack manuel → jalon PREMIER HACK ; 1ʳᵉ amélioration achetée → jalon PREMIÈRE AMÉLIO | `checkHackMilestone` (événementiel, `hack()`) + prédicat `upgrade`, **testés** + PO | validé | 22/07/2026 |
| C4 | 1ᵉʳ nœud de l'arbre débloqué → jalon ARBRE OUVERT atteint | prédicat `tree` (`unlockedNodes.length ≥ 1`), **testé** + PO | validé | 22/07/2026 |
| C5 | Reveal d'un nœud caché (`ghost-protocol`/`dark-pool`) → jalon GHOST/CARTEL atteint, masqué avant | prédicats `ghost`/`cartel`, **testés** + `MilestonesPanel` masque nom+desc avant reveal + PO | validé | 22/07/2026 |
| C6 | 1ʳᵉ conversion `data`→`crypto` → jalon MARCHÉ CRYPTO atteint | prédicat `crypto` (`crypto > 0`), **testé** + PO | validé | 22/07/2026 |
| C7 | 1ʳᵉ renaissance → jalon RENAISSANCE atteint | prédicat `reborn` (`prestigeCount ≥ 1`), **testé** + PO (renaissance déclenchée) | validé | 22/07/2026 |
| C8 | Reload conserve les jalons atteints, y compris après renaissance | `BuilderState.achievedMilestones` (Dexie **v16**, append-only, non touché par `prestige()`) + PO (F5 + renaissance) | validé | 22/07/2026 |
| C9 | Panneau REGISTRE : liste complète atteint/non atteint, pas de spoil sur les cachés | `MilestonesPanel` + PO (rendu conforme maquette `network-milestones`) | validé | 22/07/2026 |
| C10 | Jalon déjà atteint franchi à nouveau → aucun nouveau toast | garde `achievedMilestones` dans `checkMilestones`/`checkHackMilestone` (ids déjà présents ignorés), **testé** + PO | validé | 22/07/2026 |
| — | Jalon SURCADENCE (hors périmètre initial, ajouté via maquette) : 1ᵉʳ boost accélérateur obtenu → toast dédié | prédicat `accel` (`acceleratorBoost !== null`), vérifié dans `applyTick`/`load()`, **testé** + PO | validé | 22/07/2026 |
| — | Composants DS (`<Card hud brackets>` sans halo — chrome neutre volontaire, `<ProgressBar accent="mint">`, `<Icon>`), pattern bespoke toast comme `RankUpToast` | revue + PO (rendu conforme maquette) | validé | 22/07/2026 |
| — | i18n FR/EN (`builder.milestones.*`), aucune chaîne en dur | clés FR+EN via `t()` | validé | 22/07/2026 |

## US-027 — Marché crypto (Phase A2)

Recette du 21-22/07/2026. Critères de `us/US-027-marche-crypto.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**179/179** (dont nouveau `game/crypto.ts` **10/10**, `game/unlockTree.ts`
généralisé **29/29**, `game/prestige.ts` ajusté **7/7**). **Recette visuelle &
interactive navigateur (`npm run dev`, port 5182) confirmée par le PO :
fonctionnel OK, rendu conforme à la maquette `network-crypto`.** Coûts/seuil
temporairement réduits pour la recette (RELAIS DE MARCHÉ, CARTEL://DARK.POOL,
seuil de prestige) puis **remis à leurs valeurs d'origine** après validation PO.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Avant le nœud de déblocage : aucune info sur le marché crypto visible | `cryptoUnlocked` (`unlockedNodes.includes('breach-market')`) gate `CryptoPanel`/branche crypto + PO | validé | 22/07/2026 |
| C2 | Achat du nœud RELAIS DE MARCHÉ → panneau marché **et** 2ᵉ branche d'arbre apparaissent | `buyNode` généralisé + PO live | validé | 22/07/2026 |
| C3 | Cours qui varie dans le temps, observable sans action du joueur | `marketRate` déterministe (3 oscillations), **testé** + PO (ticker observé) | validé | 22/07/2026 |
| C4 | Montant crédité dépend du cours au moment de la conversion | `convertToCrypto` recalcule `marketRate(Date.now())` à chaque appel, **testé** + PO (2 conversions à cours différents) | validé | 22/07/2026 |
| C5 | 2ᵉ branche : ≥ 3 nœuds crypto, coût + état affichés | `UnlockNodeCard`/`UnlockTreeSection` généralisés (`unit='crypto'`) + PO | validé | 22/07/2026 |
| C6 | Achat d'un nœud crypto débite crypto (pas data), applique l'effet ; solde < → refusé | `buyNode`/`canBuyNode` devise-aware, **testé** + PO | validé | 22/07/2026 |
| C7 | Nœud caché crypto sans info avant condition remplie ; reveal dédié à l'apparition | `visibleNodes` (filtre `hidden`+`currency`), **testé** + `HiddenNodeCard` généralisé (glitch amber/cyan) + PO (voir bug ci-dessous, corrigé en cours de recette) | validé | 22/07/2026 |
| C8 | Persistance : solde crypto + nœuds crypto conservés au reload, cours cohérent | migration **Dexie v15** + `marketRate` recalculé à la volée (aucune incohérence possible) + PO (F5) | validé | 22/07/2026 |
| C9 | Non-régression (HACK/daemons/arbre data/accélérateur/prestige) ; renaissance remet aussi `crypto` à 0 | `game/prestige.ts` ajusté (`PrestigeCore` +`crypto`), **testé** + PO (renaissance déclenchée, crypto revenu à 0) | validé | 22/07/2026 |
| — | Composants DS (`<Card halo="amber">`, `<Slider>`, `<Icon>`), accent ambre réservé | revue + PO (rendu conforme maquette) | validé | 22/07/2026 |
| — | i18n FR/EN (`builder.crypto.*`, `unlockTree` généralisé), aucune chaîne en dur | clés FR+EN via `t()` | validé | 22/07/2026 |

### Ajustement issu de la recette (résolu, pas un bug de code)

- **Nœud caché CARTEL://DARK.POOL apparaissait immédiatement, non cliquable** :
  causé par la **valeur de recette** de sa condition (réduite à 1 oracle), alors
  qu'atteindre la branche crypto garantit déjà 1 oracle (`data` l'exige depuis
  A3) — la condition était donc trivialement remplie avant même l'apparition de
  la branche. La logique (`isConditionMet`/`visibleNodes`) était correcte ; la
  **vraie valeur de production (2 oracles)** n'a pas ce problème (atteindre la
  branche ne garantit qu'1 oracle). Recette rejouée avec la condition à 2 —
  reveal confirmé conforme (irruption glitch ambre/cyan). Aucune correction de
  code nécessaire.

## US-024 — A5 : Hors-ligne & temps écoulé + embryon de prestige

Recette du 21/07/2026. Critères de `us/US-024-hors-ligne-prestige.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**159/159** (dont `game/builder.ts` `offlineTick`, `game/accelerators.ts`
`boostWindows`, nouveau `game/prestige.ts`). **Recette visuelle & interactive
navigateur (`npm run dev`, port 5181) confirmée par le PO : fonctionnel OK,
rendu conforme à la maquette `network-renaissance`.** Seuil de renaissance
temporairement abaissé pour la recette (500 cycles) puis **remis à sa valeur
d'origine** (1 000 000) après validation PO.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Absence prolongée → cycles (+ data si `oracle`) crédités sur le temps réel écoulé | `offlineTick` (calendrier de segments) au `load()`, **testé** + PO live (fermeture/réouverture) | validé | 21/07/2026 |
| C2 | Le rattrapage tient compte des multiplicateurs actifs (arbre) à la fermeture | store compose arbre × boost × prestige dans le calendrier, **testé** (`offlineTick` multi-segments) + PO | validé | 21/07/2026 |
| C3 | Feedback visible à la réouverture (bandeau, pas de hausse muette) | `OfflineCatchupBanner` (`<Alert kind="success">`) + `useFeedbackStore.offlineCatchup` + PO | validé | 21/07/2026 |
| C4 | Absence très courte → pas de rattrapage anormal ni double-comptage | rattrapage calculé **1 fois** au `load()` depuis `updatedAt`, tick réamorcé indépendamment ; seuil d'affichage notable + PO (F5 rapproché) | validé | 21/07/2026 |
| C5 | Sous le seuil : renaissance indisponible + progression/explication visible | `PrestigePanel` variante verrouillée (`<ProgressBar>` + « Seuil non atteint », pas de bouton) + PO | validé | 21/07/2026 |
| C6 | Seuil atteint : action disponible + confirmation explicite (irréversible) | `canPrestige` → bouton « Renaître » → `ConfirmDialog` étendu (grille Perdu/Conservé) + PO | validé | 21/07/2026 |
| C7 | Après confirmation : reset complet + bonus permanent acquis, visible, appliqué | `prestige()` (reset ciblé, `prestigeCount + 1`), `prestigeMultiplier` composé dans `applyTick` **et** dans le débit affiché (voir correction) + PO | validé | 21/07/2026 |
| C8 | Recharger après renaissance conserve le bonus **et** l'état remis à zéro | migration **Dexie v14** (`prestigeCount`) + persistance immédiate + PO (F5) | validé | 21/07/2026 |
| C9 | Non-régression : HACK, daemons, arbre, accélérateur OK après rattrapage/renaissance ; focus non effacé par la renaissance | `prestige` ne touche pas `acceleratorRun`/`acceleratorBoost`, **testé** + tests A1→A4 verts + PO | validé | 21/07/2026 |
| — | i18n FR/EN (`builder.offline.*`, `builder.prestige.*`), aucune chaîne en dur ; « SURCADENCE/OVERDRIVE » et « RENAISSANCE/REBIRTH » distincts | clés FR+EN via `t()` | validé | 21/07/2026 |
| — | Composants DS (`<Card hud brackets halo="red">`, `<Alert>`, `<ProgressBar>`, `ConfirmDialog` **étendu** rétrocompatible), accent rouge réservé | revue + PO (rendu conforme maquette) | validé | 21/07/2026 |

### Correction issue de la recette (résolue dans l'US)

- **Débit affiché n'intégrait pas le bonus de prestige** : le multiplicateur de
  renaissance était bien appliqué à la **production réelle** (`applyTick`), mais
  le débit affiché (« +X/s » + total « Production réseau ») était calculé
  `productionPerSec × multiplicateur d'arbre` **sans** le prestige — donnant
  l'impression que le ×1,5 était inactif. Signalé par le PO à la recette,
  corrigé en composant `prestigeMultiplier(prestigeCount)` dans le débit affiché
  (`BuilderView.tsx`), cohérent avec ce qui est réellement crédité. Le boost
  temporaire SURCADENCE reste volontairement hors du débit affiché (convention
  héritée d'US-023, inchangée). Validé PO.

### Note (hors bug, amélioration backlog)

- **Seuil de renaissance flat** : identifié à la recette (le seuil ne monte pas
  d'une renaissance à l'autre — choix assumé pour l'embryon A5). Amélioration
  « seuil incrémental + équilibrage de la courbe de prestige » ajoutée au
  backlog (**US-026**, priorité basse).

## US-023 — A4 : Accélérateurs réels au choix

Recette du 20/07/2026. Critères de `us/US-023-accelerateurs-choix.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**142/142** (dont nouveau `game/accelerators.ts` **16/16**). **Recette visuelle
& interactive navigateur (`npm run dev`, port 5180) confirmée par le PO :
fonctionnel OK, rendu conforme à la maquette `network-accelerators`.** Durées
temporairement réduites pour la recette (focus 20 s / SURCADENCE 30 s) puis
**remises à leurs valeurs d'origine** (25 min / 15 min) après validation PO.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | `/network` : catalogue avec ≥ 1 accélérateur, principe + engagement (durée/effet/boost) affichés avant lancement | `AcceleratorPanel` (état repos) + `ACCELERATORS` + PO live | validé | 20/07/2026 |
| C2 | Ne rien lancer : aucune relance intrusive, aucun compteur pénalisant l'inaction | Panneau passif + teaser discret (dashed, sans pastille) + PO | validé | 20/07/2026 |
| C3 | « Lancer » → chrono tenu par l'app, état « en cours » visible (compte à rebours + barre + abandon) | `start()` + `acceleratorRun` + `AccRunning` (`<ProgressBar>`) + PO | validé | 20/07/2026 |
| C4 | Chrono mené au bout → overclock temporaire appliqué (prod ×2), indicateur actif + temps restant | `resolve()` (run→boost), `boostMultiplier` composé dans `applyTick`, `AccBoost` + toast succès + PO (prod doublée observée) | validé | 20/07/2026 |
| C5 | Abandon avant la fin → aucun boost, message neutre sans culpabilisation | `cancel()` (no-op sur boost) + toast `info` « Focus interrompu · aucune pénalité » + PO | validé | 20/07/2026 |
| C6 | Pas d'empilement : relance impossible tant que session/boost en cours | `canStart` (run+boost null) → bouton absent en cours/boost + PO | validé | 20/07/2026 |
| C7 | État (en cours / boost / dispo) survit au rechargement | `endsAt` **instant absolu** + migration **Dexie v13** + `resolve()` au `load()` (rattrapage) + PO (F5 pendant chrono & boost) | validé | 20/07/2026 |
| C8 | `prefers-reduced-motion` respecté sur les animations d'overclock | anneau focus + glow SURCADENCE repliés en statique (media query) + PO | validé | 20/07/2026 |
| — | i18n FR/EN (`builder.accelerators.*`), aucune chaîne en dur ; boost « SURCADENCE » (FR) / « OVERDRIVE » (EN), distinct du nœud permanent « OVERCLOCK » | clés FR+EN via `t()` | validé | 20/07/2026 |
| — | Panneau sur composants DS (`<Card hud brackets halo="cyan">`, `<Button>`, `<ProgressBar>`), accent cyan réservé | revue + PO (rendu conforme maquette) | validé | 20/07/2026 |

**Synthèse : recette 8/8 PO — US-023 passe la recette.** Aucun bug ouvert.
Prochaine étape : commit + merge + push (skill `commit`).

## US-022 — A3 : 2ᵉ couche de ressource + arbre de déblocage + 1ᵉʳ reveal caché

Recette du 20/07/2026. Critères de `us/archive/US-022-arbre-deblocage.md` §1.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**126/126** (dont `game/builder.ts` **25/25** et nouveau `game/unlockTree.ts`
**19/19**). **Recette visuelle & interactive navigateur (`npm run dev`)
confirmée par le PO : fonctionnel OK, rendu conforme à la maquette.** Seuils
de daemons temporairement abaissés pour la recette (wraith/oracle) puis
**remis à leurs valeurs d'origine** après validation PO.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Avant `oracle` : aucune info `data` visible (tout au plus l'ambiance « scellé ») | `dataPerSec` = 0 tant qu'`oracle` absent, **testé** + `DataReadout` (branche scellée) + PO | validé | 20/07/2026 |
| C2 | Achat du 1ᵉʳ `oracle` → mécanique `data` visible/active, compteur apparaît | `BUILDER_CONFIG.dataUnlockGenerator` + `DataReadout` + PO live | validé | 20/07/2026 |
| C3 | Compteur `data` augmente dans le temps, cohérent avec la production | `tick()` accrue `data` via `dataPerSec`, **testé** + PO live | validé | 20/07/2026 |
| C4 | Section « Arbre » : ≥ 2 nœuds achetables, coût + état affichés | `UNLOCK_NODES` (4 nœuds) + `UnlockTreeSection`/`UnlockNodeCard` + PO (capture) | validé | 20/07/2026 |
| C5 | Achat d'un nœud : solde suffisant → débite + effet ; insuffisant → refusé | `canBuyNode`/`buyNode` (no-op), **testé** + bouton `disabled` + PO | validé | 20/07/2026 |
| C6 | Nœud caché : aucune info avant condition remplie ; apparition avec traitement dédié | `visibleNodes` (filtre `hidden`), **testé** + `HiddenNodeCard` (irruption glitch) + PO (capture `GHOST://ROGUE.AI` révélé) | validé | 20/07/2026 |
| C7 | Persistance : `data` + nœuds débloqués conservés au rechargement | migration **Dexie v12** + `builderRepo`/`useBuilderStore` (même mécanisme que `cycles`/`generators`) | validé | 20/07/2026 |
| C8 | Non-régression : HACK, achat/upgrade des 4 daemons, cycles/s inchangés | `builder.test.ts` **25/25** (cas existants + nouveaux) + PO | validé | 20/07/2026 |
| — | i18n FR/EN (`builder.data.*`, `builder.unlockTree.*`), aucune chaîne en dur | clés FR+EN via `t()` | validé | 20/07/2026 |
| — | Cartes de nœuds sur le composant DS `<Card hud brackets>` (repères d'angle cohérents) | revue + correction PO (voir ajustement ci-dessous) | validé | 20/07/2026 |

### Ajustement issu de la recette (résolu dans l'US)

- **Repères d'angle des cartes de nœuds** : 1ʳᵉ version avec 4 repères custom
  (`position: absolute`, décollés du bord) au lieu de réutiliser le composant DS
  **`<Card hud brackets halo="…">`** (2 repères diagonaux, collés au bord — déjà
  utilisé par `DaemonCard`). Signalé par le PO capture à l'appui, corrigé en
  remplaçant `UnlockNodeCard`/`HiddenNodeCard` par `<Card hud brackets>` (états
  `acquired`/`available`/nœud caché révélé) ; `locked`/`sealed` restent des
  cartes pointillées custom sans repères, sur le modèle de `TeaserCard`.
  CSS des 4 repères custom supprimée. Validé PO (nouvelle capture).

### Note (hors bug, observation PO pour plus tard)

- Mise en page encore **linéaire verticalement**, ne remplit pas toute la
  largeur disponible. Le PO considère que c'est attendu à ce stade (contenu
  qui s'étoffera avec A4-A6) — **pas un défaut à corriger maintenant**, pas de
  ticket ouvert.

**Verdict : recette US-022 validée (8/8 critères + vérifs annexes).** Dexie
**v12** (`data` + `unlockedNodes`, 2 champs). Nouveau module pur
`game/unlockTree.ts` (**19/19**) découplé de `game/builder.ts` (composition
des multiplicateurs faite par `useBuilderStore`). 1ᵉʳ reveal caché (P6) livré :
absence totale d'indice puis irruption visuelle dédiée. `prefers-reduced-motion`
respecté (P9).

## US-021 — A2 : Daemons & automatisation

Recette du 20/07/2026. Critères de `us/archive/US-021-daemons-automatisation.md`.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**100/100** (dont `game/builder.ts` **18/18** ; 93 → 100). **Recette visuelle &
interactive navigateur (`npm run dev`) confirmée par le PO : tout OK.**

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | **≥ 3 types de daemons**, chacun nom/production/coût propres | catalogue `GENERATORS` + `BuilderView` + PO | validé | 20/07/2026 |
| C2 | Coûts/productions **indépendants par type** | fonctions par `def` + PO | validé | 20/07/2026 |
| C3 | Coût d'un type **monte à chaque achat** ; **refusé** si solde insuffisant | `generatorCost` (escalade) + bouton `disabled` ; `builder.test.ts` **18/18** + PO | validé | 20/07/2026 |
| C4 | **Déblocage progressif** : teaser « ??? » → débloqué en possédant ≥ 1 du précédent | `isUnlocked` chaîné + `TeaserCard` + PO | validé | 20/07/2026 |
| C5 | **Upgrade par type** ×2 la prod ; effet immédiat sur `cycles/s` | `buyUpgrade` + `upgradeMultiplier` + PO | validé | 20/07/2026 |
| C6 | **Débit total** = somme daemons × upgrades ; bandeau « Production réseau » exact | `productionPerSec(state)` + PO | validé | 20/07/2026 |
| C7 | **Migration v11** : SCRAPER-01 + cycles d'A1 **préservés** au rechargement | upgrade Dexie v11 + PO (sauvegarde A1 réelle) | validé | 20/07/2026 |
| C8 | Types possédés **+** niveaux d'upgrade **persistent** (F5) | `builderRepo.save` (maps) + PO | validé | 20/07/2026 |
| C9 | **HACK manuel** inchangé | `hack` + PO | validé | 20/07/2026 |
| C10 | Non-régression : hors-ligne OK, **to-do intact** | local-first + zéro modif `Contract`/`Faction`/`Player` + PO | validé | 20/07/2026 |
| — | i18n FR/EN (`generators`/`upgrade`/`teaser`/`total`), aucune chaîne en dur | clés FR+EN via `t()` | validé | 20/07/2026 |
| — | `DaemonCard` sur le composant DS `<Card>` (repères d'angle cohérents) | revue | validé | 20/07/2026 |

**Verdict : recette US-021 validée (10/10 critères).** Dexie **v11** (maps
`generators`/`upgrades`). Catalogue **data-driven** → ajouter un daemon = **une
entrée de données** (zéro migration), bénéfice de la généralisation anticipée en
US-020. Déblocage chaîné + teaser (frisson « il y en a d'autres »). `prefers-
reduced-motion` respecté (P9).

## US-020 — A1 : Noyau du builder (« Réseau »)

Recette du 20/07/2026. Critères d'acceptation de `us/archive/US-020-noyau-builder.md`.
**Vérifs automatiques** : `typecheck` + `lint` + `build`/PWA + tests Vitest
**93/93** (dont `game/builder.ts` **11/11** ; 82 → 93). **Recette visuelle &
interactive navigateur (`npm run dev`) confirmée par le PO : tout OK.**

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Onglet **« Réseau »** dans le rail → ouvre l'écran builder | route `/network` + `NavRail` + PO live | validé | 20/07/2026 |
| C2 | Premier lancement : `0` cycle, `0` daemon, `0/s` | seed `BuilderState` à 0 + `BuilderView` + PO | validé | 20/07/2026 |
| C3 | Clic **HACK** → +1 cycle par clic (retour juteux : anneau + `+1`) | `hack()` + `HackZone` + PO live | validé | 20/07/2026 |
| C4 | Acheter un daemon débite le coût ; **refusé** (cadenas) si solde insuffisant | `buyGenerator` (no-op) + bouton `disabled` ; `builder.test.ts` **11/11** + PO | validé | 20/07/2026 |
| C5 | Chaque daemon fait **monter le solde tout seul** (`+X/s`) | `useBuilderTick` + `tick()` + PO live | validé | 20/07/2026 |
| C6 | **Coût du prochain daemon monte** à chaque achat (15 → 18 → 20…) | `nextGeneratorCost` (escalade ×1,15, **testée**) + PO | validé | 20/07/2026 |
| C7 | **Recharger** conserve l'état (solde + daemons) | persistance `builderRepo` (masquage/`pagehide`/throttle) + PO F5 | validé | 20/07/2026 |
| C8 | Module **to-do inchangé** (aucune régression) | zéro modif entités `Contract`/`Faction`/`Player` + PO | validé | 20/07/2026 |
| C9 | **Hors-ligne (PWA)** : l'écran Réseau tourne sans réseau | local-first + précache PWA + PO (DevTools offline) | validé | 20/07/2026 |
| — | i18n FR/EN (`builder.*`, `nav.network*`), aucune chaîne en dur | clés FR+EN via `t()` | validé | 20/07/2026 |
| — | Archi évolutive : réglages en **objet config**, tokens sémantiques (généralisation → A2) | revue | validé | 20/07/2026 |
| — | Migration Dexie **v10** : nouvelle table `builderState` (singleton, seed à 0) | upgrade v10 | validé | 20/07/2026 |

### Ajustement issu de la recette (résolu dans l'US)

- **Repères d'angle de la carte daemon** : ma carte maison (repères violets décalés
  de 6 px sur un biseau) ne collait pas aux coins. Remplacée par le composant DS
  **`<Card hud brackets halo="violet">`** → repères blancs collés aux coins, comme
  les cartes de contrat. Validé PO.

> **Note de méthode** : C4/C6 couverts par les tests unitaires de `game/builder.ts`
> (escalade du coût, achat refusé si solde <) **et** vérifiés en live par le PO.
> C7 : persistance vérifiée à F5 par le PO (réserve assumée : les cycles hackés
> dans les ~4 s précédant un reload brutal peuvent ne pas être persistés — throttle
> volontaire ; l'achat, lui, persiste immédiatement).

**Verdict : recette US-020 validée (9/9 critères + vérifs annexes).** Dexie **v10**
(`BuilderState`). Noyau builder (`game/builder.ts` **11/11**), tick avec **pause
`visibilitychange`** (pas de rattrapage hors-ligne → A5/US-024). Fond immersif
hérité de `.nav-main` (#017) ; `prefers-reduced-motion` respecté (P9).

## US-014 — Échéances horodatées + rappels / notifications PWA

Recette du 19/07/2026. Vérifs automatiques (typecheck / lint / build / tests
Vitest **82/82**, dont `game/dueTime.ts` **15/15** — **non-régression au jour**) +
recette comportementale navigateur (`npm run dev`) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Ajouter une heure à l'échéance → persistée (F5), affichée ligne + détail (« JJ.MM · HH:MM ») | validé | 19/07/2026 |
| C2 | Retirer l'heure → « toute la journée » ; retirer la date → plus d'échéance | validé | 19/07/2026 |
| C3 | Horodaté à heure dépassée → EN RETARD ; au jour le jour même → reste du jour (non-régression) | validé | 19/07/2026 |
| C4 | Récurrent horodaté complété → prochaine occurrence conserve l'heure | validé | 19/07/2026 |
| C5 | Récurrent horodaté dont l'instant est atteint → réactivé au chargement dès cet instant | validé | 19/07/2026 |
| C6 | Mise à risque sur horodaté → perdue dès l'instant dépassé (pas seulement fin de journée) | validé | 19/07/2026 |
| C7 | Activer un rappel → permission demandée ; accordée → notif système + toast quand l'app tourne ; refusée → repli in-app honnête ; sans heure → contrôle inactif | validé | 19/07/2026 |
| C8 | Rouvrir après échéances passées hors-ligne → bandeau de rattrapage + notif agrégée | validé | 19/07/2026 |
| C9 | Rappel/notification = signal seul (aucune récompense, aucun contrat modifié) | validé | 19/07/2026 |

**Verdict : recette US-014 validée (9/9 critères).** Dexie **v9** (`dueHasTime` +
`reminderLead` + `reminderNotifiedFor`). Cœur temporel unifié `game/dueTime.ts`
(`deadlineInstant` **DST-safe**). Périmètre B (best-effort local). Revue de code :
4 points corrigés avant merge (bug DST, garde anti-boucle, notif de rattrapage
agrégée, cohérence d'affichage de l'heure). **Correctif visuel hors périmètre
inclus** (validé PO) : alignement vertical du rond de difficulté sur la ligne de
contrat (`line-height: 1`).

## US-013 — Contrats à risque (mise de crédits)

Recette du 19/07/2026. Vérifs automatiques (typecheck / lint / build / tests
Vitest **65/65**, dont `game/risk.ts` **14/14**) + recette comportementale
navigateur (`npm run dev`) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Poser une mise valide (one-shot à échéance) → débit immédiat du solde, état « en jeu » + puce ambre | validé | 19/07/2026 |
| C2 | Mise > solde disponible → refus (message), bouton *Miser* désactivé, aucun débit | validé | 19/07/2026 |
| C3 | Contrat sans échéance / récurrent / permanent → bloc inéligible, pas de saisie | validé | 19/07/2026 |
| C4 | Complétion avant échéance → retour = mise × multiplicateur difficulté, en plus de la récompense ; toast « mise réussie » ; puce menthe | validé | 19/07/2026 |
| C5 | Échéance dépassée + rechargement → mise perdue (aucun re-crédit), toast « mise perdue » **une seule fois**, puce rouge | validé | 19/07/2026 |
| C6 | Modifier la mise (remboursement + re-débit) ; retirer → re-crédit intégral, puce disparaît | validé | 19/07/2026 |
| C7 | Solde jamais négatif à aucune étape (pose / modif / issue), plancher 0 | validé | 19/07/2026 |
| C8 | Mise et issue (en jeu / remportée / perdue + montant) lisibles sur la ligne et dans le détail | validé | 19/07/2026 |

Garde-fous vérifiés en bonus : retirer l'échéance d'un contrat en jeu **rembourse**
la mise ; supprimer un contrat en jeu **rembourse** la mise.

**Verdict : recette US-013 validée (8/8 critères).** Dexie **v8**
(`Contract.stake` + `stakeOutcome`). Décisions gameplay : bonus indexé difficulté
(`1,5/2/2,5/3/4`), one-shot uniquement, débit immédiat, perte constatée au `load()`,
plafond = solde disponible.

## US-007 — Factions (catégories) & filtrage

Recette du 18/07/2026. Vérifs automatiques (typecheck / lint / build / tests
Vitest 30/30, dont `factionLabel` 3/3) + recette visuelle & comportementale
navigateur (`npm run dev`, port 5180) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Affecter une faction dans le détail → persistée après F5 | validé | 18/07/2026 |
| C2 | Repasser à « Aucune » → persisté (F5), plus de badge sur la ligne | validé | 18/07/2026 |
| C3 | Ligne avec faction → badge (point coloré + nom) en tête de méta ; sans faction → aucun badge | validé | 18/07/2026 |
| C4 | Filtre par faction → seuls les contrats de cette faction affichés | validé | 18/07/2026 |
| C5 | Filtre « Toutes » (défaut) → liste complète restaurée | validé | 18/07/2026 |
| C6 | Filtre « Sans faction » → seuls les contrats non rattachés | validé | 18/07/2026 |
| C7 | Filtrer/dé-filtrer → aucun contrat modifié/supprimé, tri (priorité/récence) conservé | validé | 18/07/2026 |
| C8 | Bascule FR/EN → factions, « Aucune/Toutes/Sans faction » traduits ; aucune chaîne en dur | validé | 18/07/2026 |
| C9 | Création rapide au clavier → toujours ~2 s ; faction réglée après, dans le détail | validé | 18/07/2026 |

**Verdict : recette US-007 validée (9/9 critères).** Aucune migration Dexie
(socle faction déjà en place depuis v2). Amélioration renvoyée au backlog (MVP 2) :
état vide dédié « aucun contrat pour ce filtre ».

## US-001 — Initialisation technique + design system

Recette du 17/07/2026. Vérifs automatiques (dev/build/tsc/lint/PWA) + recette
visuelle navigateur confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | `npm run dev` → l'app démarre et affiche la page de démo | validé | 17/07/2026 |
| C2 | Thème du DS appliqué (néons, polices Chakra/Space/JetBrains, dark par défaut) + bascule thème clair | validé | 17/07/2026 |
| C3 | Composants DS en React/TS au rendu conforme (verre translucide, halo néon, focus teal) | validé | 17/07/2026 |
| C4 | Interaction Zustand → la valeur d'état se met à jour à l'écran | validé | 17/07/2026 |
| C5 | Valeur écrite dans Dexie → présente après rechargement (F5) | validé | 17/07/2026 |
| C6 | PWA installable (manifest valide + service worker) et consultable hors-ligne | validé | 17/07/2026 |
| C7 | `npm run build` réussit | validé | 17/07/2026 |
| C8 | TypeScript strict + lint passent sans erreur | validé | 17/07/2026 |

### Ajustements visuels issus de la recette (résolus dans l'US)

- **Cartes en verre trop opaques** → fill rendu très translucide (`0.28 → 0.10`),
  blur renforcé (`24px`), halo repensé en **liseré néon net** (le glow diffus
  coloriait l'intérieur), sheen + scanlines internes. Validé PO.
- **Badges & chips (StatChip)** → ajout d'un **halo néon fort** coloré selon le
  ton/kind. Validé PO. Tags `#` de catégorie laissés sobres (néon = signal).
- Ajustements portés dans le thème live (`src/theme/`) **et** synchronisés dans
  la référence `design-system/`.

**Verdict : recette US-001 validée (8/8 critères).**

## US-002 — Modèle de données & persistance locale (Dexie)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette
comportementale en console navigateur (repositories exposés en dev), confirmée
par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Base `netrunner-tasks` expose les tables `contracts` / `factions` / `player` (DevTools → IndexedDB) | validé | 17/07/2026 |
| C2 | Contrat créé via la couche d'accès → toujours présent après F5, champs inchangés | validé | 17/07/2026 |
| C3 | Modèle Contrat complet (id, title, factionId, difficulty, priority, dueDate, status, createdAt, completedAt) | validé | 17/07/2026 |
| C4 | Factions par défaut semées (5), aucun re-seed ni doublon après relances | validé | 17/07/2026 |
| C5 | Joueur singleton créé (`id:'me'`, xp 0 / level 1 / credits 0), lisible & modifiable | validé | 17/07/2026 |
| C6 | Couche d'accès typée (CRUD contrats/factions + get/update player) ; aucun Dexie hors de `src/db/` | validé | 17/07/2026 |
| C7 | Schéma versionné (`db.version(2)`), extensible sans perte | validé | 17/07/2026 |
| C8 | Pas de régression : `build` + `lint` OK, l'app démarre (démo fonctionnelle) | validé | 17/07/2026 |

**Verdict : recette US-002 validée (8/8 critères).**

## US-003 — Création rapide de contrat (règle des 2 s)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(interaction clavier/souris + persistance) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Barre de saisie visible et **focalisée au chargement** (saisie directe au clavier) | validé | 17/07/2026 |
| C2 | Titre + Entrée → contrat `open` créé et **persistant** (présent après F5 via `contractsRepo`/IndexedDB) | validé | 17/07/2026 |
| C3 | Après validation, champ **vidé + focus conservé** → 2ᵉ création au clavier sans souris | validé | 17/07/2026 |
| C4 | Titre vide/espaces → **flash rouge**, aucun contrat créé (compteur inchangé) | validé | 17/07/2026 |
| C5 | Création avec **valeurs par défaut** (difficulté trivial, sans faction/échéance) ; bouton « ⏎ AJOUTER » opérationnel | validé | 17/07/2026 |
| C6 | **Feedback immédiat** : compteur « CRÉÉS · SESSION » +1 (pop) + toast « CONTRAT CRÉÉ » ; état vide → buffer | validé | 17/07/2026 |
| C7 | `npm run build` réussit | validé | 17/07/2026 |
| C8 | TypeScript strict + lint passent sans erreur | validé | 17/07/2026 |

**Verdict : recette US-003 validée (8/8 critères).**

## Chantier — Internationalisation FR/EN

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(bascule FR↔EN, persistance, pluriels) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Sélecteur FR/EN visible ; le changer bascule **toute** l'UI Contrats à chaud | validé | 17/07/2026 |
| C2 | Choix de langue **persistant** après F5 | validé | 17/07/2026 |
| C3 | **Pluriels** corrects (1 CONTRAT/2 CONTRATS ↔ 1 CONTRACT/2 CONTRACTS) | validé | 17/07/2026 |
| C4 | **Aucune chaîne d'UI en dur** dans ContractsView / QuickAddContract | validé | 17/07/2026 |
| C5 | Catalogues **FR et EN complets** pour l'existant (EN in-world, pas mot-à-mot) | validé | 17/07/2026 |
| C6 | Langue initiale détectée (navigateur) sinon **repli FR** | validé | 17/07/2026 |
| C7 | `typecheck` + `lint` + `build` passent | validé | 17/07/2026 |

**Verdict : recette chantier i18n validée (7/7 critères).**

## US-004 — Liste des contrats & complétion

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
confirmée par le PO (dont pluriel des compteurs et animations).

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Liste des contrats (ouverts d'abord, récent en haut) + en-tête ACTIFS/TOTAL + barre de progression ; persistante après F5 | validé | 17/07/2026 |
| C2 | Réactivité : créer via la barre ajoute le contrat immédiatement à la liste | validé | 17/07/2026 |
| C3 | Terminer → `done` (barré + badge, descend en bas) ; ré-ouvrir → remonte ; persiste | validé | 17/07/2026 |
| C4 | Éditer le titre en place (Entrée = enregistrer, Échap = annuler) ; persiste | validé | 17/07/2026 |
| C5 | Supprimer → popup de confirmation HUD ; annuler ne fait rien, confirmer retire (liste + base) + toast | validé | 17/07/2026 |
| C6 | État vide « GRID VIDE » quand aucun contrat | validé | 17/07/2026 |
| C7 | i18n FR/EN sur tout l'écran (dont pluriel « ACTIF(S) / TERMINÉ(S) ») | validé | 17/07/2026 |
| C8 | Réordonnancement animé (Framer Motion : déplacement / ajout / suppression), respecte reduced-motion | validé | 17/07/2026 |
| C9 | `build` + `lint` + typecheck passent | validé | 17/07/2026 |

**Verdict : recette US-004 validée (9/9 critères).**

## US-008 — Difficulté & calcul de récompense (XP + crédits)

Recette du 17/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
(sélecteur, octroi, persistance, anti-farm, migration, i18n) confirmée par le PO.

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| C1 | Sélecteur de difficulté (5 niveaux) ; création sans choix → contrat `trivial` ; règle des 2 s préservée | validé | 17/07/2026 |
| C2 | Édition de la difficulté d'un contrat → nouvelle valeur persistée après F5 | validé | 17/07/2026 |
| C3 | Contrat ouvert affiche sa récompense potentielle (`+X XP · +Y ¢`) conforme au barème | validé | 17/07/2026 |
| C4 | Terminer un `medium` → `player.xp` +25 & `player.credits` +20, persistés après F5 | validé | 17/07/2026 |
| C5 | Retour de gain : compteur « GAINS · SESSION » +gain **+** toast « HACK RÉUSSI » **+** flash mint transitoire | validé | 17/07/2026 |
| C6 | Cumul : deux `easy` d'affilée → +20 XP / +20 ¢ au total | validé | 17/07/2026 |
| C7 | Anti-farm : décocher/re-terminer n'octroie plus rien (marqueur `rewardGranted`) | validé | 17/07/2026 |
| C8 | `player.level` inchangé par les gains (montée de niveau = US-009) | validé | 17/07/2026 |
| C9 | i18n FR/EN : difficultés, « GAINS · SESSION », récompenses, toast ; aucune chaîne en dur | validé | 17/07/2026 |

### Ajustement issu de la recette (résolu dans l'US)

- **Halos figés sur la ligne de contrat** : le halo d'édition (cyan) et le flash
  « hack réussi » (mint) restaient affichés indéfiniment. Cause : `motion.div`
  (Framer Motion) applique les styles de façon impérative et **ne retire pas** une
  clé `boxShadow` disparue du style inline entre deux rendus. Correctif : halo
  déplacé du style inline vers des **classes CSS** (`ctr-row--editing` /
  `ctr-row--flashing`), déclarées après `:hover` ; le liseré au survol est
  préservé au repos. Validé PO.

**Verdict : recette US-008 validée (9/9 critères).**

## US-005 — Attributs de contrat (priorité, échéance, sous-tâches)

Recette du 18/07/2026. Vérifs automatiques (tsc/lint/build) + recette navigateur
confirmée par le PO (édition, tri, alertes d'échéance, sous-tâches animées, i18n).

| # | Critère (action → résultat attendu) | Statut | Date |
|---|-------------------------------------|--------|------|
| E1 | Ligne = **un seul bouton « modifier »** + corbeille ; le crayon ouvre la modale de détail | validé | 18/07/2026 |
| E2 | Titre éditable dans la modale (persiste F5) ; saisie vide → dernier titre non vide conservé | validé | 18/07/2026 |
| E3 | Difficulté éditable dans la modale (pastilles) → récompense potentielle mise à jour ; persiste | validé | 18/07/2026 |
| C1 | Priorité (basse/normale/haute) réglée dans la modale, persistée après F5 | validé | 18/07/2026 |
| C2 | Priorité visible sur la ligne via **barres de signal** (1/2/3, haute = cyan + glow) | validé | 18/07/2026 |
| C3 | Tri : ouverts par priorité (haute→basse) puis récence ; terminés en bas | validé | 18/07/2026 |
| C4 | Échéance définie / modifiée / effacée dans la modale ; chaque état persiste (F5) | validé | 18/07/2026 |
| C5 | Puce d'échéance : rouge « EN RETARD » (dépassée), amber « BIENTÔT » (≤ 1 j), neutre sinon | validé | 18/07/2026 |
| C6 | Sous-tâches : ajout (Entrée), coche/décoche, suppression ; persistées après F5 | validé | 18/07/2026 |
| C7 | Progression « n/m » sur la ligne (icône check-list) ; passe au mint quand tout est coché | validé | 18/07/2026 |
| C8 | Cocher une sous-tâche n'octroie aucun XP/crédit ; ne termine pas le contrat | validé | 18/07/2026 |
| C9 | Création rapide inchangée (geste de 2 s) | validé | 18/07/2026 |
| C10 | i18n FR/EN complet (priorité, échéance, détail, sous-tâches) ; aucune chaîne en dur | validé | 18/07/2026 |
| C11 | Cocher une sous-tâche la fait glisser en bas (animé Framer Motion) ; décocher la remonte | validé | 18/07/2026 |
| C12 | Non-régression US-008 : récompense à la complétion (compteur + toast + flash) + anti-farm | validé | 18/07/2026 |
| — | Migration Dexie v4 : contrats existants ouverts sans perte (`subtasks: []`) | validé | 18/07/2026 |

### Ajustements issus de la recette (résolus dans l'US)

- **Deux boutons d'édition trop lourds** → **surface d'édition unique** : un seul
  bouton « modifier » ouvre la modale qui édite tout (titre, difficulté, priorité,
  échéance, sous-tâches) ; édition inline d'US-008 supprimée. Validé PO.
- **Réordonnancement des sous-tâches cochées** (glissement en bas) ajouté, puis
  **animé** (Framer Motion, `layout` + `AnimatePresence`). Validé PO.

**Verdict : recette US-005 validée (15/15 points).**

## US-009 — Progression joueur (XP, niveau netrunner, solde crédits)

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires de la courbe
(`src/game/progression.test.ts`, **10/10**), `typecheck`, `lint`, `build` — tous
OK. **Recette visuelle navigateur (fidélité maquette 5a/5b + F5) confirmée par le
PO : 100 % conforme à l'attendu.** Colonne « Méthode » = comment le critère a été
vérifié.

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Base vierge → indicateur niveau **1**, **0 %** (`0/100`), **0 ¢** | test `progressionFor(0)` + code indicateur | validé | 18/07/2026 |
| C2 | Terminer un `medium` (niv.1) → reste niv.1, **25/100** (25 %), solde **+20 ¢** | test `progressionFor(25)` + `rewardFor(medium)` + `grantReward` | validé | 18/07/2026 |
| C3 | Joueur à 75 XP + `medium` (→100) → niveau **2**, **0/200** | test `progressionFor(100)` + `levelForXp(75→100)` | validé | 18/07/2026 |
| C4 | Joueur à 250 XP (niv.2) + `legendary` (→350) → niveau **3**, **50/300** | test `progressionFor(350)` + `levelForXp(250→350)` | validé | 18/07/2026 |
| C5 | Palier franchi → retour visuel « NIVEAU X ATTEINT » ; **absent** si aucun palier | traçage + recette navigateur PO | validé | 18/07/2026 |
| C6 | Rouvrir + re-terminer un contrat déjà payé → **aucun** XP, **aucune** montée, **aucun** toast | traçage : `complete()` → `null` (rewardGranted) → `grantReward` non appelé | validé | 18/07/2026 |
| C7 | Après montée, **F5** → niveau, avancement et solde conservés | traçage `playerRepo.update` + recette navigateur PO | validé | 18/07/2026 |
| C8 | Indicateur permanent (niveau + barre + solde) visible hors modale, **maj immédiate** sans F5 | traçage abonnement store + recette navigateur PO | validé | 18/07/2026 |
| C9 | Fidélité visuelle maquette 5a (bloc biseauté cyan) & 5b (toast palier mint) | recette navigateur PO | validé | 18/07/2026 |
| C10 | Non-régression US-008 : récompense à la complétion (gains session + toast « HACK RÉUSSI » + flash) + anti-farm | traçage + recette navigateur PO | validé | 18/07/2026 |
| C11 | Périmètre : compteur « ACTIFS · TOTAL » retiré de l'en-tête (→ HUD US-010) | code en-tête | validé | 18/07/2026 |
| C12 | `typecheck` + `lint` + `build` + tests unitaires passent | exécution | validé | 18/07/2026 |

**Verdict : recette US-009 validée (12/12 critères).**

## US-010 — Tableau de bord / HUD

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires
`todayContracts` (`src/features/dashboard/todayContracts.test.ts`, **5/5** ;
total suite **15/15**), `typecheck`, `lint`, `build` OK ; **smoke test dev**
(Vite sert `/` et le lien profond `/contracts`, tous les modules se transforment
sans erreur). **Recette visuelle/interactive navigateur confirmée par le PO :
100 % conforme à l'attendu.**

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Navigation : basculer Tableau de bord ↔ Contrats ; vue active indiquée | `NavRail`/`NavLink` + recette navigateur PO | validé | 18/07/2026 |
| C2 | Au démarrage, la vue affichée est le **Tableau de bord** (`/`) | routeur (`index` → `DashboardView`) + PO | validé | 18/07/2026 |
| C3 | Barre de statut permanente (niveau + solde) sur les 2 vues, maj immédiate à la complétion | `StatusBar` + `ProgressionIndicator` + `useFeedbackStore` + PO | validé | 18/07/2026 |
| C4 | Contrats du jour : ouverts, échéance aujourd'hui/dépassée, **en retard d'abord** | test `todayContracts` (**5/5**) + PO | validé | 18/07/2026 |
| C5 | HUD vide → message dédié (« GRID CALME »), pas de liste vide | `DashboardView` + PO | validé | 18/07/2026 |
| C6 | Depuis une ligne du HUD, ouvrir le détail (`ContractDetail`) | `TodayContractRow` → `ContractDetailConnected` + PO | validé | 18/07/2026 |
| C7 | Terminer un contrat du jour depuis le HUD → récompense + progression, il quitte la liste | `useCompleteContract` + `todayContracts` + PO | validé | 18/07/2026 |
| C8 | Écran Contrats : compteur **ACTIFS · TOTAL** + barre réaffichés | `ContractsView` (en-tête) + PO | validé | 18/07/2026 |
| C9 | i18n FR/EN sur nav + HUD ; aucune chaîne en dur | clés `nav.*` / `dashboard.*` FR+EN + PO | validé | 18/07/2026 |
| C10 | Non-régression écran Contrats (création 2 s, liste, complétion, détail, toasts, palier) | refactor via hook/store partagés + PO | validé | 18/07/2026 |
| C11 | PWA : lien profond `/contracts` servi (hors-ligne) | `navigateFallback` + smoke test + PO | validé | 18/07/2026 |
| C12 | `typecheck` + `lint` + `test` (15/15) + `build` | exécution | validé | 18/07/2026 |
| — | Responsive : rail latéral (desktop) ↔ barre inférieure (mobile PWA) | media query + PO | validé | 18/07/2026 |

**Verdict : recette US-010 validée (12/12 critères + responsive).**

## US-006 — Récurrence des contrats

Recette du 18/07/2026. **Vérifs automatiques** : tests unitaires
`recurrence.ts` (`nextOccurrence` + `firstOccurrence`, **12/12** ; total suite
**27/27**), `typecheck`, `lint`, `build` OK. **Recette navigateur confirmée par
le PO : 100 %** (après boucle d'ajustements ci-dessous ; pas de maquette).

| # | Critère (action → résultat attendu) | Méthode | Statut | Date |
|---|-------------------------------------|---------|--------|------|
| C1 | Définir récurrence **intervalle** (N + unité), persistée F5 | `RecurrenceControl` + store/Dexie v5 + PO | validé | 18/07/2026 |
| C2 | Définir récurrence **jour fixe** (ex. dimanche), persistée F5 | `RecurrenceControl` (mode weekday) + PO | validé | 18/07/2026 |
| C3 | Retirer la récurrence (« aucune ») → one-shot ; persisté | `setRecurrence(null)` + PO | validé | 18/07/2026 |
| C4 | Puce « ⟳ … » visible sur la ligne (liste & HUD) | `RecurrenceChip` + PO | validé | 18/07/2026 |
| C5 | Compléter un récurrent → **VALIDÉ** (case cochée, « ⟳ revient le … ») + XP/crédits | `complete()` modèle validé + PO | validé | 18/07/2026 |
| C6 | Avance par intervalle (+N j / +N sem. / +N mois, clamp) | test `nextOccurrence` (**12/12**) | validé | 18/07/2026 |
| C7 | Avance par jour fixe (prochaine occurrence de ce jour) | test `nextOccurrence` + PO | validé | 18/07/2026 |
| C8 | Jamais d'échéance passée (roll-forward si en retard) | test `nextOccurrence` | validé | 18/07/2026 |
| C9 | Récompense **à chaque occurrence** (réactivation → repaie) | `load()` réactivation + `complete()` + PO | validé | 18/07/2026 |
| C10 | Anti-farm : récurrent validé **verrouillé** (case inactive + info-bulle) jusqu'à réactivation | `complete()` (done) + `toggle` garde + `Checkbox disabled/title` + PO | validé | 18/07/2026 |
| C11 | Synergie HUD : récurrent dû du jour y figure, le quitte après complétion | `todayContracts` + PO | validé | 18/07/2026 |
| C12 | Non-récurrent inchangé (une complétion, reste `done`) | branche one-shot de `complete()` + PO | validé | 18/07/2026 |
| C13 | i18n FR/EN (unités, jours, puce, info-bulle) ; aucune chaîne en dur | clés `contracts.recurrence.*` FR+EN + PO | validé | 18/07/2026 |
| — | Échéance auto-posée à la définition, recalculée au changement de récurrence | `firstOccurrence` + `setRecurrence` + PO | validé | 18/07/2026 |
| — | Réactivation « au chargement » (validé → à faire quand l'échéance est atteinte) | `load()` + PO (test échéance→aujourd'hui + F5) | validé | 18/07/2026 |
| — | Migration Dexie v5 : contrats existants ouverts (`recurrence: null`) | upgrade v5 + PO | validé | 18/07/2026 |
| C14 | `typecheck` + `lint` + `test` (27/27) + `build` | exécution | validé | 18/07/2026 |

### Évolution du modèle en cours de recette (validée PO)

- **Complétion d'un récurrent** : au lieu de « redevient *open* immédiatement »
  (impression de non-validé + case grise ambiguë), le contrat passe **VALIDÉ**
  (case cochée, « ⟳ revient le JJ.MM ») et **reste verrouillé** jusqu'à sa
  prochaine échéance, où il est **réactivé au chargement** de l'app. Meilleur
  ressenti + anti-farm plus clair.
- **Échéance auto** : poser (ou changer) une récurrence pose/recalcule la
  première échéance (`firstOccurrence`) — plus de résidu de l'ancien choix.
- **Report backlog** : échéances horodatées (heure/minute) + rappels/notifications
  PWA — hors périmètre, tracé au backlog MVP 2.

**Verdict : recette US-006 validée (13/13 critères + ajustements).**

## US-011 — Contrats permanents (habitudes) & streaks

Recette du 19/07/2026. Critères d'acceptation de `us/US-011-permanents-streaks.md`.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Rendre un contrat récurrent → puce **🔥 0** sur la ligne ; un one-shot n'affiche aucune série | `StreakChip` (gate `recurrence != null`) + PO live | validé | 19/07/2026 |
| C2 | Compléter un récurrent **à temps** → série N→**N+1**, record MAJ si dépassé | `applyCompletion(onTime)` + `complete()` + PO live | validé | 19/07/2026 |
| C3 | Rouvrir/re-compléter dans la **même période** → série **inchangée** (pas de double) | verrou « récurrent validé » (`toggle` garde + `complete()` 1×/cycle) — anti-double par construction | validé | 19/07/2026 |
| C4 | Échéance manquée sans complétion + **reload** → réactivation (US-006) **et** série **à 0** | `resetIfMissed` (**test unit.**) + câblage `load()` (récurrent `open` échu) — *dépend d'un changement de jour, non observé en live* | validé | 19/07/2026 |
| C5 | Le **record** ne diminue **jamais**, même après remise à zéro | `Math.max` dans `applyCompletion` + `resetIfMissed` préserve `bestStreak` (**tests unit.**) | validé | 19/07/2026 |
| C6 | Série & record **persistent** (Dexie) après rechargement | champs inclus dans les patchs `contractsRepo.update` (`complete`/`load`) + migration v6 ; relus au `load()` | validé | 19/07/2026 |
| C7 | Détail d'un récurrent affiche **série + record** ; un one-shot ne les affiche pas | bloc « Série / Record » (gate `recurrence != null`) dans `ContractDetail` + PO live | validé | 19/07/2026 |
| C8 | `game/streak.ts` couvert par tests (à temps/retard, record, bornes d'échéance, reset) | `streak.test.ts` (**11/11**) | validé | 19/07/2026 |
| C9 | `typecheck` + `lint` + `build` + `test` (**41/41**) | exécution | validé | 19/07/2026 |
| — | i18n FR/EN (`contracts.streak.*`), aucune chaîne en dur | clés FR+EN + `StreakChip`/détail via `t()` | validé | 19/07/2026 |
| — | Migration Dexie **v6** : contrats existants rétro-remplis `currentStreak/bestStreak = 0` | upgrade v6 (backfill) | validé | 19/07/2026 |
| — | Récompenses **inchangées** (H5) — aucune touche XP/crédits | hors périmètre `complete()` one-shot / rewards | validé | 19/07/2026 |

> **Note de méthode** : C1/C2/C7 vérifiés en live par le PO (19/07/2026). C4 et
> la préservation du record après reset (C5) **dépendent d'un changement de jour**
> et ne sont pas observés « à la volée » : ils sont couverts par les tests
> unitaires de `game/streak.ts` (`resetIfMissed`, `applyCompletion`) et la revue
> du câblage `load()`. C3 est garanti **par construction** (le récurrent validé
> est verrouillé jusqu'à réactivation, US-006).

**Verdict : recette US-011 validée (7/7 critères + vérifs annexes).**

## US-012 — Réputation par faction (paliers, gain/perte)

Recette du 19/07/2026. Critères d'acceptation de `us/US-012-reputation-factions.md`.

| ID | Critère (action → résultat) | Vérif | Statut | Date |
|----|------------------------------|-------|--------|------|
| C1 | Compléter un contrat **rattaché à une faction** → réputation **+barème** (selon difficulté) | `useCompleteContract` + `grantReputation` + PO live | validé | 19/07/2026 |
| C2 | Compléter un contrat **sans faction** → **aucune** réputation modifiée | garde `if (!contract.factionId) return` + PO live | validé | 19/07/2026 |
| C3 | Récurrent rattaché complété à temps → **+montant à chaque occurrence** | même chemin de gain (réputation indépendante de l'anti-farm XP) + PO | validé | 19/07/2026 |
| C4 | Casser le streak d'un récurrent rattaché (période manquée + **reload**) → réputation **−malus** | pénalités agrégées dans `load()` + `applyReputationDelta` (**tests**) — *dépend d'un changement de jour, non observé en live* | validé | 19/07/2026 |
| C5 | Franchir un **seuil** → **rang** affiché change (+ toast de passage de rang) | `rankForReputation` avant/après + `triggerRankUp` + panneau ; **tests** des seuils | validé | 19/07/2026 |
| C6 | La réputation ne descend **jamais sous 0** | `applyReputationDelta = max(0, …)` (**test unit.**) | validé | 19/07/2026 |
| C7 | Réputation **et** palier **persistent** (Dexie) après reload | `factionsRepo.update` (gain + pénalités) + migration v7 ; relus au `load()` | validé | 19/07/2026 |
| C8 | Réputation + palier **visibles par faction** (panneau) | `ReputationPanel` (HudPanel) sur le tableau de bord + PO live | validé | 19/07/2026 |
| C9 | i18n **FR/EN** (`reputation.*` : rangs, libellés, toasts) ; aucune chaîne en dur | clés FR+EN + composants via `t()` | validé | 19/07/2026 |
| C10 | `game/reputation.ts` couvert (barème, seuils, progression, plancher) | `reputation.test.ts` (**10/10**) | validé | 19/07/2026 |
| C11 | `typecheck` + `lint` + `build` + `test` (**51/51**) | exécution | validé | 19/07/2026 |
| — | Séquencement `AppShell` : contrats **avant** factions (pénalités écrites avant lecture) | `loadContracts().then(loadFactions)` | validé | 19/07/2026 |
| — | Migration Dexie **v7** : factions existantes rétro-remplies `reputation = 0` | upgrade v7 (backfill) | validé | 19/07/2026 |
| — | Rétroactions maquette 8d : **toast de gain** teinté faction + **toast de passage de rang** | `ReputationGainToast` / `RankUpToast` (hébergés `AppShell`) + PO | validé | 19/07/2026 |

### Ajustement en cours de recette (validé PO)

- **Barres de progression du panneau** : passées d'une couleur pleine à un
  **dégradé de teinte** (couleur voisine → couleur de la faction, façon barre du
  design system), pour les rangs **en cours** ; l'état **LÉGENDE** reste plein +
  hachuré. Appliqué **localement** au panneau réputation (le composant partagé
  `ProgressBar` n'est **pas** modifié — hors périmètre US-012).

> **Note de méthode** : C1/C2/C3/C5/C8 vérifiés en live par le PO (19/07/2026).
> C4 (perte au streak cassé) et le franchissement effectif de seuil (C5) dépendent
> d'un changement de jour / de plusieurs complétions : couverts par les tests
> unitaires de `game/reputation.ts` (`applyReputationDelta`, `rankForReputation`)
> et la revue du câblage `load()` / `useCompleteContract`.

**Verdict : recette US-012 validée (9/9 critères + vérifs annexes).**
