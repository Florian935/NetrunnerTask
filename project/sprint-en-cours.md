# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-009** (archivée dans
`us/archive/`).

## Étape du cycle de vie

US-009 terminée : cycle complet (cadrages → maquette 5a/5b → plan →
implémentation → recette **12/12** validée PO → commit/merge). A introduit
**Vitest** (1er test du dépôt, décision #014) et la couche pure
`src/game/progression.ts` (courbe `100 × n` : `xpToReachLevel`, `levelForXp`,
`progressionFor`) + `progression.test.ts` (**10/10**). `usePlayerStore.grantReward`
**dérive et persiste `level`** depuis l'XP totale et renvoie
`{ leveledUp, previousLevel, newLevel }`. Nouveaux composants
`src/features/progression/` : **`ProgressionIndicator`** (indicateur permanent en
en-tête, autonome → réemployable dans le HUD US-010) et **`LevelUpToast`**
(toast de palier sur-mesure, `prefers-reduced-motion`) + `progression.css`.
Icônes `coins` / `chevrons-up` ajoutées au registre. i18n FR/EN.

**Décision de périmètre (18/07/2026)** : le compteur « ACTIFS · TOTAL » (US-004)
**a quitté l'en-tête** au profit de l'indicateur de niveau → **à réintégrer dans
le HUD d'US-010**.

Reports encore ouverts : **app-shell** — rail de nav + barre de statut (US-010) ;
**i18n des noms de factions** (US-007) ; **réintégration du compteur « ACTIFS ·
TOTAL »** dans le HUD (US-010, retiré de l'en-tête en US-009). Bug doc ouvert :
**DOC-001** (décisions #012/#013 référencées mais absentes de `decisions.md`).

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

## Prochaine action

Choisir la prochaine US via le skill `nouvelle-us`. Restent en MVP 1 :
**US-006** (récurrence), **US-007** (factions & filtrage), **US-010** (HUD —
inclut la réintégration du compteur actifs/total).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
