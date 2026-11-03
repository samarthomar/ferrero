import axios from 'axios';
import { mockData } from '../data/mockData';

const client = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 5000,
});

// Interceptor for responses
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.warn('API call failed, falling back to mock data:', error.message);
    return Promise.reject(error);
  }
);

export const api = {
  getDashboardData: async () => {
    try {
      return await client.get('/dashboard');
    } catch {
      return mockData;
    }
  },
  getScenarios: async () => {
    try {
      return await client.get('/scenarios');
    } catch {
      return { scenarios: [], defaults: {} };
    }
  },
  runSimulation: async (params) => {
    try {
      return await client.post('/scenarios/simulate', params);
    } catch {
      return { 
        impact: { costChange: 1.5, marginImpact: -2.1, action: "WAIT" },
        chartData: []
      };
    }
  },
  getRecommendations: async () => {
    try {
      return await client.get('/advisor/recommendations');
    } catch {
      return mockData.recommendations;
    }
  },
  getMarketSignals: async () => {
    try {
      return await client.get('/market/signals');
    } catch {
      return mockData.alerts;
    }
  }
};
