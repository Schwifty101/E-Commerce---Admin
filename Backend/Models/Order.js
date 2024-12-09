const mongoose = require('mongoose');
const Analytics = mongoose.models.Analytics || require('./Analytics');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const statusLogSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  comments: String,
  timestamp: { type: Date, default: Date.now }
});

const returnRequestSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending'
  },
  requestedAt: { type: Date, default: Date.now },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  processedAt: Date,
  adminComments: String,
  refundAmount: Number,
  images: [String]
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  statusLogs: [statusLogSchema],
  returnRequest: returnRequestSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Add indexes for analytics queries
orderSchema.index({ createdAt: -1, status: 1 });
orderSchema.index({ vendor: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

// Add middleware to update analytics after order save
orderSchema.post('save', async function(doc) {
    try {
        // Update analytics with the new/updated order
        await Analytics.updateOrderMetrics(doc);
        
        // If this is a status change, log it in system logs
        if (doc.isModified('status')) {
            await Analytics.logUserActivity(
                doc.customer,
                `order_${doc.status}`,
                null // IP address not available in middleware
            );
        }
    } catch (error) {
        console.error('Error updating analytics:', error);
    }
});

// Add middleware to update analytics for bulk operations
orderSchema.post('updateMany', async function(result) {
    try {
        await Analytics.updateOrderMetrics();
    } catch (error) {
        console.error('Error updating analytics after bulk update:', error);
    }
});

// Add method to get order analytics
orderSchema.statics.getAnalytics = async function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                orderCount: { $sum: 1 },
                revenue: { $sum: "$total" },
                averageOrderValue: { $avg: "$total" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

// Export the model only if it hasn't been compiled yet
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema); 