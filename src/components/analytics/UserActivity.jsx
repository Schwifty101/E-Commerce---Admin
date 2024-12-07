import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import UserActivityChart from './UserActivityChart';
import LoadingSpinner from '../common/LoadingSpinner';
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
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Activity</h2>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="24hours">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {data ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm text-gray-600">Active Users</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {data.summary?.totalActive || 0}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-sm text-gray-600">New Users</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {data.summary?.newUsers || 0}
                                </p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg">
                                <h3 className="text-sm text-gray-600">Buyers</h3>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {data.summary?.buyers || 0}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-sm text-gray-600">Sellers</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {data.summary?.sellers || 0}
                                </p>
                            </div>
                        </div>
                        <UserActivityChart data={data} />
                    </>
                ) : (
                    <p className="text-gray-500 text-center">No activity data available</p>
                )}
            </div>
        </div>
    );
};

export default UserActivity;
