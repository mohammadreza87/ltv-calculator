// Chart rendering broken down by method
import { calculateLTV } from './calculations.js';

function hasChart() {
  return typeof window !== 'undefined' && typeof window.Chart !== 'undefined';
}

export function generateCharts(currentMethod, results) {
  const chartsCard = document.getElementById('charts-card');
  const chartsContainer = document.getElementById('charts-container');
  chartsContainer.innerHTML = '';
  if (!hasChart()) {
    chartsContainer.innerHTML = '<div class="results-section">⚠️ Chart.js failed to load. Please check network/CSP.</div>';
    chartsCard.style.display = 'block';
    return;
  }
  let html = '<div class="chart-grid">';

  if (currentMethod === 'basic') {
    html += `
      <div class="chart-container">
        <div class="chart-title">LTV Projection Curve</div>
        <div class="chart-subtitle">Power law retention model over 180 days</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="ltv-projection-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">ROAS Timeline</div>
        <div class="chart-subtitle">Return on ad spend progression</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="roas-timeline-chart"></canvas>
        </div>
      </div>`;
  } else if (currentMethod === 'intermediate') {
    html += `
      <div class="chart-container">
        <div class="chart-title">Retention Curve Analysis</div>
        <div class="chart-subtitle">D1, D7, D30 retention progression with benchmarks</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="retention-curve-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Revenue Breakdown</div>
        <div class="chart-subtitle">IAP vs Ad revenue contribution</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="revenue-breakdown-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">LTV vs CPI Analysis</div>
        <div class="chart-subtitle">Cost efficiency over time periods</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="ltv-cpi-chart"></canvas>
        </div>
      </div>`;
  } else {
    html += `
      <div class="chart-container">
        <div class="chart-title">Cohort Performance Matrix</div>
        <div class="chart-subtitle">User segments and spending patterns</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="cohort-matrix-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Channel Performance Comparison</div>
        <div class="chart-subtitle">Acquisition source efficiency analysis</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="channel-performance-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Scaling Decision Matrix</div>
        <div class="chart-subtitle">Risk vs Reward visualization</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="decision-matrix-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Monetization Health Score</div>
        <div class="chart-subtitle">Overall game performance radar</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="health-radar-chart"></canvas>
        </div>
      </div>`;
  }

  html += '</div>';
  chartsContainer.innerHTML = html;
  chartsCard.style.display = 'block';

  // Now instantiate the charts
  if (currentMethod === 'basic') createBasicCharts();
  else if (currentMethod === 'intermediate') createIntermediateCharts(results);
  else createAdvancedCharts(results);
}

function createBasicCharts() {
  const ltvCtx = document.getElementById('ltv-projection-chart')?.getContext('2d');
  if (ltvCtx) {
    const d1 = parseFloat(document.getElementById('d1-retention').value);
    const d7 = parseFloat(document.getElementById('d7-retention').value);
    const arpdau = parseFloat(document.getElementById('arpdau').value);
    const days = Array.from({ length: 180 }, (_, i) => i + 1);
    const ltvData = days.map(day => calculateLTV({ d1, d7 }, arpdau, day));
    try {
      new Chart(ltvCtx, {
        type: 'line',
        data: { labels: days, datasets: [{ label: 'Cumulative LTV ($)', data: ltvData, borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)', fill: true, tension: 0.4 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { font: { weight: '600' }, color: '#333' } } },
          scales: {
            x: { title: { display: true, text: 'Days Since Install', font: { weight: '600' }, color: '#555' }, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } },
            y: { title: { display: true, text: 'Cumulative LTV ($)', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }
          }
        }
      });
    } catch (e) { console.error('Basic LTV chart error', e); }
  }

  const roasCtx = document.getElementById('roas-timeline-chart')?.getContext('2d');
  if (roasCtx) {
    const d1 = parseFloat(document.getElementById('d1-retention').value);
    const d7 = parseFloat(document.getElementById('d7-retention').value);
    const arpdau = parseFloat(document.getElementById('arpdau').value);
    const cpi = parseFloat(document.getElementById('avg-cpi').value);
    const roasDays = [7, 14, 30, 60, 90, 120, 180];
    const roasData = roasDays.map(day => {
      const ltv = calculateLTV({ d1, d7 }, arpdau, day);
      return (ltv / cpi) * 100;
    });
    try {
      new Chart(roasCtx, {
        type: 'bar',
        data: { labels: roasDays.map(d => `D${d}`), datasets: [{ label: 'ROAS %', data: roasData, backgroundColor: roasData.map(val => (val >= 150 ? '#4CAF50' : val >= 100 ? '#FF9800' : '#F44336')) }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } },
            y: { title: { display: true, text: 'ROAS %', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }
          }
        }
      });
    } catch (e) { console.error('Basic ROAS chart error', e); }
  }
}

function createIntermediateCharts(results) {
  const d1 = parseFloat(document.getElementById('int-d1-retention').value);
  const d7 = parseFloat(document.getElementById('int-d7-retention').value);
  const d30 = parseFloat(document.getElementById('int-d30-retention').value);
  const arpdau = parseFloat(document.getElementById('int-arpdau').value);
  const iapRevenue = parseFloat(document.getElementById('iap-revenue').value);
  const adRevenue = parseFloat(document.getElementById('ad-revenue').value);
  const cpi = parseFloat(document.getElementById('int-avg-cpi').value);
  
  // Retention Curve Chart
  const retentionCtx = document.getElementById('retention-curve-chart')?.getContext('2d');
  if (retentionCtx) {
    try {
      new Chart(retentionCtx, {
        type: 'line',
        data: {
          labels: ['D1', 'D7', 'D30'],
          datasets: [{
            label: 'Your Game',
            data: [d1, d7, d30],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            fill: false,
            tension: 0.1
          }, {
            label: 'Industry Benchmark',
            data: [40, 18, 8],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            fill: false,
            tension: 0.1,
            borderDash: [5, 5]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { title: { display: true, text: 'Retention %' }, beginAtZero: true, max: 100 }
          }
        }
      });
    } catch (e) { console.error('Intermediate retention chart error', e); }
  }
  
  // Revenue Breakdown Chart
  const revenueCtx = document.getElementById('revenue-breakdown-chart')?.getContext('2d');
  if (revenueCtx) {
    try {
      new Chart(revenueCtx, {
        type: 'doughnut',
        data: {
          labels: ['IAP Revenue', 'Ad Revenue'],
          datasets: [{
            data: [iapRevenue, adRevenue],
            backgroundColor: ['#4CAF50', '#2196F3']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    } catch (e) { console.error('Intermediate revenue chart error', e); }
  }
  
  // LTV vs CPI Chart
  const ltvCpiCtx = document.getElementById('ltv-cpi-chart')?.getContext('2d');
  if (ltvCpiCtx) {
    const timeFrames = ['D7', 'D30', 'D60', 'D180'];
    const ltvValues = timeFrames.map((_, i) => {
      const days = [7, 30, 60, 180][i];
      return calculateLTV({d1, d7, d30}, arpdau + (iapRevenue + adRevenue), days);
    });
    
    try {
      new Chart(ltvCpiCtx, {
        type: 'bar',
        data: {
          labels: timeFrames,
          datasets: [{
            label: 'LTV ($)',
            data: ltvValues,
            backgroundColor: '#667eea',
            yAxisID: 'y'
          }, {
            label: 'CPI ($)',
            data: Array(4).fill(cpi),
            backgroundColor: '#ff6b6b',
            yAxisID: 'y'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { title: { display: true, text: 'Value ($)' }, beginAtZero: true }
          }
        }
      });
    } catch (e) { console.error('Intermediate LTV-CPI chart error', e); }
  }
}

function createAdvancedCharts(results) {
  // Get advanced form values
  const channels = ['organic', 'facebook', 'google', 'unity', 'applovin'];
  const cohortData = channels.map(channel => ({
    channel,
    d1: parseFloat(document.getElementById(`${channel}-d1`).value) || 0,
    d7: parseFloat(document.getElementById(`${channel}-d7`).value) || 0,
    d30: parseFloat(document.getElementById(`${channel}-d30`).value) || 0,
    cpi: parseFloat(document.getElementById(`${channel}-cpi`).value) || 0,
    volume: parseFloat(document.getElementById(`${channel}-volume`).value) || 0
  }));
  
  // Cohort Performance Matrix
  const cohortCtx = document.getElementById('cohort-matrix-chart')?.getContext('2d');
  if (cohortCtx) {
    try {
      new Chart(cohortCtx, {
        type: 'scatter',
        data: {
          datasets: cohortData.map((data, i) => ({
            label: data.channel.charAt(0).toUpperCase() + data.channel.slice(1),
            data: [{x: data.d1, y: data.d30, r: Math.sqrt(data.volume) / 10}],
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'][i]
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'D1 Retention %' } },
            y: { title: { display: true, text: 'D30 Retention %' } }
          }
        }
      });
    } catch (e) { console.error('Advanced cohort chart error', e); }
  }
  
  // Channel Performance Chart
  const channelCtx = document.getElementById('channel-performance-chart')?.getContext('2d');
  if (channelCtx) {
    const channelNames = cohortData.map(d => d.channel.charAt(0).toUpperCase() + d.channel.slice(1));
    const channelRoas = cohortData.map(d => {
      const ltv = calculateLTV({d1: d.d1, d7: d.d7, d30: d.d30}, 0.5, 180);
      return d.cpi > 0 ? (ltv / d.cpi) * 100 : 0;
    });
    
    try {
      new Chart(channelCtx, {
        type: 'bar',
        data: {
          labels: channelNames,
          datasets: [{
            label: 'ROAS %',
            data: channelRoas,
            backgroundColor: channelRoas.map(val => 
              val >= 150 ? '#4CAF50' : val >= 100 ? '#FF9800' : '#F44336'
            )
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: { title: { display: true, text: 'ROAS %' }, beginAtZero: true }
          }
        }
      });
    } catch (e) { console.error('Advanced channel chart error', e); }
  }
  
  // Decision Matrix Chart
  const decisionCtx = document.getElementById('decision-matrix-chart')?.getContext('2d');
  if (decisionCtx) {
    try {
      new Chart(decisionCtx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Scale Zone',
            data: [{x: 150, y: 85}],
            backgroundColor: '#4CAF50',
            pointRadius: 20
          }, {
            label: 'Iterate Zone', 
            data: [{x: 100, y: 60}],
            backgroundColor: '#FF9800',
            pointRadius: 15
          }, {
            label: 'Risk Zone',
            data: [{x: 50, y: 30}],
            backgroundColor: '#F44336',
            pointRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'ROAS %' }, min: 0, max: 200 },
            y: { title: { display: true, text: 'Quality Score' }, min: 0, max: 100 }
          }
        }
      });
    } catch (e) { console.error('Advanced decision chart error', e); }
  }
  
  // Health Radar Chart
  const healthCtx = document.getElementById('health-radar-chart')?.getContext('2d');
  if (healthCtx) {
    try {
      new Chart(healthCtx, {
        type: 'radar',
        data: {
          labels: ['Retention', 'Monetization', 'User Acquisition', 'Engagement', 'Virality'],
          datasets: [{
            label: 'Current Performance',
            data: [75, 60, 80, 65, 40],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            fill: true
          }, {
            label: 'Industry Benchmark',
            data: [60, 50, 70, 55, 35],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: { beginAtZero: true, max: 100 }
          }
        }
      });
    } catch (e) { console.error('Advanced health chart error', e); }
  }
}
