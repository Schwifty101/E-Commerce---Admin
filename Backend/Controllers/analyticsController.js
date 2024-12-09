const Analytics = require('../Models/Analytics');
const { Product } = require('../Models/Product');
const { createExcelWorkbook } = require('../utils/excel');

// Create controller as an object with methods instead of a class
const analyticsController = {
    // Get Overview Stats
    getOverviewStats: async (req, res) => {
        try {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

            // Use the new getDateRangeMetrics method
            const currentStats = await Analytics.getDateRangeMetrics(lastMonth, today);
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
            const previousStats = await Analytics.getDateRangeMetrics(previousMonth, lastMonth);

            const current = currentStats[0] || {
                totalRevenue: 0,
                activeUsers: 0,
                totalOrders: 0,
                totalOrderValue: 0,
                orderCount: 0
            };

            const previous = previousStats[0] || {
                totalRevenue: 0,
                activeUsers: 0,
                totalOrders: 0,
                totalOrderValue: 0
            };

            // Calculate growth percentages
            const calculateGrowth = (current, previous) => {
                if (previous === 0) return 0;
                return ((current - previous) / previous) * 100;
            };

            const growth = {
                revenue: calculateGrowth(current.totalRevenue, previous.totalRevenue),
                users: calculateGrowth(current.activeUsers, previous.activeUsers),
                orders: calculateGrowth(current.totalOrders, previous.totalOrders),
                orderValue: calculateGrowth(
                    current.orderCount ? current.totalOrderValue / current.orderCount : 0,
                    previous.totalOrders ? previous.totalOrderValue / previous.totalOrders : 0
                )
            };

            res.json({
                success: true,
                data: {
                    stats: {
                        totalRevenue: current.totalRevenue,
                        activeUsers: current.activeUsers,
                        totalOrders: current.totalOrders,
                        averageOrderValue: current.orderCount
                            ? current.totalOrderValue / current.orderCount
                            : 0
                    },
                    growth
                }
            });

        } catch (error) {
            console.error('Error fetching overview stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching overview statistics',
                error: error.message
            });
        }
    },

    // Placeholder for other methods
    getRevenueAnalytics: async (req, res) => {
        try {
            const { period = '30days' } = req.query;
            const today = new Date();
            let startDate;

            // Set time period for analysis
            switch (period) {
                case '7days':
                    startDate = new Date(today.setDate(today.getDate() - 7));
                    break;
                case '90days':
                    startDate = new Date(today.setDate(today.getDate() - 90));
                    break;
                case '12months':
                    startDate = new Date(today.setMonth(today.getMonth() - 12));
                    break;
                default: // 30 days
                    startDate = new Date(today.setDate(today.getDate() - 30));
            }

            // Use the new Order model method for revenue analytics
            const revenueData = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $project: {
                        date: 1,
                        totalRevenue: "$metrics.revenue.total",
                        revenueGrowth: "$metrics.revenue.growth",
                        orderMetrics: "$metrics.orders",
                        dailyMetrics: 1  // Include new daily metrics
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]);

            // Include hourly revenue data in response
            const dailyData = revenueData.map(day => ({
                date: day.date,
                revenue: day.totalRevenue,
                growth: day.revenueGrowth,
                orders: day.orderMetrics,
                hourlyRevenue: day.dailyMetrics?.revenue || []
            }));

            // Calculate summary statistics
            const summary = {
                totalRevenue: revenueData.reduce((sum, day) => sum + day.totalRevenue, 0),
                totalOrders: revenueData.reduce((sum, day) => sum + day.orderMetrics.total, 0),
                avgOrderValue: revenueData.length > 0
                    ? revenueData.reduce((sum, day) => 
                        sum + (day.totalRevenue / (day.orderMetrics.total || 1)), 0) / revenueData.length
                    : 0,
                ordersByStatus: {
                    pending: revenueData.reduce((sum, day) => sum + day.orderMetrics.pending, 0),
                    processing: revenueData.reduce((sum, day) => sum + day.orderMetrics.processing, 0),
                    shipped: revenueData.reduce((sum, day) => sum + day.orderMetrics.shipped, 0),
                    delivered: revenueData.reduce((sum, day) => sum + day.orderMetrics.delivered, 0),
                    cancelled: revenueData.reduce((sum, day) => sum + day.orderMetrics.cancelled, 0),
                    returned: revenueData.reduce((sum, day) => sum + day.orderMetrics.returned, 0)
                },
                averageGrowth: revenueData.length > 0
                    ? revenueData.reduce((sum, day) => sum + day.revenueGrowth, 0) / revenueData.length
                    : 0,
                conversionMetrics: revenueData[0]?.conversionMetrics || {
                    visitToCart: 0,
                    cartToOrder: 0,
                    orderToDelivery: 0
                }
            };

            res.json({
                success: true,
                data: {
                    summary,
                    dailyData
                }
            });

        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching revenue analytics',
                error: error.message
            });
        }
    },

    getUserActivity: async (req, res) => {
        try {
            const { period = '24hours' } = req.query;
            const now = new Date();
            let startDate;

            // Set time period for analysis
            switch (period) {
                case '7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case '30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                default: // 24hours
                    startDate = new Date(now.setHours(now.getHours() - 24));
            }

            const activityData = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $unwind: '$userActivity'
                },
                {
                    $group: {
                        _id: '$userActivity.hour',
                        activeUsers: { $sum: '$userActivity.activeUsers' }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        hour: '$_id',
                        activeUsers: 1
                    }
                }
            ]);

            // Get user type distribution
            const userMetrics = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalActive: { $sum: '$metrics.users.active' },
                        newUsers: { $sum: '$metrics.users.new' },
                        buyers: { $sum: '$metrics.users.buyers' },
                        sellers: { $sum: '$metrics.users.sellers' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalActive: 1,
                        newUsers: 1,
                        buyers: 1,
                        sellers: 1
                    }
                }
            ]);

            // Get most recent system logs
            const recentActivity = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $unwind: '$systemLogs'
                },
                {
                    $sort: { 'systemLogs.timestamp': -1 }
                },
                {
                    $limit: 50
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'systemLogs.userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        action: '$systemLogs.action',
                        timestamp: '$systemLogs.timestamp',
                        userName: { $arrayElemAt: ['$user.name', 0] },
                        userRole: { $arrayElemAt: ['$user.role', 0] }
                    }
                }
            ]);

            const summary = userMetrics[0] || {
                totalActive: 0,
                newUsers: 0,
                buyers: 0,
                sellers: 0
            };

            res.json({
                success: true,
                data: {
                    summary,
                    hourlyActivity: activityData,
                    recentActivity
                }
            });

        } catch (error) {
            console.error('Error fetching user activity:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user activity',
                error: error.message
            });
        }
    },

    getTopProducts: async (req, res) => {
        try {
            const { period = '30days', limit = 10, sortBy = 'revenue' } = req.query;
            const today = new Date();
            let startDate = new Date();

            // Calculate start date based on period
            switch (period) {
                case '7days':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case '90days':
                    startDate.setDate(today.getDate() - 90);
                    break;
                case '12months':
                    startDate.setMonth(today.getMonth() - 12);
                    break;
                default: // 30days
                    startDate.setDate(today.getDate() - 30);
            }

            // Pass sortBy parameter to the model method
            const topProducts = await Product.getTopSellingProducts(
                startDate,
                today,
                parseInt(limit),
                sortBy
            );

            // If no products found, return empty array instead of error
            if (!topProducts || topProducts.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        topProducts: []
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    topProducts: topProducts.map(product => ({
                        _id: product._id,
                        name: product.name || 'Unknown Product',
                        category: product.category || 'Uncategorized',
                        image: product.image || 'https://via.placeholder.com/150',
                        totalSales: product.totalSales || 0,
                        totalRevenue: product.totalRevenue || 0
                    }))
                }
            });

        } catch (error) {
            console.error('Error in getTopProducts:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching top products',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    exportData: async (req, res) => {
        try {
            const { period, groupBy } = req.query;
            
            // Calculate date range based on period
            const endDate = new Date();
            const startDate = new Date();
            
            switch (period) {
                case '24hours':
                    startDate.setHours(startDate.getHours() - 24);
                    break;
                case '7days':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30days':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90days':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case '12months':
                    startDate.setMonth(startDate.getMonth() - 12);
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid period specified' });
            }

            // Fetch analytics data
            const analyticsData = await Analytics.find({
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            // Transform data for export
            const exportData = analyticsData.map(record => ({
                Date: record.date.toISOString().split('T')[0],
                Revenue: record.metrics.revenue.total,
                Orders: record.metrics.orders.total,
                'Active Users': record.metrics.users.active,
                'New Users': record.metrics.users.new,
                'Total Products': record.metrics.products.total
            }));

            // Generate Excel workbook
            const workbook = await createExcelWorkbook(exportData);
            
            // Set headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=analytics_${period}.xlsx`);

            // Write to response
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Export Data Error:', error);
            res.status(500).json({ 
                message: 'Failed to export analytics data',
                error: error.message 
            });
        }
    }
};

module.exports = analyticsController; 