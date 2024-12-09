import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { analyticsService } from '../../services/analyticsService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { BarChart2, AlertCircle, Loader2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await analyticsService.getOverviewStats();
                console.log(data.stats);
                setStats(data.stats);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600 font-medium">Loading analytics...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-8 px-4 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="ml-2 text-red-600">Error: {error}</span>
        </div>
    );

    if (!stats) return null;

    const data = {
        labels: ['Orders', 'Users', 'Products'],
        datasets: [
            {
                label: 'Metrics Overview',
                data: [
                    stats.totalOrders,
                    stats.totalCustomers,
                    stats.totalProducts
                ],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',  // Green
                    'rgba(255, 193, 7, 0.7)',  // Yellow
                    'rgba(33, 150, 243, 0.7)', // Blue
                    'rgba(255, 87, 34, 0.7)'   // Orange
                ],
                borderColor: [
                    '#4CAF50',
                    '#FFC107',
                    '#2196F3',
                    '#FF5722'
                ],
                borderWidth: 1
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
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                    usePointStyle: true,
                }
            },
            title: {
                display: true,
                text: 'Business Metrics Overview',
                font: {
                    size: 16,
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                },
                padding: 20
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <BarChart2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Overview</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total Orders', value: stats.totalOrders, color: 'green' },
                        { label: 'Total Customers', value: stats.totalCustomers, color: 'yellow' },
                        { label: 'Total Products', value: stats.totalProducts, color: 'blue' },
                    ].map((item, index) => (
                        <div 
                            key={index} 
                            className={`p-4 rounded-lg border bg-${item.color}-50 border-${item.color}-100`}
                        >
                            <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="h-[400px] sm:h-[450px] lg:h-[500px]">
                    <Bar data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Overview;
