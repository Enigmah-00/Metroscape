// ===================================
// Metroscape dashboard script (merged & improved)
// ===================================

// ---------- DATA & CONFIG ----------
const indexHistory = {
  air: [7, 8, 8, 9, 8, 7, 6.5],
  water: [6, 6, 7, 6, 6, 5, 5.2],
  noise: [4, 5, 5, 5, 4, 4, 3.8],
  human: [62, 61, 60, 59, 58, 57, 58.5]
};
const idealIndex = {
  air: [5,5,5,5,5,5,5],
  water: [5,5,5,5,5,5,5],
  noise: [3,3,3,3,3,3,3],
  human: [70,70,70,70,70,70,70]
};
const ndviData = [0.45,0.47,0.44,0.5,0.52,0.48,0.55];
const waterResData = [85,82,80,78,75,72,70];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

const indexData = {
  air: indexHistory.air.at(-1),
  water: indexHistory.water.at(-1),
  noise: indexHistory.noise.at(-1),
  human: indexHistory.human.at(-1)
};

// ---------- GLOBAL CHART DEFAULTS (white fonts) ----------
Chart.defaults.color = '#ffffff';
Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.color = '#ffffff';

// helper to build context
function getCtx(id) {
  const el = document.getElementById(id);
  return el ? el.getContext('2d') : null;
}

// ---------- CHARTS ----------
// Insights chart
const insightsCtx = getCtx('insightsChart');
const insightsChart = new Chart(insightsCtx, {
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'Actual Index',
      data: [],
      borderColor: '#f0e050',
      backgroundColor: 'rgba(240,224,80,0.08)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }, {
      label: 'Ideal Index',
      data: [],
      borderColor: '#5080e0',
      backgroundColor: 'rgba(80,128,224,0.08)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } }
    }
  }
});

// Green chart
const greenCtx = getCtx('greenChart');
const greenChart = new Chart(greenCtx, {
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'NDVI (Green Cover)',
      data: ndviData.slice(),
      borderColor: '#40e0a0',
      backgroundColor: 'rgba(64,224,160,0.12)',
      fill: true, tension: 0.3
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } }
    }
  }
});

// Water reservoir chart
const waterCtx = getCtx('waterResChart');
const waterResChart = new Chart(waterCtx, {
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'Reservoir Level (%)',
      data: waterResData.slice(),
      borderColor: '#5080e0',
      backgroundColor: 'rgba(80,128,224,0.12)',
      fill: true, tension: 0.3
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' }, min: 0, max: 100 }
    }
  }
});

// Mobility chart
const mobilityCtx = getCtx('mobilityChart');
const mobilityChart = new Chart(mobilityCtx, {
  type: 'line',
  data: {
    labels: months.slice(),
    datasets: [{
      label: 'Air Quality (µg/m³)',
      data: [120, 115, 110, 105, 100, 95, 90],
      borderColor: '#f0e050',
      backgroundColor: 'rgba(240,224,80,0.12)',
      fill: true, tension: 0.3
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#ffffff' } }
    }
  }
});

// Sustainability gauge
const sustainCtx = getCtx('sustainabilityGauge');
let sustainabilityScore = calculateSustainability();
const sustainChart = new Chart(sustainCtx, {
  type: 'doughnut',
  data: {
    labels: ['Score','Remaining'],
    datasets: [{
      data: [sustainabilityScore, 100 - sustainabilityScore],
      backgroundColor: ['#f0e050','rgba(255,255,255,0.06)'],
      borderWidth: 0
    }]
  },
  options: {
    cutout: '80%', rotation: 270, circumference: 180,
    plugins: { tooltip: { enabled: false }, legend: { display: false } }
  }
});

// ---------- CORE LOGIC ----------
function updateInsightsChart(idx) {
  insightsChart.data.datasets[0].data = indexHistory[idx].slice();
  insightsChart.data.datasets[1].data = idealIndex[idx].slice();
  insightsChart.update();
  const analysisText = analyzeIndexComparison(idx);
  const el = document.getElementById('indexAnalysis');
  el.textContent = analysisText.text;
  el.className = `analysis-text ${analysisText.class}`;
}

function analyzeIndexComparison(index) {
  const lastActual = indexHistory[index].at(-1);
  const lastIdeal = idealIndex[index].at(-1);
  let text = "";
  let classType = "good";
  if (index === "air" && lastActual > lastIdeal) {
    text = "⚠️ Air pollution is above ideal. Take action to improve air quality.";
    classType = "warning";
  } else if (index === "water" && lastActual > lastIdeal) {
    text = "⚠️ Water pollution exceeds ideal levels. Risk of waterborne diseases.";
    classType = "warning";
  } else if (index === "noise" && lastActual > lastIdeal) {
    text = "⚠️ Noise pollution is above ideal. Potential for health stress.";
    classType = "warning";
  } else if (index === "human" && lastActual < lastIdeal) {
    text = "⚠️ Human Health Index is low. Strengthen economy and healthcare.";
    classType = "critical";
  } else {
    text = index === "human" ? "✅ Human Health Index is healthy." : "✅ All good. " + index.charAt(0).toUpperCase() + index.slice(1) + " quality is within ideal range.";
  }
  return { text, class: classType };
}

// Climate simulation
function updateClimateSimulation() {
  const tempAnomaly = parseFloat(document.getElementById('temp-slider').value);
  const rainfallIncrease = parseInt(document.getElementById('rainfall-slider').value);
  document.getElementById('tempValue').textContent = `${tempAnomaly}°C`;
  document.getElementById('rainfallValue').textContent = `${rainfallIncrease}%`;
  const riskScore = (tempAnomaly * 10) + (rainfallIncrease / 5);
  let title = "Low Risk Scenario";
  let message = "This climate scenario poses minimal risks to urban infrastructure and health.";
  let classType = "good";
  if (riskScore > 30) {
    title = "⚠️ High Risk Scenario";
    message = `A ${tempAnomaly}°C temperature rise and ${rainfallIncrease}% rainfall increase could lead to heat stress, power grid failures, and urban flooding.`;
    classType = "critical";
  } else if (riskScore > 15) {
    title = "⚠️ Moderate Risk Scenario";
    message = `This scenario presents increased risk of infrastructure stress and localized flooding. Prepare for more frequent heatwaves.`;
    classType = "warning";
  }
  const t = document.getElementById('climateTitle');
  const m = document.getElementById('climateMessage');
  t.textContent = title; m.textContent = message; t.className = classType;
}

// Infrastructure
function updateInfrastructureImpact() {
  const infraType = document.getElementById('infraType').value;
  const tempAnomaly = parseFloat(document.getElementById('temp-slider').value);
  const rainfallIncrease = parseInt(document.getElementById('rainfall-slider').value);
  let title = '', message = '', classType = 'good';
  if (infraType === 'residential') {
    if (tempAnomaly > 2 || rainfallIncrease > 40) {
      title = "⚠️ High Vulnerability";
      message = "New residential buildings may face structural stress from heat and increased flood risk. Review building codes.";
      classType = "critical";
    } else {
      title = "✅ Resilient";
      message = "This residential project is designed to withstand a moderate climate shift.";
    }
  } else if (infraType === 'commercial') {
    if (tempAnomaly > 3 || rainfallIncrease > 60) {
      title = "⚠️ High Vulnerability";
      message = "Commercial infrastructure is vulnerable to power outages and supply chain disruptions from extreme weather.";
      classType = "critical";
    } else {
      title = "✅ Resilient";
      message = "Commercial project is well-suited for a changing climate, with backup systems in place.";
    }
  } else if (infraType === 'transport') {
    if (tempAnomaly > 1 || rainfallIncrease > 20) {
      title = "⚠️ High Vulnerability";
      message = "Transport hubs are highly susceptible to flooding and heat-related track damage. Review drainage and cooling.";
      classType = "critical";
    } else {
      title = "✅ Resilient";
      message = "Transport hub is built for climate resilience, minimizing service disruptions.";
    }
  }
  const t = document.getElementById('infraTitle'), m = document.getElementById('infraMessage');
  t.textContent = title; m.textContent = message; t.className = classType;
}

// Mobility & air quality
function updateMobility() {
  const trafficDensity = parseInt(document.getElementById('traffic-slider').value);
  const evAdoption = parseInt(document.getElementById('ev-slider').value);
  document.getElementById('trafficValue').textContent = `${trafficDensity}%`;
  document.getElementById('evValue').textContent = `${evAdoption}%`;
  // a simple model: base 150 reduced by traffic and EV adoption
  const airQuality = Math.max(10, Math.round(150 - (trafficDensity * 0.5) - (evAdoption * 0.7)));
  // update last point instead of appending repeatedly (keeps dataset length consistent)
  const ds = mobilityChart.data.datasets[0].data;
  ds[ds.length - 1] = airQuality;
  mobilityChart.update();
}

// Green analysis
function analyzeGreen() {
  const last = ndviData.at(-1);
  const analysisElement = document.getElementById('greenAnalysis');
  if (last > 0.5) {
    analysisElement.textContent = "✅ Green cover is healthy. This helps regulate heat and reduce flooding risk.";
    analysisElement.className = 'analysis-text good';
  } else {
    analysisElement.textContent = "⚠️ Green cover is below ideal. Prioritize reforestation and urban parks to improve climate resilience.";
    analysisElement.className = 'analysis-text warning';
  }
}

// Water resource analysis
function analyzeWaterRes() {
  const last = waterResData.at(-1);
  const analysisElement = document.getElementById('waterResAnalysis');
  if (last > 60) {
    analysisElement.textContent = "✅ Water levels are stable. The city has a good supply, but conservation is key.";
    analysisElement.className = 'analysis-text good';
  } else if (last < 40) {
    analysisElement.textContent = "⚠️ Water levels are low. The city is facing water stress. Implement conservation measures.";
    analysisElement.className = 'analysis-text critical';
  } else {
    analysisElement.textContent = "⚠️ Water levels are declining. A medium risk of water scarcity exists.";
    analysisElement.className = 'analysis-text warning';
  }
}

// Sustainability score
function calculateSustainability() {
  const air = Math.max(0, 100 - (indexData.air * 10));
  const water = Math.max(0, 100 - (indexData.water * 10));
  const noise = Math.max(0, 100 - (indexData.noise * 10));
  const human = indexData.human;
  const green = ndviData.at(-1) * 100;
  const waterRes = waterResData.at(-1);
  const score = Math.round((air + water + noise + human + green + waterRes) / 6);
  return score;
}

function updateSustainabilityGauge() {
  const score = calculateSustainability();
  sustainChart.data.datasets[0].data = [score, 100 - score];
  sustainChart.update();
  const textElement = document.getElementById('sustainabilityText');
  let text = '';
  if (score > 80) text = `${score} — Excellent`;
  else if (score > 60) text = `${score} — Good`;
  else if (score > 40) text = `${score} — Average`;
  else text = `${score} — Poor`;
  textElement.textContent = text;
}

// ---------- MAP ----------
const map = L.map('map', { zoomControl: true }).setView([23.8103, 90.4125], 12);
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let gibsLayer = null;
const gibsTemplate = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2025-08-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';

const hotspots = [
  { lat: 23.82, lon: 90.41, type: 'air', desc: 'High Air Pollution' },
  { lat: 23.81, lon: 90.42, type: 'water', desc: 'Contaminated Water' },
  { lat: 23.815, lon: 90.41, type: 'noise', desc: 'Noise Level > 80dB' },
  { lat: 23.805, lon: 90.425, type: 'disaster', desc: 'Flood Risk Zone' },
  { lat: 23.818, lon: 90.405, type: 'health', desc: 'Hospital' }
];
hotspots.forEach(h => {
  let color = 'gray';
  switch (h.type) {
    case 'air': color = 'red'; break;
    case 'water': color = 'blue'; break;
    case 'noise': color = 'orange'; break;
    case 'disaster': color = 'purple'; break;
    case 'health': color = 'green'; break;
  }
  L.circle([h.lat, h.lon], {
    color, fillColor: color, fillOpacity: 0.5, radius: 400
  }).addTo(map).bindPopup(`<b>${h.desc}</b>`);
});

const ndviOverlay = L.layerGroup();
hotspots.forEach((h, i) => {
  const ndviVal = ndviData[i % ndviData.length];
  const fillColor = ndviVal > 0.5 ? '#2ca02c' : (ndviVal > 0.45 ? '#66c2a4' : '#ffcc00');
  L.circle([h.lat + 0.002 * (i%2 ? 1:-1), h.lon + 0.002 * (i%3 - 1)], {
    radius: 600 * ndviVal,
    color: fillColor,
    fillColor,
    fillOpacity: 0.35
  }).bindPopup(`<b>NDVI ${(ndviVal).toFixed(2)}</b>`).addTo(ndviOverlay);
});
ndviOverlay.addTo(map);

// ---------- EVENTS & UI ----------
document.querySelectorAll('.index-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.index-buttons button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateInsightsChart(btn.getAttribute('data-index'));
  });
});

document.getElementById('temp-slider').addEventListener('input', () => {
  updateClimateSimulation(); updateInfrastructureImpact(); updateSustainabilityGauge();
});
document.getElementById('rainfall-slider').addEventListener('input', () => {
  updateClimateSimulation(); updateInfrastructureImpact(); updateSustainabilityGauge();
});
document.getElementById('infraType').addEventListener('change', () => updateInfrastructureImpact());

document.getElementById('traffic-slider').addEventListener('input', () => { updateMobility(); updateSustainabilityGauge(); });
document.getElementById('ev-slider').addEventListener('input', () => { updateMobility(); updateSustainabilityGauge(); });

document.getElementById('toggleGibsBtn').addEventListener('click', () => {
  if (!gibsLayer) {
    try {
      gibsLayer = L.tileLayer(gibsTemplate, { attribution: 'NASA GIBS' }).addTo(map);
    } catch (e) {
      console.warn('Could not add GIBS layer:', e);
      alert('Unable to load NASA GIBS layer — check network/CORS or swap to a working GIBS tile URL.');
      gibsLayer = null;
    }
  } else {
    map.removeLayer(gibsLayer);
    gibsLayer = null;
  }
});

// small export helpers:
function downloadChartImage(chart, filename = 'chart') {
  if (!chart) return;
  const url = chart.toBase64Image();
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.png`;
  a.click();
}
document.getElementById('downloadInsights').addEventListener('click', () => downloadChartImage(insightsChart,'city_indexes'));
document.getElementById('downloadGreen').addEventListener('click', () => downloadChartImage(greenChart,'green_cover'));
document.getElementById('downloadWater').addEventListener('click', () => downloadChartImage(waterResChart,'water_reservoirs'));
document.getElementById('downloadMobility').addEventListener('click', () => downloadChartImage(mobilityChart,'mobility_air_quality'));

document.getElementById('exportMapPNG').addEventListener('click', () => {
  try {
    const container = map.getContainer();
    if (container instanceof HTMLCanvasElement) {
      const url = container.toDataURL('image/png');
      const a = document.createElement('a'); a.href = url; a.download = 'map.png'; a.click();
    } else {
      alert('Map export not fully supported in this browser without additional libraries. Use a screenshot tool or add leaflet-image plugin.');
    }
  } catch (e) {
    console.warn('Map export failed', e);
    alert('Map export failed. Use a screenshot tool or add leaflet-image plugin for a reliable export.');
  }
});

// small CSV export of current latest indexes (example)
function exportCurrentIndexesCSV() {
  const rows = [['metric','value'],
    ['air', indexData.air],
    ['water', indexData.water],
    ['noise', indexData.noise],
    ['human', indexData.human]];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'current_indexes.csv'; a.click();
}

// ---------- REFINED WASTE MANAGEMENT MODULE ----------
(function () {
  const population = 500000;
  const basePerCapitaKgPerDay = 0.8;
  const totalLandfillCapacityTons = 200000;
  const baselineUsedCapacityTons = 80000;
  const projectionHorizonYears = 50;

  // Waste Stream Composition (Fractions of total waste)
  const wasteComposition = {
    residential: 0.60,
    commercial: 0.25,
    organics: 0.15,
    c_and_d: 0.05
  };

  // Diversion Potential (Max percentage of a stream that can be diverted)
  const diversionPotential = {
    residential_recycling: 0.40,
    commercial_recycling: 0.65,
    organics_composting: 0.90,
  };

  // DOM references
  const popGrowthSlider = document.getElementById('pop-growth-slider');
  const economicIndexSlider = document.getElementById('economic-index-slider');
  const policyEffectivenessSlider = document.getElementById('policy-effectiveness-slider');
  const landfillCostSlider = document.getElementById('landfill-cost-slider');

  const popGrowthValue = document.getElementById('popGrowthValue');
  const economicIndexValue = document.getElementById('economicIndexValue');
  const policyEffectivenessValue = document.getElementById('policyEffectivenessValue');
  const landfillCostValue = document.getElementById('landfillCostValue');

  const landfillBar = document.getElementById('landfillBar');
  const landfillYearsText = document.getElementById('landfillYears');
  const landfillMessage = document.getElementById('landfillMessage');
  const wasteAnalysis = document.getElementById('wasteAnalysis');

  const wasteCtx = getCtx('wasteChart');
  let wasteChart = null;
  let monthsLocal = (typeof months !== 'undefined') ? months.slice() : ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

  // Initialize the chart
  if (wasteCtx) {
    wasteChart = new Chart(wasteCtx, {
      data: {
        labels: monthsLocal,
        datasets: [{
          type: 'bar',
          label: 'Waste Disposed (tons / month)',
          data: [],
          backgroundColor: 'rgba(224,80,80,0.85)',
          borderRadius: 6,
          yAxisID: 'y1'
        }, {
          type: 'line',
          label: 'Total Diversion (%)',
          data: [],
          borderColor: '#40e0a0',
          backgroundColor: 'rgba(64,224,160,0.12)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#ffffff' } },
          y1: {
            position: 'left',
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#ffffff' },
            beginAtZero: true,
            suggestedMax: 20000
          },
          y2: {
            position: 'right',
            grid: { display: false },
            ticks: { color: '#ffffff' },
            min: 0,
            max: 100
          }
        }
      }
    });
  }

  function simulateWasteStream() {
    const popGrowth = parseFloat(popGrowthSlider.value);
    const economicIndex = parseFloat(economicIndexSlider.value);
    const policyEffectiveness = parseInt(policyEffectivenessSlider.value) / 100;
    const landfillCost = parseInt(landfillCostSlider.value);

    // Dynamic per-capita rate based on economic activity
    const dynamicPerCapitaKg = basePerCapitaKgPerDay * economicIndex;
    let currentPopulation = population * (1 + (popGrowth / 100));

    // Calculate waste generation per month in tons
    const totalMonthlyKg = currentPopulation * dynamicPerCapitaKg * 30;
    const totalMonthlyTons = totalMonthlyKg / 1000;

    // Calculate waste streams by category
    const residentialWaste = totalMonthlyTons * wasteComposition.residential;
    const commercialWaste = totalMonthlyTons * wasteComposition.commercial;
    const organicsWaste = totalMonthlyTons * wasteComposition.organics;
    const candDWaste = totalMonthlyTons * wasteComposition.c_and_d;

    // Calculate diversion based on policy and cost
    const residentialRecycledTons = residentialWaste * diversionPotential.residential_recycling * policyEffectiveness;
    const commercialRecycledTons = commercialWaste * diversionPotential.commercial_recycling * (1 + (landfillCost / 100)); // businesses more sensitive to cost
    const organicsCompostedTons = organicsWaste * diversionPotential.organics_composting * policyEffectiveness;
    const totalDivertedTons = residentialRecycledTons + commercialRecycledTons + organicsCompostedTons;

    // Waste disposed to landfill (C&D is not diverted in this model)
    const disposedToLandfillTons = totalMonthlyTons - totalDivertedTons + candDWaste;

    const totalDiversionPercent = (totalDivertedTons / totalMonthlyTons) * 100;

    return { totalMonthlyTons, disposedToLandfillTons, totalDiversionPercent };
  }

  function updateWasteSimulation() {
    // Update slider values on UI
    popGrowthValue.textContent = `${popGrowthSlider.value}%`;
    economicIndexValue.textContent = `${economicIndexSlider.value}x`;
    policyEffectivenessValue.textContent = `${policyEffectivenessSlider.value}%`;
    landfillCostValue.textContent = `$${landfillCostSlider.value}`;

    // Run the simulation model
    const { totalMonthlyTons, disposedToLandfillTons, totalDiversionPercent } = simulateWasteStream();

    // Chart Data
    const disposedData = monthsLocal.map(() => disposedToLandfillTons);
    const diversionData = monthsLocal.map(() => totalDiversionPercent);
    
    if (wasteChart) {
      wasteChart.data.datasets[0].data = disposedData;
      wasteChart.data.datasets[1].data = diversionData;
      wasteChart.options.scales.y1.suggestedMax = Math.ceil(disposedToLandfillTons * 1.5);
      wasteChart.update();
    }

    // Landfill Lifespan Calculation
    const remainingCapacity = Math.max(0, totalLandfillCapacityTons - baselineUsedCapacityTons);
    const monthlyDisposed = disposedToLandfillTons;
    const yearsRemaining = (remainingCapacity / (monthlyDisposed * 12));
    const percentFilled = (baselineUsedCapacityTons / totalLandfillCapacityTons) * 100;
    
    // Update Landfill UI
    if (landfillBar) {
      const remainingPercent = (yearsRemaining / projectionHorizonYears) * 100;
      landfillBar.style.width = `${Math.min(100, remainingPercent)}%`;
      if (yearsRemaining < 5) landfillBar.style.backgroundColor = 'var(--accent-red)';
      else if (yearsRemaining < 15) landfillBar.style.backgroundColor = 'var(--accent-yellow)';
      else landfillBar.style.backgroundColor = 'var(--accent-green)';
    }

    if (landfillYearsText) {
      if (Number.isFinite(yearsRemaining)) {
        landfillYearsText.textContent = `~${yearsRemaining.toFixed(1)} years left`;
      } else {
        landfillYearsText.textContent = `Lifespan unlimited by this model`;
      }
    }
    
    if (landfillMessage) {
      if (yearsRemaining < 5) {
        landfillMessage.textContent = '⚠️ Critical. Landfill is nearing capacity. Immediate action required.';
        landfillMessage.className = 'analysis-text critical';
      } else if (yearsRemaining < 15) {
        landfillMessage.textContent = '⚠️ Warning. Landfill capacity is a growing concern. Policy intervention is needed.';
        landfillMessage.className = 'analysis-text warning';
      } else {
        landfillMessage.textContent = '✅ Landfill capacity is stable. Policies are effectively managing waste disposal.';
        landfillMessage.className = 'analysis-text good';
      }
    }

    // Overall analysis blurb
    const totalDiversion = totalDiversionPercent.toFixed(1);
    if (totalDiversion >= 50) {
      wasteAnalysis.textContent = `✅ Excellent diversion rate of ${totalDiversion}%. Your policies are highly effective.`;
      wasteAnalysis.className = 'analysis-text good';
    } else if (totalDiversion >= 30) {
      wasteAnalysis.textContent = `⚠️ Moderate diversion rate of ${totalDiversion}%. Room for improvement in policy effectiveness and public adoption.`;
      wasteAnalysis.className = 'analysis-text warning';
    } else {
      wasteAnalysis.textContent = `⚠️ Low diversion rate of ${totalDiversion}%. Significant pressure on landfill capacity remains.`;
      wasteAnalysis.className = 'analysis-text critical';
    }

    // Update sustainability score if available
    if (typeof updateSustainabilityGauge === 'function') {
      try { updateSustainabilityGauge(); } catch (e) { /* ignore */ }
    }
  }

  function exportWasteCSV() {
    const { totalMonthlyTons, disposedToLandfillTons, totalDiversionPercent } = simulateWasteStream();
    const rows = [
      ['Metric', 'Value'],
      ['Total Monthly Waste (tons)', totalMonthlyTons.toFixed(2)],
      ['Disposed to Landfill (tons)', disposedToLandfillTons.toFixed(2)],
      ['Total Diversion (%)', totalDiversionPercent.toFixed(2)],
      ['Population Growth Rate (%)', popGrowthSlider.value],
      ['Economic Activity Index', economicIndexSlider.value],
      ['Policy Effectiveness (%)', policyEffectivenessSlider.value],
      ['Landfill Cost ($/ton)', landfillCostSlider.value]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waste_management_report.csv';
    a.click();
  }

  function downloadWasteChart() {
    if (!wasteChart) return;
    const url = wasteChart.toBase64Image();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waste_chart.png';
    a.click();
  }

  // Hook events
  if (popGrowthSlider) popGrowthSlider.addEventListener('input', updateWasteSimulation);
  if (economicIndexSlider) economicIndexSlider.addEventListener('input', updateWasteSimulation);
  if (policyEffectivenessSlider) policyEffectivenessSlider.addEventListener('input', updateWasteSimulation);
  if (landfillCostSlider) landfillCostSlider.addEventListener('input', updateWasteSimulation);

  document.getElementById('downloadWaste').addEventListener('click', downloadWasteChart);
  document.getElementById('exportWasteCSV').addEventListener('click', exportWasteCSV);

  updateWasteSimulation();

  window.Metroscape = window.Metroscape || {};
  Object.assign(window.Metroscape, {
    updateWasteSimulation,
    exportWasteCSV
  });
})();

// ---------- INITIALIZE (other components) ----------
document.querySelector('.index-buttons button[data-index="air"]').click();
updateClimateSimulation();
updateInfrastructureImpact();
updateMobility();
analyzeGreen();
analyzeWaterRes();
updateSustainabilityGauge();

// expose main hooks for embed scenarios
window.Metroscape = Object.assign(window.Metroscape || {}, {
  updateClimateSimulation, updateInfrastructureImpact, updateMobility,
  analyzeGreen, analyzeWaterRes, updateSustainabilityGauge, exportCurrentIndexesCSV
});
