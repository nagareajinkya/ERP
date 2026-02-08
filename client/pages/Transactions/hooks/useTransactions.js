import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../src/api';
import { useDebounce } from '../../../hooks/useDebounce';
import { API_DEBOUNCE_MS } from '../utils/constants';

/**
 * Custom hook for managing transactions data and filters
 * Optimized with React Query for caching and useDebounce for responsive searching
 */
export const useTransactions = () => {
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    // Debounce ONLY the search query
    const debouncedSearchQuery = useDebounce(searchQuery, API_DEBOUNCE_MS);

    // Fetch transactions using React Query
    // The query key includes all relevant filters, so it automatically refetches when they change
    const {
        data: transactionsResponse,
        isLoading,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['transactions', {
            debouncedSearchQuery,
            filterType,
            dateFilter,
            customDateRange
        }],
        queryFn: async () => {
            const { data } = await api.get('/trading/transactions/search', {
                params: {
                    query: debouncedSearchQuery,
                    type: filterType === 'All' ? 'All' : filterType.toUpperCase(),
                    dateRange: dateFilter,
                    startDate: dateFilter === 'Custom Range' ? customDateRange.start : null,
                    endDate: dateFilter === 'Custom Range' ? customDateRange.end : null
                }
            });
            return data.data || [];
        },
        keepPreviousData: true, // Keep showing old data while fetching new to prevent "flashing"
        staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    });

    return {
        transactions: transactionsResponse || [],
        loading: isLoading,
        isFetching, // Indicates background refetch in progress
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        dateFilter,
        setDateFilter,
        customDateRange,
        setCustomDateRange,
        refreshTransactions: refetch
    };
};
