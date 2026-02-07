import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import SearchBar from '../../../components/common/SearchBar';
import TabsBar from '../../../components/common/TabsBar';
import { useTransactionsContext } from '../context/TransactionsContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { TRANSACTION_TYPES, DATE_FILTERS } from '../utils/constants';

/**
 * Filters component for transaction filtering
 */
const TransactionsFilters = () => {
    const {
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        dateFilter,
        setDateFilter,
        customDateRange,
        setCustomDateRange
    } = useTransactionsContext();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

            {/* TABS */}
            <TabsBar
                tabs={TRANSACTION_TYPES}
                activeTab={filterType}
                onTabChange={setFilterType}
                variant="default"
                className="flex p-1 bg-gray-50 rounded-xl w-full md:w-auto"
            />

            {/* SEARCH & DATE */}
            <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
                <SearchBar
                    placeholder="Search Invoice or Party..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 md:w-64"
                />

                {/* Date Filter Pills */}
                <div className="flex gap-2 items-center">
                    {/* Custom Date Inputs */}
                    {dateFilter === 'Custom Range' && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <input
                                type="date"
                                value={customDateRange.start}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                            />
                            <span className="text-gray-400 font-bold self-center text-xs">to</span>
                            <input
                                type="date"
                                value={customDateRange.end}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                            />
                        </div>
                    )}

                    {/* Modern Pill-Style Date Filter */}
                    <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
                        {DATE_FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setDateFilter(filter)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${dateFilter === filter
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}

                        {/* Dropdown for More Options */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 ${dateFilter === 'All Time' || dateFilter === 'Custom Range'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <Calendar size={14} />
                                {dateFilter === 'All Time' || dateFilter === 'Custom Range' ? dateFilter : 'More'}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            setDateFilter('All Time');
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <Calendar size={14} />
                                        All Time
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDateFilter('Custom Range');
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                                    >
                                        <Calendar size={14} />
                                        Custom Range
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionsFilters;
