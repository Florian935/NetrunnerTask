# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-010** (archivée dans
`us/archive/`). **Chemin critique du MVP 1 terminé** (créer → terminer →
récompense → niveau → HUD).

## Étape du cycle de vie

US-010 terminée : cycle complet (cadrages → maquette 6a–6d → plan →
implémentation → recette **12/12** validée PO → commit/merge). A introduit
**`react-router` + app-shell** (décision #015) : `app/AppShell` (rail de nav
responsive + barre de statut permanente + hôte global des toasts/palier),
routes `/` → **`DashboardView`** (HUD, point d'entrée) et `/contracts` →
`ContractsView`. **Couche feedback partagée** (`useFeedbackStore` +
`useCompleteContract`) sortie de `ContractsView`. HUD = contrats du jour groupés
(EN RETARD / AUJOURD'HUI) via `dashboard/todayContracts.ts` (pur, testé 5/5) +
`TodayContractRow` + état vide. `ProgressionIndicator` gagne une variante `bar`.
`ContractsView` allégé, **ACTIFS · TOTAL réintégré**. PWA `navigateFallback`.

> US-009 (avant) terminée : recette **12/12** PO. Vitest (#014),
> `game/progression.ts` (courbe `100 × n`), `grantReward` persiste `level`,
> composants `features/progression/`.

Reports encore ouverts : **i18n des noms de factions** (US-007). Bug doc ouvert :
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
- [x] US-010 — Tableau de bord / HUD (**fait**, décision #015 — routeur & app-shell).

## Prochaine action

Chemin critique MVP 1 bouclé. Restent les **enrichissements** du to-do (priorité
`moyenne`), à démarrer via le skill `nouvelle-us` : **US-006** (récurrence) et
**US-007** (factions & filtrage). Ensuite : découpage du MVP 2.

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
