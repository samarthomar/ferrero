import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import UnifiedDashboard from './pages/UnifiedDashboard';
import ScenarioSimulator from './pages/ScenarioSimulator';
import AIAdvisor from './pages/AIAdvisor';
import MarketIntelligence from './pages/MarketIntelligence';
import WeatherIntelligence from './pages/WeatherIntelligence';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<UnifiedDashboard />} />
          <Route path="scenarios" element={<ScenarioSimulator />} />
          <Route path="weather" element={<WeatherIntelligence />} />
          <Route path="advisor" element={<AIAdvisor />} />
          {/* Keep the branded sidebar URLs working as stable aliases. */}
          <Route path="recipes" element={<ScenarioSimulator />} />
          <Route path="predictions" element={<AIAdvisor />} />
          <Route path="market" element={<MarketIntelligence />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
