import React, { useState } from 'react';
import { analyticsService } from '../../services/analyticsService';

const ExportAnalytics = () => {
    const [exportConfig, setExportConfig] = useState({
        period: '30days',
        dataType: 'all',
        groupBy: 'day',
        orderStatus: 'all'
    });

    const handleConfigChange = (field, value) => {
        setExportConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExport = async () => {
        try {
            await analyticsService.exportData(exportConfig);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to export data';
            alert(errorMessage);
            console.error('Export error:', error);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Export Data</h2>
                    <p className="text-gray-600 mt-1">Download your analytics data</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time Period */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Time Period</label>
                        <select
                            value={exportConfig.period}
                            onChange={(e) => handleConfigChange('period', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        >
                            <option value="24hours">Last 24 Hours</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="12months">Last 12 Months</option>
                        </select>
                    </div>

                    {/* Data Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Data Type</label>
                        <select
                            value={exportConfig.dataType}
                            onChange={(e) => handleConfigChange('dataType', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        >
                            <option value="all">All Data</option>
                            <option value="revenue">Revenue Only</option>
                            <option value="orders">Orders Only</option>
                            <option value="users">User Activity Only</option>
                            <option value="products">Products Only</option>
                        </select>
                    </div>

                    {/* Group By */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Group By</label>
                        <select
                            value={exportConfig.groupBy}
                            onChange={(e) => handleConfigChange('groupBy', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        >
                            <option value="hour">Hourly</option>
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                        </select>
                    </div>

                    {/* Order Status Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Order Status</label>
                        <select
                            value={exportConfig.orderStatus}
                            onChange={(e) => handleConfigChange('orderStatus', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-colors duration-200 
                             focus:ring-2 focus:ring-blue-200"
                >
                    Export Analytics Data
                </button>
            </div>
        </div>
    );
};

export default ExportAnalytics;
