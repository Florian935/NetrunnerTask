# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-001** (archivée dans
`us/archive/`).

## Étape du cycle de vie

US-001 terminée : cycle complet déroulé (cadrages → plan → implémentation →
recette 8/8 → commit/merge). Prêt à démarrer la prochaine US du MVP 1.

## Avancement global

- [x] Gouvernance, CDC, design system (source-only), roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [ ] US-002 — Modèle de données & persistance locale (Dexie) — prochaine.

## Prochaine action

Démarrer **US-002 — Modèle de données & persistance locale (Dexie)** via le
skill `nouvelle-us` (branche `feature/US-002-...` depuis `develop`, puis cadrage
fonctionnel → STOP validation).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
