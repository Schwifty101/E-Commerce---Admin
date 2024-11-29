import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../Models/Admin';

dotenv.config();

async function createAdminUser() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({
        username: 'admin',
        email: 'admin@example.com'
      });

      await Admin.register(admin, 'admin123');
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser(); 