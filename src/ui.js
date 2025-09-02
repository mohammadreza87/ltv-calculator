import { getBenchmarkLabel, computeBasicMetrics, computeIntermediateMetrics, computeAdvancedMetrics } from './calculations.js';
import { generateCharts } from './charts.js';

export let currentMethod = 'basic';
let cohortCounter = 1;

export function initUI() {
  // Method selection
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMethod(btn.dataset.method, btn));
  });

  // Tabs (advanced)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab, btn));
  });

  // Cohorts
  document.getElementById('add-cohort-btn')?.addEventListener('click', addCohort);
  document.getElementById('cohort-table')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-cohort')) {
      removeCohort(e.target);
    }
  });

  // Calculate
  document.getElementById('calculate-btn')?.addEventListener('click', calculateAndRender);
}

function selectMethod(method, buttonEl) {
  currentMethod = method;
  document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
  buttonEl?.classList.add('active');
  document.querySelectorAll('.method-inputs').forEach(input => input.style.display = 'none');
  document.getElementById(`${method}-inputs`).style.display = 'block';
}

function switchTab(tab, buttonEl) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  buttonEl?.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  document.getElementById(`${tab}-tab`).style.display = 'block';
}

function addCohort() {
  const tbody = document.getElementById('cohort-tbody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" value="Source ${++cohortCounter}" class="cohort-source"></td>
    <td><input type="number" value="10000" class="cohort-users"></td>
    <td><input type="number" value="2.00" step="0.01" class="cohort-cpi"></td>
    <td><input type="number" value="30" step="0.1" class="cohort-d1"></td>
    <td><input type="number" value="0.15" step="0.01" class="cohort-d1-arpu"></td>
    <td><button class="remove-cohort">Remove</button></td>
  `;
  tbody.appendChild(row);
}

function removeCohort(btn) {
  const tbody = document.getElementById('cohort-tbody');
  if (tbody && tbody.children.length > 1) {
    btn.closest('tr')?.remove();
  }
}

function gatherIntermediateRows() {
  const rows = [];
  document.querySelectorAll('#cohort-tbody tr').forEach(tr => {
    rows.push({
      source: tr.querySelector('.cohort-source')?.value || 'Source',
      users: parseFloat(tr.querySelector('.cohort-users')?.value || '0'),
      cpi: parseFloat(tr.querySelector('.cohort-cpi')?.value || '0'),
      d1: parseFloat(tr.querySelector('.cohort-d1')?.value || '0'),
      d1Arpu: parseFloat(tr.querySelector('.cohort-d1-arpu')?.value || '0')
    });
  });
  return rows;
}

export function displayResults(currentMethod, results, decision, insights) {
  const resultsContainer = document.getElementById('results-container');
  const decisionCard = document.getElementById('decision-card');
  const decisionContainer = document.getElementById('decision-container');
  let html = '<div class="results-section">';

  if (currentMethod === 'basic') {
    html += `
      <div class="metric-card">
        <h3>Lifetime Value (LTV)</h3>
        <div class="metric-value">${results.ltv}</div>
        <div class="metric-label">Estimated 180-day LTV</div>
      </div>
      <div class="metric-card">
        <h3>LTV:CPI Ratio</h3>
        <div class="metric-value">${results.ltvCpiRatio}x ${getBenchmarkLabel('ltv_cpi', results.ltvCpiRatio)}</div>
        <div class="metric-label">Target: 3x for healthy margins</div>
      </div>
      <div class="metric-card">
        <h3>Day 7 ROAS</h3>
        <div class="metric-value">${results.d7Roas}% ${getBenchmarkLabel('roas_d7', results.d7Roas)}</div>
        <div class="metric-label">Revenue returned by Day 7</div>
      </div>
      <div class="metric-card">
        <h3>ROI Projection</h3>
        <div class="metric-value">${results.roi}%</div>
        <div class="metric-label">Expected return on investment</div>
      </div>`;
  } else if (currentMethod === 'intermediate') {
    html += `
      <div class="metric-card">
        <h3>Total Investment</h3>
        <div class="metric-value">${parseInt(results.totalSpend).toLocaleString()}</div>
        <div class="metric-label">${results.totalUsers} users acquired</div>
      </div>
      <div class="metric-card">
        <h3>Blended CPI</h3>
        <div class="metric-value">${results.avgCPI}</div>
        <div class="metric-label">Average across all sources</div>
      </div>
      <div class="metric-card">
        <h3>Day 1 ROAS</h3>
        <div class="metric-value">${results.d1Roas}%</div>
        <div class="metric-label">Immediate return signal</div>
      </div>
      <div class="metric-card">
        <h3>Projected ROAS</h3>
        <div class="metric-value">${results.projectedRoas}%</div>
        <div class="metric-label">Expected by target day</div>
      </div>
      <div class="metric-card">
        <h3>ML Readiness</h3>
        <div class="metric-value">${results.mlReadinessScore}%</div>
        <div class="metric-label">Predictive modeling readiness</div>
      </div>`;
  } else {
    html += `
      <div class="metric-card">
        <h3>Effective CPI</h3>
        <div class="metric-value">${results.eCPI}</div>
        <div class="metric-label">Including ${results.organicUplift}% organic uplift</div>
      </div>
      <div class="metric-card">
        <h3>LTV Projections</h3>
        <div class="metric-value">${results.ltv180}</div>
        <div class="metric-label">D90: ${results.ltv90} | D365: ${results.ltv365}</div>
      </div>
      <div class="metric-card">
        <h3>LTV:CPI Ratio (D180)</h3>
        <div class="metric-value">${results.ltvCpiRatio180}x</div>
        <div class="metric-label">Profitability multiplier</div>
      </div>
      <div class="metric-card">
        <h3>ROAS Progression</h3>
        <div class="metric-value">${results.d30Roas}%</div>
        <div class="metric-label">D7: ${results.d7Roas}% | D30: ${results.d30Roas}%</div>
      </div>
      <div class="metric-card">
        <h3>Monetization Mix</h3>
        <div class="metric-value">${results.monetizationMix.iap}% / ${results.monetizationMix.ads}%</div>
        <div class="metric-label">IAP / Ads revenue split</div>
      </div>
      <div class="metric-card">
        <h3>Retention Health</h3>
        <div class="metric-value">${results.retentionHealth}</div>
        <div class="metric-label">Overall engagement score</div>
      </div>`;
  }

  html += '</div>';
  resultsContainer.innerHTML = html;

  // Decision
  let decisionHTML = '';
  if (decision === 'scale') {
    decisionHTML = `
      <div class="decision-box decision-scale">
        <div class="decision-title">✅ SCALE</div>
        <div class="decision-subtitle">Game is ready for growth investment</div>
      </div>`;
  } else if (decision === 'iterate') {
    decisionHTML = `
      <div class="decision-box decision-iterate">
        <div class="decision-title">🔄 ITERATE</div>
        <div class="decision-subtitle">Improve metrics before scaling</div>
      </div>`;
  } else {
    decisionHTML = `
      <div class="decision-box decision-shutdown">
        <div class="decision-title">⛔ PIVOT/SHUTDOWN</div>
        <div class="decision-subtitle">Fundamental issues need addressing</div>
      </div>`;
  }

  decisionHTML += '<ul class="insights-list">' + insights.map(i => `<li>${i}</li>`).join('') + '</ul>';

  if (currentMethod === 'advanced') {
    decisionHTML += '<div class="warning-box"><h4>📋 Next Steps</h4><p>';
    if (decision === 'scale') {
      decisionHTML += 'Start with 20% budget increase weekly, monitor cohort performance closely. Focus on creative optimization to reduce CPI.';
    } else if (decision === 'iterate') {
      decisionHTML += 'Run A/B tests on monetization, improve D1 retention by 5%, then re-evaluate. Consider soft launching in additional markets for more data.';
    } else {
      decisionHTML += 'Conduct user research to identify core issues. Consider pivoting game mechanics or targeting a different audience segment.';
    }
    decisionHTML += '</p></div>';
  }

  decisionContainer.innerHTML = decisionHTML;
  decisionCard.style.display = 'block';
}

export function calculateAndRender() {
  let results = {};
  let decision = '';
  let insights = [];

  if (currentMethod === 'basic') {
    const d1 = parseFloat(document.getElementById('d1-retention').value);
    const d7 = parseFloat(document.getElementById('d7-retention').value);
    const arpdau = parseFloat(document.getElementById('arpdau').value);
    const cpi = parseFloat(document.getElementById('avg-cpi').value);
    const genre = document.getElementById('genre').value;
    ({ results, decision, insights } = computeBasicMetrics({ d1, d7, arpdau, cpi, genre }));
  } else if (currentMethod === 'intermediate') {
    const d30 = parseFloat(document.getElementById('d30-retention-inter').value);
    const targetDay = parseFloat(document.getElementById('target-roas-day').value);
    const rows = gatherIntermediateRows();
    ({ results, decision, insights } = computeIntermediateMetrics({ rows, d30, targetDay }));
  } else {
    const d1 = parseFloat(document.getElementById('adv-d1').value);
    const d3 = parseFloat(document.getElementById('adv-d3').value);
    const d7 = parseFloat(document.getElementById('adv-d7').value);
    const d30 = parseFloat(document.getElementById('adv-d30').value);
    const iapArpdau = parseFloat(document.getElementById('iap-arpdau').value);
    const adArpdau = parseFloat(document.getElementById('ad-arpdau').value);
    const payingShare = parseFloat(document.getElementById('paying-share').value) / 100;
    const arppu = parseFloat(document.getElementById('arppu').value);
    const totalSpend = parseFloat(document.getElementById('total-spend').value);
    const totalInstalls = parseFloat(document.getElementById('total-installs').value);
    const kFactor = parseFloat(document.getElementById('k-factor').value);
    const market = document.getElementById('target-market').value;
    ({ results, decision, insights } = computeAdvancedMetrics({ d1, d3, d7, d30, iapArpdau, adArpdau, payingShare, arppu, totalSpend, totalInstalls, kFactor, market }));
  }

  displayResults(currentMethod, results, decision, insights);
  generateCharts(currentMethod, results);
}

