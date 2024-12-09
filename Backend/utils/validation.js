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

const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
    .required(),
  comments: Joi.string().required()
});

const returnActionSchema = Joi.object({
  action: Joi.string()
    .valid('approve', 'reject', 'escalate')
    .required()
    .messages({
      'any.required': 'Action is required',
      'string.valid': 'Action must be approve, reject, or escalate'
    }),
  comments: Joi.string()
    .required()
    .min(1)
    .messages({
      'any.required': 'Comments are required',
      'string.empty': 'Comments cannot be empty'
    })
});

const dateRangeSchema = Joi.object({
  from: Joi.date().required(),
  to: Joi.date().min(Joi.ref('from')).required(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day')
}).messages({
  'date.min': 'End date must be after start date',
  'any.required': 'Both start and end dates are required'
});

const periodSchema = Joi.object({
  period: Joi.string()
    .valid('24hours', '7days', '30days', '90days', '12months')
    .required()
    .messages({
      'any.required': 'Period is required',
      'string.valid': 'Invalid period value'
    }),
  groupBy: Joi.string()
    .valid('hour', 'day', 'week', 'month')
    .default('day'),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional(),
  sortBy: Joi.string()
    .valid('revenue', 'sales')
    .optional()
}).messages({
  'object.unknown': 'Invalid query parameters'
});

const exportRequestSchema = Joi.object({
  type: Joi.string().valid('csv', 'pdf').required(),
  dateRange: dateRangeSchema,
  filters: Joi.object({
    userType: Joi.string().valid('all', 'admin', 'vendor', 'customer'),
    activityType: Joi.string().valid('all', 'login', 'order', 'product'),
    status: Joi.string()
  }).optional()
}).messages({
  'string.valid': 'Invalid export type specified'
});

// Analytics period validation
const analyticsPeriodSchema = Joi.object({
    period: Joi.string()
        .valid('24hours', '7days', '30days', '90days', '12months')
        .required()
        .messages({
            'any.required': 'Time period is required',
            'string.valid': 'Invalid time period specified'
        }),
    dataType: Joi.string()
        .valid('all', 'revenue', 'orders', 'users', 'products')
        .default('all')
        .messages({
            'string.valid': 'Invalid data type specified'
        }),
    groupBy: Joi.string()
        .valid('hour', 'day', 'week', 'month')
        .default('day')
        .messages({
            'string.valid': 'Invalid grouping specified'
        }),
    orderStatus: Joi.string()
        .valid('all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
        .default('all')
        .messages({
            'string.valid': 'Invalid order status specified'
        })
});

// Analytics export validation
const analyticsExportSchema = Joi.object({
    period: Joi.string()
        .valid('24hours', '7days', '30days', '90days', '12months')
        .required(),
    format: Joi.string()
        .valid('csv', 'excel', 'pdf')
        .default('csv'),
    includeMetrics: Joi.object({
        revenue: Joi.boolean().default(true),
        orders: Joi.boolean().default(true),
        users: Joi.boolean().default(true),
        products: Joi.boolean().default(true)
    }).default(),
    filters: Joi.object({
        orderStatus: Joi.string()
            .valid('all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
            .default('all'),
        userType: Joi.string()
            .valid('all', 'buyer', 'seller')
            .default('all'),
        productCategory: Joi.string().optional()
    }).default()
}).messages({
    'any.required': 'Export configuration is required',
    'object.base': 'Invalid export configuration'
});

// Analytics dashboard filters validation
const analyticsDashboardSchema = Joi.object({
    timeRange: Joi.object({
        start: Joi.date().required(),
        end: Joi.date().min(Joi.ref('start')).required()
    }).required(),
    metrics: Joi.array()
        .items(Joi.string().valid(
            'revenue',
            'orders',
            'users',
            'products',
            'topProducts',
            'userActivity'
        ))
        .default(['revenue', 'orders', 'users', 'products']),
    comparison: Joi.boolean().default(false)
}).messages({
    'date.min': 'End date must be after start date',
    'any.required': 'Time range is required'
});

// Analytics top products validation
const topProductsSchema = Joi.object({
    period: Joi.string()
        .valid('24hours', '7days', '30days', '90days', '12months')
        .required(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),
    sortBy: Joi.string()
        .valid('sales', 'revenue')
        .default('revenue'),
    category: Joi.string().optional()
}).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
});

module.exports = {
  loginSchema,
  createUserSchema,
  productActionSchema,
  rejectSchema,
  updateProductSchema,
  orderStatusSchema,
  returnActionSchema,
  dateRangeSchema,
  periodSchema,
  exportRequestSchema,
  analyticsPeriodSchema,
  analyticsExportSchema,
  analyticsDashboardSchema,
  topProductsSchema
};
