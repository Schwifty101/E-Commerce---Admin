import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { analyticsService } from '../../services/analyticsService';
import { useState, useEffect } from 'react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RevenueAnalytics = () => {
    const [period, setPeriod] = useState('30days');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRevenueData();
    }, [period]);

    const fetchRevenueData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsService.getRevenueAnalytics({ period });
            setAnalyticsData(data);
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
            setError(error.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Transform API data for the chart with proper error handling
    const chartData = {
        labels: analyticsData?.dailyData?.map(day =>
            new Date(day.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        ) || [],
        datasets: [
            {
                label: 'Revenue',
                data: analyticsData?.dailyData?.map(day => day.totalRevenue) || [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                tension: 0.4,
                fill: true,
                pointStyle: 'circle',
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 12
                    }
                }
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: {
                    display: false
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.06)',
                },
                ticks: {
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 12
                    },
                    color: '#6B7280'
                }
            },
            x: {
                border: {
                    display: false
                },
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 12
                    },
                    color: '#6B7280'
                }
            }
        }
    };

    const handleExport = () => {
        analyticsService.exportData({
            type: 'revenue',
            period,
            format: 'csv'
        });
    };

    const calculateSummaryMetrics = (data) => {
        if (!data?.dailyData?.length) return null;

        const validOrders = data.dailyData.filter(day => 
            day.orderCount > 0 && day.totalRevenue > 0
        );

        const totalRevenue = validOrders.reduce((sum, day) => 
            sum + day.totalRevenue, 0
        );

        const totalOrders = validOrders.reduce((sum, day) => 
            sum + day.orderCount, 0
        );

        const averageRevenue = totalOrders > 0 ? 
            totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            averageRevenue,
            totalOrders,
            growth: data.summary?.growth || 0,
            conversionMetrics: data.summary?.conversionMetrics || {
                cartToOrder: 0
            }
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading data</p>
                    <button
                        onClick={fetchRevenueData}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const summary = calculateSummaryMetrics(analyticsData);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {period === '24hours' ? 'Last 24 hours' :
                            period === '7days' ? 'Last 7 days' :
                                period === '30days' ? 'Last 30 days' :
                                    period === '90days' ? 'Last 90 days' :
                                        'Last 12 months'} performance analysis
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        className="px-3 py-2 bg-white border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="24hours">Last 24 Hours</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="12months">Last 12 Months</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                        Export Data
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { 
                            label: 'Total Revenue', 
                            value: `$${summary?.totalRevenue?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) || '0.00'}`,
                            change: `${summary?.growth || 0}%`
                        },
                        { 
                            label: 'Average Order Value', 
                            value: `$${summary?.averageRevenue?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) || '0.00'}`,
                            change: `${summary?.averageGrowth || 0}%`
                        },
                        {
                            label: 'Order Count',
                            value: summary?.totalOrders?.toLocaleString() || 0,
                            change: `${summary?.orderGrowth || 0}%`
                        },
                        {
                            label: 'Conversion Rate',
                            value: `${summary?.conversionMetrics?.cartToOrder || 0}%`,
                            change: `${summary?.conversionGrowth || 0}%`
                        },
                    ].map((stat, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                            <p className={`text-sm mt-1 ${parseFloat(stat.change) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {parseFloat(stat.change) >= 0 ? '+' : ''}{stat.change}%
                            </p>
                        </div>
                    ))}
                </div>

                <div style={{ height: '400px' }}>
                    {analyticsData?.dailyData?.length > 0 ? (
                        <Line data={chartData} options={options} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No data available for the selected period</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;