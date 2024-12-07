const mongoose = require('mongoose');
const {Product} = require('../Models/Product');
const User = require('../models/User');
const dotenv = require('dotenv');
const seedUsers = require('./userSeeder');

dotenv.config();

const createProducts = async (sellers, admin) => {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'];
  const statuses = ['pending', 'approved', 'rejected', 'flagged'];
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const products = [];
  const productNames = {
    Electronics: ['Wireless Headphones', 'Smart Watch', 'Gaming Mouse', 'Mechanical Keyboard', 'USB-C Hub'],
    Clothing: ['Cotton T-Shirt', 'Denim Jeans', 'Winter Jacket', 'Running Shoes', 'Baseball Cap'],
    'Home & Garden': ['Garden Tools Set', 'Bed Sheets', 'Coffee Maker', 'Wall Clock', 'Plant Pot'],
    Books: ['Programming Guide', 'Mystery Novel', 'Cookbook', 'Self-Help Book', 'History Book'],
    Sports: ['Yoga Mat', 'Tennis Racket', 'Basketball', 'Dumbbells Set', 'Running Shorts']
  };

  sellers.forEach(seller => {
    const numProducts = getRandomNumber(3, 7);
    
    for (let i = 0; i < numProducts; i++) {
      const category = getRandomItem(categories);
      const status = getRandomItem(statuses);
      const createdAt = new Date(Date.now() - getRandomNumber(0, 30) * 24 * 60 * 60 * 1000);

      const product = {
        name: getRandomItem(productNames[category]),
        price: getRandomNumber(1000, 50000) / 100,
        stock: getRandomNumber(0, 100),
        category,
        image: `https://picsum.photos/seed/${Math.random()}/200`,
        status,
        seller: seller._id,
        description: `High-quality ${category.toLowerCase()} product from ${seller.name}`,
        specifications: {
          brand: `Brand ${getRandomNumber(1, 10)}`,
          model: `Model ${getRandomNumber(100, 999)}`,
          warranty: `${getRandomNumber(1, 3)} years`
        },
        actionLogs: [{
          action: 'create',
          performedBy: seller._id,
          reason: 'New product submission',
          createdAt
        }],
        createdAt,
        updatedAt: createdAt
      };

      if (status === 'approved') {
        product.actionLogs.push({
          action: 'approve',
          performedBy: admin._id,
          reason: 'Product meets all requirements',
          createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
        });
      } else if (status === 'rejected') {
        product.actionLogs.push({
          action: 'reject',
          performedBy: admin._id,
          reason: 'Insufficient product documentation',
          createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
        });
      } else if (status === 'flagged') {
        product.actionLogs.push({
          action: 'flag',
          performedBy: admin._id,
          reason: 'Potential policy violation',
          createdAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
        });
        product.flaggedReasons = ['Suspected counterfeit'];
      }

      products.push(product);
    }
  });

  return products;
};

const seedProducts = async (existingUsers = null) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get or use existing users
    const users = existingUsers || await seedUsers();
    const { sellers, admin } = users;

    if (!sellers.length || !admin) {
      throw new Error('Required users not found. Please run userSeeder first.');
    }

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const products = await createProducts(sellers, admin);
    const createdProducts = await Product.insertMany(products);

    console.log(`${createdProducts.length} products seeded successfully`);

    // Return the created products for use in order seeder
    return {
      products: createdProducts,
      users
    };
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

// Export for use in other seeders
module.exports = seedProducts;

// Run directly if this script is executed directly
if (require.main === module) {
  seedProducts()
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