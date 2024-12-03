const passport = require('passport');

const login = (req, res) => {
  passport.authenticate('local', (err, user, info) => {
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

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    return res.json({ message: 'Logged out successfully' });
  });
};

const checkAuth = (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
};

module.exports = {
  login,
  logout,
  checkAuth
};