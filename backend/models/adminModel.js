const pool = require('../config/db');

const safeFields = 'id, name, email, role, status, token_version, created_at';

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT ${safeFields}, password FROM admins WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${safeFields} FROM admins WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findAuthById(id) {
  const [rows] = await pool.execute(
    `SELECT ${safeFields} FROM admins WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function list({ search, role, limit, offset }) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM admins${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `SELECT ${safeFields} FROM admins${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function countActiveAdmins(excludeId = null) {
  let q = "SELECT COUNT(*) AS count FROM admins WHERE role = 'Admin' AND status = 'Active'";
  const params = [];
  if (excludeId) { q += ' AND id != ?'; params.push(excludeId); }
  const [rows] = await pool.execute(q, params);
  return rows[0].count;
}

async function updateRole(id, role) {
  // Bump token_version to invalidate existing sessions after role changes
  await pool.execute(
    'UPDATE admins SET role = ?, token_version = token_version + 1 WHERE id = ?',
    [role, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM admins WHERE id = ?', [id]);
}

module.exports = { findByEmail, findById, findAuthById, list, countActiveAdmins, updateRole, remove };
