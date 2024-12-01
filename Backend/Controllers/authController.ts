import { Request, Response, RequestHandler } from 'express';
import passport from 'passport';

export const login: RequestHandler = (req, res) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login error' });
      }
      return res.json({ message: 'Logged in successfully' });
    });
  })(req, res);
};

export const logout: RequestHandler = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    return res.json({ message: 'Logged out successfully' });
  });
};

export const checkAuth: RequestHandler = (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
};