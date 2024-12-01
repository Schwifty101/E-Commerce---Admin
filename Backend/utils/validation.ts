import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
}); 

export const createUserSchema = Joi.object({
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