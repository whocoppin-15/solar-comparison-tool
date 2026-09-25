# ⚡ Comparateur Spot & Cannibalisation Solaire

Un outil interactif hébergé sur **GitHub Pages** permettant d'analyser et de comparer les prix Day-Ahead du marché de l'électricité ainsi que le **facteur de cannibalisation solaire** à travers 20 zones géographiques européennes.

Les données sont extraites automatiquement depuis l'API officielle **ENTSO-E Transparency Platform** via **GitHub Actions**.

---

## 📌 Fonctionnalités

- **Visuel & Interactif** : Graphique dynamique alimenté par Chart.js permettant de comparer le profil horaire moyen entre deux pays.
- **Indicateurs Clés** :
  - **Baseload (€/MWh)** : Prix moyen de l'électricité sur l'ensemble des 24 heures de la journée.
  - **Prix Solaire (€/MWh)** : Prix moyen pendant la fenêtre de production photovoltaïque (10h00 – 17h00).
  - **Facteur de Cannibalisation** : Ratio entre le prix solaire et le prix baseload ($Prix_{solaire} / Prix_{baseload}$).
  - **Décote Solaire (%)** : Pourcentage de perte de valeur du solaire par rapport au baseload.
- **Extraction Automatique** : Tâche automatisée (Cron) déclenchée chaque jour à 06:00 UTC.
- **Extraction Personnalisée** : Déclenchement manuel via *Workflow Dispatch* pour choisir une plage de dates sur-mesure (ex: 1 mois ou 1 an).
- **20 Zones Européennes** : France (`FR`), Allemagne/Luxembourg (`DE_LU`), Espagne (`ES`), Belgique (`BE`), Pays-Bas (`NL`), Italie Nord (`IT_NORTH`), Suisse (`CH`), Autriche (`AT`), etc.

---

## 🛠️ Architecture du Projet

Le projet repose sur une chaîne de traitement automatisée et statique (*serverless*), structurée en 5 composants clés :

* **1. Source de Données (API ENTSO-E Transparency)**
  * Fournit les prix de l'électricité *Day-Ahead* heure par heure pour les pays européens.
  * Requiert une clé d'API sécurisée (`ENTSOE_API_KEY`).

* **2. Moteur d'Extraction & Calculs (`generate_data.py`)**
  * Script Python utilisant Pandas et la bibliothèque `entsoe-py`.
  * Télécharge les séries temporelles pour les 20 zones géographiques.
  * Rééchantillonne les données et calcule les indicateurs clés (Baseload, Prix Solaire 10h-17h, Facteur de Cannibalisation et Décote).
  * Génère le fichier structuré `data.json`.

* **3. Automate d'Exécution (`.github/workflows/daily_update.yml`)**
  * Workflow GitHub Actions s'exécutant automatiquement chaque jour à 06:00 UTC.
  * Permet le déclenchement manuel (*Workflow Dispatch*) pour extraire des périodes personnalisées (jusqu'à 1 an).
  * Injecte la clé API depuis GitHub Secrets et effectue le `commit`/`push` automatique de `data.json`.

* **4. Stockage Statique (`data.json`)**
  * Sert de base de données intermédiaire au format JSON.
  * Contient les dates de la période analysée et l'ensemble des profils horaires pour chaque pays.

* **5. Interface Graphique Front-End (`index.html` & `script.js`)**
  * Site web autonome hébergé sur GitHub Pages.
  * **`index.html`** : Contient la mise en page responsive, les menus déroulants de sélection des pays et les boutons d'action.
  * **`script.js`** : Interroge `data.json` via une requête HTTP (`fetch`), met à jour dynamiquement les cartes de métriques et trace les courbes comparatives à l'aide de **Chart.js**.
 
### 📂 Structure du Dépôt

```text
solar-comparison-tool/
├── .github/
│   └── workflows/
│       └── daily_update.yml  # Automatisation de l'extraction et mise à jour
├── data.json                 # Base de données JSON générée dynamiquement
├── generate_data.py          # Script Python d'extraction et calculs (Pandas / ENTSO-E)
├── index.html                # Interface utilisateur HTML5 / CSS3
├── script.js                 # Logique d'affichage et graphiques (Chart.js)
└── README.md                 # Documentation du projet

---

## 🧮 Méthodologie de Calcul

- **Période Solaire** : La plage horaire retenue pour la production solaire est **10:00 - 17:00** (8 heures au total).
- **Facteur de Cannibalisation ($FC$)** :
  $$FC = \frac{\bar{P}_{solaire}}{\bar{P}_{baseload}}$$
- **Décote (%)** :
  $$\text{Décote} = (1 - FC) \times 100$$

*Un facteur inférieur à 1,0 (ou une décote positive) indique un phénomène de cannibalisation : l'injection massive d'énergie solaire au milieu de la journée fait chuter les prix spot pendant les heures de production.*

---

## 🚀 Installation & Configuration

### 1. Prérequis
- Un compte GitHub avec GitHub Pages activé sur le dépôt.
- Une clé API gratuite demandée sur la [Plateforme ENTSO-E Transparency](https://transparency.entsoe.eu/).

### 2. Configuration du Secret GitHub
1. Va dans **Settings** > **Secrets and variables** > **Actions**.
2. Clique sur **New repository secret**.
3. **Nom** : `ENTSOE_API_KEY`
4. **Valeur** : Ta clé API brute (ex: `efad********************`).

### 3. Permissions du Workflow
1. Va dans **Settings** > **Actions** > **General**.
2. Dans la section **Workflow permissions**, coche **Read and write permissions**.
3. Sauvegarde.

---

## 🔄 Comment mettre à jour les données ?

### Automatique
Le workflow s'exécute automatiquement **tous les jours à 06:00 UTC** pour récupérer les données des 7 derniers jours.

### Manuel (Période personnalisée)
1. Sur le site web, clique sur **🔄 Lancer l'extraction ENTSO-E** (ou va dans l'onglet **Actions** de GitHub).
2. Sélectionne le workflow **Mise à jour des données ENTSO-E**.
3. Clique sur **Run workflow**.
4. *(Optionnel)* Renseigne une `start_date` et une `end_date` au format `YYYY-MM-DD` (ex: `2026-01-01` et `2026-08-31`).
5. Valide et attends 1 à 3 minutes.
6. Rafraîchis la page web (`Cmd + Shift + R` ou `Ctrl + F5`).
