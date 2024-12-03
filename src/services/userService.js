import { API_BASE_URL } from '../config';

export const userService = {
  getAllUsers: async() => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
  },
  approveUser: async (id)=> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to approve user');
  },
  banUser: async (id)=> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/ban`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to ban user');
  },
  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },
  initiatePasswordReset: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/users/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to initiate password reset');
  },
  getSellerVerifications: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/sellers/pending`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  approveSellerApplication: async (sellerId) => {
    await fetch(`${API_BASE_URL}/api/users/sellers/${sellerId}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  },
  getBuyerStats: async (buyerId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/buyers/${buyerId}/stats`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  exportUserList: async (filters) => {
    const response = await fetch(`${API_BASE_URL}/api/users/export`, {
      method: 'POST',
      body: JSON.stringify(filters),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.blob();
  },
  getSellers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/sellers`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch sellers');
    return response.json();
  },
  getPendingSellers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/sellers/pending`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch pending sellers');
    return response.json();
  },
  verifySeller: async (sellerId, approved) => {
    const response = await fetch(`${API_BASE_URL}/api/users/sellers/${sellerId}/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved })
    });
    if (!response.ok) throw new Error('Failed to verify seller');
  },
  getBuyers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/buyers`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch buyers');
    return response.json();
  },
  getPendingBuyers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/buyers/pending`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch pending buyers');
    return response.json();
  },
  verifyBuyer: async (buyerId, approved) => {
    const response = await fetch(`${API_BASE_URL}/api/users/buyers/${buyerId}/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved })
    });
    if (!response.ok) throw new Error('Failed to verify buyer');
  }
};