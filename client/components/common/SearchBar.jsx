import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar Component
 * Reusable search input with icon, consistent styling across pages
 * 
 * @param {string} placeholder - Search placeholder text
 * @param {string} value - Current search value
 * @param {function} onChange - Change handler for input
 * @param {string} [className] - Additional classes for container
 * @param {string} [variant] - Style variant: 'default' | 'light' | 'dark'
 * @param {number} [size] - Icon size (default: 18)
 */
const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  className = "w-full md:w-64",
  variant = "default",
  size = 18
}) => {
  const variantStyles = {
    default: {
      container: "relative",
      input: "w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all",
      icon: "absolute left-3 top-2.5 text-gray-400"
    },
    light: {
      container: "relative",
      input: "w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 outline-none",
      icon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    },
    dark: {
      container: "relative",
      input: "w-full pl-10 pr-10 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all",
      icon: "absolute left-3.5 top-4 text-gray-500"
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`${style.container} ${className}`}>
      <Search className={`${style.icon}`} size={size} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={style.input}
      />
    </div>
  );
};

export default SearchBar;
