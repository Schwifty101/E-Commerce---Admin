import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/analytics`;

export const analyticsService = {
    // Overview Statistics
    getOverviewStats: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/overview`, {
                withCredentials: true
            });

            return response.data.data;
        } catch (error) {
            console.error('Error fetching overview stats:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch overview statistics');
        }
    },

    getRevenueAnalytics: async (period = '30days') => {
        try {
            const response = await axios.get(`${BASE_URL}/revenue`, {
                params: { period },
                withCredentials: true
            });

            return response.data.data;
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch revenue analytics');
        }
    },

    getUserActivity: async (period = '24hours') => {
        try {
            const response = await axios.get(`${BASE_URL}/user-activity`, {
                params: { period },
                withCredentials: true
            });

            return response.data.data;
        } catch (error) {
            console.error('Error fetching user activity:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch user activity');
        }
    },

    getTopProducts: async ({
        period = '30days',
        limit = 10,
        sortBy = 'revenue'
    } = {}) => {
        try {
            const response = await axios.get(`${BASE_URL}/top-products`, {
                params: {
                    period,
                    limit,
                    sortBy
                },
                withCredentials: true
            });

            return response.data.data;
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch top products');
        }
    },

    exportData: async ({
        type = 'all',
        period = '30days',
        format = 'csv'
    } = {}) => {
        try {
            const response = await axios.get(`${BASE_URL}/export`, {
                params: {
                    type,
                    period,
                    format
                },
                responseType: 'blob',
                withCredentials: true
            });

            // Generate filename
            const filename = `analytics_export_${period}_${type}_${new Date().toISOString().split('T')[0]}.${format}`;

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            return true;
        } catch (error) {
            console.error('Error exporting analytics data:', error);
            throw new Error(error.response?.data?.message || 'Failed to export analytics data');
        }
    }
};
