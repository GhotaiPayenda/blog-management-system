const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await adminModel.findAuthById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    // Invalidate sessions after role/permission changes
    const tokenVersion = decoded.token_version ?? 0;
    if (Number(tokenVersion) !== Number(user.token_version)) {
      return res.status(401).json({ message: 'Session expired due to account changes. Please log in again.' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token_version: user.token_version,
    };
    // Backward compatibility for existing controllers expecting req.admin
    req.admin = req.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = authMiddleware;
module.exports.requireAdmin = requireAdmin;
