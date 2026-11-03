import React from 'react';
import { AlertCircle, Info, ShieldAlert, Clock } from 'lucide-react';

const severityConfig = {
  critical: {
    color: 'bg-danger',
    border: 'border-l-danger',
    bg: 'bg-danger/10',
    icon: ShieldAlert,
    text: 'text-danger'
  },
  warning: {
    color: 'bg-warning',
    border: 'border-l-warning',
    bg: 'bg-warning/10',
    icon: AlertCircle,
    text: 'text-warning'
  },
  info: {
    color: 'bg-info',
    border: 'border-l-info',
    bg: 'bg-info/10',
    icon: Info,
    text: 'text-info'
  }
};

export default function AlertCard({ severity = 'info', category, title, description, timestamp, value }) {
  const config = severityConfig[severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={`flex bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 ${config.border} p-4 transition-all hover:shadow-md relative group overflow-hidden mb-3`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
            {category}
          </span>
          <div className="flex items-center text-xs text-gray-400 font-medium ml-auto">
            <Clock className="w-3 h-3 mr-1" />
            {timestamp}
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${config.text}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ferrero-dark mb-1 group-hover:text-ferrero-brown transition-colors">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      
      {value && (
        <div className="ml-4 flex flex-col justify-center items-end border-l border-gray-100 pl-4">
          <span className="text-sm font-bold text-ferrero-dark">{value}</span>
        </div>
      )}
    </div>
  );
}
