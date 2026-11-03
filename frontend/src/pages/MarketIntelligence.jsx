import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TrendingUp, TrendingDown, Minus, Filter, ExternalLink, Calendar, MapPin, AlertCircle } from 'lucide-react';

const TrendCard = ({ data }) => {
  const getMomentumIcon = () => {
    if (data.momentum === 'bullish') return <TrendingUp size={24} className="text-success" />;
    if (data.momentum === 'bearish') return <TrendingDown size={24} className="text-danger" />;
    return <Minus size={24} className="text-ferrero-brown-light" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ferrero-cream p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-ferrero-gold" />
          <span className="font-bold text-ferrero-dark text-lg">{data.origin}</span>
        </div>
        <div className="p-2 bg-ferrero-cream-light rounded-xl">
          {getMomentumIcon()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-semibold text-ferrero-brown-light mb-1">Current Price (EUR/mt)</div>
        <div className="text-3xl font-black text-ferrero-dark">€{data.current_price.toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ferrero-cream-light">
        <div>
          <div className="text-xs text-ferrero-brown-medium mb-1">7D Change</div>
          <div className={`font-bold ${data.change_7d_pct > 0 ? 'text-success' : data.change_7d_pct < 0 ? 'text-danger' : 'text-ferrero-brown'}`}>
            {data.change_7d_pct > 0 ? '+' : ''}{data.change_7d_pct}%
          </div>
        </div>
        <div>
          <div className="text-xs text-ferrero-brown-medium mb-1">30D Change</div>
          <div className={`font-bold ${data.change_30d_pct > 0 ? 'text-success' : data.change_30d_pct < 0 ? 'text-danger' : 'text-ferrero-brown'}`}>
            {data.change_30d_pct > 0 ? '+' : ''}{data.change_30d_pct}%
          </div>
        </div>
      </div>
    </div>
  );
};

const SignalCard = ({ signal }) => (
  <div className="bg-white p-5 rounded-xl border border-ferrero-cream shadow-sm flex gap-4 items-start">
    <div className={`mt-1 p-2 rounded-full shrink-0 ${
      signal.severity === 'critical' ? 'bg-danger/20 text-danger' : 
      signal.severity === 'high' ? 'bg-warning/20 text-warning' : 
      'bg-info/20 text-info'
    }`}>
      <AlertCircle size={20} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-ferrero-gold-dark">{signal.category}</span>
        <span className="text-xs text-ferrero-brown-light">{new Date(signal.timestamp).toLocaleDateString()}</span>
      </div>
      <h4 className="font-bold text-ferrero-dark mb-1">{signal.title}</h4>
      <p className="text-sm text-ferrero-brown-medium mb-2">{signal.description}</p>
      {signal.value && (
        <span className="inline-block bg-[#FFF8F0] border border-ferrero-cream px-2 py-1 rounded text-xs font-bold text-ferrero-brown">
          Impact: {signal.value}
        </span>
      )}
    </div>
  </div>
);

const NewsCard = ({ item }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-ferrero-cream p-6 flex flex-col h-full">
    <div className="flex justify-between items-center mb-3">
      <span className="text-xs font-bold bg-ferrero-dark text-ferrero-gold px-3 py-1 rounded-full">
        {item.category}
      </span>
      <div className="flex items-center gap-1 text-xs text-ferrero-brown-light font-semibold">
        <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
      </div>
    </div>
    
    <h3 className="font-bold text-ferrero-dark text-lg mb-2 leading-tight">{item.title}</h3>
    <p className="text-sm text-ferrero-brown-medium mb-4 flex-1">{item.summary}</p>
    
    <div className="bg-ferrero-cream-light p-4 rounded-xl mb-4">
      <div className="text-xs font-bold text-ferrero-brown mb-2 uppercase">Key Takeaways</div>
      <ul className="space-y-1">
        {item.takeaways?.map((point, idx) => (
          <li key={idx} className="text-sm text-ferrero-dark flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-ferrero-gold rounded-full mt-1.5 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="flex justify-between items-center pt-3 border-t border-ferrero-cream mt-auto">
      <span className="text-sm font-semibold text-ferrero-brown-light">{item.source}</span>
      <button className="text-ferrero-gold hover:text-ferrero-gold-dark flex items-center gap-1 text-sm font-bold transition-colors">
        Read Report <ExternalLink size={14} />
      </button>
    </div>
  </div>
);

export default function MarketIntelligence() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [data, setData] = useState({ trends: {}, signals: [], news: [] });
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Price', 'Weather', 'Supply', 'FX', 'Tariff'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsData, signalsData, newsData] = await Promise.all([
          api.getMarketTrends(),
          api.getMarketSignals(),
          api.getMarketNews()
        ]);
        setData({ trends: trendsData, signals: signalsData, news: newsData });
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter signals and news
  const filteredSignals = activeFilter === 'All' 
    ? data.signals 
    : data.signals.filter(s => s.category.toLowerCase() === activeFilter.toLowerCase());
    
  const filteredNews = activeFilter === 'All'
    ? data.news
    : data.news.filter(n => n.category.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-6 lg:space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-ferrero-cream-light rounded mb-8"></div>
        <div className="flex gap-3 mb-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-24 bg-ferrero-cream-light rounded-full"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-ferrero-cream-light rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ferrero-dark">Market Intelligence</h1>
          <p className="text-ferrero-brown-medium mt-1">Real-time signals, trends, and reports</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="p-2 bg-white rounded-full shadow-sm text-ferrero-brown-light border border-ferrero-cream mr-2">
          <Filter size={20} />
        </div>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm ${
              activeFilter === filter 
                ? 'bg-ferrero-gold text-white shadow-md' 
                : 'bg-white text-ferrero-brown border border-ferrero-cream hover:border-ferrero-gold hover:text-ferrero-gold'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Row 1: Trends */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-ferrero-dark mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-ferrero-gold" /> Key Origin Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(data.trends).map((trend, i) => (
            <TrendCard key={i} data={trend} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Signals Feed (40%) */}
        <div className="lg:col-span-5">
          <h2 className="text-xl font-bold text-ferrero-dark mb-6 flex items-center gap-2">
            <AlertCircle size={24} className="text-ferrero-gold" /> Live Signals
          </h2>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredSignals.length > 0 ? (
              filteredSignals.map((signal, i) => <SignalCard key={i} signal={signal} />)
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-ferrero-cream border-dashed text-ferrero-brown-medium">
                No signals found for this category.
              </div>
            )}
          </div>
        </div>

        {/* News & Reports (60%) */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-bold text-ferrero-dark mb-6 flex items-center gap-2">
            <ExternalLink size={24} className="text-ferrero-gold" /> Intelligence Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((item, i) => <NewsCard key={i} item={item} />)
            ) : (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-ferrero-cream border-dashed text-ferrero-brown-medium">
                No reports found for this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
