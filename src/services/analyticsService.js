import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/analytics`;

const validateDateRange = (dateRange) => {
    if (!dateRange?.from || !dateRange?.to) {
        throw new Error('Invalid date range provided');
    }
    
    // Ensure dates are Date objects
    const from = dateRange.from instanceof Date ? dateRange.from : new Date(dateRange.from);
    const to = dateRange.to instanceof Date ? dateRange.to : new Date(dateRange.to);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new Error('Invalid date format');
    }
    
    return { from, to };
};

export const analyticsService = {
    // Get dashboard overview stats
    getOverviewStats: async () => {
        try {
            const response = await fetch(`${BASE_URL}/stats/overview`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error fetching overview stats');
            }
            
            const { data } = await response.json();
            
            // Return a default structure if data is missing
            return {
                revenue: {
                    total: 0,
                    growth: 0
                },
                users: {
                    active: 0,
                    growth: 0
                },
                orders: {
                    total: 0,
                    average: 0,
                    growth: 0,
                    valueGrowth: 0
                },
                ...data // Spread the actual data if it exists
            };
        } catch (error) {
            console.error('Analytics service error:', error);
            throw new Error('Error fetching overview stats');
        }
    },

    // Get revenue analytics
    getRevenueAnalytics: async (dateRange, groupBy) => {
        const params = new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            groupBy
        });

        const response = await fetch(`${BASE_URL}/revenue?${params}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch revenue analytics');
        }

        const { data } = await response.json();
        return data || [];
    },

    // Get user activity data
    getUserActivity: async (dateRange, groupBy) => {
        const params = new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            groupBy
        });

        const response = await fetch(`${BASE_URL}/users/activity?${params}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch user activity');
        }

        const { data } = await response.json();
        return data?.activityData || [];
    },

    // Get system logs
    getSystemLogs: async (dateRange) => {
        const validatedRange = validateDateRange(dateRange);
        
        const params = new URLSearchParams({
            from: validatedRange.from.toISOString(),
            to: validatedRange.to.toISOString()
        });

        const response = await fetch(`${BASE_URL}/logs?${params}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch system logs');
        }

        return response.json();
    },

    // Get top products
    getTopProducts: async (dateRange) => {
        const params = new URLSearchParams({
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
        });

        const response = await fetch(`${BASE_URL}/products/top?${params}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch top products');
        }

        return response.json();
    },

    // Export data
    exportData: async (format, dateRange, filters = {}) => {
        const response = await fetch(`${BASE_URL}/export/${format}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dateRange,
                filters
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to export data');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}; 