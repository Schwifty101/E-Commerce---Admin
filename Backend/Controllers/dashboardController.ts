import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Get total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get monthly orders count
    const monthlyOrders = await Order.countDocuments({
      date: { $gte: lastMonth }
    });

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'buyer' });

    // Get products in stock
    const productsInStock = await Product.countDocuments({ stock: { $gt: 0 } });

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('customer', 'name');

    res.json({
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyOrders,
        totalCustomers,
        productsInStock
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
}; 