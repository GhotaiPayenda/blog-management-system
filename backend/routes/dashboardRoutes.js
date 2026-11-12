const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/stats', auth, requireAdmin, getStats);

module.exports = router;
