const mongoose = require('mongoose');
const Order = require('../Models/Order');
const dotenv = require('dotenv');
const seedProducts = require('./productSeeder');

dotenv.config();

const generateOrderNumber = (index) => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `ORD-${year}${month}-${(index + 1).toString().padStart(4, '0')}`;
};

const createOrders = async (buyers, products, admin) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  const paymentStatuses = ['pending', 'paid', 'refunded', 'failed'];
  const paymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'wallet'];

  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Calculate more realistic order numbers
  const ordersPerBuyer = 3; // Average 2 orders per buyer
  const totalOrders = buyers.length * ordersPerBuyer;

  for (let i = 0; i < totalOrders; i++) {
    // Make more recent orders more likely
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 30); // Weighted towards recent dates
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // More realistic order quantities and amounts
    const numItems = getRandomNumber(1, 5); // Allow up to 5 items per order
    const orderItems = [];
    const buyer = getRandomItem(buyers);
    let total = 0;

    // Adjust status probabilities
    const statusProbabilities = {
      'delivered': 0.5,    // 50% delivered
      'shipped': 0.2,      // 20% shipped
      'processing': 0.15,  // 15% processing
      'pending': 0.1,      // 10% pending
      'cancelled': 0.03,   // 3% cancelled
      'returned': 0.02     // 2% returned
    };

    const status = (() => {
      const rand = Math.random();
      let cumulative = 0;
      for (const [status, prob] of Object.entries(statusProbabilities)) {
        cumulative += prob;
        if (rand <= cumulative) return status;
      }
      return 'delivered';
    })();

    // Create order items using only approved products
    for (let j = 0; j < numItems; j++) {
      const product = getRandomItem(products);
      const quantity = getRandomNumber(1, 3); // More realistic quantities
      const subtotal = product.price * quantity;
      total += subtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: quantity,
        price: product.price,
        subtotal: subtotal
      });
    }

    // Use the seller from the first product as the vendor
    const vendor = products.find(p => p._id === orderItems[0].productId).seller;

    const paymentStatus = getRandomItem(paymentStatuses);
    const paymentMethod = getRandomItem(paymentMethods);

    const order = {
      orderNumber: generateOrderNumber(i),
      customer: buyer._id,
      vendor: vendor,
      items: orderItems,
      total: total,
      status: status,
      shippingAddress: {
        street: `${getRandomNumber(100, 999)} ${['Main', 'Oak', 'Maple', 'Cedar'][getRandomNumber(0, 3)]} Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][getRandomNumber(0, 3)],
        state: ['NY', 'CA', 'IL', 'TX'][getRandomNumber(0, 3)],
        zipCode: getRandomNumber(10000, 99999).toString(),
        country: 'United States'
      },
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      statusLogs: [
        {
          status: 'pending',
          updatedBy: admin._id,
          comments: 'Order created',
          timestamp: createdAt
        }
      ],
      createdAt: createdAt,
      updatedAt: createdAt
    };

    // Add return request for returned orders
    if (status === 'returned') {
      const returnReasons = [
        'Product not as described',
        'Defective item',
        'Wrong size/color',
        'Damaged during shipping'
      ];

      order.returnRequest = {
        reason: getRandomItem(returnReasons),
        description: `Customer reported issue: ${getRandomItem(returnReasons).toLowerCase()}`,
        status: 'approved',
        requestedAt: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
        processedBy: admin._id,
        processedAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        adminComments: 'Return request approved after verification',
        refundAmount: total,
        images: [
          `return-${order.orderNumber}-1.jpg`,
          `return-${order.orderNumber}-2.jpg`
        ]
      };

      order.statusLogs.push({
        status: 'returned',
        updatedBy: admin._id,
        comments: 'Return request approved',
        timestamp: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Add status history
    if (status !== 'pending') {
      const statusIndex = statuses.indexOf(status);
      for (let k = 1; k <= statusIndex; k++) {
        order.statusLogs.push({
          status: statuses[k],
          updatedBy: admin._id,
          comments: `Order ${statuses[k]}`,
          timestamp: new Date(createdAt.getTime() + k * 24 * 60 * 60 * 1000)
        });
      }
    }

    console.log(`Order Number: ${order.orderNumber}, Created At: ${order.createdAt}`);

    orders.push(order);
  }

  return orders;
};

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get seeded data
    const { products, users } = await seedProducts();
    const { buyers, admin } = users;

    if (!buyers.length || !products.length || !admin) {
      throw new Error('Required users or products not found.');
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Create orders using only approved products and active buyers
    const approvedProducts = products.filter(product => product.status === 'approved');
    const orders = await createOrders(buyers, approvedProducts, admin);
    const createdOrders = await Order.insertMany(orders);

    console.log(`${createdOrders.length} orders seeded successfully`);

    return createdOrders;
  } catch (error) {
    console.error('Error seeding orders:', error);
    throw error;
  }
};

// Export for potential use in other seeders
module.exports = seedOrders;

// Run directly if this script is executed directly
if (require.main === module) {
  seedOrders()
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