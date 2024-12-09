const mongoose = require('mongoose');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createUsers = () => {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston'];
  const states = ['NY', 'CA', 'IL', 'TX'];
  const numBuyers = 50;
  const numSellers = 10;

  const users = [
    // Admin users
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
      isBanned: false,
      verificationStatus: 'active',
      address: {
        street: '123 Admin Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      phone: '+1-555-0100',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Sellers
    ...[...Array(numSellers)].map((_, index) => ({
      name: `Seller ${index + 1}`,
      email: `seller${index + 1}@example.com`,
      password: 'seller123',
      role: 'seller',
      isApproved: index < 3, // First 3 sellers are approved
      isBanned: false,
      verificationStatus: index < 3 ? 'active' : 'pending',
      address: {
        street: `${100 + index} Seller Avenue`,
        city: cities[index % cities.length],
        state: states[index % states.length],
        zipCode: `${20000 + index}`,
        country: 'United States'
      },
      phone: `+1-555-02${index.toString().padStart(2, '0')}`,
      businessInfo: {
        companyName: `Company ${index + 1}`,
        registrationNumber: `REG${(index + 1).toString().padStart(4, '0')}`,
        taxId: `TAX${(index + 1).toString().padStart(4, '0')}`
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })),

    // Buyers
    ...[...Array(numBuyers)].map((_, index) => ({
      name: `Buyer ${index + 1}`,
      email: `buyer${index + 1}@example.com`,
      password: 'buyer123',
      role: 'buyer',
      isApproved: true,
      isBanned: index === 9, // Last buyer is banned
      verificationStatus: index === 9 ? 'banned' : 'active',
      address: {
        street: `${200 + index} Buyer Lane`,
        city: cities[index % cities.length],
        state: states[index % states.length],
        zipCode: `${30000 + index}`,
        country: 'United States'
      },
      phone: `+1-555-03${index.toString().padStart(2, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  ];

  return users;
};

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = createUsers();
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
    
    // Return the created users for use in other seeders
    return {
      admin: createdUsers.find(user => user.role === 'admin'),
      sellers: createdUsers.filter(user => user.role === 'seller' && user.isApproved),
      buyers: createdUsers.filter(user => user.role === 'buyer' && user.isApproved)
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Export for use in other seeders
module.exports = seedUsers;

// Run directly if this script is executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      mongoose.connection.close();
      process.exit(1);
    });
} 