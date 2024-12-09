import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const UserActivityChart = ({ data }) => {
    const chartData = data.hourlyActivity.map(item => ({
        time: `${item.hour}:00`,
        activeUsers: item.activeUsers,
        buyers: item.buyers || 0,
        sellers: item.sellers || 0
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-600">
                                {entry.name}: {entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={chartData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                }}
            >
                <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                />
                <XAxis
                    dataKey="time"
                    tickFormatter={(time) => time}
                    tick={{ 
                        fontSize: 12, 
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fill: '#6B7280' 
                    }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                    tick={{ 
                        fontSize: 12, 
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fill: '#6B7280'
                    }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                />
                <Legend 
                    wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '12px',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                />
                <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users"
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="rgba(59, 130, 246, 0.1)"
                    strokeWidth={2}
                />
                <Area 
                    type="monotone" 
                    dataKey="buyers" 
                    name="Buyers"
                    stackId="2" 
                    stroke="#10B981" 
                    fill="rgba(16, 185, 129, 0.1)"
                    strokeWidth={2}
                />
                <Area 
                    type="monotone" 
                    dataKey="sellers" 
                    name="Sellers"
                    stackId="3" 
                    stroke="#8B5CF6" 
                    fill="rgba(139, 92, 246, 0.1)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default UserActivityChart; 