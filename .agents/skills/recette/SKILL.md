---
name: recette
description: Vérifie une user story Netrunner Tasks contre ses critères d'acceptation et consigne les résultats. Utiliser lorsque l'utilisateur demande la recette de l'US en cours ou la validation de ses critères.
---

# Recetter une US

Vérifier chaque critère avec des preuves réelles. Ne jamais marquer un contrôle
comme validé s'il n'a pas été exécuté ou observé.

## 1. Récupérer le périmètre

- Lire `AGENTS.md`, `project/sprint-en-cours.md` et le fichier
  `us/US-XXX-*.md` de l'US active.
- Extraire tous les critères d'acceptation et relever ceux qui ne sont pas
  formulés comme une action suivie d'un résultat attendu.
- Demander une reformulation si un critère vague empêche une vérification
  objective.

## 2. Exécuter la recette

- Tester chaque critère avec la méthode pertinente : test automatisé, commande,
  inspection ciblée ou vérification manuelle par le PO.
- Distinguer clairement les contrôles exécutés de ceux qui nécessitent encore
  une observation humaine.
- Comparer le résultat réel au résultat attendu et conserver les éléments de
  preuve utiles.

## 3. Consigner les résultats

- Créer ou compléter la section de l'US dans `project/recettes.md`.
- Pour chaque critère, noter `validé`, `échoué` ou `en attente`, la date au
  format `JJ/MM/AAAA` et une preuve concise. Réserver `en attente` aux
  contrôles non exécutés ou nécessitant encore une observation humaine.
- Pour chaque échec ou anomalie, ajouter une entrée dans `project/bugs.md` avec
  identifiant, description, gravité, statut `ouvert` et US liée.
- Mettre immédiatement `project/sprint-en-cours.md` en accord avec l'étape
  réellement atteinte.

## 4. Faire la synthèse

- Déclarer la recette réussie seulement si tous les critères sont validés.
- Sinon, lister les écarts et proposer leur correction.
- Si tout est validé, proposer de poursuivre avec le skill `$commit`, sans
  l'exécuter tant que l'utilisateur ne l'a pas demandé explicitement.
