const Product = require('../models/Product');
const { productActionSchema } = require('../utils/validation');
const { sendNotification } = require('../utils/notification');
const { rejectSchema, updateProductSchema } = require('../utils/validation');

// Get all products with filtering
const getProducts = async (req, res) => {
  try {
    const { status, category, seller } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (seller) query.seller = seller;

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get flagged products
const getFlaggedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'flagged' })
      .populate('seller', 'name email')
      .populate('reports.reportedBy', 'name')
      .sort({ updatedAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flagged products' });
  }
};

// Approve product
const approveProduct = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'approved';
    product.actionLogs.push({
      action: 'approve',
      performedBy: req.user._id,
      createdAt: new Date()
    });

    await product.save();

    // Send notification to seller
    await sendNotification(product.seller, {
      type: 'PRODUCT_APPROVED',
      productId: product._id,
      productName: product.name
    });

    res.json(product);
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ 
      message: 'Error approving product',
      error: error.message 
    });
  }
};

// Reject product
const rejectProduct = async (req, res) => {
  try {
    // Validate the request body against the reject schema
    const { error } = rejectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const { reason } = req.body;
    if (!req.params.id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'rejected';
    product.rejectionReason = reason;
    product.actionLogs.push({
      action: 'reject',
      performedBy: req.user._id,
      reason,
      createdAt: new Date()
    });

    await product.save();

    // Send notification to seller
    await sendNotification(product.seller, {
      type: 'PRODUCT_REJECTED',
      productId: product._id,
      productName: product.name,
      reason
    });

    res.json(product);
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ 
      message: 'Error rejecting product',
      error: error.message 
    });
  }
};

// Take action on flagged product
const takeAction = async (req, res) => {
  try {
    const { action, reason } = req.body;
    
    // Validate action
    if (!action || !['escalate', 'delete'].includes(action)) {
      return res.status(400).json({ 
        message: 'Invalid action. Must be either "escalate" or "delete"' 
      });
    }

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate product status
    if (product.status !== 'flagged') {
      return res.status(400).json({ 
        message: 'Can only take action on flagged products' 
      });
    }

    // Update product status
    product.status = action === 'delete' ? 'deleted' : 'escalated';
    
    // Add action log
    product.actionLogs.push({
      action,
      performedBy: req.user._id,
      reason: reason || undefined,
      createdAt: new Date()
    });

    await product.save();

    // Send notification to seller
    await sendNotification(product.seller, {
      type: `PRODUCT_${action.toUpperCase()}`,
      productId: product._id,
      productName: product.name,
      reason: reason || undefined
    });

    res.json(product);
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ 
      message: 'Error processing action',
      error: error.message 
    });
  }
};

// Add this controller function
const updateProduct = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update allowed fields only
    if (updateData.category) product.category = updateData.category;
    if (updateData.status) {
      product.status = updateData.status;
      product.actionLogs.push({
        action: `status_change_to_${updateData.status}`,
        performedBy: req.user._id,
        createdAt: new Date()
      });
    }
    if (updateData.reports) {
      product.reports = updateData.reports;
    }

    await product.save();

    // If status changed, send notification
    if (updateData.status && updateData.status !== product.status) {
      await sendNotification(product.seller, {
        type: `PRODUCT_${updateData.status.toUpperCase()}`,
        productId: product._id,
        productName: product.name
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product',
      error: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getFlaggedProducts,
  approveProduct,
  rejectProduct,
  takeAction,
  updateProduct
}; 