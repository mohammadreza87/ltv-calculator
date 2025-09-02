// Core calculation utilities and per-method computations

export function calculateLTV(retention, arpdau, days = 180) {
  const d1 = retention.d1 / 100;
  const d7 = retention.d7 / 100;
  let b = Math.log(d7 / d1) / Math.log(7);
  b = Math.max(-2, Math.min(b, -0.1));
  const a = d1;

  let cumulative = 0;
  const stepSize = 0.1;
  for (let day = stepSize; day <= days; day += stepSize) {
    cumulative += a * Math.pow(day, b) * stepSize;
  }
  const decayFactor = 0.95 + 0.05 * Math.exp(-days / 60);
  return arpdau * cumulative * decayFactor;
}

export function calculateMonetizationCurve(day) {
  // 2025 research-based monetization curve
  if (day <= 7) {
    return 0.8 + (day / 7) * 0.4; // 0.8 to 1.2
  } else if (day <= 30) {
    return 1.2 - ((day - 7) / 23) * 0.3; // 1.2 to 0.9
  } else {
    return 0.9 * Math.exp(-(day - 30) / 180); // Gradual decay
  }
}

export function calculatePredictiveLifetime(d1, d30, retentionDecay) {
  // Calculate expected user lifetime using power law integration
  const a = d1 / 100;
  const b = retentionDecay;
  
  // Integrate retention curve to get expected lifetime
  let lifetime = 0;
  for (let day = 1; day <= 365; day += 0.5) {
    lifetime += a * Math.pow(day, b) * 0.5;
  }
  
  return Math.min(lifetime, 30); // Cap at 30 days for realistic estimates
}

export function calculateMLReadinessScore(cohorts, avgD1, d30) {
  // Calculate readiness for ML-based LTV prediction
  let dataQuality = 0;
  
  // Cohort diversity score (more sources = better ML training)
  dataQuality += Math.min(cohorts.length / 5, 1) * 25;
  
  // Retention quality score
  const retentionScore = (avgD1 / 30) + (d30 / 5);
  dataQuality += Math.min(retentionScore, 1) * 35;
  
  // Variance score (good spread indicates rich data)
  const revenues = cohorts.map(c => c.revenue / c.users);
  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - avgRevenue, 2), 0) / revenues.length;
  const varianceScore = Math.min(variance / avgRevenue, 0.5) * 2; // Normalize
  dataQuality += varianceScore * 40;
  
  return Math.min(dataQuality, 100);
}

export function getRetentionHealth(d1, d7, d30) {
  // Updated retention health scoring for 2025 standards
  const platformAdjustedD1 = 30; // Blended target
  const score = (d1 / platformAdjustedD1) * 0.4 + (d7 / 12) * 0.35 + (d30 / 5) * 0.25;
  
  if (score > 1.0) return 'Excellent (Top 10%)';
  if (score > 0.8) return 'Good (Above Average)';
  if (score > 0.6) return 'Average';
  if (score > 0.4) return 'Below Average';
  return 'Poor (Needs Improvement)';
}

export function getBenchmark(metric, value) {
  const benchmarks = {
    d1: { good: 30, average: 27, poor: 25 },
    d7: { good: 12, average: 8, poor: 5 },
    d30: { good: 5, average: 3, poor: 2 },
    ltv_cpi: { good: 3, average: 2, poor: 1.5 },
    roas_d7: { good: 50, average: 30, poor: 20 },
    roas_d30: { good: 120, average: 80, poor: 50 }
  };
  const bench = benchmarks[metric];
  if (!bench) return '';
  if (value >= bench.good) return 'benchmark-good';
  if (value >= bench.average) return 'benchmark-average';
  return 'benchmark-poor';
}

export function getBenchmarkLabel(metric, value) {
  const cls = getBenchmark(metric, value);
  if (cls === 'benchmark-good') return '<span class="benchmark-indicator benchmark-good">Above Target</span>';
  if (cls === 'benchmark-average') return '<span class="benchmark-indicator benchmark-average">Average</span>';
  if (cls === 'benchmark-poor') return '<span class="benchmark-indicator benchmark-poor">Below Target</span>';
  return '';
}

export function calculateAdvancedLTV(a, b, arpdau, days) {
  let cumulative = 0;
  const stepSize = 0.1;
  for (let day = stepSize; day <= days; day += stepSize) {
    const retentionAtDay = a * Math.pow(day, b);
    const monetizationFactor = calculateMonetizationCurve(day);
    cumulative += retentionAtDay * monetizationFactor * stepSize;
  }
  return arpdau * cumulative;
}

// calculateMonetizationCurve already declared above


// Per-method computations
export function computeBasicMetrics({ d1, d7, arpdau, cpi, genre }) {
  const ltv = calculateLTV({ d1, d7 }, arpdau);
  const ltvCpiRatio = ltv / cpi;
  const d7Roas = (arpdau * 7 * (d7 / 100)) / cpi * 100;
  const roi = ((ltv - cpi) / cpi) * 100;

  const results = {
    ltv: ltv.toFixed(2),
    ltvCpiRatio: ltvCpiRatio.toFixed(2),
    d7Roas: d7Roas.toFixed(1),
    roi: roi.toFixed(1),
    d1,
    d7,
    paybackDays: Math.round(cpi / (arpdau * (d7 / 100)))
  };

  const insights = [];
  let decision = 'iterate';
  if (d1 < 27 || d7 < 8) {
    decision = 'shutdown';
    insights.push('Retention metrics below 2025 industry minimum (D1: 27%, D7: 8%)');
    insights.push('Focus on core gameplay loop and first-time user experience');
    insights.push('Consider implementing rewarded video to boost retention by 15-20%');
  } else if (ltvCpiRatio < 1.5) {
    decision = 'shutdown';
    insights.push('LTV:CPI ratio below viability threshold (1.5x minimum for 2025)');
    insights.push('Hybrid monetization (IAP + Ads) could improve margins');
  } else if (ltvCpiRatio < 2) {
    decision = 'iterate';
    insights.push('LTV:CPI ratio needs improvement before scaling (target: 2x+)');
    insights.push('Consider machine learning models for predictive LTV optimization');
    insights.push('Test loyalty programs to increase player lifetime value');
  } else {
    decision = 'scale';
    insights.push('Strong unit economics support controlled scaling');
    insights.push(`Payback period: ${results.paybackDays} days (target: <30 days)`);
    insights.push('Consider expanding to high-LTV markets (North America, Japan)');
  }

  return { results, decision, insights };
}

export function computeIntermediateMetrics({ rows, d30, targetDay }) {
  const cohorts = [];
  let totalSpend = 0;
  let totalUsers = 0;
  let weightedD1 = 0;
  let weightedCPI = 0;
  let totalRevenue = 0;

  rows.forEach(row => {
    const { source, users, cpi, d1, d1Arpu } = row;
    const spend = users * cpi;
    totalSpend += spend;
    totalUsers += users;
    weightedD1 += d1 * users;
    weightedCPI += cpi * users;
    const revenue = users * d1Arpu;
    totalRevenue += revenue;
    cohorts.push({ source, users, cpi, d1, d1Arpu, spend, revenue });
  });

  const avgD1 = weightedD1 / Math.max(totalUsers, 1);
  const avgCPI = weightedCPI / Math.max(totalUsers, 1);
  const d1Roas = totalSpend > 0 ? (totalRevenue / totalSpend) * 100 : 0;

  const d1Revenue = totalUsers > 0 ? totalRevenue / totalUsers : 0; // D1 ARPU
  const retentionDecay = Math.log(Math.max(d30, 0.0001) / Math.max(avgD1, 0.0001)) / Math.log(30);
  const projectedLifetime = calculatePredictiveLifetime(avgD1, d30, retentionDecay);
  const estimatedLTV = d1Revenue * projectedLifetime * (targetDay / 30);
  const projectedRoas = totalSpend > 0 ? (estimatedLTV * totalUsers / totalSpend) * 100 : 0;

  const mlReadinessScore = cohorts.length ? calculateMLReadinessScore(cohorts, avgD1, d30) : 0;

  const results = {
    totalSpend: totalSpend.toFixed(0),
    totalUsers: totalUsers.toFixed(0),
    avgCPI: avgCPI.toFixed(2),
    avgD1: avgD1.toFixed(1),
    d1Roas: d1Roas.toFixed(1),
    projectedRoas: projectedRoas.toFixed(1),
    estimatedLTV: estimatedLTV.toFixed(2),
    cohorts: cohorts,
    mlReadinessScore: mlReadinessScore.toFixed(1),
    predictiveLifetime: projectedLifetime.toFixed(1)
  };

  const insights = [];
  cohorts.forEach(cohort => {
    const cohortRoas = cohort.spend > 0 ? (cohort.revenue / cohort.spend) * 100 : 0;
    if (d1Roas > 0 && cohortRoas > d1Roas * 1.2) {
      insights.push(`${cohort.source} performing ${((cohortRoas / d1Roas - 1) * 100).toFixed(0)}% above average`);
    } else if (d1Roas > 0 && cohortRoas < d1Roas * 0.8) {
      insights.push(`${cohort.source} underperforming - consider reducing spend`);
    }
  });

  let decision = 'iterate';
  if (projectedRoas < 100) {
    decision = 'iterate';
    insights.push(`Projected ${targetDay}-day ROAS below breakeven`);
  } else if (projectedRoas < 150) {
    decision = 'iterate';
    insights.push('Marginal profitability - optimize before scaling');
  } else {
    decision = 'scale';
    insights.push(`Strong ${targetDay}-day ROAS projection: ${parseFloat(projectedRoas).toFixed(0)}%`);
  }

  return { results, decision, insights };
}

export function computeAdvancedMetrics({ d1, d3, d7, d30, iapArpdau, adArpdau, payingShare, arppu, totalSpend, totalInstalls, kFactor, market }) {
  const cpi = totalInstalls > 0 ? totalSpend / totalInstalls : 0;
  const effectiveInstalls = totalInstalls * (1 + kFactor);
  const eCPI = effectiveInstalls > 0 ? totalSpend / effectiveInstalls : 0;
  let b = Math.log((d7/100) / (d1/100)) / Math.log(7);
  b = Math.max(-2, Math.min(b, -0.1));
  const a = d1 / 100;
  const blendedArpdau = iapArpdau + adArpdau;
  const ltv90 = calculateAdvancedLTV(a, b, blendedArpdau, 90);
  const ltv180 = calculateAdvancedLTV(a, b, blendedArpdau, 180);
  const ltv365 = calculateAdvancedLTV(a, b, blendedArpdau, 365);
  const d7Revenue = blendedArpdau * 7 * (d7 / 100);
  const d30Revenue = blendedArpdau * 30 * (d30 / 100);
  const d7Roas = eCPI > 0 ? (d7Revenue / eCPI) * 100 : 0;
  const d30Roas = eCPI > 0 ? (d30Revenue / eCPI) * 100 : 0;

  const results = {
    cpi: cpi.toFixed(2),
    eCPI: eCPI.toFixed(2),
    organicUplift: (kFactor * 100).toFixed(0),
    ltv90: ltv90.toFixed(2),
    ltv180: ltv180.toFixed(2),
    ltv365: ltv365.toFixed(2),
    ltvCpiRatio180: (eCPI > 0 ? ltv180 / eCPI : 0).toFixed(2),
    d7Roas: d7Roas.toFixed(1),
    d30Roas: d30Roas.toFixed(1),
    paybackDays: blendedArpdau > 0 ? Math.round(eCPI / blendedArpdau) : Infinity,
    blendedArpdau: blendedArpdau.toFixed(3),
    monetizationMix: {
      iap: blendedArpdau > 0 ? ((iapArpdau / blendedArpdau) * 100).toFixed(0) : '0',
      ads: blendedArpdau > 0 ? ((adArpdau / blendedArpdau) * 100).toFixed(0) : '0'
    },
    retentionHealth: getRetentionHealth(d1, d7, d30),
    projectedMonthlyRevenue: (ltv180 * totalInstalls * 6 / 180).toFixed(0)
  };

  const insights = [];
  let decision = 'iterate';
  if (d1 < 27 || d7 < 8 || d30 < 2.5) {
    decision = 'shutdown';
    insights.push('Retention below 2025 viability thresholds (D1<27%, D7<8%, D30<2.5%)');
    insights.push('Implement dynamic content and personalization before scaling');
  } else if (parseFloat(results.ltvCpiRatio180) < 2) {
    decision = 'iterate';
    insights.push('LTV:CPI ratio below 2025 threshold (2x minimum)');
    insights.push('Deploy predictive LTV models using early user signals');
    insights.push('Test generative AI for dynamic content to boost engagement');
  } else if (parseFloat(results.ltvCpiRatio180) < 3.5) {
    decision = 'scale';
    insights.push('Metrics support scaling with predictive optimization');
    insights.push('Target 3.5:1 LTV:CPI ratio for sustainable growth in 2025');
    insights.push('Consider implementing loyalty programs for LTV expansion');
  } else {
    decision = 'scale';
    insights.push('Excellent unit economics - ready for aggressive scaling');
    insights.push(`Strong ${results.ltvCpiRatio180}x LTV:CPI ratio exceeds 2025 benchmarks`);
    insights.push('Expand to tier-1 markets with premium monetization strategies');
  }

  if (market === 'tier1') {
    insights.push('Tier 1 markets: Higher CPIs but stronger monetization potential');
  } else if (market === 'tier2') {
    insights.push('Tier 2 markets: Balanced CPI and monetization');
  } else {
    insights.push('Tier 3 markets: Lower CPIs but requires volume for profitability');
  }

  return { results, decision, insights };
}
