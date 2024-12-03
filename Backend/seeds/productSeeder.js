const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const createProducts = async (sellerId) => [
    {
        name: 'Wireless Headphones',
        price: 99.99,
        stock: 45,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        status: 'approved',
        seller: sellerId,
        description: 'High-quality wireless headphones with noise cancellation',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
    },
    {
        name: 'Smart Watch',
        price: 199.99,
        stock: 8,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200',
        status: 'pending',
        seller: sellerId,
        description: 'Smart watch with health monitoring features',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10')
    },
    {
        name: 'Leather Backpack',
        price: 79.99,
        stock: 23,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
        status: 'flagged',
        seller: sellerId,
        description: 'Genuine leather backpack with laptop compartment',
        flaggedReasons: ['Potential counterfeit'],
        reports: [
            {
                reason: 'Suspected counterfeit product',
                description: 'Similar design to protected brand',
                createdAt: new Date('2024-03-15')
            }
        ],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
    },
    {
        name: 'Gaming Mouse',
        price: 49.99,
        stock: 15,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
        status: 'pending',
        seller: sellerId,
        description: 'RGB gaming mouse with programmable buttons',
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-18')
    },
    {
        name: 'Mechanical Keyboard',
        price: 129.99,
        stock: 0,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200',
        status: 'rejected',
        seller: sellerId,
        description: 'Mechanical gaming keyboard with RGB backlight',
        rejectionReason: 'Insufficient product documentation',
        actionLogs: [
            {
                action: 'reject',
                reason: 'Missing certification documents',
                createdAt: new Date('2024-03-16')
            }
        ],
        createdAt: new Date('2024-03-16'),
        updatedAt: new Date('2024-03-16')
    }
];

const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a seller user
        const seller = await User.findOne({ role: 'seller', isApproved: true });
        if (!seller) {
            throw new Error('No approved seller found. Please run userSeeder first.');
        }

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Create products with the seller ID
        const products = await createProducts(seller._id);
        const createdProducts = await Product.insertMany(products);

        console.log(`${createdProducts.length} products seeded successfully`);

        // Log sample product IDs for reference
        console.log('Sample Product IDs:');
        createdProducts.forEach(product => {
            console.log(`${product.name}: ${product._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts(); 