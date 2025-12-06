import React from 'react';
import { Info } from 'lucide-react';

const SummaryCard = ({ label, value, subtext }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <Info className="w-4 h-4 text-gray-400 cursor-help" />
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
  </div>
);

const SummaryCards = ({ totalUnits, totalAmount, totalDiscount, totalSRs, discountSRs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SummaryCard 
        label="Total units sold" 
        value={totalUnits || 0} 
      />
      <SummaryCard 
        label="Total Amount" 
        value={`₹${totalAmount ? totalAmount.toLocaleString('en-IN') : 0}`} 
        subtext={totalSRs ? `(${totalSRs} SRs)` : ''}
      />
      <SummaryCard 
        label="Total Discount" 
        value={`₹${totalDiscount ? totalDiscount.toLocaleString('en-IN') : 0}`} 
        subtext={discountSRs ? `(${discountSRs} SRs)` : ''}
      />
    </div>
  );
};

export default SummaryCards;