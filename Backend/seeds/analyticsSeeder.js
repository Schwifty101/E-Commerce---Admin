const mongoose = require('mongoose');
const Analytics = require('../Models/Analytics');
const Order = require('../models/Order');
const seedOrders = require('./orderSeeder');
const dotenv = require('dotenv');

dotenv.config();

const generateDailyAnalytics = async (orders, date) => {
  // Get orders for the specific date
  const dayStart = new Date(date.setHours(0, 0, 0, 0));
  const dayEnd = new Date(date.setHours(23, 59, 59, 999));
  
  const dailyOrders = orders.filter(order => 
    order.createdAt >= dayStart && order.createdAt <= dayEnd
  );

  // Calculate metrics
  const totalRevenue = dailyOrders.reduce((sum, order) => sum + order.total, 0);
  const previousDayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setDate(orderDate.getDate() + 1);
    return orderDate >= dayStart && orderDate <= dayEnd;
  });
  const previousDayRevenue = previousDayOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueGrowth = previousDayRevenue ? 
    ((totalRevenue - previousDayRevenue) / previousDayRevenue) * 100 : 0;

  // Generate hourly user activity
  const userActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 50 : 10)
  }));

  // Aggregate top products
  const productMap = new Map();
  dailyOrders.forEach(order => {
    order.items.forEach(item => {
      if (!item.productId) return; // Skip if no product ID
      const productId = item.productId._id || item.productId; // Handle both populated and unpopulated
      const existing = productMap.get(productId.toString()) || { sales: 0, revenue: 0 };
      existing.sales += item.quantity;
      existing.revenue += item.subtotal;
      productMap.set(productId.toString(), existing);
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId: new mongoose.Types.ObjectId(productId), // Convert to ObjectId
      sales: data.sales,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Generate system logs
  const systemLogs = [
    { type: 'order_created', count: dailyOrders.length },
    { type: 'payment_processed', count: dailyOrders.filter(o => o.paymentStatus === 'paid').length },
    { type: 'order_shipped', count: dailyOrders.filter(o => o.status === 'shipped').length },
    { type: 'order_delivered', count: dailyOrders.filter(o => o.status === 'delivered').length },
    { type: 'return_requested', count: dailyOrders.filter(o => o.status === 'returned').length }
  ];

  return {
    date,
    metrics: {
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth
      },
      users: {
        active: Math.floor(Math.random() * 100) + 50,
        new: Math.floor(Math.random() * 20) + 5
      },
      orders: {
        total: dailyOrders.length,
        average: totalRevenue / (dailyOrders.length || 1)
      }
    },
    userActivity,
    topProducts,
    systemLogs
  };
};

const seedAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get or create orders
    let orders = await Order.find().populate('items.productId');
    if (!orders.length) {
      console.log('No orders found, seeding orders first...');
      await seedOrders();
      orders = await Order.find().populate('items.productId');
    }

    // Clear existing analytics
    await Analytics.deleteMany({});
    console.log('Cleared existing analytics');

    // Generate analytics for the last 30 days
    const analyticsData = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dailyAnalytics = await generateDailyAnalytics(orders, date);
      analyticsData.push(dailyAnalytics);
    }

    // Insert analytics data
    const createdAnalytics = await Analytics.insertMany(analyticsData);
    console.log(`${createdAnalytics.length} days of analytics data seeded successfully`);

    return createdAnalytics;
  } catch (error) {
    console.error('Error seeding analytics:', error);
    throw error;
  }
};

module.exports = seedAnalytics;

if (require.main === module) {
  seedAnalytics()
    .then(() => {
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      mongoose.connection.close();
      process.exit(1);
    });
} 