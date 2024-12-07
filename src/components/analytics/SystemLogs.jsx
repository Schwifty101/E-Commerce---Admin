import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import Table from '../common/Table';
import { format } from 'date-fns';

const SystemLogs = ({ dateRange }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userType: 'all',
        activityType: 'all'
    });

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchLogs();
        }
    }, [dateRange, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getSystemLogs({
                from: dateRange.from,
                to: dateRange.to,
                ...filters
            });
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            Header: 'User',
            accessor: 'userName',
        },
        {
            Header: 'Activity',
            accessor: 'activity',
            Cell: ({ value }) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {value}
                </span>
            )
        },
        {
            Header: 'Timestamp',
            accessor: 'timestamp',
            Cell: ({ value }) => format(new Date(value), 'MMM dd, yyyy HH:mm:ss')
        },
        {
            Header: 'IP Address',
            accessor: 'ipAddress'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">System Activity Logs</h2>
                <div className="flex space-x-4">
                    <select
                        value={filters.userType}
                        onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Admins</option>
                        <option value="seller">Sellers</option>
                        <option value="buyer">Buyers</option>
                    </select>
                    <select
                        value={filters.activityType}
                        onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">All Activities</option>
                        <option value="order_created">Orders</option>
                        <option value="payment_processed">Payments</option>
                        <option value="return_requested">Returns</option>
                    </select>
                </div>
            </div>
            <Table columns={columns} data={logs} />
        </div>
    );
};

export default SystemLogs; 