const express = require('express');
const router = express.Router();
const { listPosts, getPost, listCategories, latest } = require('../controllers/publicController');

router.get('/posts', listPosts);
router.get('/posts/latest', latest);
router.get('/posts/:slug', getPost);
router.get('/categories', listCategories);

module.exports = router;
