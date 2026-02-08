// Chart configuration for Dashboard components
// Centralized styling and options for Recharts visualizations

export const chartColors = {
    sales: '#16a34a',      // green-600
    purchases: '#dc2626',  // red-600
    gradient: {
        sales: {
            start: '#16a34a',
            startOpacity: 0.2,
            end: '#16a34a',
            endOpacity: 0
        },
        purchases: {
            start: '#dc2626',
            startOpacity: 0.2,
            end: '#dc2626',
            endOpacity: 0
        }
    }
};

export const chartStyles = {
    grid: {
        strokeDasharray: '3 3',
        vertical: false,
        stroke: '#f3f4f6'
    },
    xAxis: {
        axisLine: false,
        tickLine: false,
        tick: {
            fill: '#9ca3af',
            fontSize: 12,
            fontWeight: 600
        },
        dy: 10
    },
    yAxis: {
        axisLine: false,
        tickLine: false,
        tick: {
            fill: '#9ca3af',
            fontSize: 12,
            fontWeight: 600
        },
        dx: -10
    },
    tooltip: {
        contentStyle: {
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold'
        },
        itemStyle: {
            fontSize: 14,
            color: '#4ade80'
        }
    },
    area: {
        sales: {
            type: 'monotone',
            dataKey: 'sales',
            stroke: '#16a34a',
            strokeWidth: 3,
            fillOpacity: 1
        }
    }
};

export const periodOptions = [
    { value: 'today', label: 'Today (Hourly)' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' }
];

export const currencyFormatter = (value) => `₹${value / 1000}k`;

export const tooltipFormatter = (value) => [`₹${value.toLocaleString()}`, 'Total Sales'];

export default {
    chartColors,
    chartStyles,
    periodOptions,
    currencyFormatter,
    tooltipFormatter
};
