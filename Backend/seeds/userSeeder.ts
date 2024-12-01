import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isApproved: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'seller1@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'seller2@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: false, // Pending approval
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'buyer1@example.com',
    password: 'buyer123',
    role: 'buyer',
    isApproved: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'buyer2@example.com',
    password: 'buyer123',
    role: 'buyer',
    isApproved: true,
    isBanned: true, // Banned user
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'pendingseller@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: false,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return User.create({
          ...user,
          password: hashedPassword,
        });
      })
    );

    console.log(`${createdUsers.length} users seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers(); 