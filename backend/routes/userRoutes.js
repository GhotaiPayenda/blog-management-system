const express = require('express');
const router = express.Router();
const { list, updateRole, remove, roleValidators } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');
const handleValidation = require('../middleware/validate');

router.use(auth, requireAdmin);
router.get('/', list);
router.patch('/:id/role', roleValidators, handleValidation, updateRole);
router.delete('/:id', remove);

module.exports = router;