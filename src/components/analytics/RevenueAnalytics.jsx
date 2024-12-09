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
import { 
    TrendingUp, 
    Loader2, 
    AlertCircle, 
    Download,
    DollarSign,
    ShoppingCart,
    CreditCard,
    PercentCircle
} from 'lucide-react';

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
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-red-600 mb-2">Error loading data</p>
                    <button
                        onClick={fetchRevenueData}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium 
                                 hover:bg-red-100 transition-colors duration-200 inline-flex items-center space-x-2"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Revenue Analytics</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {period === '24hours' ? 'Last 24 hours' :
                             period === '7days' ? 'Last 7 days' :
                             period === '30days' ? 'Last 30 days' :
                             period === '90days' ? 'Last 90 days' :
                             'Last 12 months'} performance analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                        className="px-3 py-2 bg-white border rounded-lg text-sm text-gray-600 
                                 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                 hover:border-blue-300 transition-colors duration-200"
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
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                                 hover:bg-blue-100 transition-all duration-200 inline-flex items-center 
                                 justify-center space-x-2 active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { 
                            label: 'Total Revenue',
                            icon: DollarSign,
                            value: `$${summary?.totalRevenue?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) || '0.00'}`,
                            change: `${summary?.growth || 0}%`,
                            color: 'blue'
                        },
                        { 
                            label: 'Average Order Value',
                            icon: CreditCard,
                            value: `$${summary?.averageRevenue?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) || '0.00'}`,
                            change: `${summary?.averageGrowth || 0}%`,
                            color: 'green'
                        },
                        {
                            label: 'Order Count',
                            icon: ShoppingCart,
                            value: summary?.totalOrders?.toLocaleString() || 0,
                            change: `${summary?.orderGrowth || 0}%`,
                            color: 'yellow'
                        },
                        {
                            label: 'Conversion Rate',
                            icon: PercentCircle,
                            value: `${summary?.conversionMetrics?.cartToOrder || 0}%`,
                            change: `${summary?.conversionGrowth || 0}%`,
                            color: 'purple'
                        },
                    ].map((stat, index) => (
                        <div key={index} 
                             className={`p-4 rounded-lg border bg-${stat.color}-50 border-${stat.color}-100
                                       transition-all duration-200 hover:shadow-sm`}
                        >
                            <div className="flex items-center space-x-2">
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            <p className={`text-sm mt-1 flex items-center space-x-1
                                         ${parseFloat(stat.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className={`w-4 h-4 ${
                                    parseFloat(stat.change) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`} />
                                <span>{parseFloat(stat.change) >= 0 ? '+' : ''}{stat.change}</span>
                            </p>
                        </div>
                    ))}
                </div>

                <div className="h-[400px] sm:h-[450px] lg:h-[500px]">
                    {analyticsData?.dailyData?.length > 0 ? (
                        <Line data={chartData} options={options} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No data available for the selected period</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;