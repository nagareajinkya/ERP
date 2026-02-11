import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from '../fields/FormError';
import { VALID_INDIAN_STATES } from '../../hooks/useValidation';

const StateSelect = ({ value, onChange, onBlur, error, touched }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const statesList = VALID_INDIAN_STATES;

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleStateSelect = (state) => {
        onChange({ target: { value: state } });
        setIsDropdownOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative z-50">
            <FormLabel text="State (Required)" />
            <div className="relative">
                <input
                    type="text"
                    placeholder="Select State..."
                    required
                    readOnly
                    value={value}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={onBlur}
                    className={`w-full pl-10 pr-10 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all cursor-pointer`}
                />
                <MapPin className="absolute left-3.5 top-4 text-gray-500" size={16} />
                <ChevronDown className="absolute right-3.5 top-4 text-gray-500 pointer-events-none" size={16} />

                {/* State Dropdown */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B2332] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                        {statesList.map((state, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleStateSelect(state)}
                                className="px-4 py-3 text-sm text-gray-300 hover:bg-green-600 hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                                {state}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default StateSelect;
