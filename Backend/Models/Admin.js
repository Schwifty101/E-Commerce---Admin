const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isAdmin: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

adminSchema.plugin(passportLocalMongoose, {
  usernameField: 'username'
});

// Export with proper typing
module.exports = mongoose.model('Admin', adminSchema); 