import React from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const defaultData = [
  { date: '2026-01-01', price_eur: 7.2, turkey: 7.0, italy: 7.5, oregon: 7.1 },
  { date: '2026-02-01', price_eur: 7.5, turkey: 7.1, italy: 7.8, oregon: 7.2 },
  { date: '2026-03-01', price_eur: 7.8, turkey: 7.5, italy: 8.0, oregon: 7.4 },
  { date: '2026-04-01', price_eur: 8.1, turkey: 7.9, italy: 8.4, oregon: 7.7 },
  { date: '2026-05-01', price_eur: 8.5, turkey: 8.2, italy: 8.8, oregon: 8.0 },
  { date: '2026-06-01', price_eur: 8.7, turkey: 8.5, italy: 9.0, oregon: 8.3 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-[#E5E7EB] rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-[#2D1B0E] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} €/kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PriceChart({ data }) {
  const chartData = data && data.length > 0 ? data : defaultData;
  const hasMultipleOrigins = chartData[0] && 'turkey' in chartData[0];

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {hasMultipleOrigins ? (
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="date" stroke="#8B4513" tick={{ fill: '#5C3317', fontSize: 12 }} tickMargin={10} minTickGap={30} />
            <YAxis stroke="#8B4513" tick={{ fill: '#5C3317', fontSize: 12 }} tickFormatter={(val) => `€${val}`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="turkey" name="Turkey" stroke="#8B4513" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="italy" name="Italy" stroke="#2D8B46" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="oregon" name="Oregon" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="price_eur" name="Global Avg" stroke="#D4A843" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4A843" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="date" stroke="#8B4513" tick={{ fill: '#5C3317', fontSize: 12 }} tickMargin={10} minTickGap={30} />
            <YAxis stroke="#8B4513" tick={{ fill: '#5C3317', fontSize: 12 }} tickFormatter={(val) => `€${val}`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price_eur" name="Price" stroke="#D4A843" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
