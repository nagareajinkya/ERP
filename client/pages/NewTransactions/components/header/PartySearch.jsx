import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Party/Customer search component with dropdown
 */
const PartySearch = () => {
    const {
        selectedCustomer,
        setSelectedCustomer,
        custSearch,
        setCustSearch,
        customerList,
        isCustDropdownOpen,
        setIsCustDropdownOpen,
        setShowWalkInModal,
        custInputRef,
        theme,
    } = useNewTransactionContext();

    return (
        <div ref={custInputRef} className="relative w-72 group">
            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
                value={custSearch}
                onChange={e => {
                    setCustSearch(e.target.value);
                    setIsCustDropdownOpen(true);
                }}
                onFocus={() => setIsCustDropdownOpen(true)}
                placeholder={selectedCustomer ? selectedCustomer.name : 'Search Party / Customer...'}
                className={`w-full pl-9 pr-8 py-2 bg-gray-50 border border-transparent focus:bg-white rounded-lg text-sm outline-none transition-all ${theme.borderFocus} focus:ring-2 focus:ring-opacity-20 focus:ring-current placeholder-gray-400 font-medium text-gray-700`}
            />
            {selectedCustomer && (
                <button
                    onClick={() => {
                        setSelectedCustomer(null);
                        setCustSearch('');
                    }}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
                >
                    <X size={16} />
                </button>
            )}

            {/* Dropdown */}
            {isCustDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div
                        onMouseDown={() => {
                            setSelectedCustomer({ id: 'walk-in', name: 'Walk-in Customer' });
                            setShowWalkInModal(true);
                            setIsCustDropdownOpen(false);
                        }}
                        className="p-3 hover:bg-green-50 text-green-700 cursor-pointer border-b border-gray-50 flex items-center gap-2 font-medium"
                    >
                        <Plus size={16} /> Walk-in Customer
                    </div>
                    {customerList.length > 0 ? customerList.map(c => (
                        <div
                            key={c.id}
                            onMouseDown={() => {
                                setSelectedCustomer(c);
                                setIsCustDropdownOpen(false);
                                setCustSearch('');
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                            <div className="text-sm font-bold text-gray-700">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.phone}</div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-xs text-gray-400">No customers found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PartySearch;
