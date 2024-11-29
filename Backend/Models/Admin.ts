import mongoose, { Document } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

// Interface for Admin document
export interface IAdmin extends Document {
  username: string;
  email: string;
  isAdmin: boolean;
}

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
export default mongoose.model<IAdmin>('Admin', adminSchema); 