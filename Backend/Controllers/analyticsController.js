const Analytics = require('../Models/Analytics');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../Models/Product');
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

class AnalyticsController {
    // Get Overview Stats
    async getOverviewStats(req, res) {
        try {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

            // Aggregate current month stats
            const currentStats = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: lastMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$metrics.revenue.total' },
                        activeUsers: { $sum: '$metrics.users.active' },
                        totalOrders: { $sum: '$metrics.orders.total' },
                        averageOrderValue: { 
                            $avg: { 
                                $divide: ['$metrics.revenue.total', '$metrics.orders.total'] 
                            }
                        }
                    }
                }
            ]);

            // Calculate growth rates
            const growth = await this.calculateGrowthRates(lastMonth);

            res.json({
                success: true,
                data: {
                    stats: currentStats[0],
                    growth
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching overview stats',
                error: error.message
            });
        }
    }

    // Get Revenue Analytics
    async getRevenueAnalytics(req, res) {
        try {
            const { from, to, groupBy = 'day' } = req.query;
            const startDate = new Date(from);
            const endDate = new Date(to);

            const revenueData = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $switch: {
                                branches: [
                                    { 
                                        case: { $eq: [groupBy, 'day'] },
                                        then: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                                    },
                                    {
                                        case: { $eq: [groupBy, 'week'] },
                                        then: { $week: '$date' }
                                    },
                                    {
                                        case: { $eq: [groupBy, 'month'] },
                                        then: { $dateToString: { format: '%Y-%m', date: '$date' } }
                                    }
                                ],
                                default: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                            }
                        },
                        revenue: { $sum: '$metrics.revenue.total' },
                        growth: { $avg: '$metrics.revenue.growth' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            res.json({
                success: true,
                data: revenueData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching revenue analytics',
                error: error.message
            });
        }
    }

    // Get User Activity
    async getUserActivity(req, res) {
        try {
            const { from, to } = req.query;
            const startDate = new Date(from);
            const endDate = new Date(to);

            const activityData = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $unwind: '$userActivity'
                },
                {
                    $group: {
                        _id: '$userActivity.hour',
                        averageUsers: { $avg: '$userActivity.count' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]);

            res.json({
                success: true,
                data: activityData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user activity',
                error: error.message
            });
        }
    }

    // Get System Logs
    async getSystemLogs(req, res) {
        try {
            const { userType, activityType, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            const query = {};
            if (userType && userType !== 'all') query['userType'] = userType;
            if (activityType && activityType !== 'all') query['type'] = activityType;

            const logs = await Analytics.aggregate([
                { $unwind: '$systemLogs' },
                { $match: query },
                { $skip: skip },
                { $limit: parseInt(limit) },
                { $sort: { 'systemLogs.timestamp': -1 } }
            ]);

            const total = await Analytics.countDocuments(query);

            res.json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        total,
                        pages: Math.ceil(total / limit),
                        page: parseInt(page),
                        limit: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching system logs',
                error: error.message
            });
        }
    }

    // Get Top Products
    async getTopProducts(req, res) {
        try {
            const { from, to, sortBy = 'revenue', limit = 5 } = req.query;
            const startDate = new Date(from);
            const endDate = new Date(to);

            const topProducts = await Analytics.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                { $unwind: '$topProducts' },
                {
                    $group: {
                        _id: '$topProducts.productId',
                        totalSales: { $sum: '$topProducts.sales' },
                        totalRevenue: { $sum: '$topProducts.revenue' }
                    }
                },
                {
                    $sort: {
                        [sortBy === 'revenue' ? 'totalRevenue' : 'totalSales']: -1
                    }
                },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                }
            ]);

            res.json({
                success: true,
                data: topProducts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching top products',
                error: error.message
            });
        }
    }

    // Export Data
    async exportData(req, res) {
        try {
            const { type } = req.params;
            const { dateRange, filters } = req.body;

            let data;
            switch (filters.dataType) {
                case 'sales':
                    data = await this.getSalesData(dateRange);
                    break;
                case 'users':
                    data = await this.getUserData(dateRange);
                    break;
                case 'products':
                    data = await this.getProductData(dateRange);
                    break;
                default:
                    throw new Error('Invalid data type specified');
            }

            const fileName = `export_${filters.dataType}_${Date.now()}.${type}`;
            const filePath = `./temp/${fileName}`;

            if (type === 'csv') {
                await this.generateCSV(data, filePath);
            } else {
                await this.generatePDF(data, filePath);
            }

            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up: delete the temporary file
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('File cleanup error:', unlinkErr);
                });
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error exporting data',
                error: error.message
            });
        }
    }

    // Helper Methods
    async calculateGrowthRates(lastMonth) {
        try {
            const today = new Date();
            const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2);

            // Get current month and previous month data
            const [currentPeriod, previousPeriod] = await Promise.all([
                Analytics.aggregate([
                    {
                        $match: {
                            date: { $gte: lastMonth, $lte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: '$metrics.revenue.total' },
                            users: { $sum: '$metrics.users.active' },
                           orders: { $sum: '$metrics.orders.total' },
                           orderValue: {
                                $avg: {
                                    $divide: ['$metrics.revenue.total', '$metrics.orders.total']
                               }
                            }
                        }
                    }
                ]),
                Analytics.aggregate([
                    {
                        $match: {
                            date: { $gte: twoMonthsAgo, $lte: lastMonth }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: '$metrics.revenue.total' },
                            users: { $sum: '$metrics.users.active' },
                           orders: { $sum: '$metrics.orders.total' },
                           orderValue: {
                                $avg: {
                                    $divide: ['$metrics.revenue.total', '$metrics.orders.total']
                               }
                            }
                        }
                    }
                ])
            ]);

            // Calculate growth rates
            const calculateGrowth = (current, previous) => {
                if (!previous) return 0;
                return ((current - previous) / previous) * 100;
            };

            return {
                revenue: calculateGrowth(
                    currentPeriod[0]?.revenue || 0,
                    previousPeriod[0]?.revenue || 0
                ),
                users: calculateGrowth(
                    currentPeriod[0]?.users || 0,
                    previousPeriod[0]?.users || 0
                ),
                orders: calculateGrowth(
                    currentPeriod[0]?.orders || 0,
                    previousPeriod[0]?.orders || 0
                ),
                orderValue: calculateGrowth(
                    currentPeriod[0]?.orderValue || 0,
                    previousPeriod[0]?.orderValue || 0
                )
            };
        } catch (error) {
            console.error('Error calculating growth rates:', error);
            throw error;
        }
    }

    async generateCSV(data, filePath) {
        try {
            // Create CSV writer with dynamic headers based on data structure
            const headers = Object.keys(data[0] || {}).map(key => ({
                id: key,
                title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
            }));

            const csvWriter = createObjectCsvWriter({
                path: filePath,
                header: headers,
                encoding: 'utf8',
                append: false
            });

            // Write data to CSV file
            await csvWriter.writeRecords(data.map(record => {
                const formattedRecord = {};
                headers.forEach(header => {
                    let value = record[header.id];
                    // Format dates
                    if (value instanceof Date) {
                        value = value.toISOString().split('T')[0];
                    }
                    // Format numbers
                    else if (typeof value === 'number') {
                        value = value.toLocaleString();
                    }
                    formattedRecord[header.id] = value;
                });
                return formattedRecord;
            }));

            return filePath;
        } catch (error) {
            console.error('Error generating CSV:', error);
            throw new Error(`Failed to generate CSV: ${error.message}`);
        }
    }

    async generatePDF(data, filePath) {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            // Create write stream
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add header
            doc.fontSize(20)
                .text('Analytics Report', {
                    align: 'center'
                })
                .moveDown();

            // Add generation date
            doc.fontSize(12)
                .text(`Generated on: ${new Date().toLocaleString()}`,{
                    align: 'right'
                })
                .moveDown();

            // Add data tables
            const tableTop = 150;
            const itemsPerPage = 20;
            const headers = Object.keys(data[0] || {});

            // Calculate column widths
            const pageWidth = doc.page.width - 100;
            const columnWidth = pageWidth / headers.length;

            // Draw table headers
            headers.forEach((header, i) => {
                doc.fontSize(10)
                    .text(
                        header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1'),
                        50 + (i * columnWidth),
                        tableTop,
                        { width: columnWidth, align: 'left' }
                    );
            });

            // Draw table rows
            let rowTop = tableTop + 25;
            data.forEach((row, rowIndex) => {
                // Add new page if needed
                if (rowIndex > 0 && rowIndex % itemsPerPage ===0) {
                    doc.addPage();
                    rowTop = 50;
                    // Redraw headers on new page
                    headers.forEach((header, i) => {
                        doc.fontSize(10)
                            .text(
                                header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1'),
                                50 + (i * columnWidth),
                                rowTop,
                                { width: columnWidth, align: 'left' }
                            );
                    });
                    rowTop += 25;
                }

                // Draw row data
                headers.forEach((header, i) => {
                   let value = row[header];
                    // Format dates and numbers
                    if (value instanceof Date) {
                        value = value.toISOString().split('T')[0];
                    } else if (typeof value === 'number') {
                        value = value.toLocaleString();
                    }

                    doc.fontSize(10)
                        .text(
                            String(value),
                            50 + (i * columnWidth),
                           rowTop,
                            { width: columnWidth, align: 'left' }
                        );
                });

                rowTop += 20;
            });

            // Finalize PDF
            doc.end();

            // Return promise that resolves when stream is finished
            return new Promise((resolve, reject) => {
                stream.on('finish', () => resolve(filePath));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }
}

module.exports = new AnalyticsController(); 