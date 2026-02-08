import { useState, useCallback, useEffect } from 'react';
import api from '../src/api';

export const useDashboard = (initialPeriod = 'today') => {
    const [chartPeriod, setChartPeriod] = useState(initialPeriod);
    const [dashboardData, setDashboardData] = useState({
        stats: { todaysSales: 0, salesTrend: '0%', totalBills: 0, dailyAverage: 0, lowStockItems: 0, activeOffers: 0 },
        chartData: [],
        lowStockItems: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/trading/dashboard/summary', {
                params: { period: chartPeriod }
            });
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [chartPeriod]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        chartPeriod,
        setChartPeriod,
        dashboardData,
        loading,
        error,
        refreshDashboard: fetchDashboardData
    };
};

export default useDashboard;
