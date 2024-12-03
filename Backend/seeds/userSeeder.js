const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isApproved: true,
    isBanned: false,
    verificationStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Seller One',
    email: 'seller1@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: true,
    isBanned: false,
    verificationStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Seller Two',
    email: 'seller2@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: false,
    isBanned: false,
    verificationStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Buyer One',
    email: 'buyer1@example.com',
    password: 'buyer123',
    role: 'buyer',
    isApproved: true,
    isBanned: false,
    verificationStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Buyer Two',
    email: 'buyer2@example.com',
    password: 'buyer123',
    role: 'buyer',
    isApproved: true,
    isBanned: true,
    verificationStatus: 'banned',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Pending Seller',
    email: 'pendingseller@example.com',
    password: 'seller123',
    role: 'seller',
    isApproved: false,
    isBanned: false,
    verificationStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

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
    
    console.log('Sample User IDs:');
    createdUsers.forEach(user => {
      console.log(`${user.name} (${user.role}): ${user._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers(); 