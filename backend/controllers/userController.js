const { body } = require('express-validator');
const adminModel = require('../models/adminModel');
const { getPagination } = require('../utils/pagination');

const roleValidators = [
  body('role').isIn(['Admin', 'User']).withMessage('Role must be Admin or User'),
];

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = req.query.search || null;
    const role = req.query.role || null;
    if (role && !['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role filter' });
    }
    const { rows, total } = await adminModel.list({ search, role, limit, offset });
    res.json({ users: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

async function updateRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    const newRole = req.body.role;
    if (!['Admin', 'User'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const target = await adminModel.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Never allow regular users to change roles (enforced by route middleware) and
    // never allow users/admins to change their own role via this endpoint.
    if (req.user.id === id) {
      return res.status(403).json({ message: 'You cannot change your own role' });
    }

    // Prevent demoting the last active administrator
    if (target.role === 'Admin' && newRole === 'User') {
      const otherActiveAdmins = await adminModel.countActiveAdmins(id);
      if (otherActiveAdmins < 1) {
        return res.status(400).json({ message: 'Cannot demote the last active administrator' });
      }
    }

    if (target.role === newRole) {
      return res.json({ user: target, message: 'Role unchanged' });
    }

    const updated = await adminModel.updateRole(id, newRole);
    res.json({ user: updated, message: `Role updated to ${newRole}. The user's active sessions have been invalidated.` });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const target = await adminModel.findById(id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (req.user.id === id) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }

    // Prevent deleting the last active administrator
    if (target.role === 'Admin' && target.status === 'Active') {
      const otherActiveAdmins = await adminModel.countActiveAdmins(id);
      if (otherActiveAdmins < 1) {
        return res.status(400).json({ message: 'Cannot delete the last active administrator' });
      }
    }

    // Prevent breaking posts FK (posts.admin_id -> admins.id ON DELETE RESTRICT)
    const pool = require('../config/db');
    const [postRows] = await pool.execute('SELECT COUNT(*) AS count FROM posts WHERE admin_id = ?', [id]);
    if (postRows[0].count > 0) {
      return res.status(409).json({ message: 'Cannot delete an account that has authored posts. Reassign or remove their posts first.' });
    }

    await adminModel.remove(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    // Handle FK constraint gracefully
    if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Cannot delete this account because it is referenced by existing records.' });
    }
    next(err);
  }
}

module.exports = { list, updateRole, remove, roleValidators };