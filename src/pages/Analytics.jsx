import AnalyticsStats from '../components/analytics/AnalyticsStats';
import SalesChart from '../components/analytics/SalesChart';
import TopProducts from '../components/analytics/TopProducts';
import UserActivityChart from '../components/analytics/UserActivityChart';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      
      <AnalyticsStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <UserActivityChart />
      </div>
      
      <TopProducts />
    </div>
  );
};

export default Analytics;
