# Dossier `us/` — Cadrage des User Stories

Un fichier par US, nommé `US-XXX-nom-court.md` (ex. `US-001-init-projet.md`).

Chaque fichier suit le cycle de vie défini dans `CLAUDE.md` §3 :

1. **Cadrage fonctionnel** — quoi / pour qui / critères d'acceptation testables.
2. **Cadrage technique** — fichiers impactés, logique, impacts modèle de données.
3. **Design** (si impact UI significatif) — écrans concernés, lien maquette.
4. **Plan d'implémentation** — étapes concrètes.

## Gabarit d'une US

```markdown
# US-XXX — Titre

- **MVP :** 1 / 2 / 3
- **Priorité :** haute / moyenne / basse
- **Statut :** à faire / en cours / fait
- **Branche :** feature/US-XXX-nom

## 1. Cadrage fonctionnel  _(porte de validation)_

- **Quoi :**
- **Pour qui :**
- **Critères d'acceptation :** (action → résultat attendu, vérifiables)
  1.

## 2. Cadrage technique  _(porte de validation)_

- **Fichiers impactés :**
- **Logique :**
- **Impacts modèle de données :**

## 3. Design  _(porte de validation, si impact UI significatif)_

- **Écrans concernés :**
- **Maquette :**

## 4. Plan d'implémentation  _(porte de validation)_

1.
```
