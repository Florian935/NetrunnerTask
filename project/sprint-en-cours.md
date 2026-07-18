# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-006** (archivée dans
`us/archive/`). Il ne reste qu'**US-007** en MVP 1.

## Étape du cycle de vie

US-006 terminée : cycle complet (cadrages → plan → implémentation → **boucle de
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

Reports encore ouverts : **i18n des noms de factions** (US-007). Bug doc ouvert :
**DOC-001** (décisions #012/#013 référencées mais absentes de `decisions.md`).
Backlog MVP 2 : échéances horodatées + rappels/notifications PWA (identifié en US-006).

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

## Prochaine action

Dernière US du MVP 1 : **US-007 — Factions & filtrage** (démarrer via le skill
`nouvelle-us`) — clôture les enrichissements + solde le report i18n des noms de
factions. Ensuite : découpage du MVP 2.

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
