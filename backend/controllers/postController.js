const { body } = require('express-validator');
const postModel = require('../models/postModel');
const { makeSlug } = require('../utils/slugify');
const { getPagination } = require('../utils/pagination');

const postValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional({ values: 'falsy' }).isString(),
  body('featured_image').optional({ values: 'falsy' }).isString().isLength({ max: 500 }),
  body('category_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  body('status').isIn(['Draft', 'Published']).withMessage('Status must be Draft or Published'),
];

async function ensureUniqueSlug(base, excludeId = null) {
  let slug = base;
  let suffix = 1;
  while (await postModel.findBySlug(slug, excludeId)) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

function computePublishedAt(status, existing) {
  if (status === 'Published') {
    return existing && existing.published_at ? existing.published_at : new Date();
  }
  return null;
}

async function list(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, category, status } = req.query;
    const { rows, total } = await postModel.getAdminPosts({
      search, category, status, limit, offset
    });
    res.json({ posts: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const post = await postModel.findById(Number(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const baseSlug = req.body.slug ? makeSlug(req.body.slug) : makeSlug(req.body.title);
    if (!baseSlug) return res.status(400).json({ message: 'Invalid title/slug' });
    const slug = await ensureUniqueSlug(baseSlug);
    const status = req.body.status;
    const published_at = status === 'Published' ? new Date() : null;
    const post = await postModel.create({
      title: req.body.title.trim(),
      slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      featured_image: req.body.featured_image,
      category_id: req.body.category_id || null,
      admin_id: req.admin.id,
      status,
      published_at,
    });
    res.status(201).json({ post, message: 'Post created' });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await postModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    const baseSlug = req.body.slug ? makeSlug(req.body.slug) : makeSlug(req.body.title);
    if (!baseSlug) return res.status(400).json({ message: 'Invalid title/slug' });
    const slug = await ensureUniqueSlug(baseSlug, id);
    const status = req.body.status;
    const published_at = computePublishedAt(status, existing);
    const post = await postModel.update(id, {
      title: req.body.title.trim(),
      slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      featured_image: req.body.featured_image,
      category_id: req.body.category_id || null,
      status,
      published_at,
    });
    res.json({ post, message: 'Post updated' });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await postModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    await postModel.remove(id);
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
}

async function togglePublish(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await postModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    const newStatus = existing.status === 'Published' ? 'Draft' : 'Published';
    const published_at = newStatus === 'Published' ? (existing.published_at || new Date()) : null;
    const post = await postModel.update(id, {
      title: existing.title,
      slug: existing.slug,
      excerpt: existing.excerpt,
      content: existing.content,
      featured_image: existing.featured_image,
      category_id: existing.category_id,
      status: newStatus,
      published_at,
    });
    res.json({ post, message: newStatus === 'Published' ? 'Post published' : 'Post unpublished' });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove, togglePublish, postValidators };
