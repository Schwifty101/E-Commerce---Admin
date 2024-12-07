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

const UserActivityChart = ({ dateRange, groupBy }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        try {
            setLoading(true);
            const activityData = await analyticsService.getUserActivity(dateRange, groupBy);
            
            // Ensure activityData is an array and has required properties
            const dataArray = Array.isArray(activityData) ? activityData : [];
            
            const chartData = {
                labels: dataArray.map(item => {
                    const date = new Date(item.date);
                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
                }).filter(Boolean),
                datasets: [{
                    label: 'Active Users',
                    data: dataArray.map(item => Number(item.count) || 0),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };
            
            setData(chartData);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch user activity:', err);
            setError(err.message || 'Failed to load user activity data');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
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
        text: 'User Activity Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Active Users'
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
      <h2 className="text-lg font-semibold mb-4">User Activity</h2>
      <div className="h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default UserActivityChart; 