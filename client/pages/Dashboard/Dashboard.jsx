import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';

// Dashboard Components
import DashboardHeader from './components/DashboardHeader';
import StatsGrid from './components/StatsGrid';
import SalesTrendChart from './components/SalesTrendChart';
import LowStockPanel from './components/LowStockPanel';
import DashboardSkeleton from './components/DashboardSkeleton';

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch dashboard data using custom hook
  const {
    chartPeriod,
    setChartPeriod,
    dashboardData,
    loading
  } = useDashboard('today');

  const { stats, chartData, lowStockItems } = dashboardData;

  // Show skeleton during initial load
  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans">
      {/* Header Section */}
      <DashboardHeader
        onNewPurchase={() => navigate('/new-purchase')}
        onNewSale={() => navigate('/new-sale')}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} loading={loading} />

      {/* Main Content Grid: Chart + Low Stock Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesTrendChart
          chartData={chartData}
          chartPeriod={chartPeriod}
          onPeriodChange={setChartPeriod}
          loading={loading}
        />

        <LowStockPanel
          lowStockItems={lowStockItems}
          onViewAll={() => navigate('/inventory')}
          onReorder={(item) => {
            // Navigate to purchase page with item pre-selected
            navigate('/new-purchase', { state: { preSelectedItem: item } });
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;