import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/orders`;

export const orderService = {
    getOrders: async (filters = {}) => {
        const response = await fetch(`${BASE_URL}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch orders');
        }
        return response.json();
    },

    getOrderHistory: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${BASE_URL}/history?${queryParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch order history');
        }
        return response.json();
    },

    updateOrderStatus: async (orderId, statusData) => {
        const response = await fetch(`${BASE_URL}/${orderId}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statusData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update order status');
        }
        return response.json();
    },

    getReturnRequests: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${BASE_URL}/returns?${queryParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch return requests');
        }
        return response.json();
    },

    processReturnRequest: async (orderId, actionData) => {
        const response = await fetch(`${BASE_URL}/${orderId}/returns`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(actionData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process return request');
        }
        return response.json();
    },

    exportOrders: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${BASE_URL}/export?${queryParams}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to export orders');
        }
        return response.blob();
    },

    getOrderDetails: async (orderId) => {
        const response = await fetch(`${BASE_URL}/${orderId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch order details');
        }
        return response.json();
    }
}; 