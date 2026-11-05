import axios from 'axios';
import liveData from '../data/liveData.json';
import { runScenarioLocally } from '../services/scenarioEngine';
import { runAdvisorLocally } from '../services/advisorEngine';

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

// Mock wrapper — tries live API first, falls back to function or baked-in live data
const mockWrapper = async (call, mockData) => {
  try {
    return await call();
  } catch (error) {
    console.warn('Using mock fallback for:', error.config?.url || 'unknown endpoint');
    return typeof mockData === 'function' ? mockData() : mockData;
  }
};

export const api = {
  // Dashboard
  getUnifiedDashboard: () => mockWrapper(() => client.get('/dashboard/unified'), liveData.unified),
  getDashboardKpis: () => mockWrapper(() => client.get('/dashboard/kpis'), liveData.kpis),
  getRiskScores: () => mockWrapper(() => client.get('/dashboard/risk-scores'), liveData.risk_scores),

  // Market
  getMarketSignals: () => mockWrapper(() => client.get('/market/signals'), liveData.signals),
  getMarketAlerts: () => mockWrapper(() => client.get('/market/alerts'), liveData.alerts),
  getMarketTrends: () => mockWrapper(() => client.get('/market/trends'), liveData.trends),
  getMarketNews: () => mockWrapper(() => client.get('/market/news'), liveData.news),

  // Scenarios — uses client-side engine when backend is unavailable
  simulateScenario: (params) => mockWrapper(
    () => client.post('/scenarios/simulate', params),
    () => runScenarioLocally(params)
  ),
  getScenarioPresets: () => mockWrapper(() => client.get('/scenarios/presets'), liveData.presets),

  // Weather
  getWeatherConditions: () => mockWrapper(() => client.get('/weather/conditions'), liveData.weather_conditions),
  getWeatherTimeline: () => mockWrapper(() => client.get('/weather/timeline'), liveData.weather_timeline),
  getFrostRisk: () => mockWrapper(() => client.get('/weather/frost-risk'), liveData.frost_risk),
  getHarvestCalendar: () => mockWrapper(() => client.get('/weather/harvest-calendar'), liveData.harvest_calendar),

  // Advisor — uses client-side rule & calculation engine matching Python backend
  recommendAction: (query) => mockWrapper(
    () => client.post('/advisor/recommend', { query }),
    () => runAdvisorLocally(query)
  ),
  getAdvisorRecommendation: (query) => mockWrapper(
    () => client.post('/advisor/recommend', { query }),
    () => runAdvisorLocally(query)
  ),
  getQuickActions: () => mockWrapper(() => client.get('/advisor/quick-actions'), liveData.quick_actions),
  getRisks: () => mockWrapper(() => client.get('/advisor/risks'), liveData.risks),

  // Forecast
  getPrices: () => mockWrapper(() => client.get('/forecast/prices'), { forecast: [], confidence_interval: [] }),
};
