import React from 'react';

export default function ConfidenceMeter({ score = 0 }) {
  const safeScore = Math.min(100, Math.max(0, score));
  
  let colorClass = 'bg-[#C0392B]'; // Red
  if (safeScore > 80) {
    colorClass = 'bg-[#2D8B46]'; // Green
  } else if (safeScore >= 60) {
    colorClass = 'bg-[#D4A843]'; // Gold
  }

  return (
    <div className="flex items-center w-full gap-3">
      <div className="flex-1 h-3 bg-[#FAF3E8] rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
      <span className="text-sm font-bold text-[#2D1B0E] w-10 text-right">{safeScore}%</span>
    </div>
  );
}
