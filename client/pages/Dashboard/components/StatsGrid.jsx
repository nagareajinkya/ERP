import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, AlertCircle, Zap } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';

/**
 * StatsGrid Component
 * Displays 4 key statistics in a responsive grid
 * Stats are clickable and navigate to relevant pages
 * 
 * @param {Object} stats - Statistics object containing todaysSales, totalBills, lowStockItems, activeOffers
 * @param {Boolean} loading - Show loading state
 */
const StatsGrid = ({ stats = {}, loading = false }) => {
    const navigate = useNavigate();

    const statsConfig = [
        {
            label: "Today's Sales",
            value: stats.todaysSales || 0,
            icon: DollarSign,
            iconColor: 'bg-green-50 text-green-600',
            borderColor: 'border-gray-100',
            onClick: () => navigate('/transactions')
        },
        {
            label: 'Total Bills',
            value: stats.totalBills || 0,
            icon: ShoppingBag,
            iconColor: 'bg-blue-50 text-blue-600',
            borderColor: 'border-gray-100',
            onClick: () => navigate('/transactions')
        },
        {
            label: 'Low Stock Products',
            value: stats.lowStockItems || 0,
            icon: AlertCircle,
            iconColor: 'bg-red-50 text-red-600',
            borderColor: 'border-gray-100',
            onClick: () => navigate('/inventory')
        },
        {
            label: 'Active Offers',
            value: stats.activeOffers || 0,
            icon: Zap,
            iconColor: 'bg-amber-50 text-amber-600',
            borderColor: 'border-gray-100',
            onClick: () => navigate('/offers')
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsConfig.map((stat, index) => (
                <div
                    key={index}
                    onClick={stat.onClick}
                    className="cursor-pointer transform hover:scale-[1.02] transition-transform"
                >
                    <StatCard
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        iconColor={stat.iconColor}
                        borderColor={stat.borderColor}
                        hover={true}
                    />
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
