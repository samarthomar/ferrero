import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';

export default function RecommendationCard({ recommendation }) {
  const [openSection, setOpenSection] = useState(null);

  if (!recommendation) {
    return (
      <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-l-4 border-gray-200 flex items-center justify-center text-gray-400 h-64">
        No recommendation available
      </div>
    );
  }

  const { action, title, confidence_score, reasoning, sources, risk_factors, estimated_impact, model, data_freshness } = recommendation;

  const actionColors = {
    BUY: 'bg-green-600',
    HOLD: 'bg-amber-500',
    WAIT: 'bg-gray-500',
    HEDGE: 'bg-blue-600',
    DIVERSIFY: 'bg-purple-600'
  };

  const badgeColor = actionColors[action] || 'bg-gray-600';

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md border-l-4 border-[#D4A843] overflow-hidden flex flex-col transition-all">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-[#2D1B0E] leading-tight pr-4">{title}</h2>
          <span className={`px-4 py-1 rounded-full text-white font-bold text-sm tracking-wider shadow-sm ${badgeColor}`}>
            {action}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-xs text-[#8B4513] font-semibold uppercase tracking-wider mb-2">Confidence Level</p>
          <ConfidenceMeter score={confidence_score} />
        </div>

        {estimated_impact && (
          <div className="bg-[#FAF3E8] p-4 rounded-xl border border-[#E5E7EB] mb-4">
            <h4 className="text-sm font-bold text-[#5C3317] flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-[#2D8B46]" /> Estimated Impact
            </h4>
            <p className="text-[#2D1B0E] text-sm">{estimated_impact}</p>
          </div>
        )}
      </div>

      <div className="flex-1 divide-y divide-gray-100 border-t border-gray-100">
        {reasoning && reasoning.length > 0 && (
          <div>
            <button 
              onClick={() => toggleSection('reasoning')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-semibold text-[#5C3317]">Reasoning</span>
              {openSection === 'reasoning' ? <ChevronUp className="w-5 h-5 text-[#8B4513]" /> : <ChevronDown className="w-5 h-5 text-[#8B4513]" />}
            </button>
            {openSection === 'reasoning' && (
              <div className="px-6 pb-4 pt-1">
                <ol className="list-decimal list-inside space-y-2 text-sm text-[#2D1B0E]">
                  {reasoning.map((reason, idx) => (
                    <li key={idx} className="pl-2">{reason}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {sources && sources.length > 0 && (
          <div>
            <button 
              onClick={() => toggleSection('sources')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-semibold text-[#5C3317]">Sources</span>
              {openSection === 'sources' ? <ChevronUp className="w-5 h-5 text-[#8B4513]" /> : <ChevronDown className="w-5 h-5 text-[#8B4513]" />}
            </button>
            {openSection === 'sources' && (
              <div className="px-6 pb-4 pt-1 space-y-3">
                {sources.map((source, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#D4A843]" />
                      <span className="font-semibold text-sm text-[#2D1B0E]">{source.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 italic mb-2">"{source.excerpt}"</p>
                    {source.relevance && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Relevance:</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#D4A843] rounded-full" style={{ width: `${source.relevance}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {risk_factors && risk_factors.length > 0 && (
          <div>
            <button 
              onClick={() => toggleSection('risks')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-semibold text-[#5C3317]">Risk Factors</span>
              {openSection === 'risks' ? <ChevronUp className="w-5 h-5 text-[#8B4513]" /> : <ChevronDown className="w-5 h-5 text-[#8B4513]" />}
            </button>
            {openSection === 'risks' && (
              <div className="px-6 pb-4 pt-1">
                <ul className="space-y-3 text-sm text-[#2D1B0E]">
                  {risk_factors.map((risk, idx) => (
                    <li key={idx} className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#C0392B] shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>Model: <span className="font-medium text-[#8B4513]">{model || 'Proprietary AI'}</span></span>
        <span>Data Freshness: {data_freshness || 'Just now'}</span>
      </div>
    </div>
  );
}
