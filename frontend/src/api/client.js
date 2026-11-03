import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 5000,
});

// Interceptor for responses
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn('API call failed:', error.message);
    return Promise.reject(error);
  }
);

// Basic mock generator helper
const mockWrapper = async (call, mockData) => {
  try {
    return await call();
  } catch (error) {
    console.warn('Using mock fallback for:', error.config?.url || 'unknown endpoint');
    return mockData;
  }
};

export const api = {
  // Dashboard
  getUnifiedDashboard: () => mockWrapper(() => client.get('/dashboard/unified'), { kpis: {}, charts: [], risk_scores: {}, suppliers: [] }),
  getDashboardKpis: () => mockWrapper(() => client.get('/dashboard/kpis'), { current_price_eur: 4200, price_change_30d_pct: 2.1, total_exposure_m: 120.5, days_of_supply: 45, eur_usd: 1.08, eur_try: 32.5, active_contracts: 14, inventory_utilization_pct: 85 }),
  getRiskScores: () => mockWrapper(() => client.get('/dashboard/risk-scores'), { supply: {score: 45, detail: ''}, fx: {score: 60, detail: ''}, tariff: {score: 80, detail: ''}, weather: {score: 30, detail: ''}, demand: {score: 25, detail: ''}, logistics: {score: 50, detail: ''} }),
  
  // Market
  getMarketSignals: () => mockWrapper(() => client.get('/market/signals'), [{ severity: 'high', category: 'supply', title: 'Frost in Turkey', description: 'Early frost expected in Ordu', timestamp: new Date().toISOString(), value: '-10%' }]),
  getMarketAlerts: () => mockWrapper(() => client.get('/market/alerts'), [{ severity: 'critical', category: 'tariff', title: 'New EU Tariff', description: 'Proposed 5% hike', timestamp: new Date().toISOString(), value: '5%' }]),
  getMarketTrends: () => mockWrapper(() => client.get('/market/trends'), { turkey: { origin: 'Turkey', current_price: 3450, momentum: 'bullish', change_7d_pct: 1.5, change_30d_pct: 4.2, momentum_score: 80 } }),
  getMarketNews: () => mockWrapper(() => client.get('/market/news'), [{ title: 'Cocoa hits all-time high', source: 'Bloomberg', date: '2024-03-20', summary: 'Deficit widens', takeaways: ['Buy now'], category: 'Price' }]),
  
  // Scenarios
  simulateScenario: (params) => mockWrapper(() => client.post('/scenarios/simulate', params), { baseline: {total_cost_m: 100, price_per_kg: 3.5, supplier_mix: 'Diversified', margin_pct: 25, annual_volume_tons: 102000}, scenario: {total_cost_m: 110, price_per_kg: 3.8, supplier_mix: 'Concentrated', margin_pct: 22}, impact: {cost_delta_m: 10, cost_delta_pct: 10, price_delta_eur_kg: 0.30, demand_volume_delta_tons: 0, breakdown: {}, margin_impact_pct: -3}, recommendation: {action: 'HEDGE & BUY', detail: 'This scenario triggers a severe 10.0% surge in pricing costs, eroding gross margins by 3.0%. The primary cost drivers are TRY currency depreciation and freight rate spikes. To mitigate this, immediately execute forward FX hedging and aggressively rebalance the supplier mix towards Oregon. We strongly recommend temporarily increasing the Alba and Istanbul warehouse inventory buffers by 15-20% to weather the incoming price storm.', inventory_buffer: 'Increase by 15-20%', risk_changes: {}} }),
  getScenarioPresets: () => mockWrapper(() => client.get('/scenarios/presets'), [
    { name: 'Worst Case 2024', description: 'El Nino + Red Sea', icon: 'AlertTriangle', params: {tariff_change_pct: 10, fx_rate_change_pct: 15, supply_disruption_pct: 20, demand_change_pct: -5, logistics_cost_change_pct: 30, weather_impact_pct: -20} },
    { name: '2025 Turkey Frost Replay', description: 'Severe spring frost', icon: 'CloudRain', params: {tariff_change_pct: 0, fx_rate_change_pct: 5, supply_disruption_pct: 40, demand_change_pct: 0, logistics_cost_change_pct: 5, weather_impact_pct: -50} }
  ]),
  
  // Weather
  getWeatherConditions: () => mockWrapper(() => client.get('/weather/conditions'), [
    { region: 'Turkey Black Sea', flag: '🇹🇷', temp: '14°C', rainfall: 85, normalRainfall: 100, cropHealth: 65, frostRisk: 'HIGH', chillingHours: 850, chillingTarget: 1000 },
    { region: 'Italy Piedmont', flag: '🇮🇹', temp: '12°C', rainfall: 45, normalRainfall: 40, cropHealth: 85, frostRisk: 'LOW', chillingHours: 950, chillingTarget: 1000 },
    { region: 'Oregon Willamette Valley', flag: '🇺🇸', temp: '10°C', rainfall: 120, normalRainfall: 110, cropHealth: 78, frostRisk: 'MEDIUM', chillingHours: 1100, chillingTarget: 1000 }
  ]),
  getWeatherTimeline: () => mockWrapper(() => client.get('/weather/timeline'), { currentMonth: 3 }), // 0 indexed, 3 = April
  getFrostRisk: () => mockWrapper(() => client.get('/weather/frost-risk'), [
    { event: 'April 2025 Turkey Frost', cropLoss: '50% crop loss', priceImpact: 'Prices +35%' },
    { event: '2014 Turkey Frost', cropLoss: 'Major crop damage', priceImpact: 'Prices doubled' }
  ]),
  getHarvestCalendar: () => mockWrapper(() => client.get('/weather/harvest-calendar'), [
    { region: 'Turkey', window: 'Aug 15 - Sep 30' },
    { region: 'Italy', window: 'Aug 25 - Nov 15' },
    { region: 'Oregon', window: 'Sep 15 - Oct 31' }
  ]),

  // Advisor
  recommendAction: (query) => mockWrapper(() => client.post('/advisor/recommend', {query}), { action: 'BUY', title: 'Increase Hazelnut Inventory', confidence_score: 88, reasoning: ['Frost risk in Turkey', 'FX favorable'], sources: [{doc: 'Market Report Q1', excerpt: 'Expected shortage', relevance: 90}], risk_factors: ['Logistics delays'], estimated_impact: '€2.5M savings', model: 'GPT-4-Turbo', data_freshness: '1 hour ago' }),
  getAdvisorRecommendation: (query) => mockWrapper(() => client.post('/advisor/recommend', { query }), { action: 'HEDGE', title: 'Execute forward contracts immediately', confidence_score: 92, confidence_rationale: "Base certainty (85%) computed via meteorological crop-yield correlations. A query complexity adjustment (+7%) was applied, yielding 92%.", reasoning: ['Crop health is critical', 'Historical data suggests 20% spike'], sources: [{ doc: 'Q1 Harvest Report', relevance: 98, excerpt: 'Yields down 15%' }], risk_factors: ['Further frost could worsen supply'], estimated_impact: 'Protects €4.2M in margins', model: 'GPT-4o (Mock)', data_freshness: 'Just now' }),
  getQuickActions: () => mockWrapper(() => client.get('/advisor/quick-actions'), [{ title: 'Hedge TRY', action: 'HEDGE', urgency: 'high', query: 'Should we hedge Turkish Lira now?' }, { title: 'Buy Cocoa', action: 'BUY', urgency: 'medium', query: 'Cocoa purchase strategy' }]),
  getRisks: () => mockWrapper(() => client.get('/advisor/risks'), { risks: [{category: 'Weather', severity: 'High', description: 'El Nino effect', mitigation: 'Diversify supply'}], overall_risk_level: 75 }),
  
  // Forecast
  getPrices: () => mockWrapper(() => client.get('/forecast/prices'), { forecast: [], confidence_interval: [] }),
};
