const pool = require('../config/db');

async function getAll() {
  const [rows] = await pool.execute(
    `SELECT c.id, c.name, c.slug, c.created_at, c.updated_at,
            COUNT(p.id) AS post_count
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, slug, created_at, updated_at FROM categories WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByNameOrSlug(name, slug, excludeId = null) {
  let query = 'SELECT id FROM categories WHERE (name = ? OR slug = ?)';
  const params = [name, slug];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  query += ' LIMIT 1';
  const [rows] = await pool.execute(query, params);
  return rows[0] || null;
}

async function create({ name, slug }) {
  const [result] = await pool.execute(
    'INSERT INTO categories (name, slug) VALUES (?, ?)',
    [name, slug]
  );
  return findById(result.insertId);
}

async function update(id, { name, slug }) {
  await pool.execute(
    'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
    [name, slug, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
}

module.exports = { getAll, findById, findByNameOrSlug, create, update, remove };
