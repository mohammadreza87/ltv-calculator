// Chart rendering broken down by method
import { calculateLTV } from './calculations.js';

export function generateCharts(currentMethod, results) {
  const chartsCard = document.getElementById('charts-card');
  const chartsContainer = document.getElementById('charts-container');
  chartsContainer.innerHTML = '';
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
        <div class="chart-title">Cohort Performance Comparison</div>
        <div class="chart-subtitle">CPI vs D1 ROAS by traffic source</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="cohort-performance-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Source Efficiency Matrix</div>
        <div class="chart-subtitle">Users acquired vs revenue generated</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="source-efficiency-chart"></canvas>
        </div>
      </div>`;
  } else {
    html += `
      <div class="chart-container">
        <div class="chart-title">Retention Curve Analysis</div>
        <div class="chart-subtitle">Power law fit vs actual retention data</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="retention-curve-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">LTV Projections Comparison</div>
        <div class="chart-subtitle">90, 180, 365-day LTV estimates</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="ltv-comparison-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">Monetization Mix Analysis</div>
        <div class="chart-subtitle">IAP vs Ad revenue breakdown</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="monetization-pie-chart"></canvas>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-title">ROAS Progression</div>
        <div class="chart-subtitle">D7 vs D30 ROAS with benchmarks</div>
        <div style="flex: 1; position: relative; width: 100%;">
          <canvas id="roas-progression-chart"></canvas>
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
  }
}

function createIntermediateCharts(results) {
  const cohortCtx = document.getElementById('cohort-performance-chart')?.getContext('2d');
  if (cohortCtx && results.cohorts) {
    const cohortData = results.cohorts.map(cohort => ({ x: cohort.cpi, y: (cohort.revenue / cohort.spend) * 100, r: Math.sqrt(cohort.users) / 50, label: cohort.source }));
    new Chart(cohortCtx, {
      type: 'bubble',
      data: { datasets: [{ label: 'Traffic Sources', data: cohortData, backgroundColor: 'rgba(102, 126, 234, 0.6)', borderColor: '#667eea' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { weight: '600' }, color: '#333' } }, tooltip: { callbacks: { label: function(ctx) { const p = ctx.parsed; const c = results.cohorts[ctx.dataIndex]; return `${c.source}: CPI $${p.x}, ROAS ${p.y.toFixed(1)}%, Users ${c.users}`; } } } },
        scales: {
          x: { title: { display: true, text: 'CPI ($)', font: { weight: '600' }, color: '#555' }, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } },
          y: { title: { display: true, text: 'D1 ROAS (%)', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }
        }
      }
    });
  }

  const efficiencyCtx = document.getElementById('source-efficiency-chart')?.getContext('2d');
  if (efficiencyCtx && results.cohorts) {
    new Chart(efficiencyCtx, {
      type: 'doughnut',
      data: { labels: results.cohorts.map(c => c.source), datasets: [{ label: 'Revenue Share', data: results.cohorts.map(c => c.revenue), backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: '600' }, color: '#333', padding: 15 } }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { weight: '600' }, bodyFont: { weight: '500' }, callbacks: { label: function(ctx) { const cohort = results.cohorts[ctx.dataIndex]; const total = results.cohorts.reduce((s, c) => s + c.revenue, 0); const pct = total ? ((cohort.revenue / total) * 100).toFixed(1) : '0.0'; return `${cohort.source}: $${cohort.revenue.toFixed(0)} (${pct}%)`; } } } } }
    });
  }
}

function createAdvancedCharts(results) {
  const retentionCtx = document.getElementById('retention-curve-chart')?.getContext('2d');
  if (retentionCtx) {
    const d1 = parseFloat(document.getElementById('adv-d1').value);
    const d3 = parseFloat(document.getElementById('adv-d3').value);
    const d7 = parseFloat(document.getElementById('adv-d7').value);
    const d30 = parseFloat(document.getElementById('adv-d30').value);
    const actualDays = [1, 3, 7, 30];
    const actualRetention = [d1, d3, d7, d30];
    const curveDays = Array.from({ length: 30 }, (_, i) => i + 1);
    const b = Math.log((d7/100) / (d1/100)) / Math.log(7);
    const a = d1 / 100;
    const curveRetention = curveDays.map(day => a * Math.pow(day, b) * 100);
    new Chart(retentionCtx, {
      type: 'line',
      data: { datasets: [ { label: 'Actual Data', data: actualDays.map((day, i) => ({ x: day, y: actualRetention[i] })), backgroundColor: '#667eea', borderColor: '#667eea', type: 'scatter', pointRadius: 8 }, { label: 'Power Law Fit', data: curveDays.map((day, i) => ({ x: day, y: curveRetention[i] })), borderColor: '#764ba2', backgroundColor: 'rgba(118, 75, 162, 0.1)', fill: false, tension: 0.4 } ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { font: { weight: '600' }, color: '#333' } } }, scales: { x: { type: 'linear', title: { display: true, text: 'Days Since Install', font: { weight: '600' }, color: '#555' }, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }, y: { title: { display: true, text: 'Retention %', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } } } }
    });
  }

  const ltvCompCtx = document.getElementById('ltv-comparison-chart')?.getContext('2d');
  if (ltvCompCtx) {
    new Chart(ltvCompCtx, {
      type: 'bar',
      data: { labels: ['D90', 'D180', 'D365'], datasets: [{ label: 'LTV ($)', data: [results.ltv90, results.ltv180, results.ltv365], backgroundColor: ['#667eea', '#764ba2', '#f093fb'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }, y: { title: { display: true, text: 'LTV ($)', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } } } }
    });
  }

  const monetizationCtx = document.getElementById('monetization-pie-chart')?.getContext('2d');
  if (monetizationCtx) {
    new Chart(monetizationCtx, {
      type: 'pie',
      data: { labels: ['In-App Purchases', 'Ad Revenue'], datasets: [{ data: [results.monetizationMix.iap, results.monetizationMix.ads], backgroundColor: ['#667eea', '#764ba2'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { weight: '600' }, color: '#333', padding: 15 } }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { weight: '600' }, bodyFont: { weight: '500' }, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } } } }
    });
  }

  const roasProgCtx = document.getElementById('roas-progression-chart')?.getContext('2d');
  if (roasProgCtx) {
    new Chart(roasProgCtx, {
      type: 'line',
      data: { labels: ['D7', 'D30'], datasets: [ { label: 'Actual ROAS', data: [results.d7Roas, results.d30Roas], borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)', fill: true, tension: 0.4 }, { label: 'Benchmark (Good)', data: [50, 120], borderColor: '#4CAF50', borderDash: [5,5], fill: false }, { label: 'Benchmark (Break-even)', data: [20, 50], borderColor: '#FF9800', borderDash: [5,5], fill: false } ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { font: { weight: '600' }, color: '#333' } } }, scales: { x: { ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } }, y: { title: { display: true, text: 'ROAS %', font: { weight: '600' }, color: '#555' }, beginAtZero: true, ticks: { color: '#666' }, grid: { color: 'rgba(0,0,0,0.1)' } } } }
    });
  }
}

