import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import RecentOrders from '../components/dashboard/RecentOrders';
import { Order } from '../types';

const mockOrders: Order[] = [
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Revenue"
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

      <div className="mt-6">
        <RecentOrders orders={mockOrders} />
      </div>
    </div>
  );
};

export default Dashboard;