import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const defaultData = { 
  supply: {score: 65, detail: ''}, 
  fx: {score: 80, detail: ''}, 
  tariff: {score: 30, detail: ''}, 
  weather: {score: 45, detail: ''}, 
  demand: {score: 20, detail: ''}, 
  logistics: {score: 50, detail: ''} 
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-ferrero-cream rounded-lg shadow-lg max-w-[200px]">
        <p className="text-sm font-bold text-ferrero-dark mb-1">{data.subject}</p>
        <p className="text-xs text-ferrero-gold-dark font-semibold mb-2">Score: {data.score}/100</p>
        <p className="text-xs text-ferrero-brown-medium">{data.detail}</p>
      </div>
    );
  }
  return null;
};

export default function RiskRadar({ data }) {
  const sourceData = data || defaultData;
  const radarData = [
    { subject: 'Supply', score: sourceData.supply?.score || 0, detail: sourceData.supply?.detail || 'No data' },
    { subject: 'FX', score: sourceData.fx?.score || 0, detail: sourceData.fx?.detail || 'No data' },
    { subject: 'Tariff', score: sourceData.tariff?.score || 0, detail: sourceData.tariff?.detail || 'No data' },
    { subject: 'Weather', score: sourceData.weather?.score || 0, detail: sourceData.weather?.detail || 'No data' },
    { subject: 'Demand', score: sourceData.demand?.score || 0, detail: sourceData.demand?.detail || 'No data' },
    { subject: 'Logistics', score: sourceData.logistics?.score || 0, detail: sourceData.logistics?.detail || 'No data' },
  ];

  return (
    <div className="w-full" style={{ height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#2D1B0E', fontSize: 12, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8B4513', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Radar name="Risk Score" dataKey="score" stroke="#D4A843" strokeWidth={2} fill="#D4A843" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
