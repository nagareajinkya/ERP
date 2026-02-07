import { useState, useMemo } from 'react';

export const useReports = () => {
    const [dateRange, setDateRange] = useState('This Month');

    // --- MOCK DATA (To be replaced with API calls later) ---
    const dataSets = useMemo(() => ({
        'Today': {
            chart: [
                { name: '9 AM', sales: 1200, profit: 400 },
                { name: '12 PM', sales: 4500, profit: 1500 },
                { name: '3 PM', sales: 3200, profit: 1100 },
                { name: '6 PM', sales: 6100, profit: 2200 },
                { name: '9 PM', sales: 2800, profit: 900 },
            ],
            summary: { sales: '₹17,800', profit: '₹6,100', gst: '₹1,540', deadStock: '12' }
        },
        'Last 7 Days': {
            chart: [
                { name: 'Mon', sales: 12000, profit: 4000 },
                { name: 'Tue', sales: 15000, profit: 5500 },
                { name: 'Wed', sales: 11000, profit: 3200 },
                { name: 'Thu', sales: 18000, profit: 7000 },
                { name: 'Fri', sales: 14000, profit: 4800 },
                { name: 'Sat', sales: 22000, profit: 9000 },
                { name: 'Sun', sales: 19000, profit: 7500 },
            ],
            summary: { sales: '₹1,11,000', profit: '₹41,000', gst: '₹9,800', deadStock: '10' }
        },
        'This Month': {
            chart: [
                { name: 'Week 1', sales: 45000, profit: 12000 },
                { name: 'Week 2', sales: 52000, profit: 18000 },
                { name: 'Week 3', sales: 48000, profit: 15000 },
                { name: 'Week 4', sales: 61000, profit: 21000 },
            ],
            summary: { sales: '₹2,04,200', profit: '₹75,800', gst: '₹18,450', deadStock: '12' }
        },
        'This Year': {
            chart: [
                { name: 'Jan', sales: 204000, profit: 75000 },
                { name: 'Feb', sales: 180000, profit: 62000 },
                { name: 'Mar', sales: 240000, profit: 95000 },
                { name: 'Apr', sales: 215000, profit: 82000 },
            ],
            summary: { sales: '₹8,39,000', profit: '₹3,14,000', gst: '₹72,000', deadStock: '15' }
        }
    }), []);

    const currentData = dataSets[dateRange];

    // Specific Data for components (also mock for now)
    const categoryData = [
        { name: 'Grocery', value: 45, color: '#3B82F6' },
        { name: 'Beverages', value: 25, color: '#10B981' },
        { name: 'Personal Care', value: 20, color: '#F59E0B' },
        { name: 'Snacks', value: 10, color: '#8B5CF6' },
    ];

    const topProducts = [
        { id: 1, name: 'Aashirvaad Atta 5kg', qty: 145, revenue: '₹32,625', profit: '₹4,350' },
        { id: 2, name: 'Tata Salt 1kg', qty: 210, revenue: '₹5,250', profit: '₹1,050' },
        { id: 3, name: 'Amul Butter 500g', qty: 85, revenue: '₹22,950', profit: '₹2,550' },
        { id: 4, name: 'Maggi Noodles 280g', qty: 180, revenue: '₹9,900', profit: '₹1,800' },
        { id: 5, name: 'Fortune Oil 1L', qty: 95, revenue: '₹14,250', profit: '₹1,425' },
    ];

    return {
        dateRange,
        setDateRange,
        currentData,
        categoryData,
        topProducts,
        availableRanges: Object.keys(dataSets)
    };
};

export default useReports;
