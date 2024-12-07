import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { analyticsService } from '../services/analyticsService';
import AnalyticsStats from '../components/analytics/AnalyticsStats';
import SalesChart from '../components/analytics/SalesChart';
import TopProducts from '../components/analytics/TopProducts';
import UserActivityChart from '../components/analytics/UserActivityChart';
import SystemLogs from '../components/analytics/SystemLogs';
import DateRangePicker from '../components/common/DateRangePicker';
import { Download } from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ 
    from: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    to: new Date() 
  });
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate dateRange whenever it changes
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      console.warn('Invalid date range');
      setDateRange({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date()
      });
    }
  }, [dateRange]);

  const handleDateRangeChange = (newRange) => {
    if (!newRange?.from || !newRange?.to) {
      toast.error('Please select valid dates');
      return;
    }
    setDateRange(newRange);
  };

  const fetchAnalyticsData = async () => {
    if (!dateRange.from || !dateRange.to) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        analyticsService.getOverviewStats(),
        analyticsService.getRevenueAnalytics(dateRange, groupBy),
        analyticsService.getUserActivity(dateRange, groupBy),
        analyticsService.getSystemLogs(dateRange),
        analyticsService.getTopProducts(dateRange)
      ]);
      
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      await analyticsService.exportData(format, dateRange);
      toast.success(`Successfully exported data as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, groupBy]);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto"
          />
          
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>

          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <AnalyticsStats dateRange={dateRange} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
          <SalesChart dateRange={dateRange} groupBy={groupBy} />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
          <UserActivityChart dateRange={dateRange} groupBy={groupBy} />
        </div>
      </div>

      {/* System Logs and Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <SystemLogs dateRange={dateRange} />
        <TopProducts dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Analytics;
