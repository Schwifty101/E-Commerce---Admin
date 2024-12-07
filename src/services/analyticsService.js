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

    getRevenueAnalytics: async ({ period }) => {
        try {
            const response = await axios.get(`${BASE_URL}/revenue`, {
                params: {
                    period: period || '30days',
                    groupBy: 'day'
                },
                withCredentials: true
            });

            // Debug log
            console.log('Revenue API Response:', response.data);

            // Safely access nested data with optional chaining
            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                summary: {
                    totalRevenue: data.metrics?.revenue?.total || 0,
                    totalOrders: data.metrics?.orders?.total || 0,
                    avgOrderValue: data.metrics?.orders?.total ? 
                        (data.metrics.revenue.total / data.metrics.orders.total) : 0
                },
                dailyData: [{
                    date: data.date || new Date(),
                    totalRevenue: data.metrics?.revenue?.total || 0,
                    orderCount: data.metrics?.orders?.total || 0,
                    growth: data.metrics?.revenue?.growth || 0
                }]
            };
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            console.error('Response data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to fetch revenue analytics');
        }
    },

    getUserActivity: async ({ period }) => {
        try {
            const response = await axios.get(`${BASE_URL}/user-activity`, {
                params: {
                    period: period || '30days'
                },
                withCredentials: true
            });

            // Debug log
            console.log('User Activity API Response:', response.data);

            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                summary: {
                    totalActive: data.metrics?.users?.active || 0,
                    newUsers: data.metrics?.users?.new || 0,
                    buyers: data.metrics?.users?.buyers || 0,
                    sellers: data.metrics?.users?.sellers || 0
                },
                hourlyActivity: (data.userActivity || []).map(item => ({
                    hour: item.hour || 0,
                    activeUsers: item.activeUsers || 0
                }))
            };
        } catch (error) {
            console.error('Error fetching user activity:', error);
            console.error('Response data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to fetch user activity');
        }
    },

    getTopProducts: async ({ period, limit = 10, sortBy = 'revenue' }) => {
        try {
            const response = await axios.get(`${BASE_URL}/top-products`, {
                params: {
                    period: period || '30days',
                    limit,
                    sortBy
                },
                withCredentials: true
            });

            // Debug log
            console.log('Top Products API Response:', response.data);

            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                products: (data.topProducts || []).map(product => ({
                    productId: product.productId || 'unknown',
                    name: product.name || 'Product Name',
                    category: product.category || 'Category',
                    image: product.image || 'https://via.placeholder.com/150',
                    stats: {
                        totalSales: product.sales || 0,
                        totalRevenue: product.revenue || 0
                    }
                }))
            };
        } catch (error) {
            console.error('Error fetching top products:', error);
            console.error('Response data:', error.response?.data);
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
