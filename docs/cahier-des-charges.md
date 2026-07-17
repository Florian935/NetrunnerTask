# Netrunner Tasks — Cahier des charges

## 1. Vision

Un gestionnaire de tâches et d'habitudes qui prend la forme d'un jeu de rôle
cyberpunk. L'utilisateur incarne un netrunner freelance : ses tâches réelles
deviennent des contrats à remplir, sa productivité alimente une progression
(niveaux, réputation, cosmétiques). L'objectif est de rendre une corvée
quotidienne — gérer sa vie — désirable, grâce à une esthétique néon/terminal
immersive et une boucle de récompense soignée.

**Principe fondateur** : sous la couche RPG, ça reste un vrai outil de
productivité efficace. Le jeu ne doit jamais gêner l'usage de base. Règle d'or —
ajouter une tâche prend 2 secondes, la gamification vient après.

## 2. Utilisateur cible

Personnes qui veulent s'organiser mais décrochent des to-do lists classiques par
manque de motivation. Sensibles à l'esthétique et à la progression type jeu.
Usage individuel, plusieurs ouvertures par jour.

## 3. Boucle de gameplay principale

1. L'utilisateur crée une tâche → elle devient un **contrat** avec un niveau de
   difficulté (trivial → légendaire) qui détermine la récompense.
2. Il termine le contrat → animation de « hack réussi », gain de **crédits** et
   **XP**.
3. Crédits et XP alimentent la progression : niveau de netrunner, réputation
   auprès des **factions** (= catégories de vie), déblocage de **cosmétiques**.
4. Les habitudes récurrentes = **contrats permanents** avec un **streak**.
   Casser un streak fait baisser la réputation → tension motivante.
5. Certains accomplissements génèrent des **caisses** à ouvrir → cœur de la
   rétention (voir §7).

## 4. Module de fond : le vrai to-do

Sans surcouche, l'app est un gestionnaire complet et rapide :

- Création rapide de tâche (2 secondes, la gamification s'ajoute automatiquement).
- Priorités, échéances, récurrence, sous-tâches.
- Catégories = factions (boulot, sport, perso, santé, apprentissage…).
- Contrats à difficulté ajustable, déterminant la récompense.
- **Contrats à risque** : miser des crédits sur une tâche difficile → réussie =
  gros bonus, ratée = perte de la mise. Responsabilise sur les tâches qu'on
  repousse.

## 5. Système de progression

- **Niveau de netrunner** : progression globale via l'XP.
- **Crédits** : monnaie gagnée en terminant des contrats, utilisée pour les
  mises à risque et (plus tard) certains achats cosmétiques par l'effort.
- **Réputation par faction** : chaque catégorie de vie a sa jauge, alimentée par
  les contrats de cette catégorie, entamée par les streaks cassés. Atteindre la
  réputation max sur une faction débloque des récompenses dédiées.
- **Streaks** : compteurs de régularité sur les contrats permanents, moteur
  d'assiduité.

## 6. Système de cosmétiques

Aucun cosmétique ne donne d'avantage fonctionnel. Ce sont des marqueurs de
statut et d'identité — un légendaire raconte un effort réel, pas un paiement.

**Catégories** : thèmes de terminal (palettes néon, scanlines, glow) · skins
d'interface (cadres de contrats, animations de complétion, curseurs, polices) ·
avatars / ID runner (portrait glitché, faction, titre) · effets de particules &
sons · bannières de profil (pour dimension sociale future).

**Paliers de rareté** :

| Palier | Couleur | Source type |
|---|---|---|
| Commun | Gris | Progression simple (niv. 1-10) |
| Rare | Bleu | Jalons modérés (streak 30j, 100 contrats) |
| Épique | Violet | Accomplissements exigeants (streak 90j, réput. max faction) |
| Légendaire | Or | Très rares (streak 200j+, saisons, achievements cachés) |
| Mythique / « Corrupted » | Glitch animé | Quasi introuvables (1 an de streak, drops très faibles sur caisses méritées) |

## 7. Système de hasard (pilier de rétention)

Le hasard est central, mais **toujours indexé sur l'effort réel** — jamais
accélérable par de l'argent.

**Trois qualités de caisses** :

- **Cache standard** — fréquente (contrat terminé avec streak, journée
  productive). Communs/rares, petite chance d'épique.
- **Cache sécurisée** — effort notable (semaine parfaite, contrat à risque
  réussi). Rares/épiques, vraie chance de légendaire.
- **Cache Black ICE** — événement/exploit rare (streak record, achievement
  caché, saison). Seul endroit où le mythique tombe.

**Tables de probabilités** : toujours affichées à l'utilisateur. Exemple
indicatif cache sécurisée → commun 50 %, rare 30 %, épique 15 %, légendaire
4,5 %, mythique 0,5 % (à ajuster au playtest).

**Mécaniques de rétention** :

- **Rituel d'ouverture** : animation de déchiffrement montant en tension,
  révélation progressive de la rareté par couleur/son. Le moment de dopamine —
  soigné à chaque ouverture.
- **Système de pity** : compteur visible garantissant un légendaire après X
  caisses sans, par type de caisse.
- **Fragments (anti-doublon)** : un doublon se dissout en fragments de sa
  rareté ; X fragments = craft du cosmétique exact choisi. Le hasard nourrit
  toujours une progression choisie.
- **Caisse quotidienne/hebdo à réclamer** : raison de revenir chaque jour, liée
  à l'ouverture de l'app (voir ses contrats du jour).
- **Aperçu de collection** : « il te reste 3 légendaires dans le pool » — moteur
  de complétionnisme.

**Garde-fou éthique** : le hasard ne peut jamais être accéléré par de l'argent,
uniquement par l'effort dans l'app. Limite à ne jamais franchir lors de la
future monétisation.

## 8. Écrans principaux

- **Tableau de bord / HUD** : contrats du jour, streaks actifs, niveau, caisse
  quotidienne à réclamer.
- **Liste des contrats** : vue to-do complète, filtrage par faction, ajout
  rapide.
- **Détail contrat** : difficulté, mise à risque, sous-tâches, récurrence.
- **Progression** : niveau netrunner, jauges de réputation par faction.
- **Inventaire / vitrine cosmétiques** : collection, équipement, fragments, pool
  restant.
- **Ouverture de caisses** : le rituel d'ouverture.
- **Profil / ID runner** : avatar, titre, faction, bannière.

## 9. Direction artistique

Esthétique cyberpunk : néons (cyan, magenta, ambre corpo, vert phosphore),
interface type terminal, scanlines, effets glow / glitch. L'esthétique renforce
la fonction (immersion, statut) plutôt que d'être plaquée. Référence de design :
dossier `design-system/` (voir `design-system/HANDOFF.md`). Le design system
pose les bases ; des ajustements visuels seront faits à l'implémentation des
maquettes.

## 10. Monétisation

**Reportée.** Focus gameplay d'abord. Contrainte à respecter dès maintenant pour
ne pas se fermer de portes : tous les cosmétiques de mérite doivent rester
gagnables gratuitement, et le hasard ne devra jamais être accélérable par
paiement.

## 11. Pile technique (indicatif)

Web d'abord : React + TypeScript, Vite, Tailwind, Zustand (état),
Dexie/IndexedDB (stockage local hors-ligne, pas de backend au départ).
Emballable ensuite en PWA (mobile) ou Tauri (desktop) sans réécriture.
