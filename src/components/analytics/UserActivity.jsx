import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import UserActivityChart from './UserActivityChart';
import { Users, Loader2, AlertCircle, UserPlus, ShoppingBag, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserActivity = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('24hours');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getUserActivity({ period });
                setData(response);
            } catch (error) {
                console.error('Error fetching user activity:', error);
                toast.error('Failed to load user activity data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading user activity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Activity</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {period === '24hours' ? 'Last 24 hours' :
                             period === '7days' ? 'Last 7 days' :
                             'Last 30 days'} user engagement analysis
                        </p>
                    </div>
                </div>

                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-3 py-2 bg-white border rounded-lg text-sm text-gray-600 
                             focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                             hover:border-blue-300 transition-colors duration-200"
                >
                    <option value="24hours">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6">
                {data ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                {
                                    label: 'Active Users',
                                    value: data.summary?.totalActive || 0,
                                    icon: Users,
                                    color: 'blue'
                                },
                                {
                                    label: 'New Users',
                                    value: data.summary?.newUsers || 0,
                                    icon: UserPlus,
                                    color: 'green'
                                },
                                {
                                    label: 'Buyers',
                                    value: data.summary?.buyers || 0,
                                    icon: ShoppingBag,
                                    color: 'emerald'
                                },
                                {
                                    label: 'Sellers',
                                    value: data.summary?.sellers || 0,
                                    icon: Store,
                                    color: 'purple'
                                }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border bg-${stat.color}-50 border-${stat.color}-100
                                              transition-all duration-200 hover:shadow-sm`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                                        <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
                                    </div>
                                    <p className={`text-2xl font-bold text-gray-900 mt-2`}>
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="h-[400px] sm:h-[450px] lg:h-[500px]">
                            <UserActivityChart data={data} />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No activity data available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserActivity;
