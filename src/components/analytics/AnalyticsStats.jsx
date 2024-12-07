import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../common/LoadingSpinner';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign } from 'lucide-react';

const AnalyticsStats = () => {
  const [stats, setStats] = useState({
    revenue: { total: 0, growth: 0 },
    users: { active: 0, growth: 0 },
    orders: { total: 0, average: 0, growth: 0, valueGrowth: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getOverviewStats();
        
        // Ensure we have all required properties with defaults
        setStats({
          revenue: {
            total: data?.revenue?.total ?? 0,
            growth: data?.revenue?.growth ?? 0
          },
          users: {
            active: data?.users?.active ?? 0,
            growth: data?.users?.growth ?? 0
          },
          orders: {
            total: data?.orders?.total ?? 0,
            average: data?.orders?.average ?? 0,
            growth: data?.orders?.growth ?? 0,
            valueGrowth: data?.orders?.valueGrowth ?? 0
          }
        });
        setError(null);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError(error.message || 'Failed to load statistics');
        // Keep the previous stats if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats?.revenue?.total || 0,
      change: stats?.revenue?.growth || 0,
      icon: DollarSign,
      format: (val) => `$${Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    {
      title: 'Active Users',
      value: stats?.users?.active || 0,
      change: stats?.users?.growth || 0,
      icon: Users,
      format: (val) => Number(val).toLocaleString()
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      change: stats?.orders?.growth || 0,
      icon: ShoppingBag,
      format: (val) => Number(val).toLocaleString()
    },
    {
      title: 'Average Order Value',
      value: stats?.orders?.average || 0,
      change: stats?.orders?.valueGrowth || 0,
      icon: DollarSign,
      format: (val) => `$${Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <card.icon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {card.format(card.value)}
          </p>
          <div className={`flex items-center mt-2 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {card.change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(card.change)}% vs last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsStats;

