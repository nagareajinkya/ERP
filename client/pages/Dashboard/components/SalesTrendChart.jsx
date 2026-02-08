import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts';
import { Download, TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import {
    chartColors,
    chartStyles,
    periodOptions,
    currencyFormatter,
    tooltipFormatter
} from '../config/chartConfig';

/**
 * SalesTrendChart Component
 * Visualizes sales data with period filtering and chart type toggle
 * 
 * @param {Array} chartData - Sales data points
 * @param {String} chartPeriod - Current period selection
 * @param {Function} onPeriodChange - Period change handler
 * @param {Boolean} loading - Show loading state
 */
const SalesTrendChart = ({
    chartData = [],
    chartPeriod = 'today',
    onPeriodChange,
    loading = false
}) => {
    const [chartType, setChartType] = useState('area'); // area | line | bar

    // Calculate insights from chartData
    const insights = React.useMemo(() => {
        if (!chartData || chartData.length === 0) {
            return { peak: 0, average: 0, peakTime: '-' };
        }

        const total = chartData.reduce((sum, item) => sum + (item.sales || 0), 0);
        const average = Math.round(total / chartData.length);

        const peakItem = chartData.reduce((max, item) =>
            (item.sales || 0) > (max.sales || 0) ? item : max
            , { sales: 0, name: '-' });

        return {
            peak: peakItem.sales,
            average,
            peakTime: peakItem.name
        };
    }, [chartData]);

    // Export chart as image (uses html2canvas if available)
    const handleExport = () => {
        // This would require html2canvas or similar library
        // For now, we'll just alert the user
        alert('Chart export feature - Implementation requires html2canvas library');
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorSalesBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.sales} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartColors.sales} stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid {...chartStyles.grid} />
                        <XAxis dataKey="name" {...chartStyles.xAxis} />
                        <YAxis {...chartStyles.yAxis} tickFormatter={currencyFormatter} />
                        <Tooltip {...chartStyles.tooltip} formatter={tooltipFormatter} />
                        <Bar dataKey="sales" fill="url(#colorSalesBar)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid {...chartStyles.grid} />
                        <XAxis dataKey="name" {...chartStyles.xAxis} />
                        <YAxis {...chartStyles.yAxis} tickFormatter={currencyFormatter} />
                        <Tooltip {...chartStyles.tooltip} formatter={tooltipFormatter} />
                        <Line
                            type="monotone"
                            dataKey="sales"
                            stroke={chartColors.sales}
                            strokeWidth={3}
                            dot={{ fill: chartColors.sales, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );

            default: // area
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.sales} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={chartColors.sales} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid {...chartStyles.grid} />
                        <XAxis dataKey="name" {...chartStyles.xAxis} />
                        <YAxis {...chartStyles.yAxis} tickFormatter={currencyFormatter} />
                        <Tooltip {...chartStyles.tooltip} formatter={tooltipFormatter} />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke={chartColors.sales}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                        />
                    </AreaChart>
                );
        }
    };

    if (loading) {
        return (
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Sales Trend</h3>
                    <p className="text-xs font-medium text-gray-400">Track your store's sales performance</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Chart Type Toggle */}
                    <div className="flex bg-gray-50 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setChartType('area')}
                            className={`p-1.5 rounded transition-all ${chartType === 'area'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Area Chart"
                        >
                            <TrendingUp size={16} />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-1.5 rounded transition-all ${chartType === 'line'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Line Chart"
                        >
                            <LineChartIcon size={16} />
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-1.5 rounded transition-all ${chartType === 'bar'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="Bar Chart"
                        >
                            <BarChart3 size={16} />
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-50 transition-all"
                        title="Export Chart"
                    >
                        <Download size={16} />
                    </button>

                    {/* Period Filter */}
                    <select
                        value={chartPeriod}
                        onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg px-3 py-1.5 outline-none focus:border-green-500 cursor-pointer"
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Key Insights */}
            <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium mb-1">Peak Sales</p>
                    <p className="text-lg font-bold text-green-600">₹{insights.peak.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">at {insights.peakTime}</p>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium mb-1">Average</p>
                    <p className="text-lg font-bold text-gray-700">₹{insights.average.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">per period</p>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[300px] w-full">
                {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <p className="text-sm font-medium">No sales data available</p>
                            <p className="text-xs">Data will appear here once you have transactions</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesTrendChart;
