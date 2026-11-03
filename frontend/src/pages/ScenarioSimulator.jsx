import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Settings, Play, AlertTriangle, TrendingDown, TrendingUp, Package, Shield, ArrowRight } from 'lucide-react';

export default function ScenarioSimulator() {
  const [params, setParams] = useState({
    tariff_change_pct: 0,
    fx_rate_change_pct: 0,
    supply_disruption_pct: 0,
    demand_change_pct: 0,
    logistics_cost_change_pct: 0,
    weather_impact_pct: 0,
    inventory_change_pct: 0
  });

  const [marketContext, setMarketContext] = useState('Standard Baseline');
  const [buyerStrategy, setBuyerStrategy] = useState('Standard Pricing');

  const applyMarketContext = (context) => {
    setMarketContext(context);
    if (context === 'Standard Baseline') applyPreset({ fx_rate_change_pct: 0, supply_disruption_pct: 0, logistics_cost_change_pct: 0, weather_impact_pct: 0, tariff_change_pct: 0 });
    else if (context === 'High Inflation (Bull)') applyPreset({ fx_rate_change_pct: 15, logistics_cost_change_pct: 20 });
    else if (context === 'Global Recession (Bear)') applyPreset({ fx_rate_change_pct: 0, demand_change_pct: -15, logistics_cost_change_pct: -5 });
    else if (context === 'Supply Chain Crisis') applyPreset({ supply_disruption_pct: 30, logistics_cost_change_pct: 40 });
  };

  const applyBuyerStrategy = (strategy) => {
    setBuyerStrategy(strategy);
    if (strategy === 'Standard Pricing') setParams(p => ({ ...p, demand_change_pct: 0 }));
    else if (strategy === 'Aggressive Growth') setParams(p => ({ ...p, demand_change_pct: 20 }));
    else if (strategy === 'Conservative') setParams(p => ({ ...p, demand_change_pct: -10 }));
  };

  const [presets, setPresets] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPresets, setFetchingPresets] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const data = await api.getScenarioPresets();
        setPresets(data || []);
      } catch (error) {
        console.error("Failed to fetch presets", error);
      } finally {
        setFetchingPresets(false);
      }
    };
    fetchPresets();
  }, []);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const applyPreset = (presetParams) => {
    setParams({
      ...params,
      ...presetParams
    });
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.simulateScenario(params);
      setResult(data);
    } catch (error) {
      console.error("Simulation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const Slider = ({ label, name, min, max, value, unit = "%" }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-ferrero-brown">{label}</label>
        <span className="text-sm font-bold text-ferrero-gold-dark bg-ferrero-cream px-2 py-1 rounded">
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-ferrero-cream-light rounded-lg appearance-none cursor-pointer accent-ferrero-gold"
      />
      <div className="flex justify-between text-xs text-ferrero-brown-light mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ferrero-dark">Scenario Simulator</h1>
        <p className="text-ferrero-brown-medium mt-1">Stress-test supply chain variables</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT PANEL: Controls (40%) */}
        <div className="min-w-0 lg:w-2/5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-ferrero-cream p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-ferrero-cream pb-4">
              <Settings className="text-ferrero-gold" size={24} />
              <h2 className="text-xl font-bold text-ferrero-dark">Scenario Parameters</h2>
            </div>

    <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ferrero-brown mb-1">AI Global Scenarios (Presets)</label>
                <select 
                  onChange={(e) => {
                    const selected = presets.find(p => p.name === e.target.value);
                    if (selected) applyPreset(selected.params);
                  }}
                  className="w-full bg-ferrero-cream-light border border-ferrero-cream rounded-lg p-2 text-ferrero-dark focus:outline-none focus:border-ferrero-gold"
                  disabled={fetchingPresets}
                >
                  <option value="">-- Select an AI Preset Scenario --</option>
                  {presets.map((preset, idx) => (
                    <option key={idx} value={preset.name}>{preset.name} ({preset.description})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-ferrero-brown mb-1">Market Context</label>
                  <select 
                    value={marketContext} 
                    onChange={(e) => applyMarketContext(e.target.value)}
                    className="w-full bg-ferrero-cream-light border border-ferrero-cream rounded-lg p-2 text-ferrero-dark focus:outline-none focus:border-ferrero-gold"
                  >
                    <option>Standard Baseline</option>
                    <option>High Inflation (Bull)</option>
                    <option>Global Recession (Bear)</option>
                    <option>Supply Chain Crisis</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-ferrero-brown mb-1">Buyer Strategy</label>
                  <select 
                    value={buyerStrategy} 
                    onChange={(e) => applyBuyerStrategy(e.target.value)}
                    className="w-full bg-ferrero-cream-light border border-ferrero-cream rounded-lg p-2 text-ferrero-dark focus:outline-none focus:border-ferrero-gold"
                  >
                    <option>Standard Pricing</option>
                    <option>Aggressive Growth</option>
                    <option>Conservative</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t border-ferrero-cream pt-4 mb-4">
              <h3 className="text-sm font-bold text-ferrero-brown mb-4">Custom Overrides</h3>
              <Slider label="Tariff Change" name="tariff_change_pct" min={-20} max={50} value={params.tariff_change_pct} />
              <Slider label="Currency Fluctuation" name="fx_rate_change_pct" min={-15} max={30} value={params.fx_rate_change_pct} />
              <Slider label="Supply Disruption" name="supply_disruption_pct" min={0} max={50} value={params.supply_disruption_pct} />
              <Slider label="Demand Change" name="demand_change_pct" min={-30} max={30} value={params.demand_change_pct} />
              <Slider label="Logistics Cost" name="logistics_cost_change_pct" min={-20} max={50} value={params.logistics_cost_change_pct} />
              <Slider label="Poor Harvest Impact" name="weather_impact_pct" min={-50} max={0} value={params.weather_impact_pct} />
              <Slider label="Strategic Inventory Buffer" name="inventory_change_pct" min={-50} max={50} value={params.inventory_change_pct} />
            </div>

            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full mt-4 bg-ferrero-gold hover:bg-ferrero-gold-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><Play size={20} fill="currentColor" /> Run Simulation</>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Results (60%) */}
        <div className="min-w-0 lg:w-3/5">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-ferrero-cream border-dashed p-12 text-center">
              <div className="w-20 h-20 bg-ferrero-cream rounded-full flex items-center justify-center mb-4">
                <Settings size={32} className="text-ferrero-gold" />
              </div>
              <h2 className="text-xl font-bold text-ferrero-dark mb-2">Ready to Simulate</h2>
              <p className="text-ferrero-brown-medium max-w-md">Adjust the parameters on the left and click "Run Simulation" to see the projected impact on costs and margins.</p>
            </div>
          )}

          {loading && (
            <div className="h-full bg-white rounded-2xl shadow-sm border border-ferrero-cream p-8 animate-pulse">
              <div className="h-8 w-1/3 bg-ferrero-cream-light rounded mb-8"></div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="h-24 bg-ferrero-cream-light rounded-xl"></div>
                <div className="h-24 bg-ferrero-cream-light rounded-xl"></div>
                <div className="h-24 bg-ferrero-cream-light rounded-xl"></div>
              </div>
              <div className="h-64 bg-ferrero-cream-light rounded-xl"></div>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-ferrero-cream p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-ferrero-dark">Simulation Results</h2>
                  <p className="text-ferrero-brown-medium">Impact on standard baseline</p>
                </div>
                <div className="bg-ferrero-cream-light text-ferrero-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-ferrero-gold">
                  <Shield size={16} className="text-ferrero-gold" />
                  Action: {result.recommendation?.action}
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="p-5 rounded-xl border border-ferrero-cream bg-[#FFF8F0]">
                  <div className="text-sm font-semibold text-ferrero-brown-light mb-1">Total Cost Change</div>
                  <div className={`text-2xl font-bold ${result.impact?.cost_delta_m > 0 ? 'text-danger' : 'text-success'}`}>
                    {result.impact?.cost_delta_m > 0 ? '+' : ''}€{result.impact?.cost_delta_m}M
                    <span className="text-sm ml-2 opacity-70">({result.impact?.cost_delta_pct > 0 ? '+' : ''}{result.impact?.cost_delta_pct}%)</span>
                  </div>
                </div>
                
                <div className="p-5 rounded-xl border border-ferrero-cream bg-[#FFF8F0]">
                  <div className="text-sm font-semibold text-ferrero-brown-light mb-1">Price Impact (€/kg)</div>
                  <div className={`text-2xl font-bold ${result.impact?.price_delta_eur_kg > 0 ? 'text-danger' : 'text-success'}`}>
                    {result.impact?.price_delta_eur_kg > 0 ? '+' : ''}€{result.impact?.price_delta_eur_kg}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-ferrero-cream bg-[#FFF8F0]">
                  <div className="text-sm font-semibold text-ferrero-brown-light mb-1">New Demand Volume</div>
                  <div className="text-2xl font-bold text-ferrero-dark">
                    {((result.baseline?.annual_volume_tons || 102000) + (result.impact?.demand_volume_delta_tons || 0)).toLocaleString()} Tons
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${result.impact?.demand_volume_delta_tons > 0 ? 'text-ferrero-gold-dark' : result.impact?.demand_volume_delta_tons < 0 ? 'text-success' : 'text-ferrero-brown-light'}`}>
                    {result.impact?.demand_volume_delta_tons === 0 ? 'No change from baseline' : `${result.impact?.demand_volume_delta_tons > 0 ? '+' : ''}${result.impact?.demand_volume_delta_tons?.toLocaleString()} Tons impact`}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-ferrero-cream bg-[#FFF8F0]">
                  <div className="text-sm font-semibold text-ferrero-brown-light mb-1">Margin Impact</div>
                  <div className={`text-2xl font-bold ${result.impact?.margin_impact_pct < 0 ? 'text-danger' : 'text-success'}`}>
                    {result.impact?.margin_impact_pct > 0 ? '+' : ''}{result.impact?.margin_impact_pct}%
                  </div>
                </div>
              </div>

              {/* Baseline vs Scenario */}
              <div className="mb-10">
                <h3 className="text-lg font-bold text-ferrero-dark mb-4">Comparison</h3>
                <div className="bg-ferrero-cream-light rounded-xl p-1">
                  <div className="grid grid-cols-3 text-sm font-bold text-ferrero-brown p-3 border-b border-ferrero-cream/50">
                    <div>Metric</div>
                    <div>Baseline</div>
                    <div>Scenario</div>
                  </div>
                  
                  {[
                    { label: 'Total Cost', b: `€${result.baseline?.total_cost_m}M`, s: `€${result.scenario?.total_cost_m}M` },
                    { label: 'Price per Kg', b: `€${result.baseline?.price_per_kg}`, s: `€${result.scenario?.price_per_kg}` },
                    { label: 'Margin', b: `${result.baseline?.margin_pct}%`, s: `${result.scenario?.margin_pct}%` },
                    { 
                      label: 'Supplier Mix', 
                      b: typeof result.baseline?.supplier_mix === 'object' ? Object.keys(result.baseline.supplier_mix).map(k => `${k}: ${result.baseline.supplier_mix[k]}%`).join(', ') : result.baseline?.supplier_mix, 
                      s: typeof result.scenario?.supplier_mix === 'object' ? Object.keys(result.scenario.supplier_mix).map(k => `${k}: ${result.scenario.supplier_mix[k]}%`).join(', ') : result.scenario?.supplier_mix 
                    },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 p-3 bg-white mb-1 rounded-lg items-center">
                      <div className="font-semibold text-ferrero-dark">{row.label}</div>
                      <div className="text-ferrero-brown-medium">{row.b}</div>
                      <div className="font-bold flex items-center gap-2">
                        {row.s}
                        {row.b !== row.s && <ArrowRight size={14} className="text-ferrero-gold" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-ferrero-dark rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Package size={100} />
                </div>
                <h3 className="text-ferrero-gold font-bold mb-4">AI Recommendation</h3>
                <p className="text-[15px] leading-relaxed font-medium mb-4 whitespace-pre-line">
                  {result.recommendation?.detail}
                </p>
                <div className="inline-block bg-white/10 px-3 py-1 rounded text-sm">
                  Buffer Strategy: {result.recommendation?.inventory_buffer || 'Optimized'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
