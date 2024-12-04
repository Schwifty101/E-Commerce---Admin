const { orderStatusSchema, returnActionSchema } = require('../utils/validation');

const validateOrderStatus = (req, res, next) => {
    const { error } = orderStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
  
  const validateReturnAction = (req, res, next) => {
    const { error } = returnActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };

  module.exports = {
    validateOrderStatus,
    validateReturnAction
  };