---
name: recette
description: Déroule les critères d'acceptation de l'US en cours de Netrunner Tasks, consigne les résultats dans recettes.md et liste les bugs trouvés dans bugs.md.
---

# Skill `recette`

Vérifie une US contre ses critères d'acceptation et trace les résultats.

## Étapes

1. **Récupérer les critères**
   - Lire l'US active dans `us/US-XXX-*.md` (section critères d'acceptation) et
     `project/sprint-en-cours.md`.

2. **Dérouler chaque critère**
   - Pour chaque critère (action → résultat attendu), exécuter le test et
     comparer au résultat attendu.

3. **Consigner dans `project/recettes.md`**
   - Créer/compléter la section `US-XXX` avec le tableau des critères, le statut
     (`validé` / `échoué`) et la date (JJ/MM/AAAA).

4. **Lister les bugs**
   - Pour chaque critère échoué ou anomalie, ajouter une entrée dans
     `project/bugs.md` (id, description, gravité, statut `ouvert`, US liée).

5. **Synthèse**
   - Indiquer si l'US passe la recette (tous les critères validés) ou non, et
     proposer la suite (corriger, ou passer au commit via le skill `commit`).

## Rappels

- Un critère vague n'est pas recevable : exiger une formulation action → résultat.
- Ne pas cocher `validé` sans avoir réellement vérifié.
