const mongoose = require('mongoose');
const Analytics = require('../Models/Analytics');
const Order = require('../Models/Order');
const User = require('../models/User');
const { Product } = require('../Models/Product');
const dotenv = require('dotenv');

dotenv.config();

const generateDailyAnalytics = async (date) => {
    try {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        // Get real orders for the day
        const dailyOrders = await Order.find({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        }).populate('customer vendor items.productId');

        // Get previous day orders for growth calculation
        const previousDay = new Date(dayStart);
        previousDay.setDate(previousDay.getDate() - 1);
        const previousDayEnd = new Date(previousDay);
        previousDayEnd.setHours(23, 59, 59, 999);

        const previousDayOrders = await Order.find({
            createdAt: { $gte: previousDay, $lte: previousDayEnd },
            status: 'delivered'
        });

        // Calculate revenue metrics
        const calculateRevenueMetrics = (dailyOrders) => {
            const totalRevenue = dailyOrders.reduce((sum, order) => 
                sum + order.total, 0
            );

            const completedOrders = dailyOrders.filter(order => 
                order.status !== 'cancelled' && order.status !== 'returned'
            );

            const averageRevenue = completedOrders.length > 0 ? 
                totalRevenue / completedOrders.length : 0;

            return {
                total: totalRevenue,
                average: averageRevenue,
                orderCount: completedOrders.length
            };
        };

        const revenueMetrics = calculateRevenueMetrics(dailyOrders);

        const previousDayRevenue = previousDayOrders.reduce((sum, order) => 
            sum + order.total, 0
        );

        const revenueGrowth = previousDayRevenue ? 
            ((revenueMetrics.total - previousDayRevenue) / previousDayRevenue) * 100 : 0;

        // Get user metrics for the day
        const [activeUsers, newUsers, buyers, sellers] = await Promise.all([
            User.countDocuments({ isBanned: false }),
            User.countDocuments({ 
                createdAt: { $gte: dayStart, $lte: dayEnd },
                isBanned: false 
            }),
            User.countDocuments({ role: 'buyer', isBanned: false }),
            User.countDocuments({ role: 'seller', isApproved: true })
        ]);

        // Get product metrics
        const [totalProducts, approvedProducts, pendingProducts, flaggedProducts] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ status: 'approved' }),
            Product.countDocuments({ status: 'pending' }),
            Product.countDocuments({ status: 'flagged' })
        ]);

        // Calculate top products from orders
        const productSalesMap = new Map();
        for (const order of dailyOrders) {
            for (const item of order.items) {
                const productId = item.productId._id.toString();
                const existing = productSalesMap.get(productId) || {
                    productId: item.productId._id,
                    name: item.productId.name,
                    category: item.productId.category,
                    image: item.productId.image,
                    stats: { totalSales: 0, totalRevenue: 0 }
                };

                existing.stats.totalSales += item.quantity;
                existing.stats.totalRevenue += item.subtotal;
                productSalesMap.set(productId, existing);
            }
        }

        // Generate hourly activity based on order timestamps
        const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
            const hourOrders = dailyOrders.filter(order => 
                order.createdAt.getHours() === hour
            );

            return {
                hour,
                activeUsers: Math.max(
                    hourOrders.length * 3, // Assume each order represents multiple active users
                    Math.floor(activeUsers * (hour >= 9 && hour <= 17 ? 0.3 : 0.1))
                ),
                orderCount: hourOrders.length,
                revenue: hourOrders.reduce((sum, order) => sum + order.total, 0)
            };
        });

        return {
            date,
            metrics: {
                revenue: {
                    total: revenueMetrics.total,
                    average: revenueMetrics.average,
                    growth: revenueGrowth,
                    orderCount: revenueMetrics.orderCount
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
                    active: activeUsers,
                    new: newUsers,
                    buyers,
                    sellers
                },
                products: {
                    total: totalProducts,
                    approved: approvedProducts,
                    pending: pendingProducts,
                    flagged: flaggedProducts
                }
            },
            topProducts: Array.from(productSalesMap.values())
                .sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue)
                .slice(0, 5),
            userActivity: hourlyActivity,
            systemLogs: []
        };
    } catch (error) {
        console.error('Error generating daily analytics:', error);
        throw error;
    }
};

const seedAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing analytics
        await Analytics.deleteMany({});
        console.log('Cleared existing analytics');

        // Generate analytics for the last 30 days
        const analyticsData = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            console.log(`Generating analytics for ${date.toISOString().split('T')[0]}`);
            
            const dailyAnalytics = await generateDailyAnalytics(date);
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