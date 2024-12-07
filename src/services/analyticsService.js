import axios from 'axios';

const API_URL = '/api/analytics';

export const analyticsService = {
    // Get overview statistics
    async getOverviewStats() {
        try {
            const response = await axios.get(`${API_URL}/stats/overview`);
            console.log('Raw API response:', response.data);

            // Check for API success status
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch overview stats');
            }

            // Destructure and validate the response data
            const { stats = {}, growth = {} } = response.data.data || {};

            // Format and validate the stats data
            const formattedStats = {
                stats: {
                    totalRevenue: Number(stats.totalRevenue || 0),
                    activeUsers: Number(stats.activeUsers || 0),
                    totalOrders: Number(stats.totalOrders || 0),
                    averageOrderValue: Number(stats.averageOrderValue || 0)
                },
                growth: {
                    revenue: Number(growth.revenue || 0),
                    users: Number(growth.users || 0),
                    orders: Number(growth.orders || 0)
                }
            };

            return formattedStats;
        } catch (error) {
            console.error('Error in getOverviewStats:', error);
            throw error;
        }
    },

    // Get revenue analytics with date range and grouping
    async getRevenueAnalytics(params) {
        try {
            const response = await axios.get(`${API_URL}/revenue`, { params });
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch revenue analytics');
            }
            return response.data.data.map(item => ({
                date: item._id,
                revenue: Number(item.revenue || 0),
                growth: Number(item.growth || 0)
            }));
        } catch (error) {
            console.error('Error in getRevenueAnalytics:', error);
            throw error;
        }
    },

    // Get user activity data
    async getUserActivity(params) {
        try {
            const response = await axios.get(`${API_URL}/users/activity`, { params });
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch user activity');
            }
            return response.data.data.map(activity => ({
                hour: Number(activity._id),
                users: Math.round(Number(activity.averageUsers || 0))
            })).sort((a, b) => a.hour - b.hour);
        } catch (error) {
            console.error('Error in getUserActivity:', error);
            throw error;
        }
    },

    // Get top products
    async getTopProducts(params) {
        try {
            const response = await axios.get(`${API_URL}/products/top`, { params });
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch top products');
            }
            return response.data.data.map(product => ({
                id: product._id,
                name: product.productDetails?.[0]?.name || 'Unknown Product',
                sales: Number(product.totalSales || 0),
                revenue: Number(product.totalRevenue || 0)
            }));
        } catch (error) {
            console.error('Error in getTopProducts:', error);
            throw error;
        }
    },

    // Get system logs
    async getSystemLogs(params) {
        try {
            const response = await axios.get(`${API_URL}/logs`, { params });
            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to fetch system logs');
            }
            return response.data.data.map(log => ({
                id: log._id,
                user: log.userId?.name || 'Unknown User',
                action: log.action,
                timestamp: new Date(log.timestamp),
                ipAddress: log.ipAddress
            }));
        } catch (error) {
            console.error('Error in getSystemLogs:', error);
            throw error;
        }
    },

    // Export data
    async exportData(type, data) {
        try {
            const response = await axios.post(
                `${API_URL}/export/${type}`,
                data,
                { responseType: 'blob' }
            );

            if (!response.data) {
                throw new Error(`Failed to export ${type} data`);
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_report_${Date.now()}.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error exporting ${type}:`, error);
            throw error;
        }
    }
};
