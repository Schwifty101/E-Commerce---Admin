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
  images: [{ 
    type: String, 
    required: true 
  }],
  ratings: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  features: [{
    type: String,
    default: []
  }],
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual field for seller name
productSchema.virtual('sellerName', {
  ref: 'User',
  localField: 'seller',
  foreignField: '_id',
  justOne: true,
  get: function(seller) {
    return seller ? seller.name : null;
  }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export schemas for potential reuse
module.exports = {
  Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  reportSchema,
  actionLogSchema,
  productSchema
}; 