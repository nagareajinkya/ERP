import React from 'react';
import { Search, X, UserCircle2, Building2 } from 'lucide-react';
import { useNewSettlementContext } from '../../context/NewSettlementContext';

const SettlementPartySearch = () => {
    const {
        selectedParty,
        setSelectedParty,
        searchQuery,
        setSearchQuery,
        partyList, // Now contains ALL parties (customers & suppliers)
        isDropdownOpen,
        setIsDropdownOpen,
        partyInputRef,
        theme
    } = useNewSettlementContext();

    // Filter and split the list into Customers (type 0) and Suppliers (type 1)
    const customers = partyList.filter(p => p.type === 0 || p.type === 'CUSTOMER');
    const suppliers = partyList.filter(p => p.type === 1 || p.type === 'SUPPLIER');

    const handleSelect = (p) => {
        setSelectedParty(p);
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const PartyItem = ({ party }) => (
        <div
            onMouseDown={() => handleSelect(party)}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 group transition-colors"
        >
            <div className="flex justify-between items-start">
                <div className="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">
                    {party.name}
                </div>
                <div className={`text-xs font-bold ${party.currentBalance > 0 ? 'text-green-600' : party.currentBalance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {Math.abs(party.currentBalance).toLocaleString()}
                </div>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{party.phoneNumber || 'No phone'}</div>
        </div>
    );

    return (
        <div ref={partyInputRef} className="relative w-96 group">
            <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
                value={searchQuery}
                onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={selectedParty ? selectedParty.name : "Search Customer or Supplier..."}
                className={`w-full pl-9 pr-8 py-2 bg-gray-50 border border-transparent focus:bg-white rounded-lg text-sm outline-none transition-all ${theme.borderFocus} focus:ring-2 focus:ring-opacity-20 focus:ring-current placeholder-gray-400 font-medium text-gray-700`}
            />
            {selectedParty && (
                <button
                    onClick={() => {
                        setSelectedParty(null);
                        setSearchQuery('');
                    }}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
                >
                    <X size={16} />
                </button>
            )}

            {/* SPLIT DROPDOWN */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 w-[600px] mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col md:flex-row max-h-[400px]">

                    {/* LEFT COLUMN: CUSTOMERS */}
                    <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col min-h-0">
                        <div className="p-3 bg-blue-50/50 border-b border-gray-100 flex items-center gap-2 sticky top-0">
                            <UserCircle2 size={16} className="text-blue-600" />
                            <span className="text-xs font-black text-blue-800 uppercase tracking-wider">Customers</span>
                            <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">
                                {customers.length}
                            </span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-0">
                            {customers.length > 0 ? (
                                customers.map(p => <PartyItem key={p.id} party={p} />)
                            ) : (
                                <div className="p-8 text-center text-xs text-gray-400 italic">No customers found</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SUPPLIERS */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="p-3 bg-purple-50/50 border-b border-gray-100 flex items-center gap-2 sticky top-0">
                            <Building2 size={16} className="text-purple-600" />
                            <span className="text-xs font-black text-purple-800 uppercase tracking-wider">Suppliers</span>
                            <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">
                                {suppliers.length}
                            </span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-0">
                            {suppliers.length > 0 ? (
                                suppliers.map(p => <PartyItem key={p.id} party={p} />)
                            ) : (
                                <div className="p-8 text-center text-xs text-gray-400 italic">No suppliers found</div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SettlementPartySearch;
