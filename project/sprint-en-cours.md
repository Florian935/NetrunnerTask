# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernier travail clôturé : **chantier i18n FR/EN** (archivé
dans `us/archive/`).

## Étape du cycle de vie

Chantier i18n terminé : cadrage → implémentation → recette 7/7 → commit/merge.
Prêt à démarrer US-004.

Reports actés à réintégrer le moment venu : **store contrats Zustand** (US-004),
**app-shell** — rail de nav + barre de statut (US-010), **i18n des noms de
factions** (US-007).

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, mergée dans `develop`, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [~] US-003 — Création rapide de contrat (règle des 2 s) — **en cours** (cadrage fonctionnel).

## Prochaine action

Valider (ou amender) le **cadrage fonctionnel d'US-003**, puis passer au cadrage
technique, puis à l'étape **design** (maquette Claude Design) avant le plan.

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
