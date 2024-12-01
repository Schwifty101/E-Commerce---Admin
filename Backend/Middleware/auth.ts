import { Request, Response, NextFunction, RequestHandler } from 'express';
import { loginSchema } from '../utils/validation';

export const validateLogin: RequestHandler = (req, res, next): void => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
};

export const isAuthenticated: RequestHandler = (req, res, next): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    message: 'Authentication required',
    code: 'AUTH_REQUIRED'
  });
};

export const isAdmin: RequestHandler = (req, res, next): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (!(req.user as any).isAdmin) {
    res.status(403).json({ 
      message: 'Admin privileges required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};