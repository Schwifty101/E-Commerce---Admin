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
            growth: { type: Number, default: 0 },
            byPaymentMethod: {
                cash: { type: Number, default: 0 },
                card: { type: Number, default: 0 },
                other: { type: Number, default: 0 }
            }
        },
        orders: {
            total: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            processing: { type: Number, default: 0 },
            shipped: { type: Number, default: 0 },
            delivered: { type: Number, default: 0 },
            cancelled: { type: Number, default: 0 },
            returned: { type: Number, default: 0 },
            averageValue: { type: Number, default: 0 }
        },
        users: {
            total: { type: Number, default: 0 },
            active: { type: Number, default: 0 },
            new: { type: Number, default: 0 },
            buyers: { type: Number, default: 0 },
            sellers: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            banned: { type: Number, default: 0 }
        },
        products: {
            total: { type: Number, default: 0 },
            approved: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            flagged: { type: Number, default: 0 },
            outOfStock: { type: Number, default: 0 }
        }
    },
    topProducts: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        category: String,
        image: String,
        sales: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    }],
    userActivity: [{
        hour: { type: Number, required: true },
        activeUsers: { type: Number, default: 0 }
    }],
    dailyMetrics: {
        revenue: [{
            hour: Number,
            amount: Number
        }],
        orders: [{
            hour: Number,
            count: Number
        }]
    },
    conversionMetrics: {
        visitToCart: { type: Number, default: 0 },
        cartToOrder: { type: Number, default: 0 },
        orderToDelivery: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Static method to update analytics based on new order
analyticsSchema.statics.updateOrderMetrics = async function(order) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.findOne({ date: today }) || await this.create({ date: today });
    
    // Update order counts
    analytics.metrics.orders.total += 1;
    analytics.metrics.orders[order.status] += 1;

    // Update revenue if paid
    if (order.paymentStatus === 'paid') {
        analytics.metrics.revenue.total += order.total;
        analytics.metrics.revenue.byPaymentMethod[order.paymentMethod] += order.total;
    }

    // Update average order value
    const totalOrders = analytics.metrics.orders.total;
    analytics.metrics.orders.averageValue = 
        (analytics.metrics.orders.averageValue * (totalOrders - 1) + order.total) / totalOrders;

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
                name: item.name,
                sales: item.quantity,
                revenue: item.subtotal
            });
        }
    }

    await analytics.save();
};

// Static method to update user metrics
analyticsSchema.statics.updateUserMetrics = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const User = mongoose.model('User');
    const analytics = await this.findOne({ date: today }) || await this.create({ date: today });

    // Get user counts
    const [userCounts] = await User.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                buyers: { $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] } },
                sellers: { $sum: { $cond: [{ $eq: ['$role', 'seller'] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } },
                banned: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'banned'] }, 1, 0] } }
            }
        }
    ]);

    // Update user metrics
    analytics.metrics.users = {
        ...analytics.metrics.users,
        ...userCounts
    };

    await analytics.save();
};

// Static method to update product metrics
analyticsSchema.statics.updateProductMetrics = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const Product = mongoose.model('Product');
    const analytics = await this.findOne({ date: today }) || await this.create({ date: today });

    // Get product counts
    const [productCounts] = await Product.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                flagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
                outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
            }
        }
    ]);

    // Update product metrics
    analytics.metrics.products = {
        ...analytics.metrics.products,
        ...productCounts
    };

    await analytics.save();
};

// Add indexes
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'systemLogs.timestamp': -1 });
analyticsSchema.index({ 'topProducts.productId': 1 });

// Export the model
module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema); 