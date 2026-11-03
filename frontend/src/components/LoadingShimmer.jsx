import React from 'react';

export default function LoadingShimmer({ lines = 3 }) {
  return (
    <div className="w-full p-4 animate-pulse space-y-4">
      <div className="h-4 bg-[#FAF3E8] rounded-full w-1/4 mb-6"></div>
      
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-3 bg-[#E5E7EB] rounded-full w-full"></div>
          <div className="h-3 bg-[#FAF3E8] rounded-full w-5/6"></div>
          <div className="h-3 bg-[#E5E7EB] rounded-full w-4/6"></div>
        </div>
      ))}
      
      <div className="h-24 bg-[#FAF3E8] rounded-xl w-full mt-6"></div>
    </div>
  );
}
