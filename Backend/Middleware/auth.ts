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
  res.status(401).json({ message: 'Please log in first' });
  return;
};

export const isAdmin: RequestHandler = (req, res, next): void => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Access denied' });
  return;
};