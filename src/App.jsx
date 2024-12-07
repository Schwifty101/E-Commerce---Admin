import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './services/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const AppContent = () => {
  const { isAdminAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {isAdminAuthenticated ? (
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <div className="flex-1 ml-64">
                <Header />
                <main className="mt-16 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/orders" element={<OrderManagement />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;