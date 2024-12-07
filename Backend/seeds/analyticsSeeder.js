const mongoose = require('mongoose');
const Analytics = require('../Models/Analytics');
const seedOrders = require('./orderSeeder');
const seedUsers = require('./userSeeder');
const seedProducts = require('./productSeeder');
const dotenv = require('dotenv');

dotenv.config();

const generateDailyAnalytics = async (orders, users, products, date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    // Filter orders for the specific date
    const dailyOrders = orders.filter(order => 
        order.createdAt >= dayStart && order.createdAt <= dayEnd
    );

    // Calculate revenue metrics
    const totalRevenue = dailyOrders.reduce((sum, order) => 
        order.status === 'delivered' ? sum + order.total : sum, 0
    );

    // Previous day calculations for growth
    const previousDay = new Date(dayStart);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayEnd = new Date(previousDay);
    previousDayEnd.setHours(23, 59, 59, 999);

    const previousDayOrders = orders.filter(order => 
        order.createdAt >= previousDay && 
        order.createdAt <= previousDayEnd &&
        order.status === 'delivered'
    );
    
    const previousDayRevenue = previousDayOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = previousDayRevenue ? 
        ((totalRevenue - previousDayRevenue) / previousDayRevenue) * 100 : 0;

    // Calculate top products
    const productSales = new Map();
    dailyOrders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            if (!product || product.status !== 'approved') return;

            const existing = productSales.get(product._id.toString()) || {
                productId: product._id,
                name: product.name,
                category: product.category,
                image: product.image,
                stats: { totalSales: 0, totalRevenue: 0 }
            };

            existing.stats.totalSales += item.quantity;
            existing.stats.totalRevenue += item.subtotal;
            productSales.set(product._id.toString(), existing);
        });
    });

    // Generate realistic hourly user activity
    const activeUsersCount = users.filter(u => !u.isBanned).length;
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
        // More users during business hours (9-17)
        const baseUsers = hour >= 9 && hour <= 17 ? 
            Math.floor(activeUsersCount * 0.3) : 
            Math.floor(activeUsersCount * 0.1);
        
        return {
            hour,
            activeUsers: Math.max(0, baseUsers + Math.floor(Math.random() * 20))
        };
    });

    return {
        date,
        metrics: {
            revenue: {
                total: totalRevenue,
                growth: revenueGrowth
            },
            orders: {
                total: dailyOrders.length,
                pending: dailyOrders.filter(o => o.status === 'pending').length,
                processing: dailyOrders.filter(o => o.status === 'processing').length,
                shipped: dailyOrders.filter(o => o.status === 'shipped').length,
                delivered: dailyOrders.filter(o => o.status === 'delivered').length,
                cancelled: dailyOrders.filter(o => o.status === 'cancelled').length,
                returned: dailyOrders.filter(o => o.status === 'returned').length
            },
            users: {
                active: activeUsersCount,
                new: users.filter(u => 
                    u.createdAt >= dayStart && u.createdAt <= dayEnd
                ).length,
                buyers: users.filter(u => u.role === 'buyer' && !u.isBanned).length,
                sellers: users.filter(u => u.role === 'seller' && u.isApproved).length
            },
            products: {
                total: products.length,
                approved: products.filter(p => p.status === 'approved').length,
                pending: products.filter(p => p.status === 'pending').length,
                flagged: products.filter(p => p.status === 'flagged').length
            }
        },
        topProducts: Array.from(productSales.values())
            .sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue)
            .slice(0, 5),
        userActivity: hourlyActivity,
        systemLogs: []
    };
};

const seedAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Ensure we have all required data
        const { products, users } = await seedProducts();
        const orders = await seedOrders();

        // Clear existing analytics
        await Analytics.deleteMany({});
        console.log('Cleared existing analytics');

        // Generate analytics for the last 30 days
        const analyticsData = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dailyAnalytics = await generateDailyAnalytics(orders, users.sellers.concat(users.buyers), products, date);
            analyticsData.push(dailyAnalytics);
        }

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