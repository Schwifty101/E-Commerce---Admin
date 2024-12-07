const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true,
        index: true 
    },
    metrics: {
        revenue: {
            total: { type: Number, default: 0 },
            growth: { type: Number, default: 0 }
        },
        orders: {
            total: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            processing: { type: Number, default: 0 },
            shipped: { type: Number, default: 0 },
            delivered: { type: Number, default: 0 },
            cancelled: { type: Number, default: 0 },
            returned: { type: Number, default: 0 }
        },
        users: {
            active: { type: Number, default: 0 },
            new: { type: Number, default: 0 },
            buyers: { type: Number, default: 0 },
            sellers: { type: Number, default: 0 }
        },
        products: {
            total: { type: Number, default: 0 },
            approved: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            flagged: { type: Number, default: 0 }
        }
    },
    topProducts: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        sales: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    }],
    userActivity: [{
        hour: { type: Number, required: true },
        activeUsers: { type: Number, default: 0 }
    }],
    systemLogs: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            enum: ['order_created', 'payment_processed', 'order_shipped', 
                  'order_delivered', 'return_requested', 'product_added',
                  'product_updated', 'user_registered', 'seller_approved']
        },
        timestamp: { type: Date, default: Date.now },
        ipAddress: String
    }]
}, {
    timestamps: true
});

// Create daily analytics record if it doesn't exist
analyticsSchema.statics.ensureDailyRecord = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await this.findOne({ date: today });
    if (!existingRecord) {
        return await this.create({ date: today });
    }
    return existingRecord;
};

// Update metrics based on order status change
analyticsSchema.statics.updateOrderMetrics = async function(order, oldStatus) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.ensureDailyRecord();

    // Update order status counts
    if (oldStatus) {
        analytics.metrics.orders[oldStatus] -= 1;
    }
    analytics.metrics.orders[order.status] += 1;

    // Update revenue if order is delivered
    if (order.status === 'delivered') {
        analytics.metrics.revenue.total += order.total;
    }

    // Update top products
    for (const item of order.items) {
        const productIndex = analytics.topProducts.findIndex(
            p => p.productId.toString() === item.productId.toString()
        );

        if (productIndex > -1) {
            analytics.topProducts[productIndex].sales += item.quantity;
            analytics.topProducts[productIndex].revenue += item.subtotal;
        } else {
            analytics.topProducts.push({
                productId: item.productId,
                sales: item.quantity,
                revenue: item.subtotal
            });
        }
    }

    await analytics.save();
};

// Log user activity
analyticsSchema.statics.logUserActivity = async function(userId, action, ipAddress) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.ensureDailyRecord();
    
    // Add system log
    analytics.systemLogs.push({
        userId,
        action,
        ipAddress,
        timestamp: new Date()
    });

    // Update hourly user activity
    const currentHour = new Date().getHours();
    const hourlyActivity = analytics.userActivity.find(a => a.hour === currentHour);
    
    if (hourlyActivity) {
        hourlyActivity.activeUsers += 1;
    } else {
        analytics.userActivity.push({
            hour: currentHour,
            activeUsers: 1
        });
    }

    await analytics.save();
};

// Index for efficient querying
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'systemLogs.timestamp': -1 });
analyticsSchema.index({ 'topProducts.productId': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema); 