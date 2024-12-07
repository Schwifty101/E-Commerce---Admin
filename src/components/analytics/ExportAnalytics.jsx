import React from 'react';
import {analyticsService} from '../../services/analyticsService';

const ExportAnalytics = () => {
    const handleExport = async () => {
        try {
            await analyticsService.exportData();
            alert('Export successful! Check your downloads.');
        } catch {
            alert('Failed to export data.');
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
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             transition-colors duration-200 focus:ring-2 focus:ring-blue-200"
                >
                    Export Analytics Data
                </button>
            </div>
        </div>
    );
};

export default ExportAnalytics;
