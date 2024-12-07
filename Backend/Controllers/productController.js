const {Product} = require('../models/Product');
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
        const { id } = req.params;
        const updateData = req.body;

        // Find product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Prevent removing reports from rejected/deleted products
        if ((product.status === 'rejected' || product.status === 'deleted') && 
            updateData.reports && 
            updateData.reports.length === 0) {
            return res.status(400).json({ 
                message: 'Cannot remove all reports from rejected or deleted products' 
            });
        }

        // Store old status for action log
        const oldStatus = product.status;

        // Update allowed fields
        if (updateData.category) product.category = updateData.category;
        if (updateData.status) {
            // Enforce report requirement for reject/delete actions
            if ((updateData.status === 'rejected' || updateData.status === 'deleted') && 
                (!updateData.reports || updateData.reports.length === 0)) {
                return res.status(400).json({ 
                    message: 'A report is required when rejecting or deleting a product' 
                });
            }
            product.status = updateData.status;
        }

        // Handle reports update
        if (updateData.reports) {
            product.reports = updateData.reports.map(report => ({
                reason: report.reason,
                description: report.description,
                reportedBy: req.user._id,
                createdAt: report.createdAt || new Date()
            }));
        }

        // Add action log
        const newActionLog = {
            action: updateData.status ? 'status_change' : 'update',
            performedBy: req.user._id,
            oldStatus: updateData.status ? oldStatus : undefined,
            newStatus: updateData.status || undefined,
            reason: updateData.status 
                ? `Status changed from ${oldStatus} to ${updateData.status}`
                : 'Product details updated by admin',
            createdAt: new Date()
        };
        product.actionLogs.push(newActionLog);

        // Save updates
        const updatedProduct = await product.save();
        await updatedProduct.populate([
            { path: 'seller', select: 'name email' },
            { path: 'reports.reportedBy', select: 'name' },
            { path: 'actionLogs.performedBy', select: 'name' }
        ]);

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            message: 'Error updating product',
            error: error.message 
        });
    }
};
const getProductById = (async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }
    const product = await Product.findById(req.params.id)
        .populate('seller', 'name email');
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = (async (req, res) => {
    const { name, price, stock, category, images } = req.body;

    const product = await Product.create({
        name,
        price,
        stock,
        category,
        images,
        seller: req.user._id
    });

    res.status(201).json(product);
});

// @desc    Search products by keyword
// @route   GET /api/products/search
// @access  Public

const searchProducts = (async (req, res) => {
    const {q: keyword } = req.query;
    
    if (!keyword) {
        res.status(400);
        throw new Error('Please provide a search keyword');
    }
    // Create a regex pattern for case-insensitive search
    const searchPattern = new RegExp(keyword, 'i');
    // First search in name (title)
    let products = await Product.find({ name: searchPattern })
        .populate('seller', 'name email')
        .sort('-createdAt');
    // If no products found in name, search in description and category
    if (products.length === 0) {
        products = await Product.find({
            $or: [
                { description: searchPattern },
                { category: searchPattern }
            ]
        })
        .populate('seller', 'name email')
        .sort('-createdAt');
    }
    res.json(products);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private

const deleteProduct = (async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this product');
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
});


module.exports = {
    getProducts,
    getFlaggedProducts,
    approveProduct,
    rejectProduct,
    takeAction,
    updateProduct,
    getProductById,
    createProduct,
    searchProducts,
    deleteProduct
}; 