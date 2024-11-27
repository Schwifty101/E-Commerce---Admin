export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'seller' | 'buyer';
  status: 'active' | 'pending' | 'banned';
  createdAt: string;
  lastLogin: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: 'approved' | 'pending' | 'rejected' | 'flagged';
  seller: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  lowStockItems: number;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'flash_sale' | 'banner' | 'promotion';
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
  details: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}