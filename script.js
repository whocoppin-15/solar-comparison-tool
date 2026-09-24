let chartInstance = null;
let globalData = null;

async function init() {
  const container = document.getElementById('metrics-container');
  
  try {
    // Forcer le rechargement sans cache
    const response = await fetch('data.json?t=' + new Date().getTime());
    if (!response.ok) throw new Error("Fichier data.json introuvable (404)");
    
    globalData = await response.json();
    console.log("Données chargées avec succès :", globalData);

    if (globalData.period) {
      if (document.getElementById('start-date')) document.getElementById('start-date').value = globalData.period.start;
      if (document.getElementById('end-date')) document.getElementById('end-date').value = globalData.period.end;
    }

    // Écouteurs sur les sélecteurs
    ['country1', 'country2', 'enable-compare', 'start-date', 'end-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateView);
    });

    updateView();
  } catch (error) {
    console.error("Erreur d'initialisation :", error);
    if (container) {
      container.innerHTML = `<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 8px;">
        ⚠️ <b>Impossible de charger les données :</b> ${error.message}
      </div>`;
    }
  }
}

function updateView() {
  if (!globalData || !globalData.zones) return;

  const c1Select = document.getElementById('country1');
  const c2Select = document.getElementById('country2');
  const compareCheckbox = document.getElementById('enable-compare');

  const c1Key = c1Select ? c1Select.value : 'FR';
  const isCompare = compareCheckbox ? compareCheckbox.checked : false;
  const c2Key = c2Select ? c2Select.value : 'DE_LU';

  if (c2Select) c2Select.disabled = !isCompare;

  const zone1 = globalData.zones[c1Key];
  const zone2 = isCompare ? globalData.zones[c2Key] : null;

  // 1. Affichage des Métriques
  const metricsDiv = document.getElementById('metrics-container');
  let metricsHTML = '';

  if (zone1) {
    metricsHTML += `
      <div class="metric-card" style="border-left: 4px solid #0d6efd; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
        <div style="font-weight: bold; font-size: 1.1rem;">📍 ${c1Key}</div>
        <div>Baseload : <b>${zone1.baseload} €/MWh</b></div>
        <div>Prix Solaire : <b>${zone1.solar_price} €/MWh</b></div>
        <div>Cannibalisation : <b>${zone1.facteur_cannibalisation}</b> (${zone1.decote_pct}% décote)</div>
      </div>
    `;
  } else {
    metricsHTML += `<div style="padding: 1rem; background: #fff3cd; border-radius: 8px;">⚠️ Pas de données disponibles pour <b>${c1Key}</b> dans data.json</div>`;
  }

  if (isCompare) {
    if (zone2) {
      metricsHTML += `
        <div class="metric-card" style="border-left: 4px solid #fd7e14; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <div style="font-weight: bold; font-size: 1.1rem;">📍 ${c2Key}</div>
          <div>Baseload : <b>${zone2.baseload} €/MWh</b></div>
          <div>Prix Solaire : <b>${zone2.solar_price} €/MWh</b></div>
          <div>Cannibalisation : <b>${zone2.facteur_cannibalisation}</b> (${zone2.decote_pct}% décote)</div>
        </div>
      `;
    } else {
      metricsHTML += `<div style="padding: 1rem; background: #fff3cd; border-radius: 8px;">⚠️ Pas de données disponibles pour <b>${c2Key}</b> dans data.json</div>`;
    }
  }

  if (metricsDiv) metricsDiv.innerHTML = metricsHTML;

  // 2. Traçage du Graphique Chart.js
  const canvas = document.getElementById('comparisonChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const datasets = [];

  if (zone1) {
    datasets.push({
      label: `${c1Key} (${zone1.baseload} €/MWh)`,
      data: zone1.prices,
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      fill: true,
      tension: 0.2
    });
  }

  if (zone2) {
    datasets.push({
      label: `${c2Key} (${zone2.baseload} €/MWh)`,
      data: zone2.prices,
      borderColor: '#fd7e14',
      backgroundColor: 'rgba(253, 126, 20, 0.1)',
      fill: true,
      tension: 0.2
    });
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = zone1 ? zone1.labels : (zone2 ? zone2.labels : []);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Heure de la journée' } },
        y: { title: { display: true, text: 'Prix Spot (€/MWh)' } }
      }
    }
  });
}

// Lancement au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
