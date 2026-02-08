import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from '../fields/FormError';

const StateSelect = ({ value, onChange, onBlur, error, touched }) => {
    const [statesList, setStatesList] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch Indian states from API
    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: "India" })
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    const sortedStates = data.data.states.map(s => s.name).sort((a, b) => a.localeCompare(b));
                    setStatesList(sortedStates);
                }
            })
            .catch(err => console.error("Failed to fetch states:", err));
    }, []);

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

    // Filter states while typing
    const filteredStates = statesList.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
    );

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
                    placeholder="Search State..."
                    required
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={onBlur}
                    className={`w-full pl-10 pr-10 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all`}
                />
                <MapPin className="absolute left-3.5 top-4 text-gray-500" size={16} />
                <ChevronDown className="absolute right-3.5 top-4 text-gray-500 pointer-events-none" size={16} />

                {/* State Dropdown */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B2332] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                        {statesList.length === 0 ? (
                            <div className="p-3 text-sm text-gray-400 text-center">Loading states...</div>
                        ) : filteredStates.length > 0 ? (
                            filteredStates.map((state, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleStateSelect(state)}
                                    className="px-4 py-3 text-sm text-gray-300 hover:bg-green-600 hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                >
                                    {state}
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-gray-500 text-center">No state found</div>
                        )}
                    </div>
                )}
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default StateSelect;
