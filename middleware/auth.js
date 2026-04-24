const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

module.exports = function(req, res, next) {
  console.log('Auth middleware called for path:', req.path);
  console.log('Headers:', req.headers);
  
  // Support both x-auth-token and Authorization: Bearer <token>
  let token = req.header('x-auth-token');
  const authHeader = req.headers['authorization'];
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // For readings endpoint, allow requests without a token for Arduino data
  if (!token && req.path.includes('/readings')) {
    console.log('No token provided for readings endpoint, but proceeding anyway');
    req.user = { id: null }; // Set a null user ID
    return next();
  }

  if (!token) {
    console.log('No token provided, authorization denied');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Store entire decoded payload on req.user; we sign with { id }
    req.user = decoded;
    console.log('Token verified, user:', req.user);
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};