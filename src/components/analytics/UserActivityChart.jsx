import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const UserActivityChart = ({ data }) => {
    // Format hours to readable time strings
    const chartData = data.hourlyActivity.map(item => ({
        time: `${item.hour}:00`,  // Convert hour to "HH:00" format
        activeUsers: item.activeUsers,
        buyers: item.buyers || 0,
        sellers: item.sellers || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={chartData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    tickFormatter={(time) => time} // Display as HH:00
                />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#3B82F6" fill="#93C5FD" />
                <Area type="monotone" dataKey="buyers" stackId="2" stroke="#10B981" fill="#6EE7B7" />
                <Area type="monotone" dataKey="sellers" stackId="3" stroke="#8B5CF6" fill="#C4B5FD" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default UserActivityChart; 