# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

**US-034 — Caisses & rituel d'ouverture** (Phase A3, priorité moyenne, voie
**aléatoire** de l'acquisition hybride). Branche
`feature/US-034-caisses-ouverture` créée depuis `develop`. **Cadrage fonctionnel
validé PO le 23/07/2026** (H1→H6 + invariant, 8 critères ; reco H2/H5 adoptées).
**Cadrage technique validé PO** (3 décisions : RNG injecté · mapping
source→qualité · pool épuisé→crédits). **Maquette `crates` reçue + analysée +
validée PO** (violet→frost, réutilise rampe rareté/`CosmeticCard`, `CRATE_ODDS`
adoptées, pool exclusif = contenu à créer). **Plan d'implémentation 18 étapes
posé** (`us/US-034-caisses-ouverture.md` §4). **STOP, en attente de validation PO
du plan.**

Constat fondateur : le catalogue actuel (14 cosmétiques) est **intégralement
garanti en déterministe** (4 de départ + 10 récompenses de jalons US-033) → les
caisses n'ont de valeur qu'avec du **contenu exclusif**. Cadrage fonctionnel = 6
hypothèses (H1 pool exclusif aux caisses · H2 sources non farmables [renaissance +
jalons] · H3 3 qualités + tables de probas affichées · H4 rituel d'ouverture · H5
doublons v1 / pity reporté US-035 · H6 inventaire de caisses non ouvertes) + 1
invariant (cosmétique = pur statut, survie à la renaissance).

Cadrage technique **validé PO** (3 décisions : RNG injecté · mapping
source→qualité · pool épuisé→crédits). Maquette `crates` **validée PO**. Plan 18
étapes **validé PO**.

**Implémentation US-034 terminée.** Livré : module pur **`game/crates.ts`**
(qualités standard/secured/blackice, `CRATE_ODDS` sommant à 100, **`openCrate`
RNG injecté** — 1ʳᵉ introduction de hasard dans `game/*`, anti-doublon,
consolation crédits si pool épuisé ; **testé 12/12**) ; catalogue `cosmetics.ts`
étendu de **10 cosmétiques `source: 'crate'`** (≥ 2 par rareté) + helpers
`crateCosmetics`/`isCrateExclusive` (**+5 tests**) ; thème exclusif
**`crate-obsidian`** (`themes.css` + aperçu) ; tokens **`crate.css`** (identité
violet→givre) + `crateStyle.ts` ; **`CosmeticsState.crates` + migration Dexie
v20** (rétro-remplissage zéro, survit à la renaissance par construction) + seed ;
**`useCosmeticsStore`** `grantCrate`/`openCrate` ; file `crateEarned` +
**`CrateEarnedToast`** (AppShell, haut-gauche) ; câblage du gain dans
**`useBuilderStore`** (renaissance→secured · jalon→standard · jalon caché→
blackice, silencieux au `load()`) ; composants DS **`CrateIcon`**,
**`CratesPanel`/`CrateSlot`**, **`CrateOddsTable`**, **`CrateOpeningModal`**
(rituel 3 phases + reduced-motion + Équiper/Continuer + consolation) ; extension
**`CosmeticCard`** (« Trouvé en caisse ») ; assemblage `WardrobeView` ; 9 icônes
lucide ; i18n FR/EN. **Vérifs vertes : typecheck + lint + build/PWA + tests
269/269 (+18).** Vérif visuelle navigateur à faire en recette (tirage,
reduced-motion, survie renaissance, pool épuisé → crédits).

**Recette 8/8 validée PO le 23/07/2026 à 100 %** (aucun bug ; vérif live via
scripts console IndexedDB — SURCADENCE injectée, recharge de caisses, pool
épuisé → crédits confirmé). Point non bloquant relevé : le libellé « COLLECTION
COMPLÈTE » du rituel désigne le pool caisses (mécanique confirmée correcte,
wording laissé tel quel). **Décision #039.** US **clôturée** — commit + merge sur
`develop` + push. Reste en Phase A3 : **US-035 — Pity + fragments** (dernière
tranche). Prochaine US via `nouvelle-us`.

_US-033 — Achievements-récompenses + aperçu de collection **clôturée** le
23/07/2026 (Phase A3, voie déterministe ; cycle complet — cadrages validés PO,
maquette `cosmectic-progression` analysée, plan 16 étapes validé PO,
implémentation faite, **recette 8/8 PO à 100 %**, décision **#038**, commit +
merge sur `develop` + push — `2da0233`/`6f0ffaf`). Reste en Phase A3 après
US-034 : **US-035 — Pity + fragments**._

---

_Historique de la tranche US-033._ Branche
`feature/US-033-achievements-collection` créée depuis `develop`. **Cadrage
fonctionnel**
(`us/US-033-achievements-collection.md`) — bascule le socle d'US-031 de « tout
débloqué » à « une partie se gagne » ; des accomplissements (dont cachés)
débloquent des cosmétiques ciblés garantis + aperçu de collection par rareté. 5
hypothèses (H1 étendre les jalons US-028 · H2 départ vs à-gagner · H3
re-verrouillage de la save existante · H4 affichage liste + aperçu Garde-robe ·
H5 feedback de déblocage) + 8 critères. **Cadrage fonctionnel validé PO le
23/07/2026** (H1–H4). **Étape en cours : cadrage technique** — extension des
jalons (`MilestoneDef.reward`, mapping 10 cosmétiques), `STARTER_COSMETICS` +
**migration Dexie v19** (re-verrouille `owned` = départ ∪ récompenses atteintes,
réconcilie `equipped`), `grant()` sur `useCosmeticsStore`, file `cosmeticUnlocks`
+ `CosmeticUnlockToast`, état verrouillé de `CosmeticCard`, aperçu de collection
(`game/collection.ts` pur + `CollectionPreview`), extension `MilestonesPanel`. 3
décisions techniques. **Cadrage technique validé PO le 23/07/2026.** **Étape en
cours : Design** — 4 surfaces à maquetter (CosmeticCard état verrouillé, aperçu
de collection, MilestonesPanel étendu avec récompenses, toast de déblocage).
**Maquette `cosmectic-progression` reçue + analysée + validée PO** (23/07/2026) :
fidèle, réutilise CosmeticCard/rareté/aperçus d'US-031 ; écarts validés (contenu =
vrais jalons builder, pas les accomplissements perso de la maquette ; jalons
booléens sans fraction de progression). **Plan 16 étapes validé PO.**
**Implémentation US-033 terminée.** Livré : `MilestoneDef.reward` + mapping des 10
cosmétiques + helpers (`rewardsFor`/`milestoneForCosmetic`, testés) ;
`STARTER_COSMETICS` (départ = 4) ; **`game/collection.ts`** (aperçu par rareté,
testé) ; **migration Dexie v19** (re-verrouille `owned` = départ ∪ récompenses
atteintes + réconcilie `equipped`) ; `useCosmeticsStore.grant` ; file
`cosmeticUnlocks` + **`CosmeticUnlockToast`** (hébergé AppShell, bas-centre) ;
câblage du déblocage dans `useBuilderStore` (grant + reveal, silencieux au load ;
cosmétiques chargés avant le builder pour éviter la course) ; **`CosmeticCard`
état verrouillé** (cadenas + « Débloqué par ») ; **`CollectionPreview`** +
**`RewardChip`** ; `WardrobeView` (catalogue complet + verrou + masquage des
cachés + aperçu) ; `MilestonesPanel` étendu (puce récompense) ; 2 icônes ; i18n
FR/EN. **Vérifs vertes : typecheck + lint + build/PWA + tests 252/252 (+14).**
Vérif visuelle navigateur à faire en recette (dont re-verrouillage v19).

**Recette 8/8 validée PO le 23/07/2026** (aucun bug ; vérif live sur `:5180`,
partie neuve via « Clear site data »).

**Prochaine action : commit + merge + push** via le skill `commit`.

---

_Historique._ **US-032 — Profil / ID runner clôturée** le 23/07/2026
(Phase A3, vitrine ; cycle complet — cadrages validés PO, maquette `profil-runner`
analysée, plan 11 étapes validé PO, implémentation faite, **recette 8/8 PO à
100 %** [3 ajustements corrigés en direct], décision **#037**, commit + merge sur
`develop` + push). **Chemin critique A3 (US-031 → US-032) terminé.** Restent en
Phase A3 : **US-033 — Achievements-récompenses + aperçu de collection**,
**US-034 — Caisses & rituel d'ouverture**, **US-035 — Pity + fragments**.
Prochaine US via `nouvelle-us`.

---

_Historique de la tranche US-032._ Branche `feature/US-032-profil-runner` créée
depuis `develop`. **Cadrage fonctionnel validé PO le 23/07/2026** : H1 **callsign éditable** ✓ · H2 **3 stats
BUILDER permanentes** (Génération/Jalons X÷total/Cosmétiques X÷total) — **données
perso exclues** (XP/niveau/crédits/réputation, découplées #022) ✓ · H3 **deux
écrans reliés** (profil vitrine + CTA → Garde-robe) ✓. **Étape en cours : cadrage
technique** — écran de présentation quasi pur (lit `useCosmeticsStore` +
`useBuilderStore` + totaux catalogues) ; **seule donnée nouvelle : `callsign`**
porté par `cosmeticsState` / **migration Dexie v18** ; `ProfileView` +
`CallsignEditor` + `game/profile.ts` (normalizeCallsign, testé) ; route
`/profile` + entrée de nav `profile` activée. **Cadrage technique validé PO le
23/07/2026** (3 décisions : callsign sur `cosmeticsState`/migration v18 · profil
vitrine lecture seule · rendu grand format bespoke réutilisant `rarityStyle`/
`RarityBadge`). **Maquette `profil-runner` validée PO**, **plan 11 étapes validé PO**.
**Implémentation US-032 terminée.** Livré : couche pure **`game/profile.ts`**
(`normalizeCallsign`, **testée 6/6**) ; **`CosmeticsState.callsign`** +
**migration Dexie v18** + seed ; `useCosmeticsStore` gagne `setCallsign` ;
composants **`RunnerIdCard`** (sur `<Card hud brackets>` : bannière héros + avatar
hexagonal grand format + titre, réutilise `RarityBadge`/`rarityStyle`),
**`CallsignEditor`** (affichage↔édition, boutons `<Button>`), écran
**`ProfileView`** (en-tête + CTA « Personnaliser » → `/wardrobe` + carte d'ID +
**bloc 3 `<StatCard>`** Génération/Jalons/Cosmétiques, données perso exclues) ;
route `/profile` + entrée de nav Profil activée ; `profile.css` (animations
reduced-motion) ; 2 icônes (`pencil`/`milestone`) ; i18n FR/EN. **Vérifs vertes :
typecheck + lint + build/PWA + tests 238/238 (+6).** Vérif visuelle navigateur à
faire en recette.

**Recette 8/8 validée PO le 23/07/2026** (aucun bug ouvert ; 3 ajustements
corrigés en direct : rail de nav sticky, `z-index` des repères de `<Card>`,
cercle de bannière remonté).

**Prochaine action : commit + merge + push** via le skill `commit`.

---

_Historique._ **US-031 — Socle cosmétique & rareté clôturée** le
23/07/2026 (Phase A3, fondation ; cycle complet — cadrages fonctionnel +
technique validés PO, maquette `wardrobe` reçue + analysée, plan 14 étapes validé
PO, implémentation faite, **recette 9/9 PO validée à 100 %**, décision **#036**,
commit + merge sur `develop` + push).

---

_Historique de la tranche US-031._ Priorité haute, fondation de la Phase A3.
Branche `feature/US-031-socle-cosmetique-rarete` créée depuis `develop`.
**Cadrage fonctionnel validé PO le 22/07/2026** (H1 = 5 crans · H2 = **4 types
dès le socle** · H6 = survie à la renaissance). **Étape en cours : cadrage
technique** (`us/US-031-socle-cosmetique-rarete.md`) — nouveau domaine
`cosmetics` isolé (module pur `game/cosmetics.ts` + table `cosmeticsState` /
**migration Dexie v17** + `cosmeticsRepo` + `useCosmeticsStore`), re-skin par
attribut CSS `data-cosmetic-theme` + surcharges `themes.css`, rampe de rareté
`rarity.css` + `RarityBadge`/`CosmeticCard` (**solde la dette DS #008/#022**),
écran `/wardrobe`. **Cadrage technique validé PO** (table dédiée `cosmeticsState`
· re-skin CSS `data-cosmetic-theme` + miroir localStorage · écran `/wardrobe`).
**Maquette `wardrobe` reçue + analysée** (22/07/2026) : fidèle à nos tokens, 5
surfaces conformes ; portée sur NOS composants (`<Card hud brackets>`/`<Button>`/
`Icon.tsx`), neuf seulement pour `RarityBadge`/`RankPips`/aperçus par type ;
2 écarts (retrait pastille crédits, compteur X/Y minimal) ; **décision PO
re-skin = « Chrome + fonds »** (couleurs de jeu fixes). **Étape en cours : plan
d'implémentation** — **14 étapes** rédigées (`us/US-031-…md` §4), ordre bas→haut.
**STOP — en attente de validation PO du plan.**

---

_Historique._ **Phase A2 close** (5/5 tranches livrées). **Phase A3
« Identité & Collection » définie** le 22/07/2026 — **décision #035**
(brainstorming PO ↔ Claude). Direction retenue parmi 3 options : la **couche
identité & cosmétiques**, toujours local-first, qui **prépare** la Phase B au
lieu de la court-circuiter. **Réinvente pour le builder** les thèmes gelés du
MVP 2/3 historique (socle rareté, caisses, inventaire, pity, profil runner,
achievements). **Acquisition hybride** (déterministe garanti + caisses RNG) ;
**cosmétiques v1** = thèmes/palettes HUD + profil (avatar/bannière/titre), effets
et sons reportés. **Garde-fous** : aucun avantage fonctionnel (pur statut) ;
caisses gagnées par le jeu, jamais achetées.

**5 tranches** (cf. `docs/roadmap.md` / `project/backlog.md`), chemin critique
**US-031 → US-032** : US-031 (socle cosmétique & rareté, **solde la dette DS
#008/#022**) · US-032 (profil / ID runner) · US-033 (achievements-récompenses +
aperçu de collection) · US-034 (caisses & rituel d'ouverture) · US-035 (pity +
fragments).

**Implémentation US-031 terminée** (14 étapes, plan validé PO). Livré : couche
pure **`game/cosmetics.ts`** (catalogue 14 cosmétiques, `equip` un-par-type,
**testée 13/13**) ; tokens **`rarity.css`** (rampe `--rarity-*`, dette DS #008/
#022 soldée) + **`themes.css`** (re-skin par `data-cosmetic-theme`, décision
« Chrome + fonds ») + passe d'aliasing chrome (liens/brackets/rail → `--accent`) ;
**table `cosmeticsState` / migration Dexie v17** + `cosmeticsRepo` + seed ;
**`useCosmeticsStore`** (equip persistant + miroir localStorage anti-FOUC) +
application du thème au boot (`main.tsx`) et dans `AppShell` ; composants
**`RarityBadge`/`RankPips`**, aperçus par type, **`CosmeticCard`** (sur
`<Card hud brackets>` + `<Button>`), écran **`WardrobeView`** (route `/wardrobe`,
entrée de nav `shirt`) ; i18n FR/EN. Écarts appliqués : pastille crédits retirée,
compteur X/Y minimal. **Vérifs vertes : typecheck + lint + build/PWA + tests
232/232 (+13).** Vérif visuelle navigateur à faire en recette (`:5180`).

**Recette 9/9 validée PO le 23/07/2026** (aucun bug ; vérif live sur `:5181`,
états injectés via console). Limites v1 assumées : fond signature #017 non
re-skinné, quelques éléments chrome cyan « en dur » (boutons secondaires) non
thémés — suivi possible au backlog.

**Prochaine action : commit + merge + push** via le skill `commit`.

Dernière US clôturée : **US-030 — Catalogue d'accélérateurs réels élargi**
(Phase A2, priorité basse ; cycle complet — cadrages fonctionnel + technique
validés PO, maquette `network-accelerators-v2` reçue + analysée avec plan de
réutilisation du DS, plan 10 étapes validé PO, implémentation faite, **recette
8/8 PO validée à 100 %** le 22/07/2026, décision **#034**, commit + merge sur
`develop` + push).

Réalisé US-030 : le catalogue d'accélérateurs passe de 1 à 2 en **Option A**
(arbitrage PO). Nouvel accélérateur **`deep-analysis`** — session **longue**
(50 min) → SURCADENCE **30 min** qui booste la **data ×2** (là où `focus` booste
les cycles → vrai arbitrage). **Invariant maintenu** : vérifié par l'app (jamais
auto-déclaré) → **podométrie écartée** (non vérifiable PWA), **détox numérique
reportée** (backlog). **Zéro changement moteur/store, zéro migration Dexie** :
`game/accelerators.ts` + store déjà génériques par `id` et multi-ressources ;
ajout d'une entrée de catalogue + 2 helpers purs (`acceleratorResource`/
`acceleratorMultiplier`). **Bug corrigé** : toast SURCADENCE (`useBuilderTick`)
lisait `boostEffect.cycles` en dur (×1 pour deep) → lit la vraie ressource.
**DS réutilisé** (Card/Button/ProgressBar/Icon) + **nouveau composant DS
`ProgressRing`** (anneau SVG + scan, keyframe `.nw-ring-scan` dans `base.css`,
reduced-motion). Refonte `AcceleratorPanel` (repos = choix multi-protocoles +
indisponible ; en cours = deep **vivant** [anneau/scan/flux/5 phases/aperçu
récompense qui se charge — cosmétique, récompense **tout-ou-rien**] vs focus
sobre ; SURCADENCE = ressource boostée colorée data magenta / cycles cyan). Bloc
CSS orphelin `builder__acc-*` supprimé, 4 icônes lucide ajoutées, i18n FR/EN.
**Tests 219/219** (+6). Vérif visuelle PO sur `:5180` (pas d'outil navigateur) :
1 ajustement en direct (halo de l'anneau tronqué par `overflow:hidden` par défaut
du `<svg>` → `overflow:visible`). Recette **8/8 PO, 100 %**, aucun bug.

Dernière US clôturée (antérieure) : **US-026 — Approfondissement
prestige : seuil de renaissance incrémental + équilibrage de la courbe**
(Phase A2, priorité basse ; cycle complet — cadrages fonctionnel + technique
validés PO, H5 = pas de maquette, plan 10 étapes validé PO, implémentation faite,
**recette 9/9 PO validée à 100 %** le 22/07/2026, décision **#033**, commit +
merge sur `develop` + push).

Réalisé US-026 : corrige la limite du prestige flat (recette US-024). Le seuil
de renaissance devient **incrémental** — nouvelle fonction pure
**`prestigeThreshold(count) = base × growth ** count`** dans `game/prestige.ts`
(source de vérité, remplace la constante `PRESTIGE_CONFIG.threshold` par
`base`/`growth`/`nextMult`), `canPrestige` comparant au seuil dérivé,
`prestige()` inchangé. **Équilibrage PO : `growth = 2,5`** (seuils 1M → 2,5M →
6,25M → 15,6M…), bonus `×1,5` composé conservé ; invariant **anti-boucle** posé
en test (`growth > nextMult` ⇒ rapport `seuil / bonus` strictement croissant :
chaque renaissance coûte plus d'effort relatif). **Aucune migration Dexie, aucun
nouveau champ** (seuil dérivé de `prestigeCount` déjà persisté v14 → compat
ascendante). UI : `PrestigePanel` lit `prestigeThreshold(prestigeCount)` (3
lignes). **Tests 213/213** (+6 : base, géométrie, monotonie C3, anti-boucle C4,
ré-éligibilité C6). Vérif visuelle Playwright **non réalisable dans la session**
(pas d'outil navigateur) → recette PO sur `:5180` (états injectés via helper
console IndexedDB : flux de renaissance + compat sauvegarde `prestigeCount>0`).
Aucun bug, aucun ajustement de code.

**Phase A2 : 4 tranches sur 5 livrées** (US-027, US-028, US-029, US-026). Reste
**US-030** (catalogue d'accélérateurs élargi, priorité basse) — dernière tranche.
Prochaine US via `nouvelle-us`.

Dernière US clôturée (antérieure) : **US-029 — Visualisation du Réseau
(Phase A2)** (cycle complet — cadrages fonctionnel + technique validés PO,
maquette `network-map` reçue + analysée en profondeur avec le PO, plan 14
étapes validé PO, implémentation faite, **recette 9/9 PO validée à 100 %** le
22/07/2026, décision **#032**, commit + merge sur `develop` + push).

Réalisé US-029 : la liste des daemons + les 2 arbres en lignes fusionnent en
**une seule carte spatiale** (graphe de 13 nœuds) qui grandit visuellement avec
la progression — reprend enfin la métaphore « Réseau qui s'étend ». **Couche de
présentation pure** : nouveau module pur **`networkMapModel.ts`** (layout manuel
+ arêtes dérivées des **vraies dépendances** + `buildMapNodes` qui compose les
sélecteurs existants `builder.ts`/`unlockTree.ts` — **testé 13/13**, zéro règle
de jeu, zéro migration Dexie, **pas de lib de graphe** — SVG inline). Structure
= **vraie chaîne** (daemons → data → RELAIS DE MARCHÉ → crypto), pas les ailes
symétriques de la maquette (arbitrage PO) ; **données de nœuds inventées de la
maquette écartées** (source de vérité = catalogues + i18n). Composants
**`NetworkMap`** (fond cyberspace, arêtes SVG, HUD, badge GÉN. + aura rouge),
**`NetworkMapNode`** (hexagone, halos par état, reveal glitch sur transition,
compteur ×N), **`NetworkMapDetail`** (popover sur DS **`<Card>` + `<Button>`** ;
daemon = Compiler + Améliorer, nœud d'arbre = Débloquer). **Gating de branche**
(recette) : un nœud reste verrouillé tant que sa ressource n'est pas ouverte
(data via `oracle`, crypto via `breach-market`). **5 composants supprimés**
(`DaemonCard`/`TeaserCard`/`UnlockNodeCard`/`HiddenNodeCard`/`UnlockTreeSection`)
+ CSS/keyframes orphelins nettoyés. Bande pleine largeur (casse la colonne 760).
**Tests 207/207.** Vérif visuelle (Playwright) : 3 bugs corrigés en direct
(popover/propagation, gating, chevauchement labels) + halos d'ambiance adoucis
(`ellipse closest-side`) sur retour PO. Recette **9/9 PO, 100 %**.

**Phase A2 : 4 tranches sur 5 livrées** (US-027, US-028, US-029, US-026). Reste
**US-030** (catalogue d'accélérateurs élargi, priorité basse). Prochaine US via
`nouvelle-us`.

Dernière US clôturée (antérieure) : **US-028 — Jalons /
accomplissements du Réseau (Phase A2)** (cycle complet — cadrages fonctionnel
+ technique validés PO, maquette `network-milestones` validée PO, plan 13
étapes validé PO, implémentation faite, **recette 10/10 PO** le 22/07/2026,
décision **#031**, commit + merge sur `develop` + push).

Réalisé US-028 : **REGISTRE** des 11 jalons de progression du Réseau —
nouveau module pur **`game/milestones.ts`** (prédicats purs sur l'état
courant, pas de nouveau compteur cumulatif — **testé 15/15**), flag persisté
**append-only** `BuilderState.achievedMilestones` (Dexie **v16**, survit à la
renaissance). Câblage `useBuilderStore` (jalons vérifiés après chaque action
pertinente + `load()` en merge silencieux pour le backfill/hors-ligne ; le
jalon événementiel `hack` persisté immédiatement) + `useFeedbackStore`
(nouvelle **file** de toasts `milestones`, contrairement aux singletons
`levelUp`/`rankUp`). UI : panneau **`MilestonesPanel`** (chrome neutre frost,
**sans halo** — les 6 accents DS étant déjà réservés à des systèmes actifs) +
toast bespoke **`MilestoneToast`** (sceau hexagonal, comme `RankUpToast`), en
fin de colonne side sous `PrestigePanel`. **Contenu des jalons ajusté par la
maquette** (validé PO) : remplace les jalons individuels par daemon + seuils
de cycles du cadrage initial par PREMIER HACK/ESSAIM DE DAEMONS/PREMIÈRE
AMÉLIO/FLUX DE DATA, et ajoute **SURCADENCE** (système accélérateurs US-023,
oublié au cadrage initial). **Tests 194/194.** **Vérification visuelle
navigateur** (Playwright headless, avant recette PO) : 2 bugs trouvés et
corrigés — icônes manquantes au registre DS (`components/ui/core/Icon.tsx`),
toast chevauchant la `StatusBar`. Recette PO : **10 critères conformes,
aucun bug trouvé**.

**Prochaine étape : commit + merge + push** (skill `commit`). Prochaine US
après clôture : **US-029 — Visualisation du Réseau** ou **US-030 — Catalogue
d'accélérateurs élargi** (Phase A2, à choisir au prochain `nouvelle-us`).

Dernière US clôturée (antérieure) : **US-027 — Marché crypto (Phase
A2)** (cycle complet — cadrages fonctionnel + technique validés PO, maquette
`network-crypto` validée PO, plan 14 étapes validé PO, implémentation faite,
**recette 9/9 PO** le 22/07/2026, décision **#030**, commit + merge sur
`develop` + push).

Réalisé US-027 : 1ʳᵉ tranche de la Phase A2. **3ᵉ ressource, le crypto** —
comportement délibérément différent de `cycles`/`data` : jamais accumulée
passivement, convertie **manuellement** à un cours fluctuant. Nouveau module
pur **`game/crypto.ts`** (`marketRate` déterministe à 3 oscillations, **jamais
persisté**, aucune interaction avec le hors-ligne — **testé 10/10**).
**`game/unlockTree.ts` généralisé multi-devise** (`currency` par nœud,
`unlockedNodes` **partagé** entre branches → `requiresNode` réutilisé tel quel
pour le lien inter-branches, nouveau 3ᵉ type d'effet `cryptoFloor` — **testé
29/29**, 19 non-régression + 10 nouveaux) : 5 nœuds (RELAIS DE MARCHÉ,
ARBITRAGE AUTO, PLANCHER DE COURS, LAVERIE FANTÔME, **CARTEL://DARK.POOL**
caché — 2ᵉ reveal du jeu). **`game/prestige.ts` ajusté** (`crypto` fait
désormais partie du reset — **testé 7/7**). Migration **Dexie v15**
(`crypto`). **DS étendu** : accent `amber` (`Card` +1 ligne), 2 icônes
(`arrow-left-right`/`landmark`). UI : `UnlockNodeCard`/`HiddenNodeCard`/
`UnlockTreeSection` **généralisés** (réutilisés pour les 2 branches, pas de
duplication) ; nouveau `CryptoPanel` (ticker + tendance + `<Slider>` DS +
conversion) en colonne stage (layout Option A) ; 2ᵉ arbre en colonne side.
**Tests 179/179.** Recette PO : 9 critères conformes ; 1 ajustement de recette
(condition du reveal caché mal calibrée pour le test, pas un bug de code —
corrigé et rejoué en direct).

**Prochaine US : US-028 — Jalons/accomplissements** (Phase A2) via le skill
`nouvelle-us`. Roadmap produit : `docs/roadmap.md` (Phase A2, chemin
US-027→030 / US-026 rattachée).

Contexte : **session de brainstorming PO ↔ Claude (21/07/2026)** — US-025 (A6)
gelée (décision #028), Phase A close (A1→A5 jouée). Analyse fonctionnelle du
builder → **Phase A2 « Approfondissement & rétention »** cadrée (décision
#029, voir `docs/roadmap.md`/`project/backlog.md`) : 5 tranches (US-026→030),
chemin critique US-027 en premier.

Dernière US clôturée : **US-024 — A5 : Hors-ligne & temps
écoulé + embryon de prestige** (cycle complet — cadrages fonctionnel + technique
validés PO, maquette `network-renaissance` validée PO, plan 17 étapes validé PO,
implémentation faite, **recette 9/9 PO** le 21/07/2026, décision **#027**,
commit + merge sur `develop` + push).

Réalisé US-024 : ferme la boucle « reviens demain ». **Rattrapage hors-ligne** —
`offlineTick` (`game/builder.ts`, calendrier de segments de multiplicateurs,
domaine-agnostique) + `boostWindows` (`game/accelerators.ts`, 0-3 segments) ;
le store compose **arbre × boost × prestige** au `load()` depuis `updatedAt`
(anti double-comptage : calcul 1 fois, tick réamorcé indépendamment ; pas de
plafond, linéaire P5) ; bandeau `OfflineCatchupBanner` (`<Alert success>`) si
gain notable. **Embryon de prestige** — nouveau module pur **`game/prestige.ts`**
(seuil flat **1 000 000**, `prestigeMultiplier` **composé** `1,5 ** count`,
`prestige()` reset ciblé sans toucher l'accélérateur en cours) ; migration
**Dexie v14** (`prestigeCount`) ; bonus permanent composé dans `applyTick`
**et** le rattrapage **et** le débit affiché. UI `PrestigePanel` unique/permanent
sur **`<Card halo="red">`** (accent rouge réservé) en fin de colonne side,
confirmation via **`ConfirmDialog` étendu** (rétrocompatible : `icon`/`iconColor`
+ slot `children`). **Tests 159/159.** Recette PO : 9 critères conformes +
**correction du débit affiché** (n'intégrait pas le prestige) ; limite « seuil
flat » assumée (embryon) → approfondissement **US-026** au backlog.

**US-025 (A6) gelée** (décision **#028**, 21/07/2026) : brancher le to-do
auto-déclaré sur la production du Réseau serait farmable (viole P1/P5) et fait
doublon avec les accélérateurs vérifiés d'US-023 ; module perso laissé
découplé, tel quel (rien perdu, P8). **Phase A considérée jouée** (A1→A5
suffisent à prouver le fun).

**Pas de cycle de vie US en cours.** Phase de **brainstorming polish/rétention**
ouverte (PO ↔ Claude, à partir du 21/07/2026) : analyse fonctionnelle du
builder existant + pistes d'amélioration, avant de redéfinir la prochaine
tranche. Roadmap produit : `docs/roadmap.md` (Phase A A1–A5 jouée / Phase B
B1–B4 à venir).

Dernière US clôturée (antérieure) : **US-023 — A4 : Accélérateurs réels au choix** (cycle
complet — cadrages fonctionnel + technique validés PO, maquette
`network-accelerators` validée PO, plan 10 étapes validé PO, implémentation
faite, **recette 8/8 PO** le 20/07/2026, décision **#026**, commit + merge sur
`develop` + push).

Réalisé US-023 : 1ʳᵉ concrétisation de la **« Voie 2 »** — l'effort réel devient
un **accélérateur optionnel** (jamais imposé) d'un builder autonome. Nouveau
module pur **`game/accelerators.ts`** (**testé 16/16**), découplé de
`builder.ts`/`unlockTree.ts` : catalogue `ACCELERATORS` (1 entrée `focus`
extensible), machine d'état `canStart`/`start`/`cancel`/`resolve`/
`boostMultiplier`, `endsAt` en **instant absolu** (indépendant du 1ᵉʳ plan,
rattrapage app fermée via `resolve` au `load()` + à chaque `applyTick`).
Migration **Dexie v13** (`acceleratorRun`/`acceleratorBoost`). Store
`startAccelerator`/`cancelAccelerator` + composition `boostMultiplier` ×
multiplicateurs d'arbre avant `tick()` ; toasts succès (apparition boost, via
`useBuilderTick`) / neutre (abandon). UI `AcceleratorPanel` (3 états
repos/en cours/**SURCADENCE**) sur les composants DS `<Card hud brackets
halo="cyan">`/`<Button>`/`<ProgressBar>` — **accent cyan réservé**, layout
Option A (colonne stage, sous `HackZone`) ; anneau focus + glow SURCADENCE,
`prefers-reduced-motion` respecté ; i18n FR/EN ; 2 icônes (`play`/`brain`) +
helper `formatCountdown`. Réglages focus 25 min → SURCADENCE ×2 pendant 15 min
(placeholder). **Tests 142/142.** Recette PO : les 8 critères conformes,
**aucun bug ouvert**.

**US-024 — A5** (hors-ligne & temps écoulé + embryon de prestige) **clôturée**
le 21/07/2026 (recette 9/9 PO, décision #027, commit + merge + push).
**Prochaine : US-025 — A6.** Roadmap produit : `docs/roadmap.md` (Phase A
A1–A6 / Phase B B1–B4).

Dernière US clôturée : **US-022 — A3 : 2ᵉ couche de ressource + arbre de
déblocage + 1ᵉʳ reveal caché** (cycle complet — cadrages + maquette
`network-datatree` + plan validés PO, implémentation faite, **recette 8/8 PO**
le 20/07/2026, **commit + merge + push faits** — `874ca89`/`d41d7eb`,
`develop` à jour sur `origin`).

Réalisé US-022 : `game/builder.ts` étendu (`data`, `unlockedNodes`,
`dataPerSec()`, `tick()` avec multiplicateurs optionnels) ; nouveau module pur
**`game/unlockTree.ts`** (catalogue `UNLOCK_NODES` à 4 nœuds — `overclock`,
`parallelism`, `cryo-cache`, `ghost-protocol` caché ×3 data —, dépendance
`requiresNode`/`requiresGenerator`, **testé 19/19**) ; migration **Dexie v12**
(`data` + `unlockedNodes`, 2 champs) ; store `buyNode(id)` + composition des
multiplicateurs avant `tick()` ; UI `DataReadout` (panneau magenta
conditionnel) + `UnlockTreeSection`/`UnlockNodeCard`/`HiddenNodeCard` sur le
composant DS **`<Card hud brackets>`** (repères d'angle corrigés en recette,
voir `project/recettes.md`), irruption glitch du nœud caché,
`prefers-reduced-motion` respecté ; i18n FR/EN ; icônes `gauge`/`split`/
`snowflake`/`skull`/`triangle-alert`/`unlock`/`download`/`minus`. **Tests
126/126.** Recette PO : fonctionnel + rendu conformes ; note non-bloquante sur
la mise en page (linéaire, s'étoffera avec A4-A6).

Dernière US clôturée : **US-021 — A2 : Daemons & automatisation** (commit + merge
sur `develop`, décision **#024**, **recette 10/10 PO** le 20/07/2026, archivée).

Réalisé US-021 : `game/builder.ts` généralisé en **catalogue `GENERATORS`** (4
daemons, **upgrade par type**, déblocage chaîné) — **testé 18/18** ; `BuilderState`
→ maps `generators`/`upgrades` + **migration Dexie v11** (SCRAPER-01 + cycles
préservés) ; store `buyGenerator(id)`/`buyUpgrade(id)` ; `DaemonCard` (2 boutons
sur `<Card>` DS) + `TeaserCard` (verrouillé) + bandeau « Production réseau » ;
i18n FR/EN ; icônes `filter`/`ghost`/`radar`/`key-round`. **tests 100/100.**

## US précédente (clôturée)

**US-020 — A1 : Noyau du builder** clôturée le 20/07/2026 (décision **#023**,
recette **9/9 PO**, mergée sur `develop`, archivée). Réalisé : Dexie **v10** +
`BuilderState` + `builderRepo` ; `game/builder.ts` (**11/11**) ; `useBuilderStore`
+ `useBuilderTick` ; écran `/network` (`BuilderView`/`HackZone`/`DaemonCard` sur
`<Card>` DS) + onglet Réseau ; i18n `builder.*`. **tests 93/93.**

## Contexte — pivot builder (#022) acté & commité

Le rangement du pivot est **commité** (branche `chore/pivot-vision` mergée sur
`develop`, `2d35e3e`). Netrunner Tasks devient un **jeu builder** (façon Universal
Paperclips) dont la **progression réelle** est l'accélérateur ; le to-do +
habitudes + factions existants deviennent le **module perso privé**. Vision &
principes **P1–P8** : `docs/vision-plateforme.md`. Roadmap produit (Phase A A1–A6 /
Phase B B1–B4) : `docs/roadmap.md`. **US-015→019 gelées.**

## Étape du cycle de vie

**US-014 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-014/`, révision « rappel = heure requise ») → plan 12 étapes →
implémentation → **recette 9/9 PO**. Contenu : **heure d'échéance optionnelle**
(**Dexie v9** : `dueHasTime` + `reminderLead` + `reminderNotifiedFor`) + **rappels
best-effort** (périmètre B). Cœur temporel unifié **`game/dueTime.ts`**
(`deadlineInstant` **DST-safe** ; testé, **non-régression**), refactor
`streak`/`risk`/`recurrence`/`dueDate` (`hasTime`, heure conservée), réactivation
via `isDue`. Service **`useReminders`** (tick 30 s + rattrapage, notif système +
toast, bandeau agrégé), `notifications.ts` (dégradation propre). UI : champ heure +
`ReminderControl` + permission, pastille horodatée + puce rappel, bandeau `Alert`.
**Revue de code** : 4 corrections avant merge (bug DST, garde anti-boucle, notif
agrégée, affichage heure). **Correctif visuel hors périmètre inclus** (validé PO) :
alignement du rond de difficulté. Vérifs vertes : **typecheck + lint + build +
tests 82/82**.

## Étape du cycle de vie (US antérieure)

**US-013 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-013/` — bonus indexé difficulté, one-shot, plafond = solde,
bouton « Miser » explicite) → plan 13 étapes → implémentation → **recette 8/8 PO**.
Contenu : **mise de crédits** sur un contrat one-shot à échéance (**Dexie v8** :
`Contract.stake` + `stakeOutcome`), **débit immédiat** ; réussite avant échéance =
retour `mise × mult` (**barème `1,5/2/2,5/3/4`** indexé difficulté) ; échéance
dépassée = **perte** au `load()` (aucun mouvement de crédit). Réalisé : module pur
**`game/risk.ts`** (**testé 14/14**), `usePlayerStore.adjustCredits`
(**plancher 0**), `useContractsStore.setStake` + `settleStakeOnComplete` +
remboursements (suppression / retrait d'échéance / ajout de récurrence), UI
**`StakeControl`** (4 états) + **`StakeChip`** + toasts, i18n `contracts.stake.*`.
**Revue de code** : 2 bugs d'intégrité crédits corrigés avant merge (résolution de
mise gatée par la récompense de base ; `setRecurrence` ne soldait pas la mise en
jeu). Vérifs vertes : **typecheck + lint + build + tests 65/65**.

## Étape du cycle de vie (US antérieure)

**US-012 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **maquette reçue & validée**
(`docs/maquettes/US-012/`) → plan 13 étapes → implémentation → recette **9/9 PO**.
Contenu : `Faction.reputation` (**Dexie v7**, plancher 0) **monte** à la complétion
payante d'un contrat de la faction (barème `1/2/4/7/12`) et **descend** quand un
streak d'habitude rattaché casse (perte au `load()`, US-011, silencieuse) ; **rangs
dérivés par seuils** `0/25/75/200/500` (statut, sans avantage). Réalisé : module
pur **`game/reputation.ts`** (**testé 10/10**), `grantReputation`, gain +
**toasts** (gain teinté faction + passage de rang) dans `useCompleteContract`/
`AppShell`, pénalités au `load()` + **séquencement contrats→factions**, panneau
**`ReputationPanel`** (`HudPanel`) sur le tableau de bord (insigne 5 crans, barre
en **dégradé de teinte** local au panneau, état LÉGENDE), icônes `crown`/
`shield-check`, i18n `reputation.*` FR/EN. Vérifs vertes : **typecheck + lint +
build + tests 51/51**.

## Étape du cycle de vie (US antérieure)

**US-011 clôturée le 19/07/2026** (commit + merge sur `develop`). Cycle complet :
cadrages fonctionnel + technique validés PO → **pas de maquette** (alignement sur
l'existant) → plan 10 étapes → implémentation → recette **7/7 PO**. Contenu : le
**streak** est une propriété des contrats **récurrents** (US-006) — série des
périodes complétées à temps (+1 à temps, repart à 1 en retard), **record** qui ne
diminue jamais, **remise à 0** sur période manquée (au `load()`, avec la
réactivation US-006). Anti-double garanti par le verrou « récurrent validé ».
Récompenses **inchangées** (conséquences réputation = **US-012**). Réalisé :
**migration Dexie v6** (`currentStreak`/`bestStreak` sur `Contract`, backfill 0),
module pur **`game/streak.ts`** (**testé 11/11**) branché dans `complete()` /
`load()` / `setRecurrence(null)`, puce **`StreakChip`** (icône `flame`, ambre si
active) sur la ligne + bloc **Série/Record** au détail, i18n `contracts.streak.*`
FR/EN. Vérifs vertes : **typecheck + lint + build + tests 41/41**.

> **MVP 2 découpé** le 19/07/2026 en 9 US (US-011 → US-019, voir `backlog.md`) ;
> **US-011 & US-012 faites** → **prochaine : US-013** (contrats à risque, mise de
> crédits). **MVP 1 terminé** (US-001 → US-010 `fait`) + chantier fond/cartes figé
> (#017).

## Chantier exploration figé (hors cycle US) — `test/fonds-halos` → `develop`

Exploration visuelle avant MVP 2 (branche depuis `develop`, **hors cycle US**,
validée PO en itération live). **Figée dans le produit** (décision **#017**) —
l'outillage d'exploration (labo `/labo`, sélecteur, `useBgLab`, 8 fonds candidats
+ overlays) a été **retiré** ; seul le choix retenu subsiste.
- **Fond signature** (`.nav-main`, `appShell.css`) : navy `#141a29` + quadrillage
  (carrés 28 px + lignes fines 4 px, opacité 0.016) + **4 halos néon d'angle**
  (HG cyan · BG violet · HD magenta · BD menthe). 100 % CSS (`::before`,
  `z-index:-1`) — pas d'image, PWA/hors-ligne préservés.
- **`<Card>` enrichie** (réutilisable) : props `halo` (halo permanent, `.nw-card-halo`
  → `card.css`) et `brackets` (2 repères d'angle blancs, coins non biseautés).
  `CardAccent` accepte `red`.
- **Lignes de contrat** (`ContractItem`) : surface **HUD** à **halo permanent**
  (couleur = accent de difficulté, mutée si terminé) + **2 brackets** ; survol
  intensifie bordure/lueur ; le flash « hack réussi » prime toujours.
- Vérifs vertes : **typecheck + lint + build + tests 30/30**.
- **À suivre (MVP 2)** : adopter `StatCard`/`HudPanel` sur le tableau de bord ;
  réserver le bouton plein `primary` à un CTA « héros ».

## Étape du cycle de vie

**US-007 clôturée** (commit + merge sur `develop`, décision #016). Cycle complet :
cadrages → maquette → plan → implémentation → recette **9/9 PO**. A exposé côté UI
le socle faction déjà présent (**aucune migration Dexie, reste v5**) : `factionLabel`
(name→clé i18n, testée 3/3), `useFactionsStore`, `setFaction`, `FactionBadge`
(reconstruit NIGHTWIRE), sélecteur de faction (modale), `FactionFilterBar` (filtre
mémoire non persisté). Maquette non versionnée (convention). Cadrages + maquette
validés PO le 18/07/2026 (`docs/maquettes/US-007/`). Plan en 9 étapes exécuté :
i18n FR/EN (clés `contracts.factions.*`, `faction.*`, `filter.*`) ; règle pure
`factionLabel` (name→clé i18n, **testée 3/3**) ; `useFactionsStore` (chargé dans
`AppShell`) ; `setFaction` (repo + store) ; `FactionBadge` (autonome, reconstruit
NIGHTWIRE) inséré en tête de rangée méta ; bloc FACTION (puces) dans
`ContractDetail` ; `FactionFilterBar` + filtre mémoire non persisté dans
`ContractsView` (compteur d'en-tête & état vide restent globaux). **Aucune
migration Dexie** (reste v5). Vérifs vertes : **typecheck + lint + build + tests
30/30**.
Cadrages (fonctionnel + technique) dans `us/US-007-factions.md`. Cadrage
fonctionnel **validé PO le 18/07/2026** (H1→H4, dont option « Sans faction »).
Le modèle de données faction **existe déjà** (table `factions` + **index Dexie
`factionId` depuis v2**, CRUD complet, `CreateContractInput.factionId` &
`ContractFilter.factionId`, 5 factions semées) mais n'est **jamais exposé côté
UI** (`factionId` toujours `null`). **Conséquence clé : US-007 = AUCUNE migration
Dexie (reste v5)** — US essentiellement front. Découpage technique : nouveau
`useFactionsStore` (chargé dans AppShell), helper pur `factionLabel` (name→clé
i18n, H3), action `setFaction` (store + repo), et 3 briques UI — `FactionBadge`
(à reconstruire NIGHTWIRE), sélecteur dans `ContractDetail`, `FactionFilterBar`
(filtre mémoire non persité dans `ContractsView`). **Impact UI significatif** →
étape design à prévoir avant implémentation.

> US-006 terminée : cycle complet (cadrages → plan → implémentation → **boucle de
recette** avec 2 ajustements validés PO → recette **13/13**). A introduit le type
`Recurrence` (2 modes : intervalle `{every, unit}` | jour fixe `{weekday}`) +
`Contract.recurrence` (**Dexie v5**), la couche pure `game/recurrence.ts`
(`firstOccurrence` + `nextOccurrence`, testées **12/12**), le contrôle de
récurrence (modale) + la puce `⟳`. **Modèle « validé jusqu'à réactivation »** :
compléter un récurrent le passe VALIDÉ (verrouillé) ; `load()` le **réactive** au
chargement quand l'échéance est atteinte. Échéance **auto-posée/recalculée** à la
définition. Pas de maquette (aligné sur l'existant).

> US-010 (avant) terminée : recette **12/12** PO. Routeur `react-router` +
> app-shell (#015), HUD, couche feedback partagée, `ProgressionIndicator bar`.

Report i18n des noms de factions : **soldé** par US-007 (`factionLabel` + clés
`contracts.factions.*`). Bug doc ouvert : **DOC-001** (décisions #012/#013
référencées mais absentes de `decisions.md`). Backlog MVP 2 : échéances horodatées
+ rappels/notifications PWA (US-006) ; état vide « aucun contrat pour ce filtre »
(US-007).

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [x] Chantier i18n FR/EN (**fait**, décision #010).
- [x] US-003 — Création rapide de contrat (règle des 2 s) (**fait**).
- [x] US-004 — Liste des contrats & complétion (**fait**, décision #011).
- [x] US-008 — Difficulté & calcul de récompense (**fait**, décision #012).
- [x] US-005 — Attributs de contrat (priorité, échéance, sous-tâches) (**fait**, décision #013).
- [x] US-009 — Progression joueur (XP, niveau, crédits) (**fait**, décision #014 — Vitest).
- [x] US-010 — Tableau de bord / HUD (**fait**, décision #015 — routeur & app-shell).
- [x] US-006 — Récurrence des contrats (**fait** ; modèle « validé jusqu'à réactivation », Dexie v5).

**US-023 — A4** (accélérateurs réels au choix) **clôturée** le 20/07/2026
(recette 8/8 PO, décision #026, commit + merge + push). **US-024 — A5**
(hors-ligne & temps écoulé + embryon de prestige) **clôturée** le 21/07/2026
(recette 9/9 PO, décision #027, commit + merge + push). **Prochaine : US-025 —
A6.** Roadmap produit : `docs/roadmap.md` (Phase A A1–A6 / Phase B B1–B4).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
