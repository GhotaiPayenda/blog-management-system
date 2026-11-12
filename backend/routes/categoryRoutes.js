const express = require('express');
const router = express.Router();
const { getAll, create, update, remove, categoryValidators } = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');
const handleValidation = require('../middleware/validate');

router.use(auth, requireAdmin);
router.get('/', getAll);
router.post('/', categoryValidators, handleValidation, create);
router.put('/:id', categoryValidators, handleValidation, update);
router.delete('/:id', remove);

module.exports = router;
