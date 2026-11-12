const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const adminModel = require('../models/adminModel');

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, token_version: user.token_version },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, created_at: user.created_at };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await adminModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive. Please contact an administrator.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    const payload = safeUser(user);
    res.json({ token, admin: payload, user: payload });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await adminModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });
    const payload = safeUser(user);
    res.json({ admin: payload, user: payload });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, loginValidators };
