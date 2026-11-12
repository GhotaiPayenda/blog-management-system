const postModel = require('../models/postModel');
const categoryModel = require('../models/categoryModel');
const { getPagination } = require('../utils/pagination');

async function listPosts(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const categorySlug = req.query.category || null;
    const search = req.query.search || null;
    const { rows, total } = await postModel.getPublicPosts({ categorySlug, search, limit, offset });
    res.json({ posts: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

async function getPost(req, res, next) {
  try {
    const post = await postModel.findBySlugPublic(req.params.slug);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const related = await postModel.getRelated(post.id, post.category_id, 3);
    res.json({ post, related });
  } catch (err) { next(err); }
}

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.getAll();
    // Only expose categories; counts fine for public
    res.json({ categories });
  } catch (err) { next(err); }
}

async function latest(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 12);
    const { rows } = await postModel.getPublicPosts({ categorySlug: null, limit, offset: 0 });
    res.json({ posts: rows });
  } catch (err) { next(err); }
}

module.exports = { listPosts, getPost, listCategories, latest };
