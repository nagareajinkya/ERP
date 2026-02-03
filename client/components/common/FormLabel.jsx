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
  className = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
}) => {
  return (
    <label className={className}>
      {text}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};

export default FormLabel;
