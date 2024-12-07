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
        users: {
            active: { type: Number, default: 0 },
            new: { type: Number, default: 0 }
        },
        orders: {
            total: { type: Number, default: 0 },
            average: { type: Number, default: 0 }
        }
    },
    userActivity: [{
        hour: { type: Number, min: 0, max: 23 },
        count: { type: Number, default: 0 }
    }],
    topProducts: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        sales: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    }],
    systemLogs: [{
        type: {
            type: String,
            enum: ['order_created', 'payment_processed', 'order_shipped', 
                  'order_delivered', 'return_requested']
        },
        count: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema); 