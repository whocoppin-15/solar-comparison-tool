async function initComparator() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();

    const fr = data.zones.FR;
    const de = data.zones.DE_LU;

    // 1. Affichage des Métriques
    const metricsDiv = document.getElementById('metrics-container');
    metricsDiv.innerHTML = `
      <div class="metric-box">
        <strong>France (FR)</strong><br>
        Baseload: ${fr.baseload} €/MWh<br>
        Facteur Cannibalisation: <b>${fr.facteur_cannibalisation}</b> (${fr.decote_pct}% décote)
      </div>
      <div class="metric-box" style="border-color: #ff7f0e;">
        <strong>Allemagne (DE_LU)</strong><br>
        Baseload: ${de.baseload} €/MWh<br>
        Facteur Cannibalisation: <b>${de.facteur_cannibalisation}</b> (${de.decote_pct}% décote)
      </div>
    `;

    // 2. Tracé du Graphique Chart.js
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: fr.labels,
        datasets: [
          {
            label: `France Spot (${fr.baseload} €)`,
            data: fr.prices,
            borderColor: '#1f77b4',
            backgroundColor: 'rgba(31, 119, 180, 0.1)',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.2
          },
          {
            label: `Allemagne Spot (${de.baseload} €)`,
            data: de.prices,
            borderColor: '#ff7f0e',
            backgroundColor: 'rgba(255, 127, 14, 0.1)',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Profil des Prix Moyens (${data.period.start} au ${data.period.end})`
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Heure de la journée' }
          },
          y: {
            title: { display: true, text: 'Prix Spot (€/MWh)' }
          }
        }
      }
    });

  } catch (error) {
    console.error("Erreur de chargement des données JSON:", error);
  }
}

initComparator();