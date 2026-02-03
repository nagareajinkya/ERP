import React from 'react';

/**
 * StatCard Component
 * Reusable card for displaying statistics with icon, label, and value
 * Used throughout Dashboard, Inventory, Offers, Reports, Parties pages
 * 
 * @param {string} label - Stat label (uppercase, gray)
 * @param {string|number} value - Main value to display
 * @param {JSX.Element} icon - Lucide icon component
 * @param {string} [iconColor] - Bg & text color (e.g., 'bg-blue-50 text-blue-600')
 * @param {string} [borderColor] - Border color (e.g., 'border-blue-100')
 * @param {string} [valueColor] - Text color for value (default: 'text-gray-800')
 * @param {boolean} [hover] - Enable hover effect (default: true)
 */
const StatCard = ({ 
  label, 
  value, 
  icon: Icon,
  iconColor = "bg-green-50 text-green-600",
  borderColor = "border-green-100",
  valueColor = "text-gray-800",
  hover = true
}) => {
  return (
    <div className={`bg-white p-5 rounded-2xl border ${borderColor} shadow-sm flex items-center gap-4 ${hover ? 'hover:shadow-md transition-all' : ''}`}>
      <div className={`w-10 h-10 ${iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-extrabold ${valueColor}`}>
          {typeof value === 'number' && value >= 1000 
            ? `₹${value.toLocaleString()}` 
            : value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;
