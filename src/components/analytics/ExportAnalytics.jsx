import React, { useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { 
    Download, 
    Calendar, 
    Filter, 
    BarChart2, 
    AlertCircle,
    ArrowDown
} from 'lucide-react';

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
            toast.error(errorMessage);
            console.error('Export error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Download className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Export Analytics</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Download your analytics data in various formats
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Period */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Time Period</span>
                        </label>
                        <div className="relative">
                            <select
                                value={exportConfig.period}
                                onChange={(e) => handleConfigChange('period', e.target.value)}
                                className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                    text-sm text-gray-600 
                                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                    hover:border-blue-300 transition-colors duration-200"
                            >
                                <option value="24hours">Last 24 Hours</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                                <option value="12months">Last 12 Months</option>
                            </select>
                            <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Data Type */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <BarChart2 className="w-4 h-4 text-gray-500" />
                            <span>Data Type</span>
                        </label>
                        <div className="relative">
                            <select
                                value={exportConfig.dataType}
                                onChange={(e) => handleConfigChange('dataType', e.target.value)}
                                className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                    text-sm text-gray-600 
                                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                    hover:border-blue-300 transition-colors duration-200"
                            >
                                <option value="all">All Data</option>
                                <option value="revenue">Revenue Only</option>
                                <option value="orders">Orders Only</option>
                                <option value="users">User Activity Only</option>
                                <option value="products">Products Only</option>
                            </select>
                            <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Group By */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span>Group By</span>
                        </label>
                        <div className="relative">
                            <select
                                value={exportConfig.groupBy}
                                onChange={(e) => handleConfigChange('groupBy', e.target.value)}
                                className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                    text-sm text-gray-600 
                                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                    hover:border-blue-300 transition-colors duration-200"
                            >
                                <option value="hour">Hourly</option>
                                <option value="day">Daily</option>
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                            </select>
                            <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Order Status Filter */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            <span>Order Status</span>
                        </label>
                        <div className="relative">
                            <select
                                value={exportConfig.orderStatus}
                                onChange={(e) => handleConfigChange('orderStatus', e.target.value)}
                                className="w-full appearance-none px-3 py-2 bg-white border rounded-lg 
                                    text-sm text-gray-600 
                                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none
                                    hover:border-blue-300 transition-colors duration-200"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                            <ArrowDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleExport}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg 
                                hover:bg-blue-700 transition-all duration-200 
                                focus:ring-2 focus:ring-blue-200 active:scale-95
                                inline-flex items-center justify-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Analytics Data</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportAnalytics;
