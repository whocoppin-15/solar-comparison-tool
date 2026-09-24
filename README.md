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

Le projet repose sur une architecture statique légère, sans serveur permanent (*serverless*) :
