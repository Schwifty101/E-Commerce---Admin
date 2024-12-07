import React, { useState, useEffect } from 'react';
import { BarChart2, Download, Filter, Users, ShoppingBag, DollarSign } from 'lucide-react';
import DateRangePicker from '../components/common/DateRangePicker';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/analytics/RevenueChart';
import SystemLogs from '../components/analytics/SystemLogs';
import TopProducts from '../components/analytics/TopProducts';
import UserActivityChart from '../components/analytics/UserActivityChart';
import { analyticsService } from '../services/analyticsService';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [groupBy, setGroupBy] = useState('day');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [userActivity, setUserActivity] = useState([]);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchTopProducts();
      fetchUserActivity();
    }
  }, [dateRange]);

  const fetchOverviewStats = async () => {
    try {
      const data = await analyticsService.getOverviewStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch overview stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const data = await analyticsService.getTopProducts({
        from: dateRange.from,
        to: dateRange.to,
        limit: 5
      });
      setTopProducts(data);
    } catch (error) {
      toast.error('Failed to fetch top products');
    }
  };

  const fetchUserActivity = async () => {
    try {
      const data = await analyticsService.getUserActivity({
        from: dateRange.from,
        to: dateRange.to
      });
      setUserActivity(data);
    } catch (error) {
      toast.error('Failed to fetch user activity');
    }
  };

  const handleExport = async (type) => {
    try {
      if (!dateRange.from || !dateRange.to) {
        toast.error('Please select a date range');
        return;
      }

      await analyticsService.exportData(type, {
        dateRange,
        filters: { groupBy }
      });
      toast.success(`${type.toUpperCase()} report generated successfully`);
    } catch (error) {
      toast.error(`Failed to generate ${type} report`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <DateRangePicker onChange={setDateRange} />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${stats?.stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={BarChart2}
          trend={stats?.growth?.revenue}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Active Users"
          value={stats?.stats?.activeUsers || '0'}
          icon={Users}
          trend={stats?.growth?.users}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.stats?.totalOrders || '0'}
          icon={ShoppingBag}
          trend={stats?.growth?.orders}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Average Order Value"
          value={`$${stats?.stats?.averageOrderValue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          trend={stats?.growth?.averageOrder}
          trendLabel="vs last month"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart dateRange={dateRange} groupBy={groupBy} />
        <UserActivityChart data={userActivity} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={topProducts} />
        <SystemLogs dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Analytics;
