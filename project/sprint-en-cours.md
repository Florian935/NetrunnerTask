# Sprint en cours — Netrunner Tasks

> Reflète l'état réel du projet à tout instant. Mis à jour après **chaque**
> étape franchie du cycle de vie (voir `CLAUDE.md` §5).

## US active

_Aucune US active._ Dernière US clôturée : **US-008** (archivée dans
`us/archive/`).

## Étape du cycle de vie

US-008 terminée : cycle complet (cadrages → maquette → plan → implémentation →
recette **9/9** → commit/merge). Introduit la couche **`src/game/`** (règles de
jeu, barème), le **store joueur** (`usePlayerStore`), le marqueur anti-farm
`rewardGranted` (**Dexie v3**), le sélecteur de difficulté, l'affichage de la
récompense potentielle et le retour de gain (compteur **GAINS · SESSION** +
toast + flash mint). Ajustement de recette : halos figés (Framer Motion) →
pilotés par classes CSS. Prêt à démarrer **US-005**.

Reports encore ouverts : **US-005** (attributs de contrat) ; **app-shell** — rail
de nav + barre de statut (US-010) ; **i18n des noms de factions** (US-007) ;
**progression de niveau** (dérivation `xp → level`, montée de niveau) et
**affichage permanent solde/niveau** → US-009 / US-010.

## Avancement global

- [x] Gouvernance, CDC, roadmap, backlog MVP 1.
- [x] US-001 — Initialisation technique + design system (**fait**).
- [x] Migration design system → NIGHTWIRE V3 (**fait**, décision #008).
- [x] US-002 — Modèle de données & persistance locale (Dexie) (**fait**, décision #009).
- [x] Chantier i18n FR/EN (**fait**, décision #010).
- [x] US-003 — Création rapide de contrat (règle des 2 s) (**fait**).
- [x] US-004 — Liste des contrats & complétion (**fait**, décision #011).
- [x] US-008 — Difficulté & calcul de récompense (**fait**, décision #012).
- [ ] US-005 — Attributs de contrat (priorité, échéance, sous-tâches) — prochaine.

## Prochaine action

Démarrer **US-005 — Attributs de contrat (priorité, échéance, sous-tâches)** via
le skill `nouvelle-us`. Impact UI → étape design probable ; libellés i18n ;
probables évolutions du modèle Dexie (montée de version).

> À reconstruire sur NIGHTWIRE dans leur US métier : composants `game/`
> (ContractCard, RarityBadge, CosmeticCard, FactionBadge) + rampe de rareté
> `--rarity-*`, supprimés avec l'ancien design system (voir #008, backlog).

## Comment lancer l'app

- Dev : `npm run dev` (port 5173 parfois pris par une autre app → Vite bascule,
  ou forcer `npm run dev -- --port 5180`).
- Build + test PWA/hors-ligne : `npm run build` puis `npm run preview`.
