const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const createUserSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('buyer', 'seller', 'admin').required(),
  status: Joi.string().valid('pending', 'active', 'banned').default('pending'),
  businessDetails: Joi.when('role', {
    is: 'seller',
    then: Joi.object({
      companyName: Joi.string().required(),
      registrationNumber: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      verificationDocuments: Joi.array().items(Joi.string())
    }),
    otherwise: Joi.optional()
  })
});

const productActionSchema = Joi.object({
  action: Joi.string()
    .valid('escalate', 'delete')
    .required()
    .messages({
      'any.required': 'Action is required',
      'string.valid': 'Action must be either "escalate" or "delete"'
    }),
  reason: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Reason must be at least 10 characters',
      'string.max': 'Reason cannot exceed 500 characters'
    })
});

const rejectSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
});

// Add this validation schema at the top with other imports
const updateProductSchema = Joi.object({
  category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Category must be at least 2 characters',
      'string.max': 'Category cannot exceed 50 characters'
    }),
    
  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'flagged', 'deleted', 'escalated')
    .optional()
    .messages({
      'any.only': 'Invalid status value'
    }),
    
  reports: Joi.array()
    .items(
      Joi.object({
        reason: Joi.string()
          .required()
          .messages({
            'any.required': 'Report reason is required'
          }),
        createdAt: Joi.date()
          .default(Date.now)
          .messages({
            'date.base': 'Invalid date format'
          }),
        reportedBy: Joi.string()
          .default('admin')
          .messages({
            'string.base': 'Invalid reporter value'
          })
      })
    )
    .optional()
    .messages({
      'array.base': 'Reports must be an array'
    })
})
.min(1)
.messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  loginSchema,
  createUserSchema,
  productActionSchema,
  rejectSchema,
  updateProductSchema
};