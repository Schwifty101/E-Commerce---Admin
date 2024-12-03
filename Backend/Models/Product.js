const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const actionLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['approve', 'reject', 'flag', 'escalate', 'delete'],
    required: true 
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'deleted', 'escalated'],
    default: 'pending'
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  rejectionReason: String,
  flaggedReasons: [String],
  reports: [reportSchema],
  actionLogs: [{
    action: {
      type: String,
      enum: [
        'create', 
        'update', 
        'delete', 
        'approve', 
        'reject', 
        'escalate',
        'status_change',
        'flag'
      ],
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
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema); 