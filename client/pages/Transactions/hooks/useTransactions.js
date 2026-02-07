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

    // Fetch transactions from API with debouncing
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
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

        // Debounced API call
        const debounceTimer = setTimeout(() => {
            fetchTransactions();
        }, API_DEBOUNCE_MS);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, filterType, dateFilter, customDateRange]);

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
        refreshTransactions: () => setSearchQuery(prev => prev) // Force refresh
    };
};
