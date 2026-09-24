let chartInstance = null;
let globalData = null;

// Initialisation au chargement de la page
async function init() {
  try {
    const response = await fetch('data.json');
    globalData = await response.json();

    // Configuration des dates par défaut selon data.json
    if (globalData.period) {
      document.getElementById('start-date').value = globalData.period.start;
      document.getElementById('end-date').value = globalData.period.end;
    }

    // Écouteurs d'événements sur les widgets
    document.getElementById('country1').addEventListener('change', updateView);
    document.getElementById('country2').addEventListener('change', updateView);
    document.getElementById('enable-compare').addEventListener('change', toggleCompare);
    document.getElementById('start-date').addEventListener('change', updateView);
    document.getElementById('end-date').addEventListener('change', updateView);

    // Premier rendu
    updateView();
  } catch (error) {
    console.error("Erreur lors de l'initialisation :", error);
  }
}

function toggleCompare() {
  const isChecked = document.getElementById('enable-compare').checked;
  document.getElementById('country2').disabled = !isChecked;
  updateView();
}

function updateView() {
  if (!globalData || !globalData.zones) return;

  const c1Key = document.getElementById('country1').value;
  const isCompareEnabled = document.getElementById('enable-compare').checked;
  const c2Key = document.getElementById('country2').value;

  const zone1 = globalData.zones[c1Key];
  const zone2 = isCompareEnabled ? globalData.zones[c2Key] : null;

  // 1. Mise à jour des cartes de statistiques / métriques
  const metricsDiv = document.getElementById('metrics-container');
  let metricsHTML = '';

  if (zone1) {
    metricsHTML += `
      <div class="metric-card">
        <div class="metric-title">📍 ${c1Key}</div>
        <div class="metric-val">Baseload : <b>${zone1.baseload} €/MWh</b></div>
        <div class="metric-val">Prix Solaire : <b>${zone1.solar_price} €/MWh</b></div>
        <div class="metric-val">Cannibalisation : <b>${zone1.facteur_cannibalisation}</b> (${zone1.decote_pct}% décote)</div>
      </div>
    `;
  }

  if (zone2) {
    metricsHTML += `
      <div class="metric-card secondary">
        <div class="metric-title">📍 ${c2Key}</div>
        <div class="metric-val">Baseload : <b>${zone2.baseload} €/MWh</b></div>
        <div class="metric-val">Prix Solaire : <b>${zone2.solar_price} €/MWh</b></div>
        <div class="metric-val">Cannibalisation : <b>${zone2.facteur_cannibalisation}</b> (${zone2.decote_pct}% décote)</div>
      </div>
    `;
  }

  metricsDiv.innerHTML = metricsHTML;

  // 2. Préparation des jeux de données pour Chart.js
  const datasets = [];

  if (zone1) {
    datasets.push({
      label: `${c1Key} (${zone1.baseload} €/MWh)`,
      data: zone1.prices,
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.08)',
      fill: true,
      borderWidth: 2,
      tension: 0.2
    });
  }

  if (zone2) {
    datasets.push({
      label: `${c2Key} (${zone2.baseload} €/MWh)`,
      data: zone2.prices,
      borderColor: '#fd7e14',
      backgroundColor: 'rgba(253, 126, 20, 0.08)',
      fill: true,
      borderWidth: 2,
      tension: 0.2
    });
  }

  // 3. Rendu du Graphique
  const ctx = document.getElementById('comparisonChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy(); // Réinitialise l'ancien graphique avant de dessiner
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: zone1 ? zone1.labels : [],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { title: { display: true, text: 'Heure de la journée' } },
        y: { title: { display: true, text: 'Prix Spot (€/MWh)' } }
      }
    }
  });
}

init();            borderWidth: 2,
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
