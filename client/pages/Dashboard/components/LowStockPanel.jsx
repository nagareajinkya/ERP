import React, { useState, useMemo } from 'react';
import { ArrowRight, Package, X, TrendingDown } from 'lucide-react';

/**
 * LowStockPanel Component
 * Displays low inventory alerts with sorting and dismissal options
 * 
 * @param {Array} lowStockItems - List of low stock products
 * @param {Function} onReorder - Reorder button handler (optional)
 * @param {Function} onViewAll - Navigate to inventory handler (optional)
 */
const LowStockPanel = ({
    lowStockItems = [],
    onReorder,
    onViewAll
}) => {
    const [sortBy, setSortBy] = useState('urgency'); // urgency | alphabetical
    const [dismissedItems, setDismissedItems] = useState([]);

    // Calculate urgency score for each item
    const itemsWithUrgency = useMemo(() => {
        return lowStockItems
            .filter(item => !dismissedItems.includes(item.id))
            .map(item => {
                const percentageLeft = (item.current / item.min) * 100;

                return {
                    ...item,
                    percentageLeft,
                    urgencyScore: 100 - percentageLeft // Higher score = more urgent
                };
            });
    }, [lowStockItems, dismissedItems]);

    // Sorted items based on selected sort option
    const sortedItems = useMemo(() => {
        const items = [...itemsWithUrgency];

        if (sortBy === 'alphabetical') {
            return items.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Default: sort by urgency (most urgent first)
        return items.sort((a, b) => b.urgencyScore - a.urgencyScore);
    }, [itemsWithUrgency, sortBy]);

    // Get urgency badge color based on percentage left
    const getUrgencyBadge = (percentageLeft) => {
        if (percentageLeft < 25) {
            return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Critical' };
        }
        if (percentageLeft < 50) {
            return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', label: 'Low' };
        }
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', label: 'Warning' };
    };

    const handleDismiss = (itemId, e) => {
        e.stopPropagation();
        setDismissedItems(prev => [...prev, itemId]);
    };

    const handleReorder = (item, e) => {
        e.stopPropagation();
        if (onReorder) {
            onReorder(item);
        } else {
            // Default behavior - could navigate to purchase page with pre-filled item
            alert(`Reorder functionality for ${item.name} - Navigate to purchase page`);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Low Stock Alert</h3>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                    >
                        View All <ArrowRight size={14} />
                    </button>
                )}
            </div>

            {/* Sort Options */}
            {sortedItems.length > 1 && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setSortBy('urgency')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${sortBy === 'urgency'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Urgency
                    </button>
                    <button
                        onClick={() => setSortBy('alphabetical')}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${sortBy === 'alphabetical'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        A-Z
                    </button>
                </div>
            )}

            {/* Items List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                {sortedItems.length > 0 ? (
                    sortedItems.map(item => {
                        const urgency = getUrgencyBadge(item.percentageLeft);

                        return (
                            <div
                                key={item.id}
                                className={`relative flex justify-between items-center p-3 ${urgency.bg} border ${urgency.border} rounded-xl transition-all hover:shadow-sm group`}
                            >
                                {/* Dismiss Button */}
                                <button
                                    onClick={(e) => handleDismiss(item.id, e)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                                    title="Dismiss"
                                >
                                    <X size={14} />
                                </button>

                                <div className="flex items-center gap-3 flex-1">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 ${urgency.bg} rounded-lg flex items-center justify-center ${urgency.text} border ${urgency.border}`}>
                                        <Package size={18} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.text} border ${urgency.border} font-medium`}>
                                                {urgency.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${urgency.text} font-medium`}>
                                            Only {item.current} {item.unit} left • Min: {item.min}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-1.5 w-full h-1 bg-white rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${urgency.text === 'text-red-600' ? 'bg-red-500' : urgency.text === 'text-orange-600' ? 'bg-orange-500' : 'bg-yellow-500'} transition-all`}
                                                style={{ width: `${Math.min(item.percentageLeft, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reorder Button */}
                                <button
                                    onClick={(e) => handleReorder(item, e)}
                                    className={`ml-2 text-xs font-bold text-white ${urgency.text === 'text-red-600' ? 'bg-red-600 hover:bg-red-700' : urgency.text === 'text-orange-600' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-600 hover:bg-yellow-700'} px-3 py-2 rounded-lg transition-all shadow-sm whitespace-nowrap`}
                                >
                                    Reorder
                                </button>
                            </div>
                        );
                    })
                ) : dismissedItems.length > 0 && lowStockItems.length > 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <TrendingDown size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">All alerts dismissed</p>
                        <button
                            onClick={() => setDismissedItems([])}
                            className="mt-2 text-xs text-green-600 hover:text-green-700 font-bold"
                        >
                            Show All
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No low stock items</p>
                        <p className="text-xs mt-1">All products are well stocked</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LowStockPanel;
