# Roadmap — Netrunner Tasks

> Fil directeur : **le vrai to-do rapide d'abord**, la gamification se superpose
> ensuite, la rétention (caisses / cosmétiques) en dernier. On ne construit
> jamais la couche N+1 avant que la couche N tourne.

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
