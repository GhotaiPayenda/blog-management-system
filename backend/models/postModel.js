const pool = require('../config/db');

const baseSelect = `
  SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image,
         p.category_id, p.admin_id, p.status, p.published_at, p.created_at, p.updated_at,
         c.name AS category_name, c.slug AS category_slug,
         a.name AS author_name
  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN admins a ON a.id = p.admin_id
`;

async function findBySlug(slug, excludeId = null) {
  let q = 'SELECT id FROM posts WHERE slug = ?';
  const params = [slug];
  if (excludeId) { q += ' AND id != ?'; params.push(excludeId); }
  q += ' LIMIT 1';
  const [rows] = await pool.execute(q, params);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(baseSelect + ' WHERE p.id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findBySlugPublic(slug) {
  const [rows] = await pool.execute(
    baseSelect + " WHERE p.slug = ? AND p.status = 'Published' LIMIT 1",
    [slug]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    title, slug, excerpt, content, featured_image,
    category_id, admin_id, status, published_at
  } = data;
  const [result] = await pool.execute(
    `INSERT INTO posts
      (title, slug, excerpt, content, featured_image, category_id, admin_id, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, excerpt || null, content, featured_image || null,
     category_id || null, admin_id, status, published_at || null]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const {
    title, slug, excerpt, content, featured_image,
    category_id, status, published_at
  } = data;
  await pool.execute(
    `UPDATE posts SET
      title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
      category_id = ?, status = ?, published_at = ?
     WHERE id = ?`,
    [title, slug, excerpt || null, content, featured_image || null,
     category_id || null, status, published_at || null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
}

async function getAdminPosts({ search, category, status, limit, offset }) {
  const where = [];
  const params = [];
  if (search) { where.push('p.title LIKE ?'); params.push(`%${search}%`); }
  if (category) { where.push('p.category_id = ?'); params.push(category); }
  if (status) { where.push('p.status = ?'); params.push(status); }
  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM posts p ${whereSql}`, params
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `${baseSelect} ${whereSql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function getPublicPosts({ categorySlug, search, limit, offset }) {
  const where = ["p.status = 'Published'"];
  const params = [];
  if (categorySlug) { where.push('c.slug = ?'); params.push(categorySlug); }
  if (search) { where.push('(p.title LIKE ? OR p.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const whereSql = ' WHERE ' + where.join(' AND ');

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`, params
  );
  const total = countRows[0].total;

  const [rows] = await pool.execute(
    `${baseSelect} ${whereSql} ORDER BY p.published_at DESC, p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function getRelated(postId, categoryId, limit = 3) {
  if (!categoryId) return [];
  const [rows] = await pool.execute(
    `${baseSelect}
     WHERE p.category_id = ? AND p.id != ? AND p.status = 'Published'
     ORDER BY p.published_at DESC LIMIT ?`,
    [categoryId, postId, limit]
  );
  return rows;
}

async function getStats() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM posts');
  const [[{ published }]] = await pool.query("SELECT COUNT(*) AS published FROM posts WHERE status = 'Published'");
  const [[{ drafts }]] = await pool.query("SELECT COUNT(*) AS drafts FROM posts WHERE status = 'Draft'");
  const [[{ categories }]] = await pool.query('SELECT COUNT(*) AS categories FROM categories');
  const [recent] = await pool.execute(
    `${baseSelect} ORDER BY p.created_at DESC LIMIT 5`
  );
  return {
    totalPosts: total,
    publishedPosts: published,
    draftPosts: drafts,
    totalCategories: categories,
    recentPosts: recent,
  };
}

module.exports = {
  findBySlug, findById, findBySlugPublic,
  create, update, remove,
  getAdminPosts, getPublicPosts, getRelated, getStats
};
