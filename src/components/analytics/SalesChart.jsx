import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../common/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ dateRange, groupBy }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const revenueData = await analyticsService.getRevenueAnalytics(dateRange, groupBy);
        
        const chartData = {
          labels: revenueData.map(item => item.date),
          datasets: [{
            label: 'Revenue',
            data: revenueData.map(item => item.revenue),
            fill: false,
            borderColor: 'rgb(53, 162, 235)',
            tension: 0.1
          }]
        };
        
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.from && dateRange?.to) {
      fetchData();
    }
  }, [dateRange, groupBy]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4">Revenue Analytics</h2>
      <div className="h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesChart;