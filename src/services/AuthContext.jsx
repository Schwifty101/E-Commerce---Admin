import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);
  const navigate = useNavigate();

  const checkAdminAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-auth`, {
        credentials: 'include',
      });
      
      if (response.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/login');
      }
      
      setIsAdminAuthenticated(response.status === 200);
    } catch (error) {
      setIsAdminAuthenticated(false);
      toast.error('Authentication check failed');
    }
  };

  const login = async (username, password) => {
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
      toast.error('Logout failed');
    }
  };

  React.useEffect(() => {
    checkAdminAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAdminAuthenticated, 
      login, 
      logout, 
      checkAdminAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 