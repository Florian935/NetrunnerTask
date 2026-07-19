# Roadmap — Netrunner Tasks

> Fil directeur : **le vrai to-do rapide d'abord**, la gamification se superpose
> ensuite, la rétention (caisses / cosmétiques) en dernier. On ne construit
> jamais la couche N+1 avant que la couche N tourne.

> **⚠️ PIVOT ACTÉ (19/07/2026, décision #022) — voir `docs/vision-plateforme.md`.**
> Le produit évolue d'un to-do gamifié vers un **jeu builder social** (façon
> Universal Paperclips, progression réelle = accélérateur). **MVP 1 + US-011→014
> restent acquis** (ils deviennent le « module perso »). **Le reste du MVP 2
> (US-015→019) et le MVP 3 historique ci-dessous sont GELÉS** — réinventés par le
> pivot. Une **roadmap produit (Phases A/B)** les remplacera une fois validée. Les
> sections ci-dessous sont conservées comme **archive** de la trajectoire initiale.

## MVP 1 — Le to-do jouable (la boucle de base)

**Objectif :** une app locale utilisable au quotidien, où créer une tâche prend
2 secondes et où finir un contrat rapporte XP et crédits, avec un niveau qui
progresse.

**Périmètre :**
- Initialisation technique (React + TS + Vite + Tailwind + Zustand + Dexie + PWA)
  et intégration du design system.
- Modèle de données local (contrats, factions, joueur) et persistance Dexie.
- Création rapide de contrat (règle des 2 s), édition, complétion, suppression.
- Attributs : priorité, échéance, sous-tâches, récurrence.
- Factions (catégories de vie) et filtrage.
- Difficulté (trivial → légendaire) → récompense XP + crédits.
- Progression : XP, niveau de netrunner, solde de crédits.
- Tableau de bord / HUD minimal : contrats du jour, niveau, solde.

## MVP 2 — Progression & tension (le moteur d'assiduité)

**Objectif :** donner des raisons de revenir et de tenir dans la durée.

**Périmètre :**
- Contrats permanents (habitudes) + streaks.
- Réputation par faction (gain par contrat, perte sur streak cassé, paliers).
- Contrats à risque (miser des crédits).
- Caisses : 3 qualités (standard / sécurisée / Black ICE), rituel d'ouverture,
  tables de probabilités affichées.
- Inventaire cosmétiques + paliers de rareté + équipement.
- Système de pity + fragments (anti-doublon) + caisse quotidienne/hebdo.

## MVP 3 — Rétention profonde & identité (le complétionnisme)

**Objectif :** polish, méta-jeu, statut et identité.

**Périmètre :**
- Catalogue cosmétiques complet (thèmes, skins, avatars, particules, sons,
  bannières).
- Aperçu de collection (« 3 légendaires restants dans le pool »).
- Achievements (dont cachés), saisons, drops mythiques / corrupted.
- Profil / ID runner (avatar, titre, faction, bannière).
- Polish animations & sons, respect de `prefers-reduced-motion`, installabilité
  PWA soignée.

## Contraintes permanentes (dès le MVP 1)

- Ajouter une tâche prend 2 secondes ; la gamification ne gêne jamais l'usage
  de base.
- Aucun cosmétique ne donne d'avantage fonctionnel.
- Le hasard reste toujours indexé sur l'effort, jamais accélérable par paiement.
- Local-first, hors-ligne, mono-utilisateur, pas de backend au départ.

---

## Roadmap produit — pivot #022 (19/07/2026)

> Remplace, à partir du pivot, les MVP 2/3 historiques ci-dessus (gelés). Vision &
> principes P1–P8 : `docs/vision-plateforme.md`. Chaque tranche de Phase A = une US
> (numérotation US-020+), portes de validation maintenues.

### Phase A — Jeu solo, local-first, sans backend
*Objectif : prouver que le builder est fun, à coût d'infra nul.*

- **A1 — Noyau du builder (squelette vertical)** : une ressource (`cycles`), un
  générateur de base, action manuelle « hack », dépense → 2ᵉ générateur. Boucle
  produire → dépenser → produire-plus. **Porte de vérité : est-ce satisfaisant ?**
- **A2 — Daemons & automatisation** : générateurs automatiques (daemons), montée
  exponentielle, upgrades. Le jeu tourne seul, on optimise.
- **A3 — 2ᵉ couche + arbre de déblocage** : nouvelle ressource/mécanique qui
  **recadre** le jeu (1ᵉʳ effet Paperclips) + 1ᵉʳ **reveal caché** (P6).
- **A4 — Accélérateurs réels AU CHOIX** : un **catalogue** d'accélérateurs
  vérifiables (focus chronométré, podométrie, quiz…) parmi lesquels **le joueur
  choisit** celui qu'il exécute — **jamais imposé** (renforce P5). Livrer le
  **cadre extensible + 1-2 accélérateurs** d'abord, en ajouter au fil du temps.
- **A5 — Hors-ligne & temps écoulé** : production calculée au retour, sauvegarde
  locale robuste, embryon de **prestige/renaissance**. Le « reviens demain ».
- **A6 — Rebrancher le module perso** : to-do + habitudes + factions existants →
  accélérateurs perso + **économie privée**. Réutilise l'acquis.

### Phase B — Couche connectée (backend requis, après la preuve du fun)

- **B1** — Comptes/auth + sync local↔serveur + bascule **serveur-autoritatif** (compétitif).
- **B2** — Clans + deux classements + ligues/divisions.
- **B3** — Arènes vérifiables arbitrées serveur (quiz…) alimentant la compétition.
- **B4** — Saisons, événements, mondes partagés, reveals communautaires (serrures mondiales…).

> La Phase B réécrira les contraintes « local-first / mono-utilisateur » de
> `CLAUDE.md` et la section « Contraintes permanentes » ci-dessus — **pas avant**.
