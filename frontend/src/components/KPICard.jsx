import React from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

export default function KPICard({ title, value, unit, trend, percentChange, warning }) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-ferrero-gold p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden group">
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-sm font-medium text-ferrero-brown-medium uppercase tracking-wider">{title}</h3>
        {warning && (
          <div className="bg-warning/10 p-1.5 rounded-md text-warning shadow-sm" title="Warning Indicator">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mt-1 relative z-10">
        <span className="text-3xl font-bold text-ferrero-dark tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
      </div>

      {percentChange && (
        <div className="flex items-center gap-1 mt-3 relative z-10">
          <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {percentChange}%
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">vs last month</span>
        </div>
      )}
      
      {/* Decorative gradient corner */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-ferrero-gold/0 to-ferrero-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
