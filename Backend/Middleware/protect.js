const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Store decoded token data in request object instead of user model
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {protect};