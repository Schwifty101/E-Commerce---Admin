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
                    period: period || '30days'
                },
                withCredentials: true
            });

            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                summary: {
                    ...data.summary,
                    conversionMetrics: data.summary.conversionMetrics || {
                        visitToCart: 0,
                        cartToOrder: 0,
                        orderToDelivery: 0
                    }
                },
                dailyData: data.dailyData.map(day => ({
                    date: new Date(day.date),
                    totalRevenue: day.revenue,
                    orderCount: day.orders.total,
                    growth: day.growth,
                    hourlyRevenue: day.hourlyRevenue
                }))
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

            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                summary: {
                    totalActive: data.summary.totalActive || 0,
                    newUsers: data.summary.newUsers || 0,
                    buyers: data.summary.buyers || 0,
                    sellers: data.summary.sellers || 0
                },
                hourlyActivity: data.hourlyActivity || []
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
                params: { period, limit, sortBy },
                withCredentials: true
            });

            const data = response.data?.data;
            
            if (!data) {
                throw new Error('No data received from server');
            }

            return {
                products: data.topProducts.map(product => ({
                    productId: product._id,
                    name: product.name,
                    category: product.category,
                    image: product.image,
                    stats: {
                        totalSales: product.totalSales,
                        totalRevenue: product.totalRevenue
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
