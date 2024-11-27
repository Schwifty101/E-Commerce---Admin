import { TrendingUp, Users, ShoppingBag, CreditCard } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';

const AnalyticsStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value="$24,567"
        icon={TrendingUp}
        trend={12.5}
        trendLabel="vs last month"
      />
      <StatsCard
        title="Active Users"
        value="1,234"
        icon={Users}
        trend={8.2}
        trendLabel="vs last month"
      />
      <StatsCard
        title="Total Orders"
        value="856"
        icon={ShoppingBag}
        trend={-3.1}
        trendLabel="vs last month"
      />
      <StatsCard
        title="Average Order Value"
        value="$123"
        icon={CreditCard}
        trend={5.8}
        trendLabel="vs last month"
      />
    </div>
  );
};

export default AnalyticsStats; 
