import React from 'react';

/**
 * FormLabel Component
 * Reusable label for form inputs with consistent styling
 * Used across Login, Offers, Inventory, and other form pages
 * 
 * @param {string} text - Label text
 * @param {boolean} [required] - Show red asterisk if true
 * @param {string} [className] - Additional classes
 */
const FormLabel = ({ 
  text, 
  required = false, 
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5',
    compact: 'block text-[10px] font-black text-gray-400 uppercase mb-1.5',
    small: 'block text-sm font-bold text-gray-600 mb-1.5',
    medium: 'block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide',
    section: 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-4'
  };

  const baseClass = variants[variant] || variants.default;
  const combined = `${baseClass} ${className}`.trim();

  if (variant === 'section') {
    return (
      <h3 className={combined}>
        {text}
        {required && <span className="text-red-500"> *</span>}
      </h3>
    );
  }

  return (
    <label className={combined}>
      {text}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};

export default FormLabel;
