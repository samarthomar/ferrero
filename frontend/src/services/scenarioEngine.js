/**
 * Client-side Scenario Simulation Engine.
 * Mirrors the backend Python engine so Vercel deployment (no backend) shows real results.
 * Uses baseline data from liveData.json.
 */
import liveData from '../data/liveData.json';

function getBaseline() {
  const kpis = liveData.unified?.kpis || {};
  const charts = liveData.unified?.charts || [];
  const latest = charts.length > 0 ? charts[charts.length - 1] : {};

  const currentPrice = kpis.current_price_eur || latest.price_eur || 9.24;
  const inventory = kpis.inventory_tons || latest.inventory_tons || 34607;
  const eurTry = kpis.eur_try || latest.eur_try || 42.41;
  const demand = latest.demand_tons || 17240;

  const annualVolume = Math.round(demand * 12);
  const annualCost = annualVolume * currentPrice * 1000;

  // Supplier mix from live data
  const suppliers = liveData.unified?.suppliers || [];
  let supplierMix = {};
  if (suppliers.length > 0) {
    const totalVol = suppliers.reduce((s, c) => s + (c.volume_tons || 0), 0);
    suppliers.forEach(c => {
      const origin = c.origin || 'Unknown';
      supplierMix[origin] = (supplierMix[origin] || 0) + (c.volume_tons || 0);
    });
    if (totalVol > 0) {
      Object.keys(supplierMix).forEach(k => {
        supplierMix[k] = Math.round(supplierMix[k] / totalVol * 1000) / 10;
      });
    }
  } else {
    supplierMix = { Turkey: 73.9, Italy: 17.4, USA: 8.7 };
  }

  return {
    current_price_eur: Math.round(currentPrice * 100) / 100,
    annual_volume_tons: annualVolume,
    annual_cost_eur: Math.round(annualCost),
    annual_cost_m: Math.round(annualCost / 1_000_000 * 100) / 100,
    inventory_tons: Math.round(inventory),
    eur_try: Math.round(eurTry * 100) / 100,
    monthly_demand_tons: Math.round(demand),
    supplier_mix: supplierMix,
    margin_pct: 32.0,
  };
}

export function runScenarioLocally(params) {
  const baseline = getBaseline();

  const tariff = params.tariff_change_pct || 0;
  const fx = params.fx_rate_change_pct || 0;
  const supply = params.supply_disruption_pct || 0;
  const demand = params.demand_change_pct || 0;
  const logistics = params.logistics_cost_change_pct || 0;
  const weather = params.weather_impact_pct || 0;
  const inventory = params.inventory_change_pct || 0;

  const baseCost = baseline.annual_cost_eur;
  const basePrice = baseline.current_price_eur;

  // Price impact model
  const tariffImpact = baseCost * (tariff / 100);

  const turkeyShare = (baseline.supplier_mix.Turkey || 55) / 100;
  const fxImpact = baseCost * turkeyShare * (fx / 100) * 0.6;

  const supplyPriceMultiplier = supply > 0
    ? 1 + (Math.abs(supply) / 100 * 1.5)
    : 1 - (Math.abs(supply) / 100 * 0.3);
  const supplyImpact = baseCost * (supplyPriceMultiplier - 1) * 0.4;

  const weatherImpact = weather < 0 ? baseCost * (Math.abs(weather) / 100 * 1.2) : 0;

  const logisticsShare = 0.07;
  const logisticsImpact = baseCost * logisticsShare * (logistics / 100);

  const priceDrivenImpact = tariffImpact + fxImpact + supplyImpact + weatherImpact + logisticsImpact;
  const priceIncreasePct = baseCost > 0 ? (priceDrivenImpact / baseCost) * 100 : 0;

  // Elasticity
  const elasticityCoefficient = -0.2;
  const inducedDemandPct = priceIncreasePct * elasticityCoefficient;
  const totalDemandPct = demand + inducedDemandPct;
  const demandImpact = baseCost * (totalDemandPct / 100);

  // Inventory buffer cost
  const inventoryCostImpact = baseCost * (inventory / 100);

  const totalImpact = priceDrivenImpact + demandImpact + inventoryCostImpact;
  const scenarioCost = baseCost + totalImpact;
  const newEffectivePrice = basePrice * (scenarioCost / baseCost);

  // Supplier mix rebalancing
  const scenarioMix = { ...baseline.supplier_mix };
  if (supply > 10) {
    const turkeyReduction = Math.min(scenarioMix.Turkey || 55, supply * 0.8);
    scenarioMix.Turkey = Math.round(((scenarioMix.Turkey || 55) - turkeyReduction) * 10) / 10;
    scenarioMix.Italy = Math.round(((scenarioMix.Italy || 25) + turkeyReduction * 0.6) * 10) / 10;
    const usaKey = scenarioMix.USA !== undefined ? 'USA' : 'Oregon';
    scenarioMix[usaKey] = Math.round(((scenarioMix[usaKey] || 20) + turkeyReduction * 0.4) * 10) / 10;
  }
  if (fx > 10) {
    const shift = Math.min((scenarioMix.Turkey || 55) * 0.15, 10);
    scenarioMix.Turkey = Math.round(((scenarioMix.Turkey || 55) - shift) * 10) / 10;
    scenarioMix.Italy = Math.round(((scenarioMix.Italy || 25) + shift * 0.5) * 10) / 10;
    const usaKey = scenarioMix.USA !== undefined ? 'USA' : 'Oregon';
    scenarioMix[usaKey] = Math.round(((scenarioMix[usaKey] || 20) + shift * 0.5) * 10) / 10;
  }

  // Risk changes
  const riskChanges = {
    supply: supply !== 0 ? `${supply > 0 ? '+' : ''}${Math.round(supply * 0.8)}` : '0',
    fx: fx !== 0 ? `${fx > 0 ? '+' : ''}${Math.round(fx * 0.6)}` : '0',
    tariff: tariff > 0 ? `+${Math.round(tariff * 0.7)}` : '0',
    demand: demand !== 0 ? `${demand > 0 ? '+' : ''}${Math.round(demand * 0.4)}` : '0',
    logistics: logistics > 0 ? `+${Math.round(logistics * 0.3)}` : '0',
  };

  // Margin
  const deltaPct = (totalImpact / baseCost) * 100;
  const marginImpact = -deltaPct * 0.4;

  // Action
  let action;
  if (deltaPct > 8) action = 'BUY NOW';
  else if (deltaPct > 3) action = 'HEDGE & BUY';
  else if (deltaPct > 0) action = 'HOLD';
  else action = 'WAIT / DEFER';

  // Recommendation text
  const recLines = [];

  if (deltaPct > 0) {
    recLines.push(deltaPct > 5
      ? `• IMPACT: This scenario triggers a severe ${deltaPct.toFixed(1)}% surge in pricing costs, eroding gross margins by ${Math.abs(marginImpact).toFixed(1)}%.`
      : `• IMPACT: This scenario causes a moderate ${deltaPct.toFixed(1)}% cost increase.`);
  } else if (deltaPct < 0) {
    recLines.push(`• IMPACT: This scenario creates a highly favorable ${Math.abs(deltaPct).toFixed(1)}% cost reduction, improving gross margins by ${Math.abs(marginImpact).toFixed(1)}%.`);
  } else {
    recLines.push('• IMPACT: This baseline scenario maintains current market equilibrium with zero immediate cost deviation.');
  }

  const drivers = [];
  if (tariff > 5) drivers.push('new EU-Turkey tariffs');
  if (fx > 5) drivers.push('TRY currency depreciation');
  if (weather < -10) drivers.push('severe Black Sea frost damage');
  if (supply > 10) drivers.push('geopolitical supply chain shocks');
  if (logistics > 10) drivers.push('freight rate spikes');

  if (drivers.length > 0) {
    recLines.push(`• STRATEGY: The primary cost drivers are ${drivers.join(', and ')}. To mitigate this, immediately execute forward FX hedging and aggressively rebalance the supplier mix towards Oregon and Italy to bypass Black Sea exposure.`);
  } else if (deltaPct < 0) {
    recLines.push('• STRATEGY: Favorable macro conditions provide an opportunity to build strategic reserves at a discount. We advise securing long-term contracts now before market sentiment shifts.');
  } else {
    recLines.push('• STRATEGY: Market conditions are stable. Maintain current long-term supplier agreements and continue routine monitoring of Black Sea weather patterns.');
  }

  if (inventory > 0) {
    recLines.push(`• INVENTORY: Your simulated ${inventory}% increase in strategic inventory provides a strong physical buffer against these shocks, ensuring Nutella production lines remain uninterrupted despite the volatility.`);
  } else if (inventory < 0) {
    recLines.push(`• INVENTORY: WARNING! Simulating a ${Math.abs(inventory)}% drawdown in inventory leaves production dangerously exposed. Rebuild the buffer immediately.`);
  } else {
    if (deltaPct > 5) {
      recLines.push('• INVENTORY: We strongly recommend temporarily increasing the Alba and Istanbul warehouse inventory buffers by 15-20% to weather the incoming price storm.');
    } else {
      recLines.push('• INVENTORY: Current physical inventory buffers (approx. 60 days of supply) remain adequate for this scenario. No immediate adjustments to warehouse capacity are required.');
    }
  }

  const totalVolumePct = totalDemandPct + inventory;

  return {
    baseline: {
      total_cost_eur: Math.round(baseCost),
      total_cost_m: Math.round(baseCost / 1_000_000 * 100) / 100,
      price_per_kg: baseline.current_price_eur,
      supplier_mix: baseline.supplier_mix,
      margin_pct: baseline.margin_pct,
      annual_volume_tons: baseline.annual_volume_tons,
    },
    scenario: {
      total_cost_eur: Math.round(scenarioCost),
      total_cost_m: Math.round(scenarioCost / 1_000_000 * 100) / 100,
      price_per_kg: Math.round(newEffectivePrice * 100) / 100,
      supplier_mix: scenarioMix,
      margin_pct: Math.round((baseline.margin_pct + marginImpact) * 100) / 100,
    },
    impact: {
      cost_delta_eur: Math.round(totalImpact),
      cost_delta_m: Math.round(totalImpact / 1_000_000 * 100) / 100,
      cost_delta_pct: Math.round(deltaPct * 100) / 100,
      price_delta_eur_kg: Math.round((newEffectivePrice - basePrice) * 100) / 100,
      demand_volume_delta_tons: Math.round(baseline.annual_volume_tons * (totalVolumePct / 100)),
      breakdown: {
        tariff_impact_m: Math.round(tariffImpact / 1_000_000 * 100) / 100,
        fx_impact_m: Math.round(fxImpact / 1_000_000 * 100) / 100,
        supply_impact_m: Math.round(supplyImpact / 1_000_000 * 100) / 100,
        demand_impact_m: Math.round(demandImpact / 1_000_000 * 100) / 100,
        logistics_impact_m: Math.round(logisticsImpact / 1_000_000 * 100) / 100,
      },
      margin_impact_pct: Math.round(marginImpact * 100) / 100,
    },
    recommendation: {
      action,
      detail: recLines.join('\n\n'),
      inventory_buffer: deltaPct > 5 ? 'Increase by 20%' : deltaPct > 0 ? 'Increase by 10%' : 'Maintain current levels',
      risk_changes: riskChanges,
    },
  };
}
