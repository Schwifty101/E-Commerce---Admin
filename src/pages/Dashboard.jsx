import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentOrders from '../components/dashboard/RecentOrders';

const mockOrders = [
  {
    id: '1',
    customerName: 'Soban',
    date: '2024-03-14',
    status: 'pending',
    total: 120.75,
    items: [
      { productId: '101', name: 'Laptop', quantity: 1, price: 120.75 }
    ],
    shippingAddress: '123 Main Street, Islamabad',
    paymentStatus: 'pending',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    date: '2024-03-14',
    status: 'processing',
    total: 234.50,
    items: [
      { productId: '102', name: 'Phone', quantity: 1, price: 234.50 }
    ],
    shippingAddress: '456 Elm Street, Karachi',
    paymentStatus: 'paid',
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    date: '2024-03-14',
    status: 'shipped',
    total: 89.99,
    items: [
      { productId: '103', name: 'Headphones', quantity: 1, price: 89.99 }
    ],
    shippingAddress: '789 Pine Street, Lahore',
    paymentStatus: 'paid',
  },
];

const Dashboard = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard
          title="Total Sales"
          value="$12,345"
          icon={DollarSign}
          trend={12}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Orders"
          value="156"
          icon={ShoppingBag}
          trend={8}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Customers"
          value="1,245"
          icon={Users}
          trend={15}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Products in Stock"
          value="534"
          icon={Package}
          trend={-3}
          trendLabel="vs last month"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <RecentOrders orders={mockOrders} />
      </div>
    </div>
  );
};

export default Dashboard;