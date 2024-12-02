import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
  },
  businessDetails: {
    companyName: String,
    registrationNumber: String,
    address: String,
    phone: String,
    verificationDocuments: [String],
    verified: {
      type: Boolean,
      default: false
    }
  },
  lastLogin: Date,
  verificationStatus: {
    type: String,
    enum: ['pending', 'active', 'banned'],
    default: 'pending',
    validate: {
      validator: function(this: any, status: string) {
        // Admin is always active and can't be banned/pending
        return this.role === 'admin' ? status === 'active' : true;
      },
      message: 'Admin status must be active'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema); 