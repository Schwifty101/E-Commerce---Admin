const Analytics = require('../Models/Analytics');

// Create controller as an object with methods instead of a class
const analyticsController = {
    // Get Overview Stats
    getOverviewStats: async (req, res) => {
        try {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

            // Get current month's stats
            const currentStats = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: lastMonth, $lte: today }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$metrics.revenue.total' },
                        activeUsers: { $sum: '$metrics.users.active' },
                        totalOrders: { $sum: '$metrics.orders.total' },
                        totalOrderValue: { $sum: '$metrics.revenue.total' },
                        orderCount: { $sum: '$metrics.orders.total' }
                    }
                }
            ]);

            // Calculate growth rates
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
            const previousStats = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: previousMonth, $lt: lastMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$metrics.revenue.total' },
                        activeUsers: { $sum: '$metrics.users.active' },
                        totalOrders: { $sum: '$metrics.orders.total' },
                        totalOrderValue: { $sum: '$metrics.revenue.total' }
                    }
                }
            ]);

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

            const revenueData = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            day: { $dayOfMonth: "$date" }
                        },
                        totalRevenue: { $sum: "$metrics.revenue.total" },
                        orderCount: { $sum: "$metrics.orders.total" },
                        avgOrderValue: {
                            $avg: {
                                $cond: [
                                    { $eq: ["$metrics.orders.total", 0] },
                                    0,
                                    { $divide: ["$metrics.revenue.total", "$metrics.orders.total"] }
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                        "_id.day": 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $dateFromParts: {
                                year: "$_id.year",
                                month: "$_id.month",
                                day: "$_id.day"
                            }
                        },
                        totalRevenue: 1,
                        orderCount: 1,
                        avgOrderValue: 1
                    }
                }
            ]);

            // Calculate summary statistics
            const summary = {
                totalRevenue: revenueData.reduce((sum, day) => sum + day.totalRevenue, 0),
                totalOrders: revenueData.reduce((sum, day) => sum + day.orderCount, 0),
                avgOrderValue: revenueData.length > 0
                    ? revenueData.reduce((sum, day) => sum + day.avgOrderValue, 0) / revenueData.length
                    : 0
            };

            res.json({
                success: true,
                data: {
                    summary,
                    dailyData: revenueData
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
            const { 
                period = '30days',
                limit = 10,
                sortBy = 'revenue' // 'revenue' or 'sales'
            } = req.query;

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

            // Aggregate top products data
            const topProducts = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: new Date() }
                    }
                },
                {
                    $unwind: '$topProducts'
                },
                {
                    $group: {
                        _id: '$topProducts.productId',
                        totalSales: { $sum: '$topProducts.sales' },
                        totalRevenue: { $sum: '$topProducts.revenue' }
                    }
                },
                {
                    $sort: sortBy === 'sales' 
                        ? { totalSales: -1 } 
                        : { totalRevenue: -1 }
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'productDetails.seller',
                        foreignField: '_id',
                        as: 'sellerDetails'
                    }
                },
                {
                    $unwind: '$sellerDetails'
                },
                {
                    $project: {
                        _id: 0,
                        productId: '$_id',
                        name: '$productDetails.name',
                        category: '$productDetails.category',
                        price: '$productDetails.price',
                        image: '$productDetails.image',
                        seller: {
                            id: '$sellerDetails._id',
                            name: '$sellerDetails.name',
                            companyName: '$sellerDetails.businessDetails.companyName'
                        },
                        stats: {
                            totalSales: '$totalSales',
                            totalRevenue: '$totalRevenue',
                            averageOrderValue: {
                                $divide: ['$totalRevenue', '$totalSales']
                            }
                        }
                    }
                }
            ]);

            // Calculate overall statistics
            const totalStats = topProducts.reduce((acc, product) => {
                acc.totalSales += product.stats.totalSales;
                acc.totalRevenue += product.stats.totalRevenue;
                return acc;
            }, { totalSales: 0, totalRevenue: 0 });

            res.json({
                success: true,
                data: {
                    products: topProducts,
                    summary: {
                        ...totalStats,
                        averageOrderValue: totalStats.totalSales > 0 
                            ? totalStats.totalRevenue / totalStats.totalSales 
                            : 0,
                        period,
                        topPerformer: topProducts[0] || null
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching top products:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching top products',
                error: error.message
            });
        }
    },

    exportData: async (req, res) => {
        try {
            const { 
                type = 'all',  // all, revenue, orders, users, products
                period = '30days',
                format = 'csv' // currently only supporting csv
            } = req.query;

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

            let data = [];
            let filename = `analytics_export_${period}_${new Date().toISOString().split('T')[0]}`;

            // Build aggregation based on type
            switch (type) {
                case 'revenue':
                    data = await Analytics.aggregate([
                        {
                            $match: {
                                date: { $gte: startDate, $lte: new Date() }
                            }
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                totalRevenue: "$metrics.revenue.total",
                                orderCount: "$metrics.orders.total",
                                avgOrderValue: {
                                    $cond: [
                                        { $eq: ["$metrics.orders.total", 0] },
                                        0,
                                        { $divide: ["$metrics.revenue.total", "$metrics.orders.total"] }
                                    ]
                                }
                            }
                        },
                        { $sort: { date: 1 } }
                    ]);
                    filename += '_revenue';
                    break;

                case 'orders':
                    data = await Analytics.aggregate([
                        {
                            $match: {
                                date: { $gte: startDate, $lte: new Date() }
                            }
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                total: "$metrics.orders.total",
                                pending: "$metrics.orders.pending",
                                processing: "$metrics.orders.processing",
                                shipped: "$metrics.orders.shipped",
                                delivered: "$metrics.orders.delivered",
                                cancelled: "$metrics.orders.cancelled",
                                returned: "$metrics.orders.returned"
                            }
                        },
                        { $sort: { date: 1 } }
                    ]);
                    filename += '_orders';
                    break;

                case 'users':
                    data = await Analytics.aggregate([
                        {
                            $match: {
                                date: { $gte: startDate, $lte: new Date() }
                            }
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                activeUsers: "$metrics.users.active",
                                newUsers: "$metrics.users.new",
                                buyers: "$metrics.users.buyers",
                                sellers: "$metrics.users.sellers"
                            }
                        },
                        { $sort: { date: 1 } }
                    ]);
                    filename += '_users';
                    break;

                case 'products':
                    data = await Analytics.aggregate([
                        {
                            $match: {
                                date: { $gte: startDate, $lte: new Date() }
                            }
                        },
                        {
                            $unwind: '$topProducts'
                        },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'topProducts.productId',
                                foreignField: '_id',
                                as: 'productDetails'
                            }
                        },
                        {
                            $unwind: '$productDetails'
                        },
                        {
                            $project: {
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                productName: '$productDetails.name',
                                category: '$productDetails.category',
                                sales: '$topProducts.sales',
                                revenue: '$topProducts.revenue'
                            }
                        },
                        { $sort: { revenue: -1 } }
                    ]);
                    filename += '_products';
                    break;

                default: // all
                    // Combine all relevant data
                    const [revenueData, orderData, userData] = await Promise.all([
                        Analytics.aggregate([/* revenue aggregation */]),
                        Analytics.aggregate([/* orders aggregation */]),
                        Analytics.aggregate([/* users aggregation */])
                    ]);
                    data = {
                        revenue: revenueData,
                        orders: orderData,
                        users: userData
                    };
                    break;
            }

            if (!data.length && type !== 'all') {
                return res.status(404).json({
                    success: false,
                    message: 'No data available for export'
                });
            }

            // Set headers for file download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);

            // Convert data to CSV format
            const csvData = type === 'all' 
                ? convertMultipleDataToCSV(data)
                : convertToCSV(data);

            res.send(csvData);

        } catch (error) {
            console.error('Error exporting analytics data:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting analytics data',
                error: error.message
            });
        }
    }
};

module.exports = analyticsController; 