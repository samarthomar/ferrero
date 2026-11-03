import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import KPICard from '../components/KPICard';
import RiskRadar from '../components/RiskRadar';
import AlertCard from '../components/AlertCard';
import PriceChart from '../components/PriceChart';
import { ShieldAlert, TrendingUp, DollarSign, Activity, Package, Layers } from 'lucide-react';

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: null,
    riskScores: null,
    alerts: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unified, alerts] = await Promise.all([
          api.getUnifiedDashboard(),
          api.getMarketAlerts()
        ]);
        
        setData({ 
          kpis: unified.kpis, 
          riskScores: unified.risk_scores, 
          charts: unified.charts,
          alerts 
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-ferrero-cream-light w-48 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-ferrero-cream-light rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-96">
          <div className="lg:col-span-7 bg-ferrero-cream-light rounded-2xl"></div>
          <div className="lg:col-span-5 bg-ferrero-cream-light rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, riskScores, alerts, charts } = data;

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ferrero-dark">Hazelnut Pricing Intelligence</h1>
          <p className="text-ferrero-brown-medium mt-1">Ferrero Annual Demand: ~250,000 tonnes | 25% of Global Supply</p>
        </div>
        <div className="max-w-full truncate bg-ferrero-dark text-ferrero-gold px-3 sm:px-6 py-2 rounded-full font-semibold shadow-lg text-sm sm:text-base">
          Simulated Market Signals
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7 gap-6 mb-8">
        <KPICard 
          title="Current Price" 
          value={kpis?.current_price_eur?.toFixed(2) || '9.32'} 
          unit="€/kg" 
          trend={kpis?.price_change_30d_pct > 0 ? 'up' : 'down'} 
          percentChange={Math.abs(kpis?.price_change_30d_pct || 8.25)} 
        />
        <KPICard 
          title="Inventory" 
          value={kpis?.inventory_tons?.toLocaleString() || '38,500'} 
          unit="Tons" 
        />
        <KPICard 
          title="Total Exposure" 
          value={kpis?.total_exposure_m?.toFixed(1) || '85.8'} 
          unit="€M" 
        />
        <KPICard 
          title="Days of Supply" 
          value={kpis?.days_of_supply?.toFixed(1) || '18.3'} 
          warning={kpis?.days_of_supply < 20} 
        />
        <KPICard 
          title="EUR/USD" 
          value={kpis?.eur_usd?.toFixed(4) || '1.1478'} 
        />
        <KPICard 
          title="EUR/TRY" 
          value={kpis?.eur_try?.toFixed(2) || '31.79'} 
        />
        <KPICard 
          title="Contract Cov" 
          value={kpis?.contract_coverage_pct?.toFixed(1) || '42.0'} 
          unit="%" 
        />
      </div>

      {/* Row 2: Charts & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="min-w-0 lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream">
          <h2 className="text-xl font-bold text-ferrero-dark mb-6">Price Trend (€/kg)</h2>
          <div className="h-72 w-full">
            <PriceChart data={charts} />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream flex flex-col">
          <h2 className="text-xl font-bold text-ferrero-dark mb-6">Risk Radar</h2>
          <div className="flex-1 w-full flex items-center justify-center">
            <RiskRadar data={riskScores} />
          </div>
        </div>
      </div>

      {/* Row 3: Suppliers, FX, Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="min-w-0 bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream">
          <h2 className="text-xl font-bold text-ferrero-dark mb-4">Top Suppliers</h2>
          <div className="space-y-4">
            {['Olam International', 'Balsu Gida', 'Progida'].map((supplier, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-ferrero-cream-light rounded-lg transition-colors">
                <span className="font-semibold text-ferrero-brown">{supplier}</span>
                <span className="text-sm bg-ferrero-cream px-2 py-1 rounded text-ferrero-brown-medium">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream">
          <h2 className="text-xl font-bold text-ferrero-dark mb-4">FX Rates</h2>
          <div className="space-y-6">
            <div className="p-4 bg-ferrero-cream-light rounded-xl flex justify-between items-center">
              <span className="text-lg font-bold text-ferrero-dark">EUR / TRY</span>
              <span className="text-2xl font-bold text-ferrero-gold-dark">{kpis?.eur_try}</span>
            </div>
            <div className="p-4 bg-ferrero-cream-light rounded-xl flex justify-between items-center">
              <span className="text-lg font-bold text-ferrero-dark">EUR / USD</span>
              <span className="text-2xl font-bold text-ferrero-gold-dark">{kpis?.eur_usd}</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream">
          <div className="flex min-w-0 items-center justify-between gap-4 mb-4">
            <h2 className="min-w-0 truncate text-xl font-bold text-ferrero-dark">Critical Alerts</h2>
            <span className="shrink-0 bg-danger text-white text-xs px-2 py-1 rounded-full">{alerts?.length || 0}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {alerts?.map((alert, i) => (
              <AlertCard key={i} {...alert} timestamp={new Date(alert.timestamp).toLocaleDateString()} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
