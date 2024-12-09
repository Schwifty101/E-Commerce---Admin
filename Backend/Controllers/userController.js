const User = require('../Models/User');
const { sendPasswordResetEmail } = require('../utils/email');
const { createExcelWorkbook } = require('../utils/excel');
const { createUserSchema } = require('../utils/validation');

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
        verificationStatus: approved ? 'active' : 'banned',
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
  verifyBuyer
}; 