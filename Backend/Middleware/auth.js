const { loginSchema } = require('../utils/validation');

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    message: 'Authentication required',
    code: 'AUTH_REQUIRED'
  });
};

const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }
  
  if (!req.user.isAdmin) {
    res.status(403).json({ 
      message: 'Admin privileges required',
      code: 'ADMIN_REQUIRED'
    });
    return;
  }
  
  next();
};

module.exports = {
  validateLogin,
  isAuthenticated,
  isAdmin
};