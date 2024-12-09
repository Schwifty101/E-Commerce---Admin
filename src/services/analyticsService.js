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
            console.log(response.data);
            return response.data;
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
                    totalRevenue: day.revenue || 0,
                    orderCount: day.orders.total || 0,
                    growth: day.growth || 0,
                    hourlyRevenue: day.hourlyRevenue || []
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

    exportData: async ({ period }) => {
        try {
            const response = await axios.get(`${BASE_URL}/export`, {
                params: {
                    period: period || '30days'
                },
                responseType: 'blob',  // Important for handling file downloads
                withCredentials: true
            });

            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_${period}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting analytics data:', error);
            console.error('Response data:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to export analytics data');
        }
    }
};
