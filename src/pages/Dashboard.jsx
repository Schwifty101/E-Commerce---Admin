import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import TopProducts from '../components/analytics/TopProducts';
import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, growth: 0 });
  const [overviewStats, setOverviewStats] = useState({ totalOrders: 0, totalCustomers: 0, totalProducts: 0 });
  const [growthData, setGrowthData] = useState({ revenue: 0, users: 0, orders: 0, orderValue: 0 });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const data = await analyticsService.getRevenueAnalytics({ period: '30days' });
        setRevenueData(data.summary);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      }
    };

    fetchRevenueData();
  }, []);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const data = await analyticsService.getOverviewStats();
        setOverviewStats(data.stats);
        setGrowthData(data.growth);
      } catch (error) {
        console.error('Failed to fetch overview stats:', error);
      }
    };

    fetchOverviewStats();
  }, []);

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm md:text-base text-gray-600 mt-0.5">
              Track your business performance and growth
            </p>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            title="Total Sales"
            value={formatNumber(revenueData.totalRevenue)}
            icon={DollarSign}
            trend={Math.floor(growthData.revenue)}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Total Orders"
            value={overviewStats.totalOrders}
            icon={ShoppingBag}
            trend={growthData.orders}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Total Customers"
            value={overviewStats.totalCustomers}
            icon={Users}
            trend={growthData.users}
            trendLabel="vs last month"
          />
          <StatsCard
            title="Products in Stock"
            value={overviewStats.totalProducts}
            icon={Package}
            trend={growthData.orderValue}
            trendLabel="vs last month"
          />
        </div>

        {/* Top Products Section */}
        <div className="mt-4">
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;