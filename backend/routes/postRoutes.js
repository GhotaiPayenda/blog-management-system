const express = require('express');
const router = express.Router();
const { list, getOne, create, update, remove, togglePublish, postValidators } = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');
const handleValidation = require('../middleware/validate');

router.use(auth, requireAdmin);
router.get('/', list);
router.get('/:id', getOne);
router.post('/', postValidators, handleValidation, create);
router.put('/:id', postValidators, handleValidation, update);
router.patch('/:id/publish', togglePublish);
router.delete('/:id', remove);

module.exports = router;
