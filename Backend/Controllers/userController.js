const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/email');
const { createExcelWorkbook } = require('../utils/excel');
const { createUserSchema } = require('../utils/validation');
const { AppError } = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { validateSignup, validateLogin } = require('../validators/auth.validator.js');


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error approving user' });
  }
};

const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error banning user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

const getSellerVerifications = async (req, res) => {
  try {
    const sellers = await User.find({
      role: 'seller',
      status: 'pending'
    }).select('-password');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seller verifications' });
  }
};

const approveSellerApplication = async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        'businessDetails.verified': true 
      },
      { new: true }
    );
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Error approving seller application' });
  }
};

const getBuyerStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { _id: req.params.id, role: 'buyer' } },
      // Add your aggregation pipeline here for buyer statistics
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buyer stats' });
  }
};

const exportUserList = async (req, res) => {
  try {
    const users = await User.find(req.body).select('-password');
    const workbook = await createExcelWorkbook(users);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting user list' });
  }
};

const createUser = async (req, res) => {
  try {
    // Validate input
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = new User(value);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sellers' });
  }
};

const getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'seller',
      verificationStatus: 'pending'
    }).select('-password');
    res.json(pendingSellers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending sellers' });
  }
};

const verifySeller = async (req, res) => {
  try {
    const { approved } = req.body;
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: approved ? 'approved' : 'rejected',
        'businessDetails.verified': approved
      },
      { new: true }
    );
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying seller' });
  }
};

const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' }).select('-password');
    res.json(buyers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buyers' });
  }
};

const getPendingBuyers = async (req, res) => {
  try {
    const pendingBuyers = await User.find({
      role: 'buyer',
      verificationStatus: 'pending'
    }).select('-password');
    res.json(pendingBuyers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending buyers' });
  }
};

const verifyBuyer = async (req, res) => {
  try {
    const { approved } = req.body;
    const buyer = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: approved ? 'approved' : 'rejected' },
      { new: true }
    );
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    res.json(buyer);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying buyer' });
  }
};
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validateUserUpdate(req.body);
    if (errors.length > 0) {
      throw new AppError('Validation Error', 400, errors);
    }

    const { name, email, phone } = req.body;

    // Check if email is already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Check if phone is already taken
    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existingUser) {
        throw new AppError('Phone number already in use', 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name,
        email,
        phone,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Here you would typically fetch orders from your orders collection
    // For now, returning mock data
    const orders = [
      {
        id: 1,
        date: '2024-03-15',
        title: 'Smartphone XYZ',
        description: 'Latest model smartphone with 256GB storage',
        price: 799.99,
        image: 'https://picsum.photos/200/300',
        sellerName: 'Tech Store Inc.',
        status: 'delivered'
      },
      {
        id: 2,
        date: '2024-03-10',
        title: 'Wireless Headphones',
        description: 'Premium noise-canceling headphones',
        price: 299.99,
        image: 'https://picsum.photos/200/300',
        sellerName: 'Audio World',
        status: 'in_process'
      }
    ];

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getCartProducts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        select: 'name price images'
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const cartProducts = user.cart.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0], // Get first image
      subtotal: item.product.price * item.quantity
    }));

    res.json({
      success: true,
      data: cartProducts
    });
  } catch (error) {
    next(error);
  }
};

const getCartTotal = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.product',
        select: 'price'
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const total = user.cart.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        total: total,
        itemCount: user.cart.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validateSignup(req.body);
    if (errors.length > 0) {
      throw new AppError('Validation Error', 400, errors);
    }

    const { email, phone, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new AppError('User already exists with this email or phone', 400);
    }

    // Create new user
    const user = await User.create({
      email,
      phone,
      password,
      name,
      role: role || 'buyer',
      verificationStatus: role === 'admin' ? 'active' : 'pending'
    });

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      throw new AppError('Validation Error', 400, errors);
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is banned
    if (user.isBanned || user.verificationStatus === 'banned') {
      throw new AppError('Your account has been banned', 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};






module.exports = {
  getAllUsers,
  updateUser,
  approveUser,
  banUser,
  deleteUser,
  getSellerVerifications,
  approveSellerApplication,
  getBuyerStats,
  exportUserList,
  createUser,
  getSellers,
  getPendingSellers,
  verifySeller,
  getBuyers,
  getPendingBuyers,
  verifyBuyer,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getCartProducts,
  getCartTotal,
  signup,
  login
}; 