const { body } = require('express-validator');
const categoryModel = require('../models/categoryModel');
const { makeSlug } = require('../utils/slugify');

const categoryValidators = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }).withMessage('Name too long'),
];

async function getAll(req, res, next) {
  try {
    const categories = await categoryModel.getAll();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const name = req.body.name.trim();
    const slug = makeSlug(name);
    if (!slug) return res.status(400).json({ message: 'Invalid category name' });
    const existing = await categoryModel.findByNameOrSlug(name, slug);
    if (existing) return res.status(409).json({ message: 'Category already exists' });
    const category = await categoryModel.create({ name, slug });
    res.status(201).json({ category, message: 'Category created' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await categoryModel.findById(id);
    if (!current) return res.status(404).json({ message: 'Category not found' });
    const name = req.body.name.trim();
    const slug = makeSlug(name);
    if (!slug) return res.status(400).json({ message: 'Invalid category name' });
    const existing = await categoryModel.findByNameOrSlug(name, slug, id);
    if (existing) return res.status(409).json({ message: 'Another category with this name exists' });
    const category = await categoryModel.update(id, { name, slug });
    res.json({ category, message: 'Category updated' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await categoryModel.findById(id);
    if (!current) return res.status(404).json({ message: 'Category not found' });
    // FK ON DELETE SET NULL ensures posts remain but lose category
    await categoryModel.remove(id);
    res.json({ message: 'Category deleted. Associated posts were uncategorized.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove, categoryValidators };
