import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentOrders from '../components/dashboard/RecentOrders';
import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, growth: 0 });

  console.log(revenueData);
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const data = await analyticsService.getRevenueAnalytics({ period: '30days' });
        console.log('Growth:', data.summary.growth);
        setRevenueData(data.summary);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      }
    };

    fetchRevenueData();
  }, []);

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Total Sales"
          value={formatNumber(revenueData.totalRevenue)}
          icon={DollarSign}
          trend={typeof revenueData.growth === 'number' ? revenueData.growth : 0}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Orders"
          value={revenueData.totalOrders}
          icon={ShoppingBag}
          trend={3}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Customers"
          value="1,245"
          icon={Users}
          trend={15}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Products in Stock"
          value="534"
          icon={Package}
          trend={-3}
          trendLabel="vs last month"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* <RecentOrders orders={} /> */}
      </div>
    </div>
  );
};

export default Dashboard;