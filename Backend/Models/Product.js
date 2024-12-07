const mongoose = require('mongoose');

// Define sub-schemas first
const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: { 
    type: String, 
    required: true 
  },
  description: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const actionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'approve', 'reject', 'escalate', 'flag', 'status_change'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldStatus: String,
  newStatus: String,
  reason: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0
  },
  category: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'deleted', 'escalated'],
    default: 'pending'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: { 
    type: String, 
    required: true 
  },
  rejectionReason: String,
  flaggedReasons: [String],
  reports: [reportSchema],
  actionLogs: [actionLogSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add analytics-related methods
productSchema.statics.getTopSellingProducts = async function(startDate, endDate, limit = 10, sortBy = 'revenue') {
    try {
        const Order = mongoose.model('Order');
        
        const pipeline = [
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(startDate), 
                        $lte: new Date(endDate) 
                    },
                    status: { $in: ['delivered', 'shipped'] }
                }
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.productId',
                    totalSales: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            {
                $sort: sortBy === 'sales' 
                    ? { totalSales: -1 } 
                    : { totalRevenue: -1 }
            },
            {
                $limit: parseInt(limit) || 10
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
                $unwind: {
                    path: '$productDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: { $ifNull: ['$productDetails.name', 'Unknown Product'] },
                    category: { $ifNull: ['$productDetails.category', 'Uncategorized'] },
                    image: { 
                        $ifNull: [
                            '$productDetails.image', 
                            'https://via.placeholder.com/150'
                        ] 
                    },
                    totalSales: 1,
                    totalRevenue: 1
                }
            }
        ];

        const results = await Order.aggregate(pipeline);
        return results || [];
        
    } catch (error) {
        console.error('Error in getTopSellingProducts:', error);
        return [];
    }
};

// Export schemas for potential reuse
module.exports = {
  Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  reportSchema,
  actionLogSchema,
  productSchema
}; 