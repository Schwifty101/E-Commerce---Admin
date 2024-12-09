const mongoose = require('mongoose');
const Analytics = require('../Models/Analytics');
const Order = require('../Models/Order');
const User = require('../Models/User');
const { Product } = require('../Models/Product');
const dotenv = require('dotenv');

dotenv.config();

const generateDailyAnalytics = async (date) => {
    try {
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        // Get orders for the day
        const dailyOrders = await Order.find({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        }).populate('customer vendor items.productId');

        // Calculate top products
        const productSalesMap = new Map();

        dailyOrders.forEach(order => {
            order.items.forEach(item => {
                if (!item.productId) return; // Skip if product reference is missing

                const productId = item.productId._id;
                if (!productSalesMap.has(productId)) {
                    productSalesMap.set(productId, {
                        productId: productId,
                        name: item.name,
                        totalSales: 0,
                        totalRevenue: 0,
                        totalOrders: 0
                    });
                }

                const stats = productSalesMap.get(productId);
                stats.totalSales += item.quantity;
                stats.totalRevenue += item.subtotal;
                stats.totalOrders += 1;
            });
        });

        // Get user metrics
        const [userCounts] = await User.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'active'] }, 1, 0] } },
                    new: { $sum: { $cond: [
                        { $gte: ['$createdAt', dayStart] }, 1, 0
                    ] } },
                    buyers: { $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] } },
                    sellers: { $sum: { $cond: [{ $eq: ['$role', 'seller'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } },
                    banned: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'banned'] }, 1, 0] } }
                }
            }
        ]) || {
            total: 0, active: 0, new: 0, buyers: 0, sellers: 0, pending: 0, banned: 0
        };

        // Generate hourly activity data
        const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            activeUsers: Math.floor(Math.random() * (userCounts.active || 10))
        }));

        // Calculate revenue metrics
        const revenueMetrics = {
            total: dailyOrders.reduce((sum, order) => sum + order.total, 0),
            byPaymentMethod: {
                cash: dailyOrders.filter(o => o.paymentMethod === 'cash')
                    .reduce((sum, order) => sum + order.total, 0),
                card: dailyOrders.filter(o => o.paymentMethod.includes('card'))
                    .reduce((sum, order) => sum + order.total, 0),
                other: dailyOrders.filter(o => !['cash', 'card'].includes(o.paymentMethod))
                    .reduce((sum, order) => sum + order.total, 0)
            }
        };

        // Format top products
        const topProducts = Array.from(productSalesMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(product => ({
                productId: product.productId,
                name: product.name,
                stats: {
                    totalSales: product.totalSales,
                    totalRevenue: product.totalRevenue,
                    totalOrders: product.totalOrders
                }
            }));

        return {
            date: dayStart,
            metrics: {
                revenue: revenueMetrics,
                orders: {
                    total: dailyOrders.length,
                    pending: dailyOrders.filter(o => o.status === 'pending').length,
                    processing: dailyOrders.filter(o => o.status === 'processing').length,
                    shipped: dailyOrders.filter(o => o.status === 'shipped').length,
                    delivered: dailyOrders.filter(o => o.status === 'delivered').length,
                    cancelled: dailyOrders.filter(o => o.status === 'cancelled').length,
                    returned: dailyOrders.filter(o => o.status === 'returned').length,
                    averageValue: dailyOrders.length ? revenueMetrics.total / dailyOrders.length : 0
                },
                users: userCounts,
                products: await Product.aggregate([{
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        flagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
                        outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
                    }
                }]).then(results => results[0] || {
                    total: 0, approved: 0, pending: 0, flagged: 0, outOfStock: 0
                })
            },
            topProducts: topProducts.length > 0 ? topProducts : [{
                productId: new mongoose.Types.ObjectId(),
                name: "No sales",
                stats: { totalSales: 0, totalRevenue: 0, totalOrders: 0 }
            }],
            userActivity: hourlyActivity,
            systemLogs: dailyOrders.map(order => ({
                userId: order.customer,
                action: `order_${order.status}`,
                timestamp: order.createdAt,
                details: `Order ${order.orderNumber}`
            }))
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