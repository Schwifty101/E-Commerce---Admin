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

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-red-500 py-4">Error: {error}</div>;
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
                position: 'top'
            },
            title: {
                display: true,
                text: 'Business Metrics Overview'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
            <div className="bg-white shadow rounded p-4">
                <div style={{ height: '400px' }}>
                    <Bar data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Overview;
