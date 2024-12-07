const mongoose = require('mongoose');
const Analytics = require('../Models/Analytics');
const Order = require('../models/Order');
const User = require('../models/User');
const { Product } = require('../Models/Product');
const seedOrders = require('./orderSeeder');
const dotenv = require('dotenv');

dotenv.config();

const generateDailyAnalytics = async (orders, users, products, date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    // Filter orders for the specific date
    const dailyOrders = orders.filter(order => 
        order.createdAt >= dayStart && order.createdAt <= dayEnd
    );

    // Calculate order metrics by status
    const orderMetrics = {
        total: dailyOrders.length,
        pending: dailyOrders.filter(o => o.status === 'pending').length,
        processing: dailyOrders.filter(o => o.status === 'processing').length,
        shipped: dailyOrders.filter(o => o.status === 'shipped').length,
        delivered: dailyOrders.filter(o => o.status === 'delivered').length,
        cancelled: dailyOrders.filter(o => o.status === 'cancelled').length,
        returned: dailyOrders.filter(o => o.status === 'returned').length
    };

    // Calculate revenue metrics
    const totalRevenue = dailyOrders.reduce((sum, order) => 
        order.status === 'delivered' ? sum + order.total : sum, 0
    );

    // Calculate previous day's revenue for growth
    const previousDay = new Date(dayStart);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayEnd = new Date(previousDay);
    previousDayEnd.setHours(23, 59, 59, 999);

    const previousDayOrders = orders.filter(order => 
        order.createdAt >= previousDay && order.createdAt <= previousDayEnd &&
        order.status === 'delivered'
    );
    const previousDayRevenue = previousDayOrders.reduce((sum, order) => sum + order.total, 0);
    
    const revenueGrowth = previousDayRevenue ? 
        ((totalRevenue - previousDayRevenue) / previousDayRevenue) * 100 : 0;

    // Calculate user metrics
    const activeUsers = users.filter(user => 
        user.lastLogin >= dayStart && user.lastLogin <= dayEnd
    ).length;

    const newUsers = users.filter(user => 
        user.createdAt >= dayStart && user.createdAt <= dayEnd
    ).length;

    const buyersCount = users.filter(user => user.role === 'buyer' && !user.isBanned).length;
    const sellersCount = users.filter(user => user.role === 'seller' && user.isApproved).length;

    // Calculate product metrics
    const productMetrics = {
        total: products.length,
        approved: products.filter(p => p.status === 'approved').length,
        pending: products.filter(p => p.status === 'pending').length,
        flagged: products.filter(p => p.status === 'flagged').length
    };

    // Generate top products data
    const productMap = new Map();
    dailyOrders.forEach(order => {
        order.items.forEach(item => {
            if (!item.productId) return;
            const productId = item.productId._id || item.productId;
            const existing = productMap.get(productId.toString()) || { sales: 0, revenue: 0 };
            existing.sales += item.quantity;
            existing.revenue += item.subtotal;
            productMap.set(productId.toString(), existing);
        });
    });

    const topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({
            productId: new mongoose.Types.ObjectId(productId),
            sales: data.sales,
            revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Generate hourly user activity
    const userActivity = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activeUsers: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 50 : 10)
    }));

    // Generate system logs from orders and user actions
    const systemLogs = dailyOrders.map(order => ({
        userId: order.customer,
        action: 'order_created',
        timestamp: order.createdAt,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    }));

    return {
        date,
        metrics: {
            revenue: {
                total: totalRevenue,
                growth: revenueGrowth
            },
            orders: orderMetrics,
            users: {
                active: activeUsers,
                new: newUsers,
                buyers: buyersCount,
                sellers: sellersCount
            },
            products: productMetrics
        },
        topProducts,
        userActivity,
        systemLogs
    };
};

const seedAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get or create required data
        let orders = await Order.find().populate('items.productId customer');
        if (!orders.length) {
            console.log('No orders found, seeding orders first...');
            await seedOrders();
            orders = await Order.find().populate('items.productId customer');
        }

        const users = await User.find();
        const products = await Product.find();

        // Clear existing analytics
        await Analytics.deleteMany({});
        console.log('Cleared existing analytics');

        // Generate analytics for the last 30 days
        const analyticsData = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dailyAnalytics = await generateDailyAnalytics(orders, users, products, date);
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