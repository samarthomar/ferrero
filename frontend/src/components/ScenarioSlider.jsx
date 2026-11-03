import React from 'react';

export default function ScenarioSlider({ label, value, onChange, min = 0, max = 100, unit = '%', step = 1 }) {
  const displayValue = value > 0 && min < 0 ? `+${value}` : value;
  
  return (
    <div className="w-full py-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-[#5C3317]">{label}</label>
        <span className="text-sm font-bold text-[#D4A843] bg-[#FAF3E8] px-2 py-1 rounded-md">
          {displayValue}{unit}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4A843] focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:ring-opacity-50"
        style={{
          background: `linear-gradient(to right, #D4A843 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%)`
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{min}{unit}</span>
        <span className="text-xs text-gray-500">{max}{unit}</span>
      </div>
    </div>
  );
}
