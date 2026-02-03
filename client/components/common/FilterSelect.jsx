import React from 'react';
import { Filter } from 'lucide-react';

/**
 * FilterSelect Component
 * Reusable select dropdown with icon and consistent styling
 * Used in Inventory, Properties, and other pages with filters
 * 
 * @param {string} placeholder - Default option text
 * @param {array} options - Array of option values to display
 * @param {string} value - Current selected value
 * @param {function} onChange - Change handler
 * @param {string} [className] - Additional classes for container
 * @param {string} [variant] - Style variant: 'default' | 'light'
 * @param {boolean} [withIcon] - Show Filter icon (default: true)
 */
const FilterSelect = ({ 
  placeholder = "Filter...", 
  options = [],
  value,
  onChange,
  className = "w-full md:w-64",
  variant = "default",
  withIcon = true
}) => {
  const variantStyles = {
    default: {
      container: "relative",
      select: "w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all cursor-pointer appearance-none",
      icon: "absolute left-3 top-2.5 text-gray-400"
    },
    light: {
      container: "relative",
      select: "w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer appearance-none",
      icon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`${style.container} ${className}`}>
      {withIcon && <Filter className={style.icon} size={18} />}
      <select
        value={value}
        onChange={onChange}
        className={style.select}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;
