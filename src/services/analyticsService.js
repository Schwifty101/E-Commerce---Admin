import axios from 'axios';

const API_URL = '/api/analytics';

export const analyticsService = {
    async getOverviewStats() {
        const response = await axios.get(`${API_URL}/stats/overview`);
        return response.data.data;
    },

    async getRevenueAnalytics(params) {
        const response = await axios.get(`${API_URL}/revenue`, { params });
        return response.data.data.map(item => ({
            date: item._id,
            revenue: item.revenue,
            growth: item.growth
        }));
    },

    async getSystemLogs(params) {
        const response = await axios.get(`${API_URL}/logs`, { params });
        return response.data.data;
    },

    async getTopProducts(params) {
        const response = await axios.get(`${API_URL}/products/top`, { params });
        return response.data.data.map(product => ({
            id: product._id,
            name: product.productDetails[0]?.name || 'Unknown Product',
            sales: product.totalSales,
            revenue: product.totalRevenue
        }));
    },

    async getUserActivity(params) {
        const response = await axios.get(`${API_URL}/users/activity`, { params });
        return response.data.data.map(activity => ({
            hour: activity._id,
            users: Math.round(activity.averageUsers)
        }));
    },

    async exportData(type, data) {
        const response = await axios.post(
            `${API_URL}/export/${type}`,
            {
                ...data,
                filters: {
                    ...data.filters,
                    dataType: 'sales'
                }
            },
            { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics_report_${Date.now()}.${type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}; 