import { useState, useEffect } from 'react';
import api from '../../../src/api';
import { API_DEBOUNCE_MS } from '../utils/constants';

/**
 * Custom hook for managing transactions data and filters
 */
export const useTransactions = () => {
    // State for transactions data
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch transactions from API with debouncing
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                // ... (existing fetch logic) ...
                const { data } = await api.get('/trading/transactions/search', {
                    params: {
                        query: searchQuery,
                        type: filterType === 'All' ? 'All' : filterType.toUpperCase(),
                        dateRange: dateFilter,
                        startDate: dateFilter === 'Custom Range' ? customDateRange.start : null,
                        endDate: dateFilter === 'Custom Range' ? customDateRange.end : null
                    }
                });
                setTransactions(data.data || []);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounced API call only if search query changes
        // For refresh or filter changes, we want immediate or slightly delayed fetch
        const debounceTimer = setTimeout(() => {
            fetchTransactions();
        }, API_DEBOUNCE_MS);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, filterType, dateFilter, customDateRange, refreshTrigger]);

    return {
        transactions,
        loading,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        dateFilter,
        setDateFilter,
        customDateRange,
        setCustomDateRange,
        refreshTransactions: () => setRefreshTrigger(prev => prev + 1)
    };
};
