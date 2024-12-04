const { orderStatusSchema, returnActionSchema } = require('../utils/validation');

const validateOrderStatus = (req, res, next) => {
    const { error } = orderStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
  
  const validateReturnAction = (req, res, next) => {
    const { status, adminComments } = req.body;
    
    if (!status || !['approved', 'rejected', 'escalated'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!adminComments || adminComments.trim().length === 0) {
        return res.status(400).json({ message: 'Admin comments are required' });
    }

    next();
  };

  module.exports = {
    validateOrderStatus,
    validateReturnAction
  };