# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-002** (archivée dans
`us/archive/`).

## Étape du cycle de vie

US-002 terminée : cycle complet déroulé (cadrages fonctionnel + technique → plan
→ implémentation → recette 8/8 → commit/merge). Prêt à démarrer US-003.

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, mergée dans `develop`, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [ ] US-003 — Création rapide de contrat (règle des 2 s) — prochaine.

## Prochaine action

Démarrer **US-003 — Création rapide de contrat (règle des 2 s)** via le skill
`nouvelle-us` (branche `feature/US-003-...` depuis `develop`, cadrage fonctionnel
→ STOP validation). Première US avec **impact UI** → prévoir l'étape design
(maquette).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
