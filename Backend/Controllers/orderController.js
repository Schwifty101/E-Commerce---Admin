const Order = require('../models/Order');
const User = require('../models/User');
const { sendNotification } = require('../utils/notification');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');
const mongoose = require('mongoose');

async function generateOrderNumber() {
  // Get the count of all orders and add 1
  const count = await Order.countDocuments();
  const date = new Date();
  // Format: ORD-YYYYMMDD-XXXX (XXXX is a sequential number)
  return `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
}

const createOrder = async (req, res) => {
  try {
    const { items, vendor, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;
    if(!userId){
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required and must be an array' });
    }

    // Extract vendor ID from vendor object or use directly if it's a string
    const vendorId = vendor.id || vendor;

    // Validate vendor exists
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: 'Invalid vendor ID format' });
    }

    const vendorExists = await User.findById(vendorId);
    if (!vendorExists) {
      return res.status(400).json({ message: 'Invalid vendor' });
    }

    // Ensure each item has the required fields and valid ObjectIds
    const formattedItems = [];
    for (const item of items) {
      // Check if productId exists
      if (!item.productId) {
        return res.status(400).json({ 
          message: 'Product ID is required for each item',
          item: item 
        });
      }

      // Validate product ID format
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ 
          message: 'Invalid product ID format',
          productId: item.productId 
        });
      }

      // Validate required fields
      if (!item.name || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: 'Each item must have name, quantity, and price',
          item: item 
        });
      }

      formattedItems.push({
        productId: new mongoose.Types.ObjectId(item.productId),
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        subtotal: parseFloat(item.price) * parseInt(item.quantity)
      });
    }

    // Calculate total
    const total = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create new order
    const order = new Order({
      orderNumber,
      customer: new mongoose.Types.ObjectId(userId),
      vendor: new mongoose.Types.ObjectId(vendorId),
      items: formattedItems,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Send notification to vendor
    await sendNotification({
      userId: vendorId,
      title: 'New Order Received',
      message: `You have received a new order #${order.orderNumber}`
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message,
      details: error.stack
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const {
      status,
      dateRange,
      page = 1,
      limit = 10,
      minAmount,
      maxAmount
    } = req.query;
    
    const userId = req.params.userId; // Get userId from params

    const query = {
      $or: [
        { customer: userId },
        { vendor: userId }
      ]
    };

    // Apply filters
    if (status) query.status = status;
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(':');
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (minAmount) query.total = { $gte: parseFloat(minAmount) };
    if (maxAmount) query.total = { ...query.total, $lte: parseFloat(maxAmount) };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const {
      vendor,
      customer,
      dateRange,
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      status: { $in: ['delivered', 'returned', 'cancelled'] }
    };

    // Apply filters
    if (vendor) query.vendor = vendor;
    if (customer) query.customer = customer;
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(':');
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Error fetching order history' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add status log
    order.statusLogs.push({
      status,
      updatedBy: req.user._id,
      comments,
      timestamp: new Date()
    });

    order.status = status;
    await order.save();

    // Send notification to customer
    await sendNotification({
      userId: order.customer,
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} status has been updated to ${status}`
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

const getReturnRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query['returnRequest.status'] = status;
    }

    const total = await Order.countDocuments(query);
    const returns = await Order.find(query)
      .populate('customer', 'name email')
      .populate('returnRequest.processedBy', 'name')
      .sort({ 'returnRequest.requestedAt': -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      returns,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).json({ message: 'Error fetching return requests' });
  }
};

const processReturnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComments } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnRequest) {
      return res.status(400).json({ message: 'No return request exists for this order' });
    }

    // Update return request
    order.returnRequest.status = status;
    order.returnRequest.adminComments = adminComments;
    order.returnRequest.processedAt = new Date();
    order.returnRequest.processedBy = req.user._id;

    await order.save();

    res.json({ message: 'Return request processed successfully', order });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ message: 'Failed to process return request' });
  }
};

const exportOrders = async (req, res) => {
  try {
    const { format: exportFormat = 'xlsx', ...filters } = req.query;

    // Fetch orders with filters
    const query = {};
    // Apply filters similar to getOrders
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    if (exportFormat === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Define columns
      worksheet.columns = [
        { header: 'Order Number', key: 'orderNumber', width: 15 },
        { header: 'Customer', key: 'customerName', width: 20 },
        { header: 'Vendor', key: 'vendorName', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Date', key: 'date', width: 20 }
      ];

      // Add rows
      orders.forEach(order => {
        worksheet.addRow({
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          vendorName: order.vendor.name,
          status: order.status,
          total: `$${order.total.toFixed(2)}`,
          date: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();

    } else if (exportFormat === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      );

      doc.pipe(res);

      // Add PDF content
      doc.fontSize(16).text('Order Report', { align: 'center' });
      doc.moveDown();

      orders.forEach((order) => {
        doc.fontSize(12).text(`Order #: ${order.orderNumber}`);
        doc.fontSize(10)
          .text(`Customer: ${order.customer.name}`)
          .text(`Vendor: ${order.vendor.name}`)
          .text(`Status: ${order.status}`)
          .text(`Total: $${order.total.toFixed(2)}`)
          .text(`Date: ${format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}`)
          .text('-------------------')
          .moveDown();
      });

      doc.end();
    } else {
      res.status(400).json({ message: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ message: 'Error exporting orders' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .populate('statusLogs.updatedBy', 'name')
      .populate('returnRequest.processedBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
};

const getDeliveredOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const query = {
      customer: userId,
      status: 'delivered'
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching delivered orders:', error);
    res.status(500).json({ message: 'Error fetching delivered orders' });
  }
};

const getNonDeliveredOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const query = {
      customer: userId,
      status: { $ne: 'delivered' }  // get all orders where status is not 'delivered'
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching non-delivered orders:', error);
    res.status(500).json({ message: 'Error fetching non-delivered orders' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderHistory,
  updateOrderStatus,
  getReturnRequests,
  processReturnRequest,
  exportOrders,
  getOrderDetails,
  getDeliveredOrders,
  getNonDeliveredOrders
}; 