import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { analyticsService } from '../../services/analyticsService';
import LoadingSpinner from '../common/LoadingSpinner';

const RevenueChart = ({ dateRange, groupBy }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchRevenueData();
    }
  }, [dateRange, groupBy]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const revenueData = await analyticsService.getRevenueAnalytics({
        from: dateRange.from,
        to: dateRange.to,
        groupBy
      });
      
      setData({
        labels: revenueData.map(d => d.date),
        datasets: [
          {
            label: 'Current Period',
            data: revenueData.map(d => d.revenue),
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
          },
          {
            label: 'Previous Period',
            data: revenueData.map(d => d.previousRevenue),
            borderColor: 'rgb(156, 163, 175)',
            tension: 0.1,
            borderDash: [5, 5]
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
      {data && <Line data={data} options={{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `$${value}`
            }
          }
        }
      }} />}
    </div>
  );
};

export default RevenueChart; 