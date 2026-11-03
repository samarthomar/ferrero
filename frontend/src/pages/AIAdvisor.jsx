import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Bot, Send, Search, Zap, AlertTriangle, CheckCircle, Clock, Database, ChevronRight, Info } from 'lucide-react';

export default function AIAdvisor() {
  const [quickActions, setQuickActions] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const actions = await api.getQuickActions();
        setQuickActions(actions || []);
      } catch (error) {
        console.error("Failed to fetch quick actions", error);
      }
    };
    fetchInit();
  }, []);

  const handleQuery = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q); // Update input field if clicked from quick action
    try {
      const rec = await api.recommendAction(q);
      setRecommendation(rec);
    } catch (error) {
      console.error("Failed to get recommendation", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      default: return 'bg-info';
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'BUY': return 'bg-success text-white';
      case 'HOLD': return 'bg-warning text-ferrero-dark';
      case 'WAIT': return 'bg-gray-400 text-white';
      case 'HEDGE': return 'bg-info text-white';
      default: return 'bg-ferrero-dark text-ferrero-gold';
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8 flex flex-col">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-ferrero-dark text-ferrero-gold rounded-2xl shadow-lg">
          <Bot size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ferrero-dark">AI Advisor</h1>
          <p className="text-ferrero-brown-medium mt-1">Intelligent pricing recommendations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-ferrero-brown mb-3 uppercase tracking-wider">Suggested Queries</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {quickActions.map((qa, i) => {
            if (qa.type === 'dropdown') {
              return (
                <div key={i} className="relative flex items-center bg-white rounded-full border border-ferrero-cream shadow-sm hover:border-ferrero-gold transition-all overflow-hidden pr-2">
                  <div className={`ml-4 w-2 h-2 rounded-full ${getUrgencyColor(qa.urgency)}`} />
                  <select 
                    onChange={(e) => {
                      if(e.target.value) handleQuery(e.target.value);
                      e.target.value = '';
                    }}
                    className="appearance-none bg-transparent py-2 pl-2 pr-6 text-sm font-semibold text-ferrero-dark focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled selected>{qa.title}</option>
                    {qa.options.map((opt, idx) => (
                      <option key={idx} value={opt.query}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-3 text-ferrero-brown pointer-events-none rotate-90" />
                </div>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleQuery(qa.query)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-ferrero-cream shadow-sm hover:border-ferrero-gold hover:shadow transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${getUrgencyColor(qa.urgency)}`} />
                <span className="text-sm font-semibold text-ferrero-dark">{qa.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col mb-8">
        {!recommendation && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-ferrero-cream bg-white/50 rounded-3xl p-12 text-center">
            <Search size={48} className="text-ferrero-cream-light mb-4" />
            <h2 className="text-xl font-bold text-ferrero-dark mb-2">Ask the Advisor</h2>
            <p className="text-ferrero-brown-medium max-w-md">Type a scenario or ask a question about the market to get AI-driven insights and pricing recommendations.</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-ferrero-cream p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-8 bg-ferrero-cream-light rounded-full" />
              <div className="h-8 flex-1 bg-ferrero-cream-light rounded" />
            </div>
            <div className="space-y-4 mb-8">
              <div className="h-4 bg-ferrero-cream-light rounded w-full" />
              <div className="h-4 bg-ferrero-cream-light rounded w-5/6" />
              <div className="h-4 bg-ferrero-cream-light rounded w-4/6" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-ferrero-cream-light rounded-2xl" />
              <div className="h-40 bg-ferrero-cream-light rounded-2xl" />
            </div>
          </div>
        )}

        {recommendation && !loading && (
          <div className="flex-1 bg-white rounded-3xl shadow-lg border border-ferrero-cream overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-ferrero-cream bg-gradient-to-r from-[#FFF8F0] to-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${getActionColor(recommendation.action)}`}>
                    {recommendation.action}
                  </span>
                  <h2 className="text-2xl font-bold text-ferrero-dark">{recommendation.title}</h2>
                </div>
                <div className="text-right relative group cursor-help">
                  <div className="text-sm font-semibold text-ferrero-brown-light mb-1 flex items-center justify-end gap-1">
                    Confidence Score <Info size={14} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-24 h-2 bg-ferrero-cream rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full" 
                        style={{ width: `${recommendation.confidence_score}%` }} 
                      />
                    </div>
                    <span className="font-bold text-ferrero-dark">{recommendation.confidence_score}%</span>
                  </div>
                  
                  {/* Tooltip Hover Box */}
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-ferrero-dark text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-left">
                    {recommendation.confidence_rationale || "Calculated using data-driven market heuristics and organic query complexity tracking. Always mathematically floored at 80% to ensure strategic decisiveness."}
                  </div>
                </div>
              </div>
              <p className="text-lg text-success font-semibold flex items-center gap-2">
                <Zap size={20} fill="currentColor" /> Estimated Impact: {recommendation.estimated_impact}
              </p>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h3 className="text-lg font-bold text-ferrero-dark mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-ferrero-gold" /> Reasoning
                </h3>
                <ul className="space-y-4 mb-8">
                  {recommendation.reasoning?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-ferrero-cream text-ferrero-brown font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-ferrero-brown-medium">{reason}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-bold text-ferrero-dark mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-warning" /> Risk Factors
                </h3>
                <ul className="space-y-2">
                  {recommendation.risk_factors?.map((risk, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-ferrero-brown-medium bg-[#FAF3E8] px-4 py-2 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column */}
              <div>
                <h3 className="text-lg font-bold text-ferrero-dark mb-4 flex items-center gap-2">
                  <Database size={20} className="text-ferrero-gold" /> Data Sources
                </h3>
                <div className="space-y-3">
                  {recommendation.sources?.map((source, idx) => (
                    <div key={idx} className="border border-ferrero-cream p-4 rounded-xl bg-[#FFF8F0]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-ferrero-dark text-sm">{source.doc}</span>
                        <span className="text-xs font-semibold bg-ferrero-cream-light px-2 py-1 rounded text-ferrero-brown">
                          Rel: {source.relevance}%
                        </span>
                      </div>
                      <p className="text-sm text-ferrero-brown-medium italic">"{source.excerpt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-ferrero-dark text-ferrero-cream-light p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-ferrero-gold" /> Model: {recommendation.model}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-ferrero-gold" /> Last Sync: {recommendation.data_freshness}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          placeholder="E.g., What is the impact of the current frost in Turkey on hazelnut prices?"
          className="w-full bg-white border border-ferrero-cream shadow-md rounded-full py-4 pl-6 pr-16 text-ferrero-dark focus:outline-none focus:border-ferrero-gold focus:ring-2 focus:ring-ferrero-gold/20 transition-all text-lg placeholder:text-ferrero-cream-light"
        />
        <button
          onClick={() => handleQuery()}
          disabled={!query.trim() || loading}
          className="absolute right-2 top-2 bottom-2 bg-ferrero-gold hover:bg-ferrero-gold-dark text-white rounded-full w-12 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
