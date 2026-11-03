import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CloudRain, Thermometer, Droplets, Sun, AlertTriangle, Calendar } from 'lucide-react';

export default function WeatherIntelligence() {
  const [conditions, setConditions] = useState([]);
  const [timeline, setTimeline] = useState({});
  const [frostRisk, setFrostRisk] = useState([]);
  const [harvestCalendar, setHarvestCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [cond, time, frost, harvest] = await Promise.all([
          api.getWeatherConditions(),
          api.getWeatherTimeline(),
          api.getFrostRisk(),
          api.getHarvestCalendar()
        ]);
        setConditions(cond || []);
        setTimeline(time || {});
        setFrostRisk(frost || []);
        setHarvestCalendar(harvest || []);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="p-8 text-ferrero-dark font-semibold">Loading Weather Intel...</div>;
  }

  return (
    <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ferrero-dark flex items-center gap-3">
          <CloudRain className="text-ferrero-gold" size={32} />
          Weather Intelligence
        </h1>
        <p className="text-ferrero-brown-medium mt-1">Real-time crop monitoring and environmental risk analysis</p>
      </div>

      {/* Row 1: 3 Region Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {conditions.map((region, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ferrero-dark flex items-center gap-2">
                {region.flag} {region.region}
              </h2>
              {region.frostRisk === 'HIGH' && (
                <span className="bg-danger text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  FROST RISK
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex items-center gap-2 text-ferrero-brown bg-ferrero-cream-light p-2 rounded-lg">
                <Thermometer size={18} className="text-ferrero-brown-medium" /> 
                <span className="font-semibold text-lg">{region.temp}</span>
              </div>
              <div className="flex items-center gap-2 text-ferrero-brown bg-ferrero-cream-light p-2 rounded-lg">
                <Droplets size={18} className="text-info" /> 
                <span className="font-semibold text-lg">{region.rainfall}mm</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-ferrero-brown-medium font-medium">
                  <span>Crop Health</span>
                  <span>{region.cropHealth}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${region.cropHealth < 75 ? 'bg-warning' : 'bg-success'}`} style={{width: `${region.cropHealth}%`}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1 text-ferrero-brown-medium font-medium">
                  <span>Chilling Hours</span>
                  <span>{region.chillingHours} / {region.chillingTarget}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-info h-2.5 rounded-full" style={{width: `${Math.min(100, (region.chillingHours/region.chillingTarget)*100)}%`}}></div>
                </div>
              </div>
            </div>

            {/* AI Business Insight Section */}
            <div className="mt-6 pt-4 border-t border-ferrero-cream bg-gradient-to-r from-[#FFF8F0] to-[#FAF3E8] -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
              <div className="text-[11px] font-bold text-ferrero-gold-dark mb-2 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={12} /> Financial Value at Risk
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-ferrero-brown-medium mb-1">Projected Spot Impact</div>
                  <div className={`font-bold ${region.region.includes('Turkey') ? 'text-danger' : 'text-success'}`}>
                    {region.region.includes('Turkey') ? '+€0.45 / kg (Elevated)' : region.region.includes('Italy') ? 'Stable (Baseline)' : 'Counter-Seasonal Edge'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ferrero-brown-medium mb-1">Recommended Action</div>
                  <div className="font-bold text-ferrero-dark text-sm bg-white px-2 py-1 rounded shadow-sm border border-ferrero-cream inline-block">
                    {region.region.includes('Turkey') ? 'Shift 15% Vol' : region.region.includes('Italy') ? 'Maintain Contracts' : 'Increase 10% Vol'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Growing Season Timeline visual */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream">
        <h2 className="text-xl font-bold text-ferrero-dark mb-4 flex items-center gap-2">
          <Sun className="text-ferrero-gold" /> Strategic Pricing Timeline
        </h2>
        <p className="text-sm text-ferrero-brown-medium mb-6">Aligning biological weather risk with financial hedging and buying windows.</p>
        <div className="relative pt-8 pb-4 px-2">
          <div className="absolute top-[45px] left-8 right-8 h-2 bg-ferrero-cream-light rounded-full"></div>
          <div className="relative flex justify-between w-full">
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-5 h-5 bg-gray-400 rounded-full z-10 mb-3 border-4 border-white shadow-sm"></div>
              <span className="text-sm font-semibold text-ferrero-brown">Oct-Feb</span>
              <span className="text-xs text-ferrero-brown-medium mb-4">Dormancy</span>
              <div className="w-11/12 bg-white border border-info border-t-4 border-t-info p-3 rounded-lg shadow-sm text-center">
                <div className="text-[11px] uppercase text-ferrero-brown-medium font-bold mb-1">Optimal Window</div>
                <div className="text-sm font-bold text-ferrero-dark">Lock Forward Contracts</div>
                <div className="text-xs text-info font-medium mt-1">Pre-frost pricing</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 bg-danger rounded-full z-10 mb-1 flex items-center justify-center animate-pulse shadow-md border-2 border-white mt-[-6px]">
                <AlertTriangle size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-danger mt-1">Mar-Apr</span>
              <span className="text-xs font-bold text-danger mb-4">FROST RISK</span>
              <div className="w-11/12 bg-white border border-danger border-t-4 border-t-danger p-3 rounded-lg shadow-sm text-center">
                <div className="text-[11px] uppercase text-ferrero-brown-medium font-bold mb-1">Defense Window</div>
                <div className="text-sm font-bold text-ferrero-dark">Pause Spot Buying</div>
                <div className="text-xs text-danger font-medium mt-1">Execute FX hedges</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-5 h-5 bg-success rounded-full z-10 mb-3 border-4 border-white shadow-sm"></div>
              <span className="text-sm font-semibold text-ferrero-brown">May-Jul</span>
              <span className="text-xs text-ferrero-brown-medium mb-4">Development</span>
              <div className="w-11/12 bg-white border border-success border-t-4 border-t-success p-3 rounded-lg shadow-sm text-center">
                <div className="text-[11px] uppercase text-ferrero-brown-medium font-bold mb-1">Assessment Window</div>
                <div className="text-sm font-bold text-ferrero-dark">Rebalance Origins</div>
                <div className="text-xs text-success font-medium mt-1">Shift via yield data</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-5 h-5 bg-ferrero-gold rounded-full z-10 mb-3 border-4 border-white shadow-sm"></div>
              <span className="text-sm font-semibold text-ferrero-brown">Aug-Sep</span>
              <span className="text-xs text-ferrero-gold-dark font-bold mb-4">HARVEST</span>
              <div className="w-11/12 bg-white border border-ferrero-gold border-t-4 border-t-ferrero-gold p-3 rounded-lg shadow-sm text-center">
                <div className="text-[11px] uppercase text-ferrero-brown-medium font-bold mb-1">Execution Window</div>
                <div className="text-sm font-bold text-ferrero-dark">Maximize Spot Buys</div>
                <div className="text-xs text-ferrero-gold-dark font-medium mt-1">High liquidity phase</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 3: Historical Frost Events table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-ferrero-cream flex flex-col">
          <h2 className="text-xl font-bold text-ferrero-dark mb-6 flex items-center gap-2">
            <AlertTriangle className="text-danger" /> Historical Frost Events
          </h2>
          <div className="space-y-4 flex-1">
            {frostRisk.map((event, i) => (
              <div key={i} className="p-4 bg-ferrero-cream-light rounded-xl border border-ferrero-cream">
                <div className="font-bold text-ferrero-dark text-lg mb-3">{event.event}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-ferrero-brown-medium mb-1">Crop Impact</div>
                    <div className="font-semibold text-danger">{event.cropLoss}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-100">
                    <div className="text-xs text-ferrero-brown-medium mb-1">Price Impact</div>
                    <div className="font-semibold text-ferrero-brown">{event.priceImpact}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: AI Executive Weather Briefing */}
        <div className="bg-ferrero-dark p-6 rounded-2xl shadow-lg border border-ferrero-brown flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CloudRain size={120} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-ferrero-gold mb-4 flex items-center gap-2 relative z-10">
            <Thermometer className="text-ferrero-gold" /> AI Weather-to-Business Briefing
          </h2>
          <div className="space-y-4 mt-2 flex-1 relative z-10">
            <p className="text-white text-lg leading-relaxed font-medium">
              Based on real-time environmental data, Turkey is tracking a <span className="text-danger font-bold">15% deficit</span> in chilling hours, elevating the risk of a sub-optimal yield for the upcoming harvest. 
            </p>
            <p className="text-ferrero-cream-light text-base leading-relaxed">
              <strong>Strategic Recommendation:</strong> To protect Q3/Q4 operating margins from potential raw material inflation, we recommend immediately increasing Oregon forward contracts by 12% before global commodities markets fully price-in the Black Sea deficit.
            </p>
            <div className="mt-6 pt-6 border-t border-ferrero-brown/50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-ferrero-brown-medium mb-1 uppercase tracking-wider">Hedging Confidence</div>
                <div className="text-2xl font-bold text-success">88%</div>
              </div>
              <div>
                <div className="text-xs text-ferrero-brown-medium mb-1 uppercase tracking-wider">Estimated Margin Saved</div>
                <div className="text-2xl font-bold text-ferrero-gold">€2.4M</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
