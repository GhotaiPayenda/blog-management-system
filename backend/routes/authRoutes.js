const express = require('express');
const router = express.Router();
const { login, me, loginValidators } = require('../controllers/authController');
const handleValidation = require('../middleware/validate');
const auth = require('../middleware/authMiddleware');

router.post('/login', loginValidators, handleValidation, login);
router.get('/me', auth, me);

module.exports = router;
