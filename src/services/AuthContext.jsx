import React, { createContext, useState, useContext, useEffect }from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

// Create context with a default value
const AuthContext = createContext(null);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAdminAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-auth`, {
        credentials: 'include',
      });
      
      if (response.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/login');
        return false;
      }
      
      const isAuthenticated = response.status === 200;
      setIsAdminAuthenticated(isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAdminAuthenticated(false);
      toast.error('Authentication check failed');
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      setIsAdminAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setIsAdminAuthenticated(false);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const value = {
    isAdminAuthenticated,
    login,
    logout,
    checkAdminAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Named export for the context itself if needed elsewhere
export { AuthContext };