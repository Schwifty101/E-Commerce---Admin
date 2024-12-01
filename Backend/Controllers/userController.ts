import { Request, Response } from 'express';
import User from '../models/User';
import { sendPasswordResetEmail } from '../utils/email';
import { createExcelWorkbook } from '../utils/excel';
import { createUserSchema } from '../utils/validation';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!user) res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error approving user' });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned' },
      { new: true }
    );
    if (!user) res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error banning user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const getSellerVerifications = async (req: Request, res: Response) => {
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

export const approveSellerApplication = async (req: Request, res: Response) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        'businessDetails.verified': true 
      },
      { new: true }
    );
    if (!seller) res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Error approving seller application' });
  }
};

export const getBuyerStats = async (req: Request, res: Response) => {
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

export const exportUserList = async (req: Request, res: Response) => {
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

export const createUser = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user
    const user = new User(value);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
}; 