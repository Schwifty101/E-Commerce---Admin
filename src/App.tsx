import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="mt-16 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* <Route path="/users" element={<UserManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/security" element={<Security />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;