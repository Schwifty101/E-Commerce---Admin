import React from 'react';
import { Bar } from 'react-chartjs-2';
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
    const data = {
        labels: ['Revenue', 'Orders', 'Users', 'Products'],
        datasets: [
            {
                label: 'Metrics Overview',
                data: [15000, 500, 1200, 100],
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
