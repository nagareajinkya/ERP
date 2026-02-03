import React from 'react';

/**
 * TabsBar Component
 * Reusable tab navigation with consistent styling
 * Used in Templates, Transactions, Properties, Offers pages
 * 
 * @param {array} tabs - Array of tab names (strings)
 * @param {string} activeTab - Currently active tab name
 * @param {function} onTabChange - Handler for tab selection
 * @param {string} [variant] - Style variant: 'default' | 'dark' | 'light'
 * @param {string} [className] - Additional classes for container
 */
const TabsBar = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  variant = "default",
  className = "flex bg-gray-50 p-1 rounded-xl w-full md:w-auto"
}) => {
  const variantStyles = {
    default: {
      container: className,
      activeBtn: "bg-white text-gray-800 shadow-sm",
      inactiveBtn: "text-gray-400 hover:text-gray-700"
    },
    dark: {
      container: "flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm",
      activeBtn: "bg-gray-800 text-white shadow-md",
      inactiveBtn: "text-gray-400 hover:text-gray-600"
    },
    light: {
      container: "flex bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto",
      activeBtn: "bg-white text-blue-600 shadow-sm",
      inactiveBtn: "text-gray-500 hover:text-gray-700"
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={style.container}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === tab 
              ? style.activeBtn 
              : style.inactiveBtn
          }`}
        >
          {typeof tab === 'string' ? tab.charAt(0).toUpperCase() + tab.slice(1) : tab}
        </button>
      ))}
    </div>
  );
};

export default TabsBar;
