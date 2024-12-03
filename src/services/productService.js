import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/products`;

export const productService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${BASE_URL}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }
    return response.json();
  },

  // Get flagged products
  getFlaggedProducts: async () => {
    const response = await fetch(`${BASE_URL}/flagged`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch flagged products');
    }
    return response.json();
  },

  // Approve a product
  approveProduct: async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const response = await fetch(`${BASE_URL}/${productId}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to approve product');
    }
    
    return data;
  },

  // Reject a product
  rejectProduct: async (productId, reason) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const response = await fetch(`${BASE_URL}/${productId}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reject product');
    }
    
    return data;
  },

  // Take action on a product (escalate, delete)
  takeAction: async (productId, action, reason) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (!action) {
      throw new Error('Action is required');
    }

    const response = await fetch(`${BASE_URL}/${productId}/action`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action, 
        reason: reason || undefined // Only include reason if provided
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to ${action} product`);
    }
    
    return data;
  },

  // Update a product
  updateProduct: async (productId, updateData) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const response = await fetch(`${BASE_URL}/${productId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Failed to update product');
    }
  }
}; 