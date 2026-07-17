# Chantier — Internationalisation FR / EN

- **Type :** chantier fondation transverse (hors cycle US, comme la migration DS).
- **Priorité :** haute (à faire avant US-004 pour éviter le retrofit).
- **Statut :** fait
- **Branche :** feature/i18n-fr-en
- **Décisions PO :** bilingue complet tout de suite (FR + EN traduits, sélecteur
  fonctionnel) ; techno **react-i18next**.

## 1. Cadrage fonctionnel

- **Quoi :** rendre l'UI entièrement **bilingue FR/EN** — infrastructure i18n +
  externalisation de toutes les chaînes existantes + **sélecteur de langue** qui
  bascule l'app à chaud, choix **persisté**. Poser la règle « plus aucune chaîne
  d'UI en dur » pour toutes les US suivantes.
- **Pour qui :** l'utilisateur (FR ou EN) ; et le projet (fondation qui évite un
  retrofit coûteux plus tard).
- **Périmètre inclus :** infra react-i18next, catalogues FR + EN complets pour
  l'existant (écran Contrats), pluriels, détection initiale + persistance,
  sélecteur FR/EN.
- **Reporté (anti-dérapage) :**
  - **i18n des noms de factions par défaut** (ce sont des *données* seedées, pas
    de l'UI, et non affichées avant US-007) → traité en **US-007**.
  - **Formatage localisé des dates/nombres** → quand des dates seront affichées
    (US-004/005) ; la convention est posée ici (FR JJ/MM/AAAA, EN format local).
  - Textes par défaut des composants DS génériques (ex. placeholder de `Select`)
    → traités quand un écran les utilise (les consommateurs passent des libellés
    traduits).
- **Critères d'acceptation :**
  1. Un **sélecteur FR/EN** est visible ; le changer bascule **toute** l'UI de
     l'écran Contrats instantanément (overline, titre, compteur, placeholder,
     bouton, ligne d'aide, états vide/buffer, toast).
  2. Le **choix de langue persiste** après rechargement (F5).
  3. **Pluriels corrects** : « 1 CONTRAT / 2 CONTRATS » (FR) et « 1 CONTRACT /
     2 CONTRACTS » (EN).
  4. **Aucune chaîne d'UI en dur** dans `ContractsView` / `QuickAddContract`
     (tout via `t()`).
  5. Catalogues **FR et EN complets** pour l'existant — l'EN est une vraie
     réécriture in-world (ton netrunner), pas du mot-à-mot.
  6. **Langue initiale** : détectée depuis le navigateur si dispo, sinon
     **repli FR**.
  7. Pas de régression : `typecheck` + `lint` + `build` OK.

## 2. Cadrage technique

> Code et **clés de traduction en anglais** (ex. `contracts.title`) ; valeurs =
> traductions. Commentaires FR.

### Fichiers impactés

- `package.json` — + `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- `src/i18n/index.ts` **(nouveau)** — init i18next (namespaces `common` +
  `contracts`, ressources FR/EN, détecteur `localStorage`→`navigator`, repli FR).
- `src/i18n/locales/{fr,en}/{common,contracts}.json` **(nouveaux)** — catalogues.
- `src/main.tsx` — `import './i18n'` avant le rendu.
- `src/features/contracts/ContractsView.tsx`, `QuickAddContract.tsx` —
  `useTranslation`, remplacement des chaînes par `t()` (+ pluriel du compteur).
- `src/features/common/LanguageSwitcher.tsx` **(nouveau)** — sélecteur FR|EN.
- `docs/conventions.md` — règle « UI via i18n, zéro chaîne en dur ».
- `docs/decisions.md` — décision #010.
- `docs/architecture.md` — arborescence `src/i18n/`.

### Logique

- **Init** : i18next + `initReactI18next`, `fallbackLng: 'fr'`, détecteur ordre
  `['localStorage','navigator']`, clé `localStorage` dédiée. Pluriels natifs
  i18next (clés `_one` / `_other`).
- **Sélecteur** : `LanguageSwitcher` → `i18n.changeLanguage('fr'|'en')` ; le
  détecteur persiste le choix en `localStorage`. Deux boutons segmentés FR | EN
  (styles DS), l'actif en néon cyan.
- **Interpolation** : compteur buffer via `t('contracts.buffer', { count })`.

### Impacts modèle de données

**Aucun** (l'i18n des données — noms de factions — est reporté à US-007).

## 3. Design

Élément UI unique et léger : le **sélecteur FR|EN**, placé en **haut à droite de
l'en-tête** de l'écran Contrats (l'app-shell qui l'hébergera à terme est différé
à US-010). Deux pastilles segmentées « FR | EN » façon HUD, actif en néon.
**Proposé en design inline** (pas de maquette Claude Design dédiée vu la taille)
— à confirmer par le PO.

## 4. Plan d'implémentation

1. Installer `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
2. `src/i18n/index.ts` + catalogues FR/EN (`common`, `contracts`).
3. Externaliser `ContractsView` + `QuickAddContract` (t() + pluriel/interpolation).
4. `LanguageSwitcher` + intégration dans l'en-tête de `ContractsView`.
5. `main.tsx` : importer l'i18n.
6. Docs : conventions, décision #010, architecture.
7. Vérif (typecheck/lint/build) + recette (bascule à chaud, persistance F5,
   pluriels, détection initiale).
